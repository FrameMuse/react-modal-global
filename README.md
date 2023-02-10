# React Modal Global

[![codecov](https://codecov.io/gh/FrameMuse/react-modal-global/branch/main/graph/badge.svg?token=1FRUN6AQDA)](https://codecov.io/gh/FrameMuse/react-modal-global)

Needs feedback, please contribute in GitHub Issues or leave your message on [my discord server](https://discord.gg/DCUWrRhvnt).

## Introduction

This is a package that provides modal dialogs which is similar to [`react-modal`](https://www.npmjs.com/package/react-modal) but it is **global**.

## Contribute

Needs feedback, please contribute in GitHub Issues or leave your message to [my discord server](https://discord.gg/DCUWrRhvnt).

## Navigation

- [React Modal Global](#react-modal-global)
  - [Introduction](#introduction)
  - [Contribute](#contribute)
  - [Navigation](#navigation)
  - [Advantages](#advantages)
    - [Major advantages](#major-advantages)
    - [Minor advantages](#minor-advantages)
  - [Usage](#usage)
    - [Add container](#add-container)
    - [Create new Modal component](#create-new-modal-component)
      - [Plain component](#plain-component)
      - [Using `modal context`](#using-modal-context)
    - [Modal component usage](#modal-component-usage)
    - [Modal options](#modal-options)
    - [Modal Template](#modal-template)
    - [Modal layouts](#modal-layouts)
      - [If using several containers](#if-using-several-containers)
  - [Layout concept](#layout-concept)
    - [Description](#description)
    - [Aria](#aria)

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

Usage may seem a bit complicated but it's actually very simple, please, be patient and read all the thing through.

### Add container

`ModalContainer` is a container for modal components (it usually appears in the root of your app) and modal components will appear there as you open them.

<details>
<summary>Show `ModalContainer` usage example</summary>

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

</details>

### Create new Modal component

All it needs for creating such is a valid `JSX.Element`:

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
  const modal = useModalContext() // Getting modal context of current component

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
import "react-modal-global/styles/modal.scss" // import default styles if should

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

### Modal options

You can use options when opening a modal.
Available options

| Option     | Description                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`       | Specifies id of a modal (default: `Date.now()`). In react it's used as a `key`. May be used to find and close specific modal or else.                                     |
| `closable` | Specifies if a modal closing is controlled itself                                                                                                                         |
| `weak`     | By default, a last closed modal will not be removed and if same modal will be request to open, it will _restore_ previous modal but with `weak: true` it will not happen. |

### Modal Template

There is a multicontainers feature - you can put containers at different depths of your app to vary templates.

Only one container will be used.

The last mounted container will be used.

### Modal layouts

To use various modal types (Dialog, Popup, Drawer), you create your own `layout` for each one, advised naming is [Type][Name] => `DrawerLayout`.

[See example here](./examples/PopupLayout)

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


However, you should manually add `aria-labelledby` and `aria-describedby` attributes to your layout.
