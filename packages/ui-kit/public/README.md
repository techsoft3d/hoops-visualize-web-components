# @ts3d-hoops/ui-kit

A modern web component library built with Lit for HOOPS applications. This package provides a comprehensive set of reusable UI components including buttons, trees, dropdowns, layouts, and more—all designed to work seamlessly across frameworks or as vanilla web components.

- Framework-agnostic web components
- Tree-shakable ES modules
- CSS custom properties for theming

## Installation

```bash
npm install @ts3d-hoops/ui-kit
```

## Quick start

### HTML (vanilla)

```html
<!doctype html>
<html>
  <head>
    <script type="module">
      import '@ts3d-hoops/ui-kit/button';
      import '@ts3d-hoops/ui-kit/icons';
    </script>
  </head>
  <body>
    <hoops-button color="accent">
      <hoops-icon slot="icon" name="play"></hoops-icon>
      Start Viewer
    </hoops-button>
  </body>
</html>
```

### TypeScript/ES modules

```ts
import '@ts3d-hoops/ui-kit/button';
import '@ts3d-hoops/ui-kit/tree';
import '@ts3d-hoops/ui-kit/icons';

// Use the components in your HTML templates
const container = document.getElementById('app')!;
container.innerHTML = `
  <hoops-button color="default">Click me</hoops-button>
  <hoops-tree>
    <hoops-tree-node label="Root">
      <hoops-tree-node label="Child 1"></hoops-tree-node>
      <hoops-tree-node label="Child 2"></hoops-tree-node>
    </hoops-tree-node>
  </hoops-tree>
`;
```

## Modular imports

Import only what you need:

```ts
// Individual components
import '@ts3d-hoops/ui-kit/button';
import '@ts3d-hoops/ui-kit/tree';
import '@ts3d-hoops/ui-kit/icons';

// Or specific icon sets
import '@ts3d-hoops/ui-kit/icons/arrow-icons';
import '@ts3d-hoops/ui-kit/icons/ui-icons';

// Or the full library (not recommended for production)
import '@ts3d-hoops/ui-kit';
```

## Theming

Components use CSS custom properties for consistent theming. Define these in your CSS:

```css
:root {
  /* Colors */
  --hoops-neutral-foreground: #ffffff;
  --hoops-neutral-foreground-active: #f0f0f0;
  --hoops-neutral-background-hover: #303030cc;
  --hoops-accent-foreground: #0078d4;
  --hoops-accent-foreground-active: #106ebe;

  /* Typography */
  --hoops-body-font: 'Segoe UI', system-ui, sans-serif;

  /* Sizing */
  --hoops-xl-icon-button-content-size: 2.6rem;
  --hoops-md-icon-button-content-size: 1.6rem;
  --hoops-sm-icon-button-content-size: 1.2rem;

  /* SVG */
  --hoops-svg-stroke-color: currentColor;
}
```

## Component APIs

### Button

```html
<hoops-button color="default|accent" disabled="false" icon-size="sm|md|xl">
  <hoops-icon slot="icon" name="icon-name"></hoops-icon>
  Button text
</hoops-button>
```

### Tree

```html
<hoops-tree>
  <hoops-tree-node label="Node label" expanded="true" selected="false">
    <hoops-tree-node label="Child"></hoops-tree-node>
  </hoops-tree-node>
</hoops-tree>
```

### Icons

```html
<hoops-icon name="play|pause|stop|..." size="16"></hoops-icon>
```

## Events

Components dispatch standard DOM events:

```ts
// Button clicks
document.querySelector('hoops-button')!.addEventListener('click', (e) => {
  console.log('Button clicked');
});

// Tree selection changes
document.querySelector('hoops-tree')!.addEventListener('selectionChange', (e) => {
  console.log('Selected:', e.detail);
});
```

## Framework compatibility

The components work in any framework that supports web components:

- **Vanilla JS/HTML** — Import and use directly
- **React** — Use @ts3d-hoops/ui-kit-react or add type declarations for JSX support
- **Vue** — Use as custom elements
- **Angular** — Add to `CUSTOM_ELEMENTS_SCHEMA`
- **Svelte** — Use as web components

## TypeScript

Full TypeScript definitions are included. Components are strongly typed with proper event interfaces and property types.

```ts
import type { HoopsButton } from '@ts3d-hoops/ui-kit/button';
import type { TreeSelectionChangeEvent } from '@ts3d-hoops/ui-kit/tree';
```

## Browser support

- Modern browsers with web component support
- ES2020+ environments
- Works with all major bundlers (Vite, Webpack, Rollup, esbuild)

## Related packages

- `@ts3d-hoops/ui-kit-react` — React-specific wrappers and hooks
- `@ts3d-hoops/web-viewer-components` — Viewer-specific UI components
- `@ts3d-hoops/web-viewer` — The main HOOPS Web Viewer

## License

Commercial license. For evaluation or production licensing, contact Tech Soft 3D.
