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

import { nanoid } from "nanoid"

import Deffered from "./Deffered"
import { ModalController } from "./ModalController"
import { ModalComponent, ModalParams, ModalWindowParams } from "./types"
import { serialize } from "./utils"

const DEFAULT_PARAMS: ModalParams = {
  id: -1,
  closable: true,
  weak: false,
  fork: false
}

class ModalWindow<CustomParams = unknown> {
  /**
   * Always uniue value. 
   * It is different from `params.id`, `params.id` can be the same for different windows.
   * 
   * Usually needs for `key` prop in React Component.
   */
  public readonly id: string

  public component: ModalComponent<CustomParams>
  public params: ModalParams & CustomParams
  public closed: boolean

  public controller?: ModalController
  private deffered: Deffered<void>

  constructor(component: ModalComponent<CustomParams>, ...[params]: ModalWindowParams<CustomParams>) {
    this.id = nanoid()

    this.component = component
    this.params = { ...DEFAULT_PARAMS, ...params as Partial<ModalParams> & CustomParams }
    this.closed = false

    this.deffered = new Deffered
  }

  close() {
    this.closed = true
    this.deffered.resolve()
  }


  /**
   * Can be used to wait for the modal to be closed before performing some action.
   * 
   * @example
   * const modal = await modalController.open(PopupHello, { title: "Hello" })
   * doAnyAction()
   */
  then(onfulfilled?: ((value: void) => void | PromiseLike<void>) | undefined | null, onrejected?: ((reason: unknown) => void | PromiseLike<void>) | undefined | null): PromiseLike<void> {
    return this.deffered.promise.then(onfulfilled, onrejected)
  }


  compare<T>(other: ModalWindow<T>): this is ModalWindow<T> {
    if (other.component === this.component) {
      return serialize(other.params) === serialize(this.params)
    }

    return false
  }

  serialize(): string {
    return serialize([this.component, this.params])
  }

  static deserialize(serialized: string, components: ModalComponent[]): ModalWindow {
    const [componentName, params] = JSON.parse(serialized)
    const component = components.find(component => component.name === componentName)
    if (component == null) {
      throw new Error(`Component "${componentName}" not found.`)
    }

    const modalWindow = new ModalWindow(component, params)
    return modalWindow
  }
}

export { ModalWindow }
