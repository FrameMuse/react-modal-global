import { containers } from "container"
import { createElement, Fragment } from "react"

import { ModalController } from "../controller"

describe("ModalController (without container)", () => {
  test("no containers were mounted", async () => {
    const consoleWarnMock = jest.spyOn(console, "warn").mockImplementation()

    const controller = new ModalController()
    controller.open(() => createElement(Fragment))

    expect(containers.size).toBe(0)
    expect(consoleWarnMock).toHaveBeenCalledWith("ModalError: no containers were mounted.")

    consoleWarnMock.mockRestore()
  })
})
describe("ModalController (with container)", () => {
  test("Modal to be PromiseLike", async () => {
    const controller = new ModalController()
    const modal = controller.open(() => createElement(Fragment))

    expect(modal).toBeInstanceOf(Object)
    expect(modal).toHaveProperty("then")
  })

  test("Modal to be closable", async () => {
    const controller = new ModalController()
    const modal = controller.open(() => createElement(Fragment))

    const onfulfilled = jest.fn()
    const onrejected = jest.fn()

    modal.then(onfulfilled, onrejected)

    expect(onfulfilled).not.toHaveBeenCalled()
    expect(onrejected).not.toHaveBeenCalled()

    modal.close()
    await modal

    expect(onfulfilled).toHaveBeenCalled()
    expect(onrejected).not.toHaveBeenCalled()
  })
})
