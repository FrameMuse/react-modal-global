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

import { createElement, Fragment } from "react"
import { act } from "react-dom/test-utils"

// import { containers } from "../container"
import { ModalController } from "../controller"

let Modal: ModalController = new ModalController()

beforeEach(() => {
  Modal = new ModalController()
})

// describe("ModalController (without container)", () => {
//   test("no containers were mounted", async () => {
//     const consoleWarnMock = jest.spyOn(console, "warn").mockImplementation()

//     const controller = new ModalController()
//     controller.open(() => createElement(Fragment))

//     expect(containers.size).toBe(0)
//     expect(consoleWarnMock).toHaveBeenCalledWith("ModalError: no containers were mounted.")

//     consoleWarnMock.mockRestore()
//   })
// })
describe("ModalController (with container)", () => {
  it("should have `isOpen` true when open", () => {
    act(() => {
      Modal.open(() => null)
    })

    expect(Modal.isOpen).toBe(true)
  })

  it("should have `isOpen` false when closed", () => {
    act(() => {
      Modal.open(() => null).close()
    })

    expect(Modal.isOpen).toBe(false)
  })

  test("Modal to be PromiseLike", () => {
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
