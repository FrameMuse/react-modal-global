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
import { ModalComponent, ModalParams, ModalWindow, ModalWindowParams } from "./types"
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

/**
 * Controller for opening and closing modal windows.
 *
 * Can be used with `ModalContainer` or with custom implementation.
 */
export class ModalController {
  /**
   * Opens a modal window. Infers props from the component.
   *
   * - If the same modal window is already in the queue, it will be ignored.
   * - If the modal window is weak, it will be unmounted after closing.
   * - If the modal window is forked, it will be opened over all other modals.
   * - If the modal window is closable (be default `true`), it will be closed by clicking on the overlay.
   * - If the modal window is not closable, it will be closed only by calling internal `close` method.
   *
   * @param component Modal component.
   * @param params Modal params.
   * @returns Modal window and `PromiseLike`.
   *
   * @example
   * const modal = modalController.open(MyModal, { id: 1 })
   * modal.closable // `true` by default
   *
   * modal.then(() => console.log("Modal was closed"))
   * modal.close()
   */
  public open<P>(component: ModalComponent<P>, ...[modalParams]: ModalWindowParams<P>): ModalWindow<P> & PromiseLike<void> {
    let resolveFunction = () => { /* Noop */ }
    const promise = new Promise<void>(resolve => resolveFunction = resolve)
    const close = () => {
      this.remove(modal)
      resolveFunction()
    }

    const params: ModalParams & P = { ...DEFAULT_PARAMS, ...modalParams as P }
    const modal: ModalWindow<P> = { component, params, close, isClosed: false }

    this.add(modal)

    return {
      ...modal,
      then(onfulfilled?, onrejected?) {
        return promise.then(onfulfilled, onrejected)
      },
    }
  }
  /**
   * Replaces the last modal window in the queue with a new one.
   *
   * If the queue is empty, it will be added to the queue.
   */
  public replace<P>(component: ModalComponent<P>, ...[params]: ModalWindowParams<P>): ModalWindow<P> & PromiseLike<void> {
    dispatch(state => ({
      ...state,
      queue: state.queue.slice(0, -1)
    }))
    return this.open(component, params as never)
  }
  /**
   * Adds a modal window to the queue.
   */
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

      // Skip adding to queue if it has been closed being filled.
      if (state.active === false && state.queue.length > 0) {
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
  /**
   * Removes a modal window from the queue.
   */
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
  /**
   * Forks a modal window and adds it to a forked queue.
   *
   * It means that the modal will be open over all other modals.
   */
  private fork<P>(modalWindow: ModalWindow<P>) {
    dispatch<P>(state => {
      return {
        ...state,
        forkedQueue: [...state.forkedQueue, modalWindow]
      }
    })
  }

  /**
   * Closes all modals by its component (including forked) starting from the last one.
   */
  public closeByComponent<P>(component: ModalComponent<P>) {
    dispatch(state => {
      const queue = [...state.queue.filter(modal => modal.component === component)]
      const forkedQueue = [...state.forkedQueue.filter(modal => modal.component === component)]

      queue.reverse().forEach(modal => modal.close())
      forkedQueue.reverse().forEach(modal => modal.close())

      return state
    })
  }
  /**
   * Closes all modals by its id (including forked) starting from the last one.
   */
  public closeById(id: ModalParams["id"]) {
    dispatch(state => {
      const queue = state.queue.filter(modal => modal.params.id === id)
      const forkedQueue = state.forkedQueue.filter(modal => modal.params.id === id)

      queue.forEach(modal => modal.close())
      forkedQueue.forEach(modal => modal.close())

      return state
    })
  }
  /**
   * Closes all modals (including forked).
   */
  public closeAll() {
    dispatch(state => {
      state.queue.forEach(modal => modal.close())
      return DEFAULT_STATE
    })
  }
}

export const Modal = new ModalController
