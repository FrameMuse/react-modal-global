# React Modal Global

[![codecov](https://codecov.io/gh/FrameMuse/react-modal-global/branch/main/graph/badge.svg?token=1FRUN6AQDA)](https://codecov.io/gh/FrameMuse/react-modal-global)
[![npm version](https://badge.fury.io/js/react-modal-global.svg)](https://badge.fury.io/js/react-modal-global)
[![npm downloads](https://img.shields.io/npm/dm/react-modal-global.svg)](https://www.npmjs.com/package/react-modal-global)
[![GitHub license](https://img.shields.io/github/license/FrameMuse/react-modal-global)]()

[![GitHub stars](https://img.shields.io/github/stars/FrameMuse/react-modal-global)]()
[![GitHub contributors](https://img.shields.io/github/contributors/FrameMuse/react-modal-global)]()
[![GitHub last commit](https://img.shields.io/github/last-commit/FrameMuse/react-modal-global)]()

## Presentation

React modal dialogs which is similar to [`react-modal`](https://www.npmjs.com/package/react-modal) but it may be called from `useEffect`, that's why it is **global** ^_^

## Contribute

Needs feedback, please contribute to GitHub Issues or leave your message to [my discord server](https://discord.gg/DCUWrRhvnt).

## Navigation

- [React Modal Global](#react-modal-global)
  - [Presentation](#presentation)
  - [Contribute](#contribute)
  - [Navigation](#navigation)
  - [Advantages](#advantages)
    - [Major advantages](#major-advantages)
    - [Minor advantages](#minor-advantages)
  - [Usage](#usage)
    - [Playgrounds](#playgrounds)
      - [Example of layouts useage](#example-of-layouts-useage)
      - [Example of usage with ChakraUI (by @laurensnl)](#example-of-usage-with-chakraui-by-laurensnl)
    - [Add container](#add-container)
    - [Create new Modal component](#create-new-modal-component)
      - [Plain component](#plain-component)
      - [Using `modal context`](#using-modal-context)
    - [Modal component usage](#modal-component-usage)
    - [Modal Template](#modal-template)
    - [Modal layouts](#modal-layouts)
      - [If using several containers](#if-using-several-containers)
  - [Layout concept](#layout-concept)
    - [Description](#description)
    - [Aria](#aria)
  - [Modal controller](#modal-controller)
    - [`Open`](#open)
    - [`Close`](#close)
      - [`CloseByComponent`](#closebycomponent)
      - [`CloseById`](#closebyid)
    - [Modal options](#modal-options)

## Advantages

### Major advantages

- Allows to use modals in `useEffect` hook without creating a new component for each one by passing `props` to `open` method.
- Allows opening modals without wrapping them in components and controlling their state.
- Allows to use modals in non-component context (e.g. in `useEffect` hook).
- Allows to reuse modals in different places without creating a new component for each one by passing `props` to `open` method.
- Allows to use various modal types (Dialog, Popup, Drawer) by creating your own layout for each one (advised naming is `[Type][Name]` => `DrawerLayout`).
- Allows customizing modal controls by extending `ModalController` class and creating your own layouts.
- Allows to use several containers at different depths of your app (e.g. to vary templates).
- Allows forking modals and creating "layer depth" (_in development_).

### Minor advantages

- Globalization - opened from anywhere (even from non-component context)
- Context - data that passed in `open` method can be accessed in the component using `useModalContext` hook
- Stacking/Nesting (as a container option).
- Data preservation (after closing last modal, the data will be preserved and if same modal will be request to open, it will _restore_ previous modal but with `weak: true` it will not happen)
- `open` method is `PromiseLike` (`thenable`) - you can use `await` or `then` to wait for modal closing
- The package uses only react as a peer dependency

## Usage

### Playgrounds

#### Example of layouts useage

[![Edit react-modal-global](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/react-modal-global-examples-47yoil)

#### Example of usage with ChakraUI (by [@laurensnl](https://github.com/laurensnl))

[![Edit react-modal-global](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/chakraui-nextjs-react-modal-global-h0g21f)

### Add container

`ModalContainer` is a container for modal components (it usually appears in the root of your app) and modal components will appear there as you open them.

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

### Create new Modal component

All it needs for creating modal component is a react component factory with a valid `JSX.Element`:

#### Plain component

```tsx
// Arrow function
const ModalComponent = () => <>:3</>
// Plain function
function ModalComponent() {
  return <>:3</>
}
```

#### Using `modal context`

```tsx
function ModalComponent() {
  const modal = useModalContext() // Getting modal context of currently active component

  return (
    <>
      <h2>Title</h2>
      <p>Content text</p>

      <button type="button" onClick={modal.close}>close</button>
    </>
  )
}
```

### Modal component usage

Note that `PopupLogin` should have its own styles to look like a popup, it is advised to use custom `PopupLayout` (Learn below).

```tsx
import "react-modal-global/styles/modal.scss" // import default styles if want

import { Modal } from "react-modal-global"

import PopupLogin from "./PopupLogin"

function HomeView() {
  function showLoginPopup() {
    // Recommended naming is [Popup, Dialog or Modal] then [Name of a modal] i.e. DialogMyName
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

### Modal Template

There is a multicontainers feature - you can put containers at different depths of your app to vary templates.

Only one container will be used.

The last mounted container will be used.

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

| Option     | Description                                                                                                                                                                 |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`       | Specifies id of a modal. In react it's used as a `key`. May be used to find and close specific modal or else.                                                               |
| `closable` | Specifies if a modal closing is controllable internally. If `false`, it's supposed to mean that user should do a **specific** action to close.                              |
| `weak`     | By default, a last closed modal will not be removed if the same modal will be requested to open. It will _restore_ previous modal but with `weak: true` it will not happen. |
