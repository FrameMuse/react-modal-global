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

import { createElement, Fragment, lazy } from "react"
import { act } from "react-dom/test-utils"

import { ModalController } from "../ModalController"
import { ModalParams } from "../types"

let Modal: ModalController = new ModalController()

beforeEach(() => {
  Modal = new ModalController()
})

describe("ModalController (with container)", () => {
  it("should have `active` true when open", () => {
    act(() => {
      Modal.open(() => null)
    })

    expect(Modal.active).toBe(true)
  })

  it("should have `active` false when closed", () => {
    act(() => {
      Modal.open(() => null).close()
    })

    expect(Modal.active).toBe(false)
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

  describe("ModalWindow id", () => {
    it("should have `id`", () => {
      const controller = new ModalController()
      const modal = controller.open(() => createElement(Fragment))

      expect(modal.id).toBeDefined()
      expect(typeof modal.id).toBe("number")
    })

    it("should be unique", () => {
      const controller = new ModalController()

      const modal1 = controller.open(() => null)
      const modal2 = controller.open(() => createElement(Fragment))
      expect(modal1.id).not.toBe(modal2.id)


      function Test() { return null }
      const modal3 = controller.open(Test, { id: "test1" })
      const modal4 = controller.open(Test, { id: "test2" })
      expect(modal3.id).not.toBe(modal4.id)
    })

    it("should be consistent", () => {
      const controller = new ModalController()

      const modal1 = controller.open(() => null)
      const modal2 = controller.open(() => null)
      expect(modal1.id).toBe(modal2.id)

      function Test() { return null }
      const modal3 = controller.open(Test, { id: "test" })
      const modal4 = controller.open(Test, { id: "test" })
      expect(modal3.id).toBe(modal4.id)
    })
  })

  describe("ModalController Config", () => {
    it("should apply `defaultParams`", () => {
      const defaultParams: ModalParams = {
        id: 1,
        closable: false,
        keepMounted: true,
        layer: 2,
        layout: undefined,
        label: "TEST",

        weak: true,
        fork: true
      }
      const controller = new ModalController({ defaultParams })
      const modal = controller.open(() => createElement(Fragment))

      expect(modal.params).toStrictEqual(defaultParams)
    })

    it("openNamed", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      function Test1(props: { a: 1 }) { return null }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      function Test2(props: { b?: 2 }) { return createElement("a") }

      const controller = new ModalController({
        components: {
          test1: Test1,
          test2: Test2,
          lazied: lazy(async () => ({ default: (await import("../ModalContainer")).ModalContainer }))
        }
      })

      controller.openNamed("test1", { a: 1 })
      controller.openNamed("test2")
      controller.openNamed("test2", { b: 2 })
      controller.openNamed("lazied", { controller: new ModalController })
    })

    it("replaceNamed", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      function Test1(props: { a: 1 }) { return null }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      function Test2(props: { b?: 2 }) { return createElement("a") }

      const controller = new ModalController({
        components: {
          test1: Test1,
          test2: Test2,
          lazied: lazy(async () => ({ default: (await import("../ModalContainer")).ModalContainer }))
        }
      })

      controller.replaceNamed("test1", { a: 1 })
      controller.replaceNamed("test2")
      controller.replaceNamed("test2", { b: 2 })
      controller.replaceNamed("lazied", { controller: new ModalController })
    })
  })
})
