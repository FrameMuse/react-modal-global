<h1 align="center">📦 React Modal Global</h1>
<h3 align="center">Composite global modals for react, which may be used in `useEffect` or any other global scope 🚀</h3>

<p align="center">
  <a href="https://codecov.io/gh/FrameMuse/react-modal-global">
    <img src="https://codecov.io/gh/FrameMuse/react-modal-global/branch/main/graph/badge.svg?token=1FRUN6AQDA" />
  </a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/react-modal-global">
    <img src="https://img.shields.io/npm/v/react-modal-global/latest.svg" />
  </a>
  <a href="https://www.npmjs.com/package/react-modal-global">
    <img src="https://img.shields.io/npm/v/react-modal-global/experimental.svg" />
  </a>
</p>

## Features

- 🌍 Can be used in `useEffect` hook or any other global scope
- 💧 [Reactish](#open-as-it-is) - Open modals `Modal.open(ModalComponent, { id: "2" })` as you would render components `<ModalComponent id="2" />`
- 🪢 [Context](#using-modal-context) - you can access params passed to `open` method in the modal component via `useModalContext` hook
- 🔃 [Queueing](#queueing) - you can open several modals at once
- ✅ [Data preservation](#data-preservation) - data will persist after closing last modal and if same modal will be request to open, it will be restored
- 📚 [Layouts](#modal-layouts) - you can create your own layouts for each modal type (Dialog, Popup, Drawer).
- 🎛️ [Customization](#modal-controller) - you can extend `ModalController` class and create your behavior
- 🦑 [Forking](#layer-depth) - you can fork modals and create "layer depth" (_in development_)

## Motivation

I was looking for a way to use modals in `useEffect` hook without creating a new component for each one by passing `props` to `open` method. I found a lot of packages that allow to use modals in non-component context, but they all have some disadvantages:

- They are not global (you can't open them from anywhere)
- They are not context-aware (you can't pass data to them)
- They are not queueing-aware (you can't open several modals at once)

So I decided to create my own package that will solve all these problems.

I insipered a lot from packages like [react-toastify](https://npmjs.com/package/react-toastify) and [react-alert](https://npmjs.com/package/react-alert).

## Playgrounds
| Title | Playground |
| --- | --- |
| Example of layouts usage | [![Edit react-modal-global](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/react-modal-global-examples-47yoil)        |
| Example of usage with ChakraUI (by [@laurensnl](https://github.com/laurensnl)) | [![Edit react-modal-global](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/chakraui-nextjs-react-modal-global-h0g21f) |


## Usage

Please follow steps below to use this package in your project.

### Add container

`ModalContainer` is a display container for modal components (it should be placed in the root), modal components will appear here as you open them.

```tsx
import React from "react"
import ReactDOM from "react-dom"
import { ModalContainer } from "react-modal-global"

function App() {
  return (
    <>
      {/* ... Other components ... */}
      <ModalContainer />
    </>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
```

### !!! STYLES !!!

Notice that you have to have styles to keep modal closed, otherwise modal will not work as expected.

You can write your own styles or use provided be the library by importing it

```tsx
import "react-modal-global/styles/modal.scss"
```

### Create new Modal component

Modal component is actually a React component, however this should be  exactly component not an element.

#### React component

```tsx
// Arrow function component
const ModalComponent = () => <>:3</>
// Plain function component
function ModalComponent() {
  return <>:3</>
}
// Class component
import { Component } from "react"
class ModalComponent extends Component {
  render() { return <>:3</> }
}
```

#### Using `modal context`

This allows a component to access modal window context inside it to see what props were passed in `open` method.

This also can be used to close modal window from inside (e.g. close on button click).

```tsx
function ModalComponent() {
  const modal = useModalContext() // Getting modal context of currently focused component

  return (
    <>
      <h2>Title</h2>
      <p>Content text</p>

      <button type="button" onClick={modal.close}>close</button>
    </>
  )
}
```

#### Advanced usage

Modal components can be templates for other modal components.
[See example here](#layout-concept)

#### Naming advice

Recommended naming is [Popup, Dialog or Modal] + [Name of a modal] => DialogPurchase.

### Modal component usage

#### Open 'em

This is how you disaply your modal components

```tsx
// Import default styles.
import "react-modal-global/styles/modal.scss"

import { Modal } from "react-modal-global"

import PopupLogin from "./PopupLogin"

function HomeView() {
  function showLoginPopup() {
    Modal.open(PopupLogin, { /* Probably your options? */ })
  }
  return (
    <>
      <h2>Title</h2>
      <p>Content text</p>

      <button type="button" onClick={showLoginPopup}>Show login popup</button>
    </>
  )
}
```

#### Open as it is

Although you can create your own layout (i.e. component) to pass `title`, `description` and other required/optional props, to what you are used to. This library encourages using only component and its props to open modals as just how you would use it in a tree.

So instead of
```ts
Modal.open(PopupGeneral, {
  title: "Login",
  description: "Please login to continue"
})
```

Include them in the component itself. Of course you will need to create more components, but this is the way to go.

```ts
Modal.open(PopupLogin)
```
```

Or you can create types of your modal components and pass them to `open` method.

```ts
Modal.open(PopupAuth, {
  type: "login" // or "register"
})
```

Eventually, this is up to you to decide, it always depends on your case.


### Modal layouts

To use various modal types (Dialog, Popup, Drawer), you create your own `layout` for each one, advised naming is [Type][Name] => `DrawerLayout`.

[Take a look at this example](https://codesandbox.io/s/react-modal-global-examples-47yoil)

To create your first `Popup` modal try this

```tsx
import { FormEvent } from "react"
import { useModalContext } from "react-modal-global"

import PopupLayout from "../modal/layouts/PopupLayout/PopupLayout"

function PopupMyFirst() {
  const modal = useModalContext()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const target = event.currentTarget
    const ageInput = target.elements.namedItem("age")

    alert(ageInput) // Show age
    modal.close() // Then close `this modal`
  }
  return (
    <PopupLayout>
      <form onSubmit={onSubmit}>
        <h2>My first popup modal</h2>
        <input name="age" placeholder="Enter your `first popup modal` age" />
        <button type="submit">See my age</button>
      </form>
    </PopupLayout>
  )
}

export default PopupMyFirst

```

#### If using several containers

Instead of wrapping your modal components manually you can pass `template` attribute to `ModalContainer`, for example, `PopupLayout`

```tsx
<ModalContainer template={PopupLayout} />
```

## Layout concept

### Description

Layout is a component that wraps modal component and allows to customize modal look and controls (close button, header, footer, etc.).

Layouts are used to create various modal types (Dialog, Popup, Drawer) and to customize modal controls.

For example, you can create your own `PopupLayout` to use it in your `Popup` modals.

[See example here](./examples/PopupLayout)

### Aria

Layouts should not have `aria-modal` attribute and `role="dialog"` because they are already set in `ModalContainer` component.

You should manually add `aria-labelledby` and `aria-describedby` attributes to your layout.

## Modal controller

### `Open`

`Modal.open` is a method that opens a modal. See [usage](#modal-component-usage) for example. See [options](#modal-options) for more details.

```tsx
Modal.open(ModalComponent, { /* options */ })
```

### `Close`

There is no `Modal.close` method because it's hard to know what exactly window to close, instead you can close a modal from inside of a modal component using `useModalContext` hook.

To close from outside you can use returned `close` method from `Modal.open` or `Modal.closeBy` methods

#### `CloseByComponent`

`Modal.closeByComponent` is a method that closes a modal by its component. It will close all modals that use this component.

```tsx
Modal.closeByComponent(ModalComponent)
```

#### `CloseById`

`Modal.closeById` is a method that closes a modal by its id. It will close all modals that have this id.

```tsx
Modal.closeById("insane-id")
```

### Modal options

You can use options when opening a modal with `Modal.open()`.
Available options

| Option | Description |
| --- | --- |
| `id` | Specifies id of a modal. In react it's used as a `key`. May be used to find and close specific modal or else. |
| `closable` | Specifies if a modal closing is controllable internally. If `false`, it's supposed to mean that user should do a **specific** action to close. |
| `weak` | By default, a last closed modal will not be removed if the same modal will be requested to open. It will _restore_ previous modal but with `weak: true` it will not happen. |

## Modal container

The `ModalContainer` component is a container for all modals, but it's not required to use it.

So if you're not happy with the default container, you can create your own.

It depends on `ModalController` and `ModalContext` to work.

## Other features

### Queueing

If you open a modal while another modal is already opened, it will be queued and will be opened after the previous one is closed.

### Data preservation

Data will be restored if you open a modal with the same component and props after it was closed.

It also works with `Modal.replace` method, which can replace props with new ones while keeping the same component and data.

### Layer depth

**---This Feature is still in development---**

Sometimes you need to open a modal on top of another modal, for example, you have a modal with a login form, and you want to open another modal with a phone confirmation on top of it but keeping the login form visible and state preserved.

This is where `layer` depth comes in handy.

```tsx
Modal.open(ModalComponent, {
  layer: 1 // Default is 0
})
```

Note that `layer` depth is not a z-index, it's just a number that specifies the depth of a modal, it's used to determine which modal should be opened on top of another, which may be overriden by focusing another modal.

---

It's in early development and accessable in [@experimental](https://www.npmjs.com/package/react-modal-global/v/experimental) branch.
Please consider contributing to this feature, I will be happy to see your PRs or just a [feedback](#contribute).

## Other modal ideas

There are more than one way to create modals in React.

Two the most popular are "React Tree Modal" and "General Consumer Modal" (this is how I named it).

### React Tree Modal

This is mostly known in React community, it's a modal that is rendered in a tree. There is a library called [react-modal](https://npmjs.com/package/react-modal) that implements this approach.

But this way has some problems, one of them is that you have to create a component, which will control your modal state (open, closed) every time for every modal, and it's not convenient.

### General Consumer Modal

This is an approach just consumes `title` and `description` props and renders them in a general container.

This approach lacks of flexibility, but it's easier to use.
There also may be problems 
- styling, because you can't style a modal component itself, you can only style a container
- multiple languages, because you can't apply its own translation to each modal window separately, you will have to pass it to a method, which is not convenient

## Contribute

Needs feedback, please contribute to GitHub Issues or leave your message to the [discord server](https://discord.gg/DCUWrRhvnt).