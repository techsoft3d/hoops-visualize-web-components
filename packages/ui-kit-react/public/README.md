# @ts3d-hoops/ui-kit-react

React component wrappers for @ts3d-hoops/ui-kit web components. This package provides React-friendly components that wrap the underlying Lit-based web components, giving you proper TypeScript support, React event handling, and seamless integration with your React applications.

- React 18+ compatible
- Full TypeScript support
- Proper React event handling
- Tree-shakable ES modules
- Built on @lit/react for optimal performance

## Installation

```bash
npm install @ts3d-hoops/ui-kit-react react
```

Note: React 18+ is required as a peer dependency.

## Quick start

```tsx
import React from 'react';
import { HoopsButton, HoopsLayout, HoopsIcon, HoopsSwitch } from '@ts3d-hoops/ui-kit-react';

function App() {
  const [enabled, setEnabled] = React.useState(false);

  return (
    <HoopsLayout>
      <HoopsButton color="accent" onClick={() => console.log('Button clicked!')}>
        <HoopsIcon slot="icon" name="play" />
        Start Viewer
      </HoopsButton>

      <HoopsSwitch checked={enabled} onChange={(e) => setEnabled(e.target.checked)}>
        Enable feature
      </HoopsSwitch>
    </HoopsLayout>
  );
}
```

## TypeScript support

All components are fully typed for TypeScript:

```tsx
import React from 'react';
import type { MouseEvent } from 'react';
import { HoopsButton } from '@ts3d-hoops/ui-kit-react';

interface Props {
  onSave: () => void;
  disabled?: boolean;
}

function SaveButton({ onSave, disabled = false }: Props) {
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    onSave();
  };

  return (
    <HoopsButton color="accent" disabled={disabled} onClick={handleClick}>
      Save
    </HoopsButton>
  );
}
```

## Event handling

React events are properly mapped from the underlying web component events:

```tsx
// Switch component with proper React onChange
<HoopsSwitch
  onChange={(e) => {
    // e.target.checked is available
    console.log('Switch toggled:', e.target.checked);
  }}
/>

// Accordion with change events
<HoopsAccordion
  onChange={(e) => {
    console.log('Accordion changed:', e.detail);
  }}
/>
```

## Styling and theming

Components inherit the same CSS custom properties as @ts3d-hoops/ui-kit:

```css
:root {
  --hoops-neutral-foreground: #ffffff;
  --hoops-accent-foreground: #0078d4;
  --hoops-body-font: 'Segoe UI', system-ui, sans-serif;
}
```

You can also style components using standard React patterns:

```tsx
<HoopsButton style={{ margin: '10px' }} className="my-button">
  Styled Button
</HoopsButton>
```

## Comparison with vanilla web components

| Feature           | @ts3d-hoops/ui-kit (Web Components) | @ts3d-hoops/ui-kit-react      |
| ----------------- | ----------------------------------- | ----------------------------- |
| React integration | Manual JSX declarations needed      | Native React components       |
| TypeScript        | Generic web component types         | Full React component types    |
| Event handling    | DOM events only                     | React SyntheticEvents         |
| Tree shaking      | ✅                                  | ✅                            |
| Bundle size       | Smaller                             | Slightly larger (+@lit/react) |

## Performance

- Built on @lit/react for optimal React integration
- Components are lazy-loaded and tree-shakable
- No unnecessary re-renders thanks to Lit's efficient change detection
- Minimal overhead over vanilla web components

## Browser support

- React 18+
- Modern browsers with web component support
- ES2020+ environments
- Works with all major bundlers (Vite, Webpack, Create React App)

## Related packages

- `@ts3d-hoops/ui-kit` — The underlying web component library
- `@ts3d-hoops/web-viewer-components-react` — React wrappers for viewer-specific components
- `@ts3d-hoops/web-viewer` — The main HOOPS Web Viewer

## Migration from @ts3d-hoops/ui-kit

If you're using @ts3d-hoops/ui-kit web components directly in React:

**Before:**

```tsx
// Manual JSX declarations needed
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'hoops-button': any;
    }
  }
}

<hoops-button onClick={() => {}} />;
```

**After:**

```tsx
import { HoopsButton } from '@ts3d-hoops/ui-kit-react';

<HoopsButton onClick={() => {}} />;
```

## License

Commercial license. For evaluation or production licensing, contact Tech Soft 3D.
