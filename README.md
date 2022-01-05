# React Popup Plugin

Easy to Popup provider for react

---

description: 'Global. Has context. Stacks windows.' labels: ['Popup', 'UI', 'react', 'typescript']

---

import { Popup } from './popup';

## Introduction

### Create new Popup Element

All need for creating such element is a valid JSX.Element:

```js
// Arrow function
const PopupElement = () => ":3"
// Standart function
function PopupElement() {
	return ":3"
}
```

### Using Popup Context

```js
const PopupElement = () => {
	const { Resolve, Params } = usePopupContext()
	return ":3"
}
```

### Component usage

```tsx

```

### Using props to customize the text

Modify the text to see it change live:

```tsx live

```
