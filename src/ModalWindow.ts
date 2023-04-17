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


import Deffered from "./Deffered"
import { ModalComponent, ModalDefaultParams } from "./types"
import { hash } from "./utils"

const DEFAULT_PARAMS: ModalDefaultParams = {
  id: -1,
  closable: true,
  keepMounted: false,
  layer: 0,
  label: "Content is unknown. Bad guy didn't set a label.",

  weak: false,
  fork: false
}

export class ModalWindow<CustomParams = unknown> {
  /**
   * Unique id of the modal window.
   * If two modals have the same id, they will be treated as the same modal.
   * 
   * This is usually used in `key` prop for React components.
   * 
   * @note
   * This is not the same as `params.id` because `id` is unique for each modal window.
   */
  public readonly id: number

  public component: ModalComponent<CustomParams>
  public params: ModalDefaultParams & CustomParams

  public closed: boolean
  public focused: boolean

  private deffered: Deffered<void>

  constructor(component: ModalComponent<CustomParams>, params: Partial<ModalDefaultParams> & CustomParams) {
    this.id = hash({ component, params })

    this.component = component
    this.params = { ...DEFAULT_PARAMS, ...params }

    this.closed = false
    this.focused = true

    this.deffered = new Deffered
  }

  /**
   * Closes the modal window.
   * 
   * @note
   * This is arrow function to prevent `this` from being lost.
   * 
   * @example
   * const modal = Modal.open(PopupHello, { title: "Hello" })
   * modal.close()
   */
  close = () => {
    this.closed = true
    this.deffered.resolve()
  }


  /**
   * Can be used to wait for the modal to be closed before performing some action.
   * 
   * @example
   * await Modal.open(PopupHello, { title: "Hello" })
   * doAnyAction()
   */
  then(onfulfilled?: ((value: void) => void | PromiseLike<void>) | undefined | null, onrejected?: ((reason: unknown) => void | PromiseLike<void>) | undefined | null): PromiseLike<void> {
    return this.deffered.promise.then(onfulfilled, onrejected)
  }
}

/**
 * This is a workaround for TypeScript.
 * 
 * Used if it doesn't matter what type of `CustomParams` is used.
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModalWindowAny = ModalWindow<any>
