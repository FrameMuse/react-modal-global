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

import { ReactNode, useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { modalContext } from "./context"
import { ModalController } from "./ModalController"
import { ModalWindow, ModalWindowAny } from "./ModalWindow"
import { ModalParams } from "./types"


interface ModalPortalProps {
  /**
   * If not presented, will be used from the context.
   */
  controller: ModalController
  children: ReactNode

  onClose?(): void
  onUserClose?(): void
  onUnmountClose?(): void

  params?: Partial<ModalParams>
}

/**
 * Renders given children as a modal.
 *
 * Can render
 */
export function ModalPortal(props: ModalPortalProps) {
  const id = useId()
  const modalWindowRef = useRef<ModalWindowAny>(new ModalWindow(() => null, {}))

  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)

  function replaceWithFragment(element: HTMLDivElement | null) {
    const parentElement = element?.parentElement
    if (parentElement == null) return

    setPortalElement(parentElement)
  }

  useEffect(() => {
    const ModalViewComponent = () => <div style={{ display: "none" }} ref={replaceWithFragment} />
    const modal = props.controller.open(ModalViewComponent, { ...props.params, id })
    modalWindowRef.current = modal

    modal.on("close", props.onClose)
    const offUserClose = props.onUserClose && modal.on("close", props.onUserClose)

    return () => {
      offUserClose?.()
      props.onUnmountClose?.()
      modal.close()
    }
  }, [props.controller, id])

  if (portalElement == null) {
    return null
  }

  return (
    <modalContext.Provider value={modalWindowRef.current}>
      {createPortal(props.children, portalElement, id)}
    </modalContext.Provider>
  )
}
