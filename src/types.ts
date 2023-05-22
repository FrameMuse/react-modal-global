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

import { Component, ReactElement } from "react"
import { HasRequiredKeys } from "type-fest"

import { ModalWindow } from "./ModalWindow"

export interface ModalState {
  active: boolean
  windows: ModalWindow[]
}

/**
 * A modal component can be either a function component or a class component.
 */
export type ModalComponent<P = unknown> =
  // Function Component
  | ((props: P) => ReactElement | null)
  | (() => ReactElement | null)
  // Class Component
  | (new (props: P) => Component<P>)
  | (new () => Component)

export interface ModalParams {
  /**
   * Usually used to close the modal by `closeById` method.
   * @default -1
   */
  id: string | number
  /**
   * Whether to enable built-in closing mechanisms.
   * 
   * - `ESC` key
   * - `click` on the overlay
   *
   * @default true
   */
  closable: boolean
  /**
   * Use `id` parameter with unique value instead.
   * @example
   * Modal.open(Component, { id: 1 })
   * @example
   * Modal.open(Component, { id: 2 })
   * @example
   * Modal.open(Component, { id: Date.now() })
   * 
   * @deprecated
  */
  weak: boolean
  /**
   * Use `layer` instead.
   * @deprecated
  */
  fork: boolean
  /**
   * Forks the modal window to a new layer.
   * 
   * @default 0
   */
  layer: number
  /**
   * Keep all open modals mounted until the last one is closed.
   */
  keepMounted: boolean
  /**
   * *Usually* used to set the `aria-label` attribute.
   */
  label: string
}

/**
 * Gets either a tuple with required or optional parameters depending on whether `P` has any required keys.
 *
 * Can be used in function argument to make `params` optional if `P` has only optional keys.
 *
 * @example
 * function open<P>(component: ModalComponent<P>, ...[modalParams]: ModalWindowParams<P>) {}
 *
 * const OkComponent = () => <div />
 * open(OkComponent, { id: 1 }) // OK
 * open(OkComponent) // OK
 *
 * const FailComponent = (props: { required: boolean }) => <div />
 * open(FailComponent, { required: true }) // OK
 * open(FailComponent) // Error: missing required property `required`
 */
export type ModalWindowParams<P = unknown> =
  HasRequiredKeys<NonNullable<P>> extends true ? [Partial<ModalParams> & P] : [(Partial<ModalParams> & P)?]
