import { render } from "@testing-library/react"
import { act } from "react-dom/test-utils"

import { ModalContainer } from "../container"
import { ModalController } from "../controller"
import DrawerLayout from "../layouts/DrawerLayout/DrawerLayout"
import PopupLayout from "../layouts/PopupLayout/PopupLayout"

let Modal: ModalController = new ModalController()
let container = render(<ModalContainer controller={Modal} />).container
let modalContainerElement = container.querySelector(".modal")

beforeEach(() => {
  Modal = new ModalController()
  container = render(<ModalContainer controller={Modal} />).container
  modalContainerElement = container.querySelector(".modal")
})

describe("Layouts", () => {
  describe("PopupLayout", () => {
    it("should render", () => {
      act(() => {
        Modal.open(() => <PopupLayout>123</PopupLayout>)
      })

      expect(modalContainerElement).not.toBeNull()
      expect(modalContainerElement).toMatchSnapshot()
    })
  })

  describe("DrawerLayout", () => {
    it("should render", () => {
      act(() => {
        Modal.open(() => <DrawerLayout>123</DrawerLayout>)
      })

      expect(modalContainerElement).not.toBeNull()
      expect(modalContainerElement).toMatchSnapshot()
    })
  })
})