import { Fragment, useEffect, useState } from "react"

import { ModalContainerProps } from "./container"
import { modalContext } from "./context"
import { Modal, ModalState } from "./controller"
import { ModalWindow } from "./types"
import { classWithModifiers, stopPropagation } from "./utils"

const DEFAULT_STATE: ModalState = {
  isOpen: false,
  windows: []
}

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
          <Template>
            <modalContext.Provider value={contextValue}>
              {focusedModal?.component && <focusedModal.component {...focusedModal.params} key={focusedModal?.params?.id} />}
            </modalContext.Provider>
          </Template>
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
