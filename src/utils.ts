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

import { ModalComponent, ModalParams } from "./types"

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
      // If the value is a function, but not an arrow function,
      // return the function as a string.
      if (value.name === key) {
        return value.toString()
      }

      // Otherwise, return the name of the function.
      return value.name
    }

    return value
  }

  function replacer(key: string, value: unknown) {
    const circularReplacer = getCircularReplacer()
    const circularReplacedValue = circularReplacer(key, value)

    const transformedValue = transform(key, circularReplacedValue)
    return transformedValue
  }

  const serializedValue = JSON.stringify(value, replacer)
  return serializedValue
}

export function serializeWindow(component: ModalComponent<never>, params: ModalParams): string {
  return serialize([component, params])
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
