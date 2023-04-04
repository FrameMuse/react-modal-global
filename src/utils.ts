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

import { SyntheticEvent } from "react"


/**
 * Join modifiers with origin class
 * @returns `"origin-class origin-class--modifier"`
 */
export function classWithModifiers(originClass: string, ...modifiers: Array<string | number | false | null | undefined>): string {
  modifiers = modifiers.filter(Boolean)
  if (!modifiers.length) return originClass

  const space = " "
  const separator = "--"

  modifiers = modifiers.map(modifier => originClass + separator + modifier)
  return originClass + space + modifiers.join(space)
}


export function serialize<T = unknown>(value?: T | null) {
  if (value == null) return String(value)

  function getCircularReplacer() {
    const seen = new WeakSet()
    return (_key: string, value: unknown) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return
        }
        seen.add(value)
      }

      return value
    }
  }

  function transform(key: string, value: unknown) {
    if (value instanceof Function) {
      // If function is anonymous, return its string representation.
      if (value.name === key || value.name.length === 0) {
        return value.toString()
      }

      return value.name
    }

    return value
  }

  function replacer() {
    const circularReplacer = getCircularReplacer()

    return (key: string, value: unknown) => {
      const transformedValue = transform(key, value)

      const circularReplacedValue = circularReplacer(key, transformedValue)
      return circularReplacedValue
    }
  }

  const serializedValue = JSON.stringify(value, replacer())
  return serializedValue
}

/**
 * Stops propagation from container
 * @param callback any function
 * @returns mouse event handler
 */
export function stopPropagation(callback?: (() => void) | null) {
  return ({ target, currentTarget }: Event | SyntheticEvent) => {
    if (target instanceof Element && currentTarget instanceof Element) {
      if (target !== currentTarget) return
    }

    callback?.()
  }
}

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
