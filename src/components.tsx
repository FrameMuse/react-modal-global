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

import _ from "lodash"
import { cloneElement, ReactElement, ReactNode, useEffect, useId, useRef } from "react"
import { useUnmount } from "react-use"
import { SetOptional } from "type-fest"

import { Modal, ModalController } from "./controller"
import { ModalComponent, ModalParams } from "./types"
import { serialize } from "./utils"


interface ModalViewProps {
  controller?: ModalController

  onClosed?(): void

  children: ReactNode
}

/**
 * Renders given children as a modal.
 *
 * Can render
 */
export function ModalView(props: ModalViewProps) {
  const id = useId()

  useEffect(() => {
    function ModalViewComponent() {
      return <>{props.children}</>
    }

    const controller = props.controller || Modal
    const modal = controller.open(ModalViewComponent, { id })
    // Trigger onClosed after modal is closed.
    modal.then(props.onClosed)

    return () => {
      // Delayed close to prevent flickering and unnecessary closing, opening animations.
      setTimeout(() => modal.close())
    }
  }, [props.children, props.controller])

  useUnmount(() => {
    const controller = props.controller || Modal
    controller.closeById(id)
  })

  return null
}





interface ModalOpenProps<ComponentProps> extends Partial<ModalParams> {
  component: ModalComponent<ComponentProps>
  componentProps: ComponentProps

  onClosed?(): void

  controller?: ModalController
}

/**
 * Opens a modal with given component and props.
 *
 * Similar to `ModalView`, but it opens a modal instead of rendering it as a child.
 * It can be closed by component and given id.
 */
export function ModalOpen<ComponentProps>(
  props: keyof ComponentProps extends never ? SetOptional<ModalOpenProps<ComponentProps>, "componentProps"> : ModalOpenProps<ComponentProps>
) {
  useEffect(() => {
    const controller = props.controller || Modal
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: ComponentProps & Partial<ModalParams> = { ...props.componentProps as any, ..._.omit(props, "component", "componentProps", "controller") }
    const modal = controller.open<ComponentProps>(props.component, params)
    // Trigger onClosed after modal is closed.
    modal.then(props.onClosed)

    return () => {
      // Delayed close to prevent flickering and unnecessary closing, opening animations.
      setTimeout(() => modal.close())
    }
  }, [props.component, serialize(props.componentProps), props.controller])

  return null
}






interface ModalGroupProps {
  /**
   * Called when a modal from this group is closed.
   */
  onClosed?(): void
  /**
   * Called when all modals from this group are closed.
   */
  onAllClosed?(): void

  children: ReactElement<ModalViewProps | ModalOpenProps<unknown>>[]
}

export function ModalGroup(props: ModalGroupProps) {
  const closedModalsRef = useRef(0)

  useEffect(() => {
    return () => {
      closedModalsRef.current = 0
    }
  }, [props.children])

  const children = props.children.map(child => {
    function onClosed() {
      // Count closed modals.
      closedModalsRef.current += 1

      // Call onClosed from child.
      child.props.onClosed?.()

      // Handle onClosed and onAllClosed from ModalGroup.
      props.onClosed?.()
      if (closedModalsRef.current >= props.children.length - 1) {
        props.onAllClosed?.()
      }
    }

    return cloneElement(child, { ...child.props, onClosed }, null)
  })

  return <>{children}</>
}
