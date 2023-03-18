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

import { ModalComponent, ModalParams, ModalWindow, ModalWindowParams } from "./types"
import { serialize } from "./utils"

const DEFAULT_PARAMS: ModalParams = {
  id: 0,
  closable: true,
  weak: false,
  fork: false
}

export interface ModalState {
  isOpen: boolean
  windows: ModalWindow[]
}

interface Events {
  add: [ModalWindow]
  remove: [ModalWindow]
  update: []
}

/**
 * Controller for opening and closing modal windows.
 *
 * Can be used with `ModalContainer` or with custom implementation.
 */
export class ModalController {
  #isOpen = false
  protected set isOpen(value: boolean) {
    this.#isOpen = value
  }
  /**
   * Whether any modals are shown.
   */
  public get isOpen(): boolean {
    return this.#isOpen
  }

  protected windows: Set<ModalWindow> = new Set
  protected events: EventEmitter<Events> = new EventEmitter


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
   * const modal = modalController.open(MyModal, { id: 1 })
   * modal.closable // `true` by default
   *
   * modal.then(() => console.log("Modal was closed"))
   * modal.close()
   */
  public open<P>(component: ModalComponent<P>, ...[modalParams]: ModalWindowParams<P>): ModalWindow<P> & PromiseLike<void> {
    let resolveFunction = () => { /* Noop */ }
    const promise = new Promise<void>(resolve => resolveFunction = resolve)
    const close = () => {
      this.remove(modal as ModalWindow<unknown>)
      resolveFunction()
    }

    const params: ModalParams & P = { ...DEFAULT_PARAMS, ...modalParams as P }
    const modal: ModalWindow<P> = { component, params, close, closed: false, focused: true }

    this.add(modal as ModalWindow<unknown>)

    return {
      ...modal,
      then(onfulfilled?, onrejected?) {
        return promise.then(onfulfilled, onrejected)
      },
    }
  }
  /**
   * Replaces the last modal window in the queue with a new one.
   *
   * If the queue is empty, it will be added to the queue.
   */
  public replace<P>(component: ModalComponent<P>, ...[params]: ModalWindowParams<P>): ModalWindow<P> & PromiseLike<void> {
    const lastWindow = [...this.windows].at(-1)
    if (lastWindow != null) {
      this.windows.delete(lastWindow)
    }

    return this.open(component, params as never)
  }

  /**
   * Adds a modal window to the queue.
   *
   * - Controls whether the modal is open.
   * - Controls whether the order of windows.
   */
  private add(modalWindow: ModalWindow) {
    // If there are temporary modal windows, clear.
    if (this.isOpen === false && this.windows.size > 0) {
      this.windows.clear()
    }

    this.isOpen = true
    this.windows.add(modalWindow)
    this.events.emit("add", modalWindow)
  }
  /**
   * Removes a modal window from the queue.
   */
  private remove(modalWindow: ModalWindow) {
    if (!this.windows.has(modalWindow)) return

    const isLastWindow = this.windows.size === 1
    if (isLastWindow) {
      this.isOpen = false

      // If the modal window is weak, it will be unmounted after closing.
      // Otherwise, skip removing to let last modal window to be in the queue.
      if (!modalWindow.params.weak) {
        this.events.emit("update")
        return
      }
    }

    this.windows.delete(modalWindow)
    this.events.emit("remove", modalWindow)
  }

  private findByComponent<Params>(component: ModalComponent<Params>, params?: ModalParams & Params): ModalWindow<Params>[] {
    const foundWindows = [...this.windows].filter(modal => {
      if (modal.component !== component) {
        return false
      }

      if (params != null) {
        return serialize(params) === serialize(modal.params)
      }

      return true
    })
    return foundWindows as ModalWindow<Params>[] // Assume that found windows follow the params type (`Params`).
  }

  private findById(id: ModalParams["id"]): ModalWindow[] {
    const foundWindows = [...this.windows].filter(modal => modal.params.id === id)
    return foundWindows
  }

  /**
   * Closes all modals by its component (including forked) starting from the last one.
   */
  public closeByComponent<Params>(component: ModalComponent<Params>, params?: ModalParams & Params) {
    this.findByComponent(component, params).forEach(modal => modal.close())
  }
  /**
   * Closes all modals by its id (including forked) starting from the last one.
   */
  public closeById(id: ModalParams["id"]) {
    this.findById(id).forEach(modal => modal.close())
  }
  /**
   * Closes all modals (including forked).
   */
  public closeAll() {
    this.isOpen = false
    this.events.emit("update")
    // All windows are now treated as temporary and they will be removed on the next `add`.
  }

  /**
   * Subscribes on event.
   *
   * @returns `unsubscribe` method
   */
  public observe(callback: (state: ModalState) => void) {
    const listener = () => {
      const state: ModalState = {
        isOpen: this.isOpen,
        windows: [...this.windows]
      }
      callback(state)
    }

    this.events.on("add", listener)
    this.events.on("remove", listener)
    this.events.on("update", listener)

    this.events.emit("update") // Emit initial state

    return () => {
      this.events.off("add", listener)
      this.events.off("remove", listener)
      this.events.off("update", listener)
    }
  }
}


export const Modal = new ModalController
