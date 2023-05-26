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

import { ReactNode, useEffect, useId, useState } from "react"
import { createPortal } from "react-dom"

import { ModalController } from "./ModalController"
import { ModalParams } from "./types"


interface ModalPortalProps {
  /**
   * If not presented, will be used from the context.
   */
  controller: ModalController
  children: ReactNode

  onClose?(): void
  params?: Partial<ModalParams>
}

/**
 * Renders given children as a modal.
 *
 * Can render
 */
export function ModalPortal(props: ModalPortalProps) {
  const id = useId()

  useEffect(() => {
    return () => {
      props.controller.closeById(id)
    }
  }, [props.controller, id])

  // return useMemo(() => {
  //   const portalElement = document.createDocumentFragment()

  //   function replaceWithFragment(element: HTMLDivElement | null) {
  //     if (element == null) return

  //     portalElement.replaceChildren(element)
  //   }


  //   const ModalViewComponent = () => <div ref={replaceWithFragment} />
  //   const modal = props.controller.open(ModalViewComponent, { ...props.params, id })
  //   if (props.onClose) {
  //     modal.on("close", props.onClose)
  //   }


  //   return (
  //     <modalContext.Provider value={modal}>
  //       {createPortal(props.children, portalElement, id)}
  //     </modalContext.Provider>
  //   )
  // }, [props.controller, id])

  const [fragment, setFragment] = useState<HTMLDivElement | null>(null)

  function replaceWithFragment(element: HTMLDivElement | null) {
    if (element == null) return

    setFragment(element)
  }

  useEffect(() => {
    const ModalViewComponent = () => <div ref={replaceWithFragment} />
    const modal = props.controller.open(ModalViewComponent, { ...props.params, id })
    if (props.onClose) {
      modal.on("close", props.onClose)
    }

    return () => {
      modal.close()

      // // Delayed close to prevent flickering and unnecessary closing, opening animations.
      // setTimeout(() => modal.close())
    }
  }, [props.controller, id])

  if (fragment == null) {
    return null
  }

  return createPortal(props.children, fragment, id)
}





// interface ModalOpenProps<ComponentProps> extends Partial<ModalParams> {
//   component: ModalComponent<ComponentProps>
//   componentProps: ComponentProps

//   onClosed?(): void

//   controller?: ModalController
// }

// /**
//  * Opens a modal with given component and props.
//  *
//  * Similar to `ModalView`, but it opens a modal instead of rendering it as a child.
//  * It can be closed by component and given id.
//  */
// export function ModalOpen<ComponentProps>(
//   props: keyof ComponentProps extends never ? SetOptional<ModalOpenProps<ComponentProps>, "componentProps"> : ModalOpenProps<ComponentProps>
// ) {
//   useEffect(() => {
//     const controller = props.controller || Modal
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const params: ComponentProps & Partial<ModalParams> = { ...props.componentProps as any, ..._.omit(props, "component", "componentProps", "controller") }
//     const modal = controller.open<ComponentProps>(props.component, params)
//     // Trigger onClosed after modal is closed.
//     modal.then(props.onClosed)

//     return () => {
//       // Delayed close to prevent flickering and unnecessary closing, opening animations.
//       setTimeout(() => modal.close())
//     }
//   }, [props.component, serialize(props.componentProps), props.controller])

//   return null
// }
