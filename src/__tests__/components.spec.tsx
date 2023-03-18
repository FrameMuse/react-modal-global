import "@testing-library/jest-dom"

import { render } from "@testing-library/react"

import { ModalOpen,ModalView } from "../components"
import { ModalContainer } from "../container.new"
import { ModalController } from "../controller"

let Modal: ModalController = new ModalController()

beforeEach(() => {
  Modal = new ModalController()
})

describe("Components", () => {
  test("ModalView", () => {
    const { container } = render(
      <>
        <ModalContainer controller={Modal} />
        <ModalView controller={Modal}>
          <div id="test1">123</div>
          <div id="test2">675</div>
        </ModalView>
      </>
    )

    expect(container).toMatchSnapshot()

    expect(container.querySelector("#test1")).toHaveTextContent("123")
    expect(container.querySelector("#test2")).toHaveTextContent("675")
    expect(container).toHaveTextContent("123675")
  })

  test("ModalOpen", () => {
    function Test(props: { a: 1 }) { return <div id="a">a{props.a}</div> }

    const { container } = render(
      <>
        <ModalContainer controller={Modal} />

        <ModalOpen
          component={Test}
          componentProps={{ a: 1 }}

          controller={Modal}
        />
      </>
    )

    expect(container).toMatchSnapshot()
    expect(container.querySelector("#a")).toHaveTextContent("a1")
  })
})
