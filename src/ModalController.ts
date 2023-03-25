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

import { ModalWindow } from "./ModalWindow"
import { ModalComponent, ModalState, ModalWindowParams } from "./types"

interface Events {
  add: [ModalWindow]
  remove: [ModalWindow]
  update: []
}

class ModalController {
  public static Instance: ModalController = new ModalController

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected windows: Set<ModalWindow<any>> = new Set
  protected events: EventEmitter<Events> = new EventEmitter


  #active = false
  protected set active(value: boolean) {
    this.#active = value
  }
  public get active(): boolean {
    return this.#active
  }

  public hide() {
    this.active = false
    this.events.emit("update")
  }
  public show() {
    this.active = true
    this.events.emit("update")
  }


  public open<P>(component: ModalComponent<P>, ...modalParams: ModalWindowParams<P>): ModalWindow<P> {
    if (this.active === false && this.windows.size > 0) {
      this.windows.clear()
    }

    this.active = true


    const modalWindow = new ModalWindow(component, ...modalParams)
    modalWindow.controller = this
    modalWindow.then(() => this.close(modalWindow as ModalWindow))

    this.windows.add(modalWindow)
    this.events.emit("add", modalWindow as ModalWindow)

    return modalWindow
  }

  public close(modalWindow: ModalWindow) {
    if (this.windows.size <= 1) {
      this.active = false
    }
    if (this.windows.size > 1) {
      this.windows.delete(modalWindow)
    }

    this.events.emit("remove", modalWindow)
  }

  public closeAll() {
    this.windows.forEach(modalWindow => this.close(modalWindow))
  }

  public on<T extends keyof Events>(event: T, listener: (...args: Events[T]) => void) {
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
