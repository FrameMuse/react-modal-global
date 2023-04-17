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

import { ReactNode } from "react"

import { useModalContext } from "../hooks"

interface PopupLayoutProps {
  width?: string;
  children: ReactNode;
}

function PopupLayout(props: PopupLayoutProps) {
  const modal = useModalContext()

  return (
    <div className="popup-layout" style={{ "--popup-width": props.width }}>
      <div className="popup-layout__container">
        {modal.params.closable && (
          <button
            className="popup-layout__close"
            type="button"
            onClick={modal.close}
          >
            &#9587;
          </button>
        )}
        <div className="popup-layout__inner">{props.children}</div>
      </div>
    </div>
  )
}

export default PopupLayout
