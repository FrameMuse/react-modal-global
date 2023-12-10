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

type EventEmitterListener = (...args: never[]) => void

class EventEmitter<Events extends Record<EventName, EventEmitterListener>, EventName extends keyof Events = keyof Events> {
  private callbacks: Partial<Record<keyof never, Set<EventEmitterListener>>> = {}

  public on<Event extends keyof Events>(event: Event, callback: Events[Event]) {
    this.callbacks[event] ??= new Set
    this.callbacks[event]?.add(callback as EventEmitterListener)
  }
  public off<Event extends keyof Events>(event: Event, callback: Events[Event]) {
    this.callbacks[event]?.delete(callback as EventEmitterListener)
  }
  public emit<Event extends keyof Events>(event: Event, ...args: Parameters<Events[Event]>) {
    const callbacks = this.callbacks[event]
    if (callbacks == null) return

    for (const callback of callbacks) callback(...args)
  }
}

export default EventEmitter
