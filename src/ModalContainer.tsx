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


import { modalContext } from "./context"
import { useModalState } from "./hooks"
import { ModalController } from "./ModalController"
import { classWithModifiers, stopPropagation } from "./utils"

export interface ModalContainerProps {
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
  const { active, windows } = useModalState(props.controller)

  const className = props.className || "modal"

  const modalWindow = windows.at(-1)
  const onClose = modalWindow?.params.closable ? stopPropagation(() => modalWindow.close()) : undefined

  return (
    <div className={classWithModifiers(className, active && "active")} aria-modal aria-hidden={!active}>
      {modalWindow && (
        <div className={className + "__container"} onClick={onClose}>
          <modalContext.Provider value={modalWindow || null}>
            <modalWindow.component {...modalWindow.params} key={modalWindow.params.id} />
          </modalContext.Provider>
        </div>
      )}
    </div>
  )
}
