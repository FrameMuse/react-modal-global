import { ReactNode } from "react"

interface VisibilityProps {
  hidden: boolean

  children: ReactNode
}

function Visibility(props: VisibilityProps) {
  return (
    <div style={{ contentVisibility: props.hidden ? "hidden" : "visible" }}>{props.children}</div>
  )
}

export default Visibility
