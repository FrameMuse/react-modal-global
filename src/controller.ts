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

import { Dispatch, SetStateAction } from "react"

import { ModalContainerState } from "./container"
import { ModalComponent, ModalParams, ModalWindow } from "./types"
import { serialize } from "./utils"

const DEFAULT_STATE: ModalContainerState = {
  active: false,
  queue: [],
  forkedQueue: [],
}
const DEFAULT_PARAMS: ModalParams = {
  id: 0,
  closable: true,
  weak: false,
  fork: false,
}

export const modalPrivate: {
  dispatch: Dispatch<SetStateAction<ModalContainerState>>
} = {
  dispatch: () => { throw new Error("ModalError: no containers were found") }
}

export class Modal {
  public static open<
    P extends object = {},
    AC extends Partial<ModalParams> & P = Partial<ModalParams> & P
  >(
    component: ModalComponent<P>,
    ...[params]: keyof P extends never ? [AC?] : [AC]
  ): { promise: Promise<void>, window: ModalWindow<AC> } {
    let resolveFunction = () => { /* Noop */ }
    const promise = new Promise<void>(resolve => resolveFunction = resolve)
    const modal: ModalWindow<any> = { component, params: { ...DEFAULT_PARAMS, id: Date.now(), ...params }, close }

    Modal.add(modal)

    function close() {
      resolveFunction()
      Modal.remove(modal)
    }

    return { promise, window: modal }
  }
  public static replace<
    P extends object = {},
    AC extends Partial<ModalParams> & P = Partial<ModalParams> & P
  >(
    component: ModalComponent<P>,
    ...[params]: P extends object ? [AC] : [AC?]
  ): { promise: Promise<void>, window: ModalWindow<AC> } {
    modalPrivate.dispatch(state => ({
      ...state,
      queue: state.queue.slice(0, -1)
    }))
    return Modal.open(component, params as never) as never
  }
  private static add(modalWindow: ModalWindow) {
    if (modalWindow.params.fork) {
      modalPrivate.dispatch(state => {
        return {
          ...state,
          forkedQueue: [...state.forkedQueue, modalWindow]
        }
      })
      return
    }


    modalPrivate.dispatch(state => {
      // Make that we need it
      if (!modalWindow.params?.weak) {
        // Skip adding to queue if there is already the same window
        if (state.queue.length > 0) {
          const lastWindow = state.queue[state.queue.length - 1]
          if ((serialize(lastWindow.params) === serialize(modalWindow.params)) && lastWindow.component === modalWindow.component) {
            return {
              ...state,
              active: true,
              queue: [modalWindow]
            }
          }
        }
      }
      // Replace stale window
      if (state.active === false && state.queue.length === 1) {
        return {
          ...state,
          active: true,
          queue: [modalWindow]
        }
      }
      return {
        ...state,
        active: true,
        queue: [...state.queue, modalWindow]
      }
    })
  }
  private static remove(modalWindow: ModalWindow) {
    if (modalWindow.params.fork) {
      modalPrivate.dispatch(state => {
        const forkedQueue = state.forkedQueue.filter(mw => mw !== modalWindow)
        return { ...state, forkedQueue }
      })
      return
    }

    modalPrivate.dispatch(state => {
      const queue = state.queue.filter(mw => mw !== modalWindow)
      if (!modalWindow.params.weak) {
        // Hide modal without removing if it's the last window
        if (queue.length === 0) {
          return { ...state, active: false, queue: [modalWindow] }
        }
      }
      return { ...state, queue, active: false }
    })
  }
  public static closeAll() {
    modalPrivate.dispatch(state => {
      state.queue.forEach(modal => modal.close())
      return DEFAULT_STATE
    })
  }
}
