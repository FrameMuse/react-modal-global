import "./PopupLayout.scss"

import { ReactNode } from "react"
import { useModalContext } from "react-modal-global"

interface PopupLayoutProps {
  width?: string
  children: ReactNode
}

function PopupLayout(props: PopupLayoutProps) {
  const modal = useModalContext()

  return (
    <div className="popup-layout" style={{ "--popup-width": props.width }}>
      <div className="popup-layout__container">
        {modal.params.closable && (
          <button className="popup-layout__close" type="button" onClick={modal.close}>&#9587;</button>
        )}
        <div className="popup-layout__inner">{props.children}</div>
      </div>
    </div>
  )
}

export default PopupLayout
