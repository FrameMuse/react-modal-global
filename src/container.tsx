/*

MIT License

Copyright (c) 2022 Valery Zinchenko

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

*/

import { Component, Fragment, ReactElement, ReactNode } from "react"

import { modalContext } from "./context"
import { ModalWindow } from "./types"
import { classWithModifiers, stopPropagation } from "./utils"

export const containers: Set<ModalContainer> = new Set

export interface ModalContainerProps {
  /**
   * Template for modal window.
   */
  template?: (props: { children: ReactNode }) => ReactElement
  /**
   * Modal container class name. It will be used as a base for modifiers (will replace defaulted `"modal"`).
   *
   * @default "modal"
   */
  className?: string
}

export interface ModalContainerState<P = unknown> {
  active: boolean
  queue: ModalWindow<P>[]
  forkedQueue: ModalWindow<P>[]
}

/**
 * Modal container component. Renders modal windows.
 *
 * Can be used multiple times to render modals in different places.
 */
export class ModalContainer extends Component<ModalContainerProps, ModalContainerState> {
  state: ModalContainerState = {
    active: false,
    queue: [],
    forkedQueue: []
  }

  get className(): string {
    return this.props.className || "modal"
  }

  componentDidMount(): void {
    containers.add(this)
  }

  componentWillUnmount(): void {
    containers.delete(this)
  }

  render() {
    const { active, queue } = this.state
    const currentModal = queue.at(-1)
    const onClose = currentModal?.params?.closable ? stopPropagation(currentModal.close) : undefined
    const Template = this.props.template || Fragment

    const providerValue = currentModal ? {
      ...currentModal,
      isClosed: !active
    } : null
    return (
      <>
        <div className={classWithModifiers(this.className, active && "active")} aria-modal aria-hidden={!active}>
          <div className={this.className + "__container"} onClick={onClose}>
            <modalContext.Provider value={providerValue}>
              <Template>
                {currentModal?.component && <currentModal.component {...currentModal.params} key={currentModal?.params?.id} />}
              </Template>
            </modalContext.Provider>
          </div>
        </div>

        {this.renderForks()}
      </>
    )
  }

  renderForks() {
    return this.state.forkedQueue.map(modal => (
      <div className={classWithModifiers(this.className, "active")} aria-modal key={modal.params.id}>
        <div className={this.className + "__container"} onClick={modal.params?.closable ? stopPropagation(modal.close) : undefined}>
          <modalContext.Provider value={modal}>
            {<modal.component {...modal.params} />}
          </modalContext.Provider>
        </div>
      </div >
    ))
  }
}
