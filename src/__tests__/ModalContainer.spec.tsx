import "@testing-library/jest-dom"

import { render } from "@testing-library/react"
import { ModalController } from "controller"
import { useModalContext } from "hooks"
import { useEffect, useState } from "react"
import { act } from "react-dom/test-utils"
import { classWithModifiers } from "utils"

import { ModalContainer } from "../container"

let Modal: ModalController = new ModalController()
let container = render(<ModalContainer />).container
let modalContainerElement = container.querySelector(".modal")

beforeEach(() => {
  Modal = new ModalController()
  container = render(<ModalContainer />).container
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

  it("should have the correct class name when closed", () => {
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
})


function PopupExample(props: { random?: boolean }) {
  const modal = useModalContext()
  const [random, setRandom] = useState(0)
  useEffect(() => setRandom(Date.now()), [props.random])

  return (
    <div>
      {props.random && <span>{random}</span>}
      <h1>Popup Example</h1>
      <button onClick={modal.close}>Close</button>
    </div>
  )
}
