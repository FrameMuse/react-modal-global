/*

MIT License

Copyright (c) 2023 Valery Zinchenko

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

*/

import EventEmitter from "eventemitter3"

import { ModalWindow, ModalWindowAny } from "./ModalWindow"
import { ExternalStore, ModalComponent, ModalParams, ModalSnapshot, ModalWindowParams } from "./types"


interface ModalControllerEvents {
  add: [ModalWindowAny]
  remove: [ModalWindowAny]
  update: []
}

interface ModalControllerConfig {
  defaultParams: Partial<ModalParams>
}

class ModalController<Config extends ModalControllerConfig = ModalControllerConfig> implements ExternalStore<ModalSnapshot> {
  protected windows: Set<ModalWindowAny> = new Set
  protected events: EventEmitter<ModalControllerEvents> = new EventEmitter

  constructor(private config?: Config) {
    this.subscribe(() => this.refreshSnapshot())
  }

  #active = false
  protected set active(value: boolean) {
    this.#active = value
  }
  public get active(): boolean {
    return this.#active
  }


  /**
   * Hides modal without touching any modals.
   */
  public hide() {
    if (this.active === false) return

    this.active = false
    this.events.emit("update")
  }
  /**
   * Shows modal without touching any modals.
   */
  public show() {
    if (this.active === true) return

    this.active = true
    this.events.emit("update")
  }

  /**
   * Opens a modal window. Infers props from the component.
   *
   * - If the same modal window is already in the queue, it will be ignored.
   * - If the modal window is weak, it will be unmounted after closing.
   * - If the modal window is forked, it will be opened over all other modals.
   * - If the modal window is closable (be default `true`), it will be closed by clicking on the overlay.
   * - If the modal window is not closable, it will be closed only by calling internal `close` method.
   *
   * @param component Modal component.
   * @param params Modal params.
   * @returns Modal window and `PromiseLike`.
   *
   * @example
   * await Modal.open(MyModal, { id: 1 })
   * console.log("Modal was closed")
   * 
   * @example
   * const modal = Modal.open(MyModal, { id: 1 })
   * modal.then(() => console.log("Modal was closed"))
   * 
   * @example
   * const modal = Modal.open(MyModal, { id: 1 })
   * modal.on("close", () => console.log("Modal was closed"))
   */
  public open<P>(component: ModalComponent<P>, ...[modalParams]: ModalWindowParams<P>): ModalWindow<P> {
    // `modalParams` still can be undefined, but we can't check it here.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const modalWindow = new ModalWindow(component, { ...this.config?.defaultParams, ...modalParams! })
    // Using `on` instead of `then` since `then` will only be executed on the next event loop iteration.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop.
    modalWindow.on("close", () => this.close(modalWindow))


    // Skip adding to queue if the window is already the last modal.
    if (this.active) {
      const lastWindow = [...this.windows].at(-1)
      if (lastWindow?.id === modalWindow.id) {
        return lastWindow
      }
    }
    // If there are temporary modal windows, clear.
    if (this.windows.size > 0 && !this.active) {
      this.windows.clear()
    }
    this.windows.add(modalWindow)
    this.events.emit("add", modalWindow)

    this.show()

    return modalWindow
  }

  /**
   * Replaces the last modal window in the queue with a new one.
   *
   * If the queue is empty, it will work the same as `open` method.
   */
  public replace<P>(component: ModalComponent<P>, ...[modalParams]: ModalWindowParams<P>): ModalWindow<P> {
    const lastWindow = [...this.windows].at(-1)
    if (lastWindow != null) {
      this.windows.delete(lastWindow)
    }

    // `modalParams` still can be undefined, but we can't check it here.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.open(component, modalParams!)
  }

  /**
   * Closes modal by its instance.
   */
  public close(modalWindow: ModalWindowAny): void {
    if (this.windows.size === 0) return
    if (!this.windows.has(modalWindow)) return

    if (this.windows.size === 1) {
      this.hide()

      return
    }

    this.windows.delete(modalWindow)
    this.events.emit("remove", modalWindow)
  }

  /**
   * Closes all modals, which have this `id`.
   */
  public closeById(id: ModalParams["id"]) {
    const modalWindows = [...this.windows].filter(modalWindow => modalWindow.params.id === id)
    modalWindows.forEach(modalWindow => this.close(modalWindow))
  }

  /**
   * Closes all modals, which have this `component`. Additionally it will seek for `params` if given (compares by `===`).
   */
  public closeByComponent<P>(component: ModalComponent<P>, params?: P) {
    const modalWindows = [...this.windows].filter(modalWindow => {
      if (modalWindow.component !== component) {
        return false
      }

      if (params != null) {
        if (modalWindow.params.params !== params) {
          return false
        }
      }

      return true
    })
    modalWindows.forEach(modalWindow => this.close(modalWindow))
  }

  /**
   * Closes all modals.
   */
  public closeAll() {
    this.windows.forEach(modalWindow => this.close(modalWindow))
  }

  /**
   * Subscribes to `event` with `listener`.
   * 
   * @example
   * Modal.on("close", () => { })
   * 
   * @returns `unsubscribe` method
   */
  public on<T extends keyof ModalControllerEvents>(event: T, listener: (...args: ModalControllerEvents[T]) => void) {
    this.events.on(event, listener)

    return () => {
      this.events.off(event, listener)
    }
  }

  /**
   * Used for container component to get the current state.
   * 
   * Observes the state and calls the callback on any changes.
   * 
   * @returns `unsubscribe` method to stop observing.
   */
  public subscribe(callback: () => void) {
    this.events.on("add", callback)
    this.events.on("remove", callback)
    this.events.on("update", callback)

    return () => {
      this.events.off("add", callback)
      this.events.off("remove", callback)
      this.events.off("update", callback)
    }
  }
  public getSnapshot(): ModalSnapshot {
    return this.#snapshot
  }

  #snapshot: ModalSnapshot = { active: this.active, windows: [] }
  private refreshSnapshot(): void {
    this.#snapshot = {
      active: this.active,
      windows: [...this.windows]
    }
  }
}

export { ModalController }
