import React from "react"
import { classWithModifiers } from "./utils"
import { PopupContext } from "./context"
import { PopupWindow } from "./interfaces"
import { PopupPrivate } from "./controller"

export interface PopupContainerProps {
  className?: string
}
export interface PopupContainerState {
  isActive: boolean
  queue: PopupWindow[]
}

export class PopupContainer extends React.Component<PopupContainerProps, PopupContainerState> {
  state: PopupContainerState = {
    isActive: false,
    queue: []
  }

  constructor(props: any) {
    super(props)
    // Set Popup dispatcher
    PopupPrivate.dispatch = this.setState.bind(this)
  }

  render() {
    const { isActive, queue } = this.state
    const lastPopup = queue[queue.length - 1]
    const { component: PopupWindowComponent, params = {}, close } = lastPopup || {}

    const className = this.props.className || "popup"
    return (
      <div className={classWithModifiers(className, isActive && "active")}>
        <div className={className + "__container"} onClick={close}>
          <div className={className + "__inner"} onClick={event => event.stopPropagation()}>
            <PopupContext.Provider value={lastPopup}>
              {PopupWindowComponent && <PopupWindowComponent {...params} />}
            </PopupContext.Provider>
          </div>
        </div>
      </div>
    )
  }
}
