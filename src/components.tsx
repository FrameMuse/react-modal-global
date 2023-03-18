import _ from "lodash"
import { ReactNode, useEffect, useId } from "react"
import { useUnmount } from "react-use"

import { Modal, ModalController } from "./controller"
import { ModalComponent, ModalParams } from "./types"
import { serialize } from "./utils"


interface ModalViewProps {
  controller?: ModalController

  children: ReactNode
}

export function ModalView(props: ModalViewProps) {
  const id = useId()

  useEffect(() => {
    function ModalViewComponent() {
      return <>{props.children}</>
    }

    const controller = props.controller || Modal
    controller.open(ModalViewComponent, { id })
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

  controller?: ModalController
}

export function ModalOpen<ComponentProps>(props: ModalOpenProps<ComponentProps>) {
  useEffect(() => {
    const controller = props.controller || Modal
    const params = { ...props.componentProps, ..._.omit(props, "component", "componentProps", "controller") }
    const modal = controller.open(props.component, params)


    return () => {
      modal.close()
    }
  }, [props.component, serialize(props.componentProps), props.controller])

  return null
}
