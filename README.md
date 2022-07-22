# React Modal Global

## Introduction

This is a package that provides modal dialogs which does similar to [`react-modal`](https://www.npmjs.com/package/react-modal) except that it is accessed from _anywhere_.

### Motivation

It is often to happen that in the function context, for example `fetchMyLovelyData`, after some, probably async, actions, you need to open a `Modal`.
In [`react-modal`](https://www.npmjs.com/package/react-modal) you add `Modal` component to your components tree and this approach requires doing so each time you want a modal to exist, it may cause some **unwanted overlaping**, is a bit of **boilerplate code** and inflicts a holder of this `Modal` to control the `isOpen` state and other parameters. Also, use of different types of modal with same controller.

Likely to create a package that would solve these problems while still covering most of use cases.

### How it works

- The package uses only react as a dependency.
- Relies on `react context` to transfer information between `ModalContainer` and modal components.

#### The main idea

There is a `ModalContainer` which is a container for modal components (it usually appears in `#root` element) and modal components will appear there as you open them.

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
There are other features upon this idea.

## Usage

Usage may seem a bit complicated, please, be patient and read all the thing throughout.

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
      
      <button type="button" onClick={() => modal.close()}>My custom button to close modal</button>
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

|Option|Description|
|---|---|
|`id`|Specifies id of a modal (default: `Date.now()`). In react it's used as a `key`. May be used to find and close specific modal or else.|
|`closable`|Specifies if a modal closing is controlled itself|
|`weak`|By default, a last closed modal will not be removed and if same modal will be request to open, it will _restore_ previous modal but with `weak: true` it will not happen.|
|`fork`|Creates a new layer for a single modal|

### Modal layouts

To use various modal types (Dialog, Popup, Drawer), you create your own `layout` for each one, advised naming is [Type][Name] => `DrawerLayout`.

[See example here](./examples/PopupLayout)

To create your first `Popup` modal try this

```tsx
import { FormEvent } from "react"
import { useModalContext } from "react-modal-global"

import PopupLayout from "modal-layouts/PopupLayout/PopupLayout"

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

The end.
