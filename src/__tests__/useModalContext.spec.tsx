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

import { render } from "@testing-library/react"
import { act } from "react-dom/test-utils"

import { useModalWindow } from "../hooks"
import { ModalContainer } from "../ModalContainer"
import { ModalController } from "../ModalController"
import { expectToThrow } from "../utils"

let Modal: ModalController = new ModalController()
let container = render(<ModalContainer controller={Modal} />).container

beforeEach(() => {
  Modal = new ModalController()
  container = render(<ModalContainer controller={Modal} />).container
})

describe("useModalContext", () => {
  it("should throw error", () => {
    function ComponentWithoutModalContext() {
      useModalWindow()
      return null
    }

    const renderCallback = () => render(<ComponentWithoutModalContext />)
    expectToThrow(renderCallback, /useModalWindow must be used within a modal context/)
  })

  it("should return `closed`: false", () => {
    function ComponentWithModalContext() {
      const { closed } = useModalWindow()

      return <span>{String(closed)}</span>
    }

    act(() => {
      Modal.open(ComponentWithModalContext)
    })

    const closedSpan = container.querySelector("span")?.textContent
    expect(closedSpan).toBe("false")
    expect(container).toMatchSnapshot()
  })

  it("should return `closed`: true", () => {
    function ComponentWithModalContext() {
      const { closed } = useModalWindow()

      return <span>{String(closed)}</span>
    }

    act(() => {
      Modal.open(ComponentWithModalContext).close()
    })

    expect(Modal.active).toBe(false)
    const closedSpan = container.querySelector("span")?.textContent
    expect(closedSpan).toBe("true")
    expect(container.querySelector(".modal")?.className).toBe("modal")
    expect(container).toMatchSnapshot()
  })
})
