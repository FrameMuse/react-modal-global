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

import { SetStateAction } from "react"

import { containers, ModalContainerState } from "./container"
import { ModalComponent, ModalParams, ModalWindow } from "./types"
import { serialize } from "./utils"

const DEFAULT_STATE: ModalContainerState = {
  active: false,
  queue: [],
  forkedQueue: []
}
const DEFAULT_PARAMS: ModalParams = {
  id: 0,
  closable: true,
  weak: false,
  fork: false
}

function dispatch<P = unknown>(setStateAction: SetStateAction<ModalContainerState<P>>) {
  const lastContainer = [...containers].at(-1)
  if (lastContainer == null) {
    console.warn("ModalError: no containers were mounted.")
    return
  }

  lastContainer.setState(setStateAction)
}

export class ModalController {
  public open<P>(
    component: ModalComponent<P>,
    ...[modalParams]: keyof P extends never ? [Partial<ModalParams>?] : [Partial<ModalParams> & P]
  ): ModalWindow<P> & PromiseLike<void> {
    let resolveFunction = () => { /* Noop */ }
    const promise = new Promise<void>(resolve => resolveFunction = resolve)
    const close = () => {
      this.remove(modal)
      resolveFunction()
    }

    const params: ModalParams & P = { ...DEFAULT_PARAMS, ...modalParams as P }
    const modal: ModalWindow<P> = { component, params, close }

    this.add(modal)

    return {
      ...modal,
      then(onfulfilled?, onrejected?) {
        return promise.then(onfulfilled, onrejected)
      },
    }
  }
  public replace<P>(
    component: ModalComponent<P>,
    ...[params]: keyof P extends never ? [Partial<ModalParams>?] : [Partial<ModalParams> & P]
  ): ModalWindow<P> & PromiseLike<void> {
    dispatch(state => ({
      ...state,
      queue: state.queue.slice(0, -1)
    }))
    return this.open(component, params as never)
  }
  private add<P>(modalWindow: ModalWindow<P>) {
    if (modalWindow.params.fork) {
      this.fork(modalWindow)
      return
    }

    dispatch<P>(state => {
      // Skip adding to queue if the window is already in the beginning of the queue.
      if (!modalWindow.params?.weak && state.queue.length > 0) {
        const lastWindow = state.queue[state.queue.length - 1]

        const areParamsEqual = serialize(modalWindow.params) === serialize(lastWindow.params)
        const areComponentsEqual = modalWindow.component === lastWindow.component
        if (areParamsEqual && areComponentsEqual) {
          return {
            ...state,
            active: true
          }
        }
      }

      return {
        ...state,
        active: true,
        queue: [...state.queue, modalWindow]
      }
    })
  }
  private remove<P>(modalWindowToRemove: ModalWindow<P>) {
    if (modalWindowToRemove.params.fork) {
      dispatch(state => {
        const forkedQueue = state.forkedQueue.filter(mw => mw !== modalWindowToRemove)
        return { ...state, forkedQueue }
      })
      return
    }

    dispatch(state => {
      const newQueue = state.queue.filter(modalWindow => modalWindow !== modalWindowToRemove)
      const isNewQueueEmpty = newQueue.length === 0

      // Hide modal without removing if it's the last window if it's not weak.
      if (isNewQueueEmpty && !modalWindowToRemove.params.weak) {
        return { ...state, active: false }
      }

      return { ...state, queue: newQueue, active: !isNewQueueEmpty }
    })
  }
  private fork<P>(modalWindow: ModalWindow<P>) {
    dispatch<P>(state => {
      return {
        ...state,
        forkedQueue: [...state.forkedQueue, modalWindow]
      }
    })
  }
  public closeAll() {
    dispatch(state => {
      state.queue.forEach(modal => modal.close())
      return DEFAULT_STATE
    })
  }
}

export const Modal = new ModalController
