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

import { Fragment, ReactElement, ReactNode, useEffect, useState } from "react"

import { modalContext } from "./context"
import { Modal, ModalController, ModalState } from "./controller"
import { ModalWindow } from "./types"
import { classWithModifiers, stopPropagation } from "./utils"


const DEFAULT_STATE: ModalState = {
  isOpen: false,
  windows: []
}

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
  /**
   * Modal controller. If not provided, will use default (global `Modal`) controller.
   */
  controller?: ModalController
}

/**
 * Modal container component. Renders modal windows.
 */
export function ModalContainer(props: ModalContainerProps) {
  const [modal, setModal] = useState(DEFAULT_STATE)
  useEffect(() => {
    const controller = props.controller || Modal
    return controller.observe(setModal)
  }, [props.controller])

  const className = props.className || "modal"
  const Template = props.template || Fragment

  const focusedModal = modal.windows.at(-1)
  const onClose = focusedModal?.params?.closable ? stopPropagation(focusedModal.close) : undefined

  // !!! HARD CODED !!!
  // This is the only way to make the modal work with the current implementation
  const contextValue: ModalWindow | null = focusedModal ? {
    ...focusedModal,
    closed: !modal.isOpen,
    focused: true
  } : null

  return (
    <>
      <div className={classWithModifiers(className, modal.isOpen && "active")} aria-modal aria-hidden={!modal.isOpen}>
        <div className={className + "__container"} onClick={onClose}>
          <modalContext.Provider value={contextValue}>
            <Template>
              {focusedModal?.component && <focusedModal.component {...focusedModal.params} key={focusedModal?.params?.id} />}
            </Template>
          </modalContext.Provider>
        </div>
      </div>

      {[...modal.windows].reverse().filter(window => window.params.fork).map(modalWindow => (
        <div className={classWithModifiers(className, "active")} aria-modal key={modalWindow.params.id}>
          <div className={className + "__container"} onClick={modalWindow.params.closable ? stopPropagation(modalWindow.close) : undefined}>
            <modalContext.Provider value={modalWindow}>
              {<modalWindow.component {...modalWindow.params} />}
            </modalContext.Provider>
          </div>
        </div>
      ))}
    </>
  )
}
