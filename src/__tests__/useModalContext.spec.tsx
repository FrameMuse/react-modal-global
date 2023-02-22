import { render } from "@testing-library/react"
import { act } from "react-dom/test-utils"

import { ModalContainer } from "../container.new"
import { ModalController } from "../controller"
import { useModalContext } from "../hooks"

let Modal: ModalController = new ModalController()
let container = render(<ModalContainer controller={Modal} />).container

beforeEach(() => {
  Modal = new ModalController()
  container = render(<ModalContainer controller={Modal} />).container
})

describe("useModalContext", () => {
  it("should throw error", () => {
    function ComponentWithoutModalContext() {
      useModalContext()
      return null
    }

    const renderCallback = () => render(<ComponentWithoutModalContext />)
    expectToThrow(renderCallback, /useModalContext must be used within a modalContext/)
  })

  it("should return isClosed: false", () => {
    function ComponentWithModalContext() {
      const { isClosed: closed } = useModalContext()

      return <span>{String(closed)}</span>
    }

    act(() => {
      Modal.open(ComponentWithModalContext)
    })

    const closedSpan = container.querySelector("span")?.textContent
    expect(closedSpan).toBe("false")
    expect(container).toMatchSnapshot()
  })

  it("should return isClosed: true", () => {
    function ComponentWithModalContext() {
      const { isClosed: closed } = useModalContext()

      return <span>{String(closed)}</span>
    }

    act(() => {
      Modal.open(ComponentWithModalContext).close()
    })

    expect(Modal.isOpen).toBe(false)
    const closedSpan = container.querySelector("span")?.textContent
    expect(closedSpan).toBe("true")
    expect(container.querySelector(".modal")?.className).toBe("modal")
    expect(container).toMatchSnapshot()
  })
})

/**
 * Helps prevent error logs blowing up as a result of expecting an error to be thrown,
 * when using a library (such as enzyme)
 *
 * @param func Function that you would normally pass to `expect(func).toThrow()`
 */
export const expectToThrow = (func: () => unknown, error?: JestToErrorArg): void => {
  // Even though the error is caught, it still gets printed to the console
  // so we mock that out to avoid the wall of red text.
  const spy = jest.spyOn(console, "error")
  spy.mockImplementation(() => void 0)

  expect(func).toThrow(error)

  spy.mockRestore()
}

type JestToErrorArg = Parameters<jest.Matchers<unknown, () => unknown>["toThrow"]>[0];
