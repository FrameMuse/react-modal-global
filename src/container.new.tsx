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

import { Fragment, useEffect, useState } from "react"

import { modalContext } from "./context"
import { ModalController } from "./ModalController"
import { ModalComponent, ModalState } from "./types"
import { classWithModifiers, stopPropagation } from "./utils"


const DEFAULT_STATE: ModalState = {
  isOpen: false,
  windows: []
}

export interface ModalContainerProps {
  /**
   * Template for modal window.
   */
  template?: ModalComponent
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

export function ModalContainer(props: ModalContainerProps) {
  const [modal, setModal] = useState(DEFAULT_STATE)
  useEffect(() => {
    const controller = props.controller || ModalController.Instance
    return controller.observe(setModal)
  }, [props.controller])

  const className = props.className || "modal"
  const Template = props.template || Fragment

  return (
    <div className={classWithModifiers(className, modal.isOpen && "active")} aria-modal aria-hidden={!modal.isOpen}>
      {modal.windows.map(modalWindow => (
        <div className={className + "__container"} onClick={modalWindow.params.closable ? stopPropagation(modalWindow.close) : undefined} key={modalWindow.params.id}>
          <Template>
            <modalContext.Provider value={modalWindow}>
              {/* eslint-disable-next-line @typescript-eslint/ban-types */}
              <modalWindow.component {...modalWindow.params as {}} />
            </modalContext.Provider>
          </Template>
        </div>
      ))}
    </div>
  )
}
