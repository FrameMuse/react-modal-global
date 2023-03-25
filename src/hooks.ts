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

import { ComponentLifecycle, ReactNode, useContext, useEffect, useState } from "react"

import { modalContext } from "./context"
import { Modal, ModalController, ModalState } from "./controller"
import { ModalWindow } from "./types"

/**
 * Used inside a modal component to access the modal context (`ModalWindow`).
 *
 * Accepts a generic type that is used to infer the props of the modal component.
 * It has 3 overloads:
 * 1. `useModalContext<ModalComponent>()` - infers the props from the class component type.
 * 2. `useModalContext<typeof ModalComponent>()` - infers the props from the function component type.
 * 3. `useModalContext<unknown>()` - infers any type besides the above.
 */
export function useModalContext<T>(): ModalWindow<T extends ComponentLifecycle<infer P, unknown> | ((props: infer P) => ReactNode) ? P : T> {
  const context = useContext(modalContext)
  if (!context) throw new Error("ModalError: useModalContext must be used within a modalContext")

  return context as never
}



const DEFAULT_STATE: ModalState = {
  isOpen: false,
  windows: []
}

export function useModalState(controller: ModalController = Modal) {
  const [modalState, setModalState] = useState(DEFAULT_STATE)

  useEffect(() => {
    return controller.observe(setModalState)
  }, [controller])

  return modalState
}
