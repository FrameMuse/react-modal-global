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

import { useContext, useEffect, useState } from "react"

import { modalContext } from "./context"
import { Modal, ModalController, ModalState } from "./controller"
import { ModalComponent, ModalWindow } from "./types"


/**
 * Used inside a modal component to access the modal context (`ModalWindow`).
 *
 * Accepts a generic type that is used to infer the props of the modal component.
 * It has 3 overloads:
 * 1. `useModalContext<typeof ModalClassComponent>()` - infers the props from the class component type.
 * 2. `useModalContext<typeof ModalFunctionComponent>()` - infers the props from the function component type.
 * 3. `useModalContext<{ c: 3 }>()` - you can enter props by yourself too.
 */
export function useModalContext<T>(): ModalWindow<T extends ModalComponent<infer Props> ? Props : T> {
  const context = useContext(modalContext)
  if (!context) throw new Error("ModalError: useModalContext must be used within a modalContext")

  // It's safe to case to `any` here because the context is always set to a `ModalWindow`
  // and the arbitrary type `T` is difened by the user.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return context as ModalWindow<any>
}

// /* Type Testing */
// class ModalClassComponent extends Component<{ a: 1 }> { }
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// function ModalFunctionComponent(props: { b: 2 }) { return null }

// useModalContext<typeof ModalClassComponent>() // => ModalWindow<{ a: 1 }>
// useModalContext<typeof ModalFunctionComponent>() // => ModalWindow<{ b: 2 }>
// useModalContext<{ c: 3 }>() // => ModalWindow<{ c: 3 }>
// useModalContext() // => ModalWindow<unknown>



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
