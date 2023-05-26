import "@testing-library/jest-dom"

import { render } from "@testing-library/react"

import { ModalPortal } from "../components"
import { ModalContainer } from "../ModalContainer"
import { ModalController } from "../ModalController"

let Modal: ModalController = new ModalController()

beforeEach(() => {
  Modal = new ModalController()
})

describe("Components", () => {
  // test("ModalView", () => {
  //   const { container } = render(
  //     <>
  //       <ModalContainer controller={Modal} />
  //       <ModalPortal controller={Modal}>
  //         <div id="test1">123</div>
  //         <div id="test2">675</div>
  //       </ModalPortal>
  //     </>
  //   )

  //   expect(container).toMatchSnapshot()

  //   expect(container.querySelector("#test1")).toHaveTextContent("123")
  //   expect(container.querySelector("#test2")).toHaveTextContent("675")
  //   expect(container).toHaveTextContent("123675")
  // })

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
