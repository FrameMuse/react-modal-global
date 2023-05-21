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
import { ModalComponent, ModalParams, ModalState, ModalWindowParams } from "./types"

interface ModalControllerEvents {
  add: [ModalWindowAny]
  remove: [ModalWindowAny]
  update: []
}

class ModalController {
  protected windows: Set<ModalWindowAny> = new Set
  protected events: EventEmitter<ModalControllerEvents> = new EventEmitter


  #active = false
  protected set active(value: boolean) {
    this.#active = value
  }
  public get active(): boolean {
    return this.#active
  }


  public hide() {
    if (this.active === false) return

    this.active = false
    this.events.emit("update")
  }
  public show() {
    if (this.active === true) return

    this.active = true
    this.events.emit("update")
  }


  public open<P>(component: ModalComponent<P>, ...[modalParams]: ModalWindowParams<P>): ModalWindow<P> {
    // `modalParams` still can be undefined, but we can't check it here.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const modalWindow = new ModalWindow(component, modalParams!)
    // Using `on` instead of `then` since `then` will only be executed on the next event loop iteration.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop.
    modalWindow.on("close", () => this.close(modalWindow))


    // Skip adding to queue if the window is already in the beginning of the queue.
    const lastWindow = [...this.windows].at(-1)
    if (lastWindow?.id === modalWindow.id) {
      this.show()

      return lastWindow
    }
    // If there are temporary modal windows, clear.
    if (this.active === false && this.windows.size > 0) {
      this.windows.clear()
    }
    this.windows.add(modalWindow)


    this.active = true
    this.events.emit("add", modalWindow)

    return modalWindow
  }

  public replace<P>(component: ModalComponent<P>, ...[modalParams]: ModalWindowParams<P>): ModalWindow<P> {
    const lastWindow = [...this.windows].at(-1)
    if (lastWindow != null) {
      this.windows.delete(lastWindow)
    }

    // `modalParams` still can be undefined, but we can't check it here.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.open(component, modalParams!)
  }

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

  public closeById(id: ModalParams["id"]) {
    const modalWindows = [...this.windows].filter(modalWindow => modalWindow.params.id === id)
    modalWindows.forEach(modalWindow => this.close(modalWindow))
  }

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

  public closeAll() {
    this.windows.forEach(modalWindow => this.close(modalWindow))
  }

  public on<T extends keyof ModalControllerEvents>(event: T, listener: (...args: ModalControllerEvents[T]) => void) {
    this.events.on(event, listener)

    return () => {
      this.events.off(event, listener)
    }
  }
  public observe(callback: (state: ModalState) => void) {
    const listener = () => {
      const state: ModalState = {
        active: this.active,
        windows: [...this.windows]
      }
      callback(state)
    }
    // Call listener to get initial state.
    listener()

    this.events.on("add", listener)
    this.events.on("remove", listener)
    this.events.on("update", listener)

    return () => {
      this.events.off("add", listener)
      this.events.off("remove", listener)
      this.events.off("update", listener)
    }
  }
}

export { ModalController }
