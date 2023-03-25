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

import "@testing-library/jest-dom"

import { render } from "@testing-library/react"
import { useEffect, useState } from "react"
import { act } from "react-dom/test-utils"

import { ModalContainer } from "../container"
import { ModalController } from "../controller"
import { useModalContext } from "../hooks"
import { classWithModifiers } from "../utils"

let Modal: ModalController = new ModalController()
let container = render(<ModalContainer controller={Modal} />).container
let modalContainerElement = container.querySelector(".modal")

beforeEach(() => {
  Modal = new ModalController()
  container = render(<ModalContainer controller={Modal} />).container
  modalContainerElement = container.querySelector(".modal")
})

describe("ModalContainer", () => {
  it("should render", () => {
    expect(modalContainerElement).not.toBeNull()
    expect(modalContainerElement).toMatchSnapshot()
  })

  it("should have the correct class name by default", () => {
    expect(modalContainerElement).toHaveClass("modal")
    expect(modalContainerElement).not.toHaveClass("modal--open")

    expect(modalContainerElement).toMatchSnapshot()
  })

  it("should have the correct class name when open", () => {
    act(() => {
      Modal.open(PopupExample)
    })

    expect(modalContainerElement).toHaveClass(classWithModifiers("modal", "active"))
    expect(modalContainerElement).toMatchSnapshot()
  })

  it("should have the correct class name when closed (not weak)", () => {
    act(() => {
      Modal.open(PopupExample)
    })

    act(() => {
      modalContainerElement?.querySelector("button")?.click()
    })

    expect(modalContainerElement).not.toHaveClass(classWithModifiers("modal", "active"))
    expect(modalContainerElement).toMatchSnapshot()
  })

  it("should render the correct component", () => {
    act(() => {
      Modal.open(PopupExample)
    })

    expect(modalContainerElement?.querySelector("h1")).toHaveTextContent("Popup Example")
    expect(modalContainerElement).toMatchSnapshot()
  })

  it("should render nullish component", () => {
    act(() => {
      Modal.open(() => null)
    })

    expect(modalContainerElement?.querySelector("h1")).toBeNull()
    expect(modalContainerElement).toMatchSnapshot()
  })

  it("should render the correct component on re-open (not weak)", () => {
    act(() => {
      Modal.open(PopupExample, { random: true })
    })

    const savedElement = modalContainerElement?.cloneNode(true)

    act(() => {
      modalContainerElement?.querySelector("button")?.click()
    })

    act(() => {
      Modal.open(PopupExample, { random: true })
    })

    expect(modalContainerElement).toEqual(savedElement)
  })

  it("should render the correct component on re-open (weak)", () => {
    act(() => {
      Modal.open(PopupExample, { random: true, weak: true })
    })

    const savedElement = modalContainerElement?.cloneNode(true)

    act(() => {
      modalContainerElement?.querySelector("button")?.click()
    })

    act(() => {
      Modal.open(PopupExample, { random: true, weak: true })
    })

    expect(modalContainerElement).not.toEqual(savedElement)
  })

  it("should render the correct component when closed (not weak)", () => {
    act(() => {
      Modal.open(PopupExample)
    })

    act(() => {
      modalContainerElement?.querySelector("button")?.click()
    })

    expect(modalContainerElement?.querySelector("h1")).toHaveTextContent("Popup Example")
    expect(modalContainerElement).toMatchSnapshot()
  })

  it("should render the correct component when closed (weak)", () => {
    act(() => {
      Modal.open(PopupExample, { weak: true })
    })

    act(() => {
      modalContainerElement?.querySelector("button")?.click()
    })

    expect(modalContainerElement?.querySelector("h1")).toBeNull()
    expect(modalContainerElement).toMatchSnapshot()
  })

  it("should render the correct component when closed (weak) and re-opened", () => {
    act(() => {
      Modal.open(PopupExample, { weak: true })
    })

    act(() => {
      modalContainerElement?.querySelector("button")?.click()
    })

    act(() => {
      Modal.open(PopupExample, { weak: true })
    })

    expect(modalContainerElement?.querySelector("h1")).toHaveTextContent("Popup Example")
    expect(modalContainerElement).toMatchSnapshot()
  })

  it("should render the correct component when open multiple and closed one", () => {
    act(() => {
      Modal.open(PopupExample)
      Modal.open(PopupExample, { test: true })
      Modal.open(PopupExample, { test: "1" })
      Modal.open(PopupExample, { test: "2" })
    })

    act(() => {
      modalContainerElement?.querySelector("button")?.click()
    })

    expect(modalContainerElement?.querySelector("#test")).toHaveTextContent("1")
    expect(modalContainerElement).toMatchSnapshot()
  })

  it("should render the correct component when open multiple and closed-open-closed one", () => {
    act(() => {
      const modal1 = Modal.open(PopupExample, { test: "1" })
      modal1.close()
      const modal2 = Modal.open(PopupExample, { test: "2" })
      modal2.close()
    })

    expect(modalContainerElement?.querySelector("h1")).toHaveTextContent("Popup Example")
    expect(modalContainerElement?.querySelector("#test")).toHaveTextContent("2")
    expect(modalContainerElement).toMatchSnapshot()
  })

  it("should render the correct component when open multiple and closed all", () => {
    act(() => {
      Modal.open(PopupExample)
      Modal.open(PopupExample, { test: true })
      Modal.open(PopupExample, { test: "1" })
      Modal.open(PopupExample, { test: "2" })
    })

    act(() => {
      Modal.closeAll()
    })

    expect(modalContainerElement?.querySelector("h1")).toHaveTextContent("Popup Example")
    expect(modalContainerElement?.querySelector("#test")).toHaveTextContent("2")
    expect(modalContainerElement).toMatchSnapshot()
  })

  it("should render the correct component when closed by component 1", () => {
    act(() => {
      Modal.open(PopupExample)
      Modal.open(PopupExample, { test: "7" })
      Modal.open(PopupExample, { test: "1" })
      Modal.open(PopupExample, { test: "2" })

      Modal.closeByComponent(PopupExample)
    })

    expect(modalContainerElement?.querySelector("#test")).toHaveTextContent("2")
    expect(modalContainerElement).toMatchSnapshot()
  })

  it("should render the correct component when closed by component 2", () => {
    act(() => {
      Modal.open(() => null)
      Modal.open(PopupExample)
      Modal.open(PopupExample, { test: "7" })
      Modal.open(PopupExample, { test: "1" })
      Modal.open(PopupExample, { test: "2" })

      Modal.closeByComponent(PopupExample)
    })

    expect(modalContainerElement?.querySelector("h1")).toBeNull()
    expect(modalContainerElement?.querySelector("#test")).toBeNull()
    expect(modalContainerElement).toMatchSnapshot()
  })

  it("should render the correct component when closed by id", () => {
    act(() => {
      Modal.open(PopupExample)
      Modal.open(PopupExample, { test: true })
      Modal.open(PopupExample, { test: "1", id: "1" })
      Modal.open(PopupExample, { test: "2", id: "2" })
      Modal.open(PopupExample, { test: "3", id: "2" })

      Modal.closeById("2")
    })

    expect(modalContainerElement?.querySelector("#test")).toHaveTextContent("1")
    expect(modalContainerElement).toMatchSnapshot()
  })

  it("should work with same repeated modals", () => {
    act(() => {
      Modal.open(PopupExample)
      Modal.open(PopupExample)
    })

    expect(modalContainerElement?.querySelectorAll("h1")).toHaveLength(1)
    expect(modalContainerElement).toMatchSnapshot()
  })

  it("should render the correct component when replaced (open)", () => {
    act(() => {
      Modal.open(PopupExample)
      Modal.replace(PopupExample, { test: true })
    })

    expect(modalContainerElement?.querySelector("h1")).toHaveTextContent("Popup Example")
    expect(modalContainerElement?.querySelector("#test")).not.toBeNull()
    expect(modalContainerElement?.classList).toContain("modal--active")
    expect(modalContainerElement).toMatchSnapshot()
  })

  it("should render the correct component when replaced (closed)", () => {
    act(() => {
      Modal.open(PopupExample)
      const modal = Modal.replace(PopupExample, { test: true })
      modal.close()
    })

    expect(modalContainerElement?.querySelector("h1")).toHaveTextContent("Popup Example")
    expect(modalContainerElement?.querySelector("#test")).not.toBeNull()
    expect(modalContainerElement?.classList).not.toContain("modal--active")
    expect(modalContainerElement).toMatchSnapshot()
  })

  it("should render the correct component when forked", () => {
    act(() => {
      Modal.open(PopupExample)
      Modal.open(PopupExample, { test: true, fork: true })
    })

    expect(container?.querySelectorAll(".modal__container")).toHaveLength(2)
    expect(container?.querySelector("#test")).not.toBeNull()
    expect([...container?.children || []].every(child => child.classList.contains("modal--active"))).toBe(true)
    expect(container).toMatchSnapshot()
  })

  it("should render the correct component when forked closed", () => {
    act(() => {
      Modal.open(PopupExample)
      const modalForked = Modal.open(PopupExample, { test: true, fork: true })
      modalForked.close()
    })

    expect(container?.querySelectorAll(".modal__container")).toHaveLength(1)
    expect(container?.querySelector("#test")).toBeNull()
    expect([...container?.children || []].every(child => child.classList.contains("modal--active"))).toBe(true)
    expect(container).toMatchSnapshot()
  })

  it("should render the correct component when forked (not closable)", () => {
    act(() => {
      Modal.open(PopupExample)
      Modal.open(PopupExample, { test: true, fork: true, closable: false })
    })

    expect(container?.querySelectorAll(".modal__container")).toHaveLength(2)
    expect(container?.querySelector("#test")).not.toBeNull()
    expect([...container?.children || []].every(child => child.classList.contains("modal--active"))).toBe(true)
    expect(container).toMatchSnapshot()
  })
})


function PopupExample(props: { random?: boolean, test?: string | boolean }) {
  const modal = useModalContext()
  const [random, setRandom] = useState(0)
  useEffect(() => setRandom(Date.now()), [props.random])

  return (
    <div>
      {props.random && <span id="random">{random}</span>}
      {props.test && <span id="test">{props.test}</span>}
      <h1>Popup Example</h1>
      <button onClick={modal.close}>Close</button>
    </div>
  )
}
