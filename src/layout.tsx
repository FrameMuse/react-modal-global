/*

MIT License

Copyright (c) 2022 FrameMuse

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

*/

/* THIS FILE IS DEPRECATED */

import { usePopupContext } from "./hook"
import { classMerge } from "./utils"

interface PopupDefaultLayoutProps {
  children: any
  className?: string
  rowGap?: string
  width?: string
  title?: any
  desc?: any
  nofooter?: boolean
}

export function PopupDefaultLayout({ children, className, title, desc, rowGap }: PopupDefaultLayoutProps) {
  const { params, close } = usePopupContext()
  return (
    <div className="popup-content">
      {(title || desc) && (
        <PopupHeading title={title} desc={desc} />
      )}
      <div className={classMerge(["popup-content__body", className])} style={{ rowGap }}>{children}</div>
    </div>
  )
}

interface PopupHeadingProps {
  title?: any
  desc?: any
}

interface PopupHeadingProps {
  children?: any
}

export function PopupHeading(props: PopupHeadingProps) {
  return (
    <div className="popup-heading">
      <div className="popup-heading__title">{props.title}</div>
      <div className="popup-heading__desc">{props.desc || props.children}</div>
    </div>
  )
}
