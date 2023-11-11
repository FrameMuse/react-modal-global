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

import Deffered from "./Deffered"
import { ModalComponent, ModalParams } from "./types"
import { cyrb53, serialize } from "./utils"

const MODAL_SEED = Date.now()

interface ModalWindowEvents {
  open: []
  close: []
}

const DEFAULT_PARAMS: ModalParams = {
  id: -1,
  closable: true,
  keepMounted: false,
  layer: 0,
  label: "Content is unknown. Bad guy didn't set a label.",

  weak: false,
  fork: false
}

class ModalWindow<CustomParams = unknown> {
  /**
   * Hash of `serialized` property.
   * 
   * Unique id of the modal window.
   * If two modals have the same id, they will be treated as the same modal.
   * 
   * This is usually used in `key` prop for React components.
   * 
   * @note
   * This is not the same as `params.id` because `id` is unique for each modal window.
   */
  public readonly id: number
  /**
   * String representation of `component` and `params`.
   */
  public readonly serialized: string

  public component: ModalComponent<CustomParams>
  public params: ModalParams & CustomParams
  /**
   * Indicates that the `close` method has been called and the modal window is going to be removed.
   * 
   * @default
   * false
   */
  public closed: boolean

  protected events: EventEmitter<ModalWindowEvents>
  private deffered: Deffered<void>

  constructor(component: ModalComponent<CustomParams>, params: Partial<ModalParams> & CustomParams) {
    this.serialized = serialize({ component, params })
    this.id = cyrb53(this.serialized, MODAL_SEED)

    this.component = component
    this.params = { ...DEFAULT_PARAMS, ...params }

    this.closed = false

    this.events = new EventEmitter
    this.deffered = new Deffered

    this.events.emit("open")
  }

  /**
   * Closes the modal window.
   * 
   * @note
   * This is an arrow function, which prevents `this` from being lost - You can use it without `bind`.
   * 
   * @example
   * const modal = Modal.open(PopupHello, { title: "Hello" })
   * modal.close()
   */
  close = () => {
    if (this.closed) return

    this.closed = true
    this.deffered.resolve()

    this.events.emit("close")
  }


  /**
   * Can be used to wait for the modal to be closed before performing an action.
   * 
   * @example
   * await Modal.open(PopupHello, { title: "Hello" })
   * doAnyAction()
   */
  then(onfulfilled?: ((value: void) => void | PromiseLike<void>) | undefined | null, onrejected?: ((reason: unknown) => void | PromiseLike<void>) | undefined | null): PromiseLike<void> {
    return this.deffered.promise.then(onfulfilled, onrejected)
  }
  /**
   * Subscribes to `event` with `listener`.
   * @example
   * const modal = Modal.open(PopupHello, { title: "Hello" })
   * modal.on("close", () => { })
   * 
   * @note If you want to do something on close, you can use await directly on this instance. For details see `then` method in `ModalWindow`.
   * 
   * @returns `unsubscribe` method
   */
  on<K extends keyof ModalWindowEvents>(event: K, listener: (...args: ModalWindowEvents[K]) => void) {
    this.events.on(event, listener)

    return () => {
      this.events.off(event, listener)
    }
  }
}

/**
 * This is a workaround for TypeScript.
 * 
 * Used if it doesn't matter what type of `CustomParams` is used.
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModalWindowAny = ModalWindow<any>

export { ModalWindow }
