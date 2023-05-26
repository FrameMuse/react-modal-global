import "@testing-library/jest-dom"

import { render } from "@testing-library/react"

import { ModalContainer } from "../ModalContainer"
import { ModalController } from "../ModalController"
import { ModalPortal } from "../ModalPortal"

let Modal: ModalController = new ModalController()

beforeEach(() => {
  Modal = new ModalController()
})

describe("Components", () => {
  test("ModalPortal", () => {
    function Test(props: { a: string }) {
      return <div id="a">a_{props.a}</div>
    }

    const { container } = render(
      <>
        <ModalContainer controller={Modal} />

        <ModalPortal controller={Modal}>
          <Test a="test-a" />
        </ModalPortal>
      </>
    )

    expect(container).toMatchSnapshot()
    expect(container.querySelector("#a")).toHaveTextContent("a_test-a")
  })
})
