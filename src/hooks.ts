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
import { ModalController } from "./ModalController"
import { ModalWindow } from "./ModalWindow"
import { ModalComponent, ModalState } from "./types"

/**
 * Used inside a modal component to access the modal context (`ModalWindow`).
 *
 * Accepts a generic type that is used to infer the props of the modal component.
 * It has 3 overloads:
 * 1. `useModalWindow<typeof ModalClassComponent>()` - infers the props from the class component type.
 * 2. `useModalWindow<typeof ModalFunctionComponent>()` - infers the props from the function component type.
 * 3. `useModalWindow<{ c: 3 }>()` - you can enter props by yourself too.
 */
export function useModalWindow<T>(): ModalWindow<T extends ModalComponent<infer Props> ? Props : T> {
  const context = useContext(modalContext)
  if (!context) throw new Error(`ModalError: ${useModalWindow.name} must be used within a modal context.`)

  // It's safe to case to `any` here because the context is always set to a `ModalWindow`
  // and the arbitrary type `T` is difened by the user.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return context as ModalWindow<any>
}



const DEFAULT_STATE: ModalState = {
  active: false,
  windows: []
}

/**
 * Provides access to modal state and listens to updates.
 */
export function useModalState(controller: ModalController): ModalState {
  const [modalState, setModalState] = useState(DEFAULT_STATE)

  useEffect(() => {
    return controller.observe(setModalState)
  }, [controller])

  return modalState
}
