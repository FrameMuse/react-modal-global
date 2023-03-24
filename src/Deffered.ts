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

class Deffered<T> {
  public promise: Promise<T>
  public resolve: (value: T) => void
  public reject: (reason: unknown) => void

  constructor() {
    this.resolve = () => { throw new Error("Deffered.resolve is not defined") }
    this.reject = () => { throw new Error("Deffered.reject is not defined") }

    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }
}

export default Deffered
