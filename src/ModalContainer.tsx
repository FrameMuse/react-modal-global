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
import { ModalWindow } from "./ModalWindow"
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

  // Group windows into its layers. 
  const layers = windows.reduce((layers, window) => {
    if (window.params.layer === "highest") {
      // It's not `layers.length - 1` because we need to push it AFTER the last item.
      window.params.layer = layers.length
    }

    if (window.params.layer === "lowest") {
      window.params.layer = 0
    }

    const layer = layers[window.params.layer] || []
    layer.push(window)

    layers[window.params.layer] = layer

    return layers
  }, [] as ModalWindow[][])

  return (
    <div className={classWithModifiers(className, active && "active")} aria-modal aria-hidden={!active}>
      {layers.map(windows => (
        <>
          {windows.map(modalWindow => {
            if (modalWindow == null) {
              return null
            }

            function ASD() {
              function onClose() {
                if (!modalWindow.params.closable) return
                stopPropagation(modalWindow.close)
              }


              return (
                <div className={classWithModifiers(className + "__container",)} onClick={onClose}>
                  <modalContext.Provider value={modalWindow}>
                    <modalWindow.component {...modalWindow.params} key={modalWindow.id} />
                  </modalContext.Provider>
                </div>
              )
            }

            return <ASD key={modalWindow.id} />
          })}
        </>
      ))}
    </div>
  )
}
