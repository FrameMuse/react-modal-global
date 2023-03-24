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

  protected windows: Set<ModalWindow> = new Set
  protected events: EventEmitter<Events> = new EventEmitter


  #isOpen = false
  protected set isOpen(value: boolean) {
    this.#isOpen = value
  }
  public get isOpen(): boolean {
    return this.#isOpen
  }

  public hide() {
    this.isOpen = false
    this.events.emit("update")
  }
  public show() {
    this.isOpen = true
    this.events.emit("update")
  }


  public open<P>(component: ModalComponent<P>, ...modalParams: ModalWindowParams<P>): ModalWindow<P> {
    const modalWindow = new ModalWindow(component, ...modalParams)
    modalWindow.controller = this

    this.windows.add(modalWindow as ModalWindow)
    this.events.emit("add", modalWindow as ModalWindow)

    return modalWindow
  }

  public close(modalWindow: ModalWindow) {
    this.windows.delete(modalWindow)
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
        isOpen: this.isOpen,
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
