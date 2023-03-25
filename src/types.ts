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

import { ReactElement } from "react"
import { HasRequiredKeys } from "type-fest"

export type ModalComponent<P = unknown> = ((props: P) => ReactElement | null) | (() => ReactElement | null)

export interface ModalParams {
  /**
   * _Notice:_ Modals with different ids are interpreted as different - no data preservation will not be provided.
   *
   * @default 0
   */
  id: string | number
  /**
   * Whether to enable built-in closing mechanisms.
   *
   * @default true
   */
  closable: boolean
  /**
   * Whether to keep mounted modal until a new one is oped.
   *
   * @default false
   */
  weak: boolean
  /**
   * Whether to open a new modal as a standalone. Each fork will be one layer above previous.
   *
   * @default false
   */
  fork: boolean
}

export interface ModalWindow<P = unknown> {
  component: ModalComponent<ModalParams & P>
  params: ModalParams & P

  /**
   * Removes the modal from the queue. If
   */
  close: () => void
  /**
   * Indicates that the `close` method has been called and the modal window is going to be removed.
   * 
   * @default
   * false
   */
  closed: boolean
  /**
   * Indicates that the modal is currently active.
   *
   * @note
   *
   * This is not the same as `!closed` because the modal may be not closed but still be in the queue.
   * 
   * @default
   * true
   */
  focused: boolean
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
