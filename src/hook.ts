import { useContext, useRef } from "react"
import { PopupContext } from "./context"
import { PopupWindow } from "./interfaces"

export function usePopupContext() {
  const context = useRef(useContext(PopupContext))

  return {
    ...context.current,
    component: undefined
  } as Omit<PopupWindow, "component">
}
