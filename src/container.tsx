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
  template?: (props: { children: ReactNode }) => ReactElement
  className?: string
}
export interface ModalContainerState {
  active: boolean
  queue: ModalWindow[]
  forkedQueue: ModalWindow[]
}

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
    const currentModal = queue[queue.length - 1] as (ModalWindow | undefined)
    const onClose = currentModal?.params?.closable ? stopPropagation(currentModal.close) : undefined
    const Template = this.props.template || Fragment
    return (
      <>
        <div className={classWithModifiers(this.className, active && "active")} aria-modal aria-hidden={!active}>
          <div className={this.className + "__container"} onClick={onClose}>
            <modalContext.Provider value={currentModal || null}>
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
      <div className={this.className} aria-modal key={modal.params.id}>
        <div className={this.className + "__container"} onClick={modal.params?.closable ? stopPropagation(modal.close) : undefined}>
          <modalContext.Provider value={modal}>
            {<modal.component {...modal.params} />}
          </modalContext.Provider>
        </div>
      </div >
    ))
  }
}
