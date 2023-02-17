import { render } from "@testing-library/react"
import { act } from "react-dom/test-utils"

import { ModalContainer } from "../container"
import { ModalController } from "../controller"
import { useModalContext } from "../hooks"

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
    const Modal: ModalController = new ModalController()
    const container = render(<ModalContainer />).container

    function ComponentWithModalContext() {
      const { isClosed } = useModalContext()

      return <span>{String(isClosed)}</span>
    }

    act(() => {
      Modal.open(ComponentWithModalContext)
    })

    const isClosed = container.querySelector("span")?.textContent
    expect(isClosed).toBe("false")
    expect(container).toMatchSnapshot()
  })

  it("should return isClosed: true", () => {
    const Modal: ModalController = new ModalController()
    const container = render(<ModalContainer />).container

    function ComponentWithModalContext() {
      const { isClosed } = useModalContext()

      return <span>{String(isClosed)}</span>
    }

    act(() => {
      Modal.open(ComponentWithModalContext).close()
    })

    const isClosed = container.querySelector("span")?.textContent
    expect(isClosed).toBe("true")
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
