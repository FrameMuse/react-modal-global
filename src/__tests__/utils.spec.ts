import { serialize } from "../utils"

describe("utils", () => {
  describe("serialize", () => {
    it("should remove circular references", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const a = { b: 1 } as any
      a.a = a

      expect(serialize(a)).toBe(`{"b":1}`)
    })
  })
})
