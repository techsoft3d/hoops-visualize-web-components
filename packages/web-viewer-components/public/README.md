# @ts3d-hoops/web-viewer-components

High-level web components and services for building HOOPS Web Viewer applications. This package provides ready-to-use UI components like model trees, toolbars, settings panels, and a complete service architecture for common viewer operations.

- Built with Lit and TypeScript
- Complete viewer UI components (trees, toolbars, panels)
- Service-based architecture for viewer operations
- Context management for component communication
- Framework-agnostic web components

## Installation

```bash
npm install @ts3d-hoops/web-viewer-components
```

This package depends on `@ts3d-hoops/web-viewer` and `@ts3d-hoops/ui-kit`, which will be installed automatically.

## Quick start

### Basic viewer with components

```html
<!doctype html>
<html>
  <head>
    <script type="module">
      import '@ts3d-hoops/web-viewer-components';
    </script>
  </head>
  <body>
    <hoops-web-viewer endpoint-uri="/models/sample.scs" style="width: 100%; height: 500px;">
      <!-- Add toolbar with buttons -->
      <hoops-toolbar-home slot="toolbar"></hoops-toolbar-home>
      <hoops-toolbar-camera slot="toolbar"></hoops-toolbar-camera>
      <hoops-toolbar-drawmode slot="toolbar"></hoops-toolbar-drawmode>

      <!-- Add model tree panel -->
      <hoops-model-tree slot="sidebar"></hoops-model-tree>
    </hoops-web-viewer>
  </body>
</html>
```

### TypeScript setup

```ts
import '@ts3d-hoops/web-viewer-components';
import { WebViewerComponent } from '@ts3d-hoops/web-viewer-components';

// Configure the viewer
const viewer = document.querySelector('hoops-web-viewer') as WebViewerComponent;
viewer.endpointUri = '/models/microengine.scs';
viewer.enginePath = '/engine';

// Listen for viewer events
viewer.addEventListener('model-loaded', (e) => {
  console.log('Model loaded:', e.detail);
});
```

## Core components

### Viewer component

- **hoops-web-viewer** — Complete viewer component with slots for toolbars and panels

### Trees and navigation

- **hoops-model-tree** — Hierarchical model structure tree
- **hoops-layer-tree** — CAD layer management tree
- **hoops-view-tree** — Saved views and configurations tree
- **hoops-types-tree** — Object type filtering tree
- **hoops-markup-tree** — Markup and annotation tree

### Toolbar buttons

- **hoops-toolbar-home** — Home/fit view button
- **hoops-toolbar-camera** — Camera controls and projections
- **hoops-toolbar-drawmode** — Rendering mode toggle (shaded, wireframe, etc.)
- **hoops-toolbar-layers** — Layer visibility controls
- **hoops-toolbar-views** — View management
- **hoops-toolbar-model-tree** — Model tree toggle
- **hoops-toolbar-properties** — Properties panel toggle
- **hoops-toolbar-snapshot** — Screenshot capture
- **hoops-toolbar-explode** — Model explode controls
- **hoops-toolbar-redlines** — Markup and redlining tools
- **hoops-toolbar-tools** — Additional viewer tools
- **hoops-toolbar-settings** — Settings panel toggle
- **hoops-toolbar-cad-configuration** — CAD configuration controls

### Panels and dialogs

- **hoops-settings-panel** — Viewer settings and preferences
- **hoops-tools-panel** — Tool collection panel
- **hoops-context-menu** — Right-click context menu
- **hoops-info-button** — Information display button
- **hoops-cad-configuration-list** — CAD configuration selection

## Service architecture

The package includes a comprehensive service system for viewer operations:

### Available services

- **CameraService** — Camera manipulation and animation
- **SelectionService** — Object selection and highlighting
- **CuttingService** — Cutting plane management
- **ExplodeService** — Model explosion controls
- **RedlineService** — Markup and annotation tools
- **RenderOptionsService** — Rendering and visual settings
- **ViewService** — View management and navigation
- **PmiService** — PMI (Product Manufacturing Information) handling
- **SheetService** — Drawing sheet management
- **SpaceMouseService** — 3D mouse integration
- **WalkOperatorService** — Walk-through navigation

### Using services

```ts
import {
  CameraService,
  SelectionService,
  serviceRegistry,
} from '@ts3d-hoops/web-viewer-components/services';

// Get services from the registry
const cameraService = serviceRegistry.get(CameraService);
const selectionService = serviceRegistry.get(SelectionService);

// Use camera service
await cameraService.fitView();
await cameraService.setProjection('orthographic');

// Use selection service
const selectedNodes = await selectionService.getSelection();
await selectionService.selectByNodeId([nodeId]);
```

## Advanced examples

### Complete viewer application

```ts
import '@ts3d-hoops/web-viewer-components';

const container = document.getElementById('app')!;
container.innerHTML = `
  <hoops-web-viewer 
    endpoint-uri="/models/assembly.scs"
    engine-path="/engine"
    style="width: 100vw; height: 100vh;">
    
    <!-- Toolbar -->
    <div slot="toolbar" style="display: flex; gap: 4px;">
      <hoops-toolbar-home></hoops-toolbar-home>
      <hoops-toolbar-camera></hoops-toolbar-camera>
      <hoops-toolbar-drawmode></hoops-toolbar-drawmode>
      <hoops-toolbar-explode></hoops-toolbar-explode>
      <hoops-toolbar-snapshot></hoops-toolbar-snapshot>
      <hoops-toolbar-settings></hoops-toolbar-settings>
    </div>
    
    <!-- Left sidebar -->
    <div slot="sidebar" style="width: 300px; display: flex; flex-direction: column;">
      <hoops-model-tree style="flex: 1;"></hoops-model-tree>
      <hoops-layer-tree style="flex: 1;"></hoops-layer-tree>
    </div>
    
    <!-- Right panel -->
    <div slot="panel" style="width: 250px;">
      <hoops-settings-panel></hoops-settings-panel>
    </div>
  </hoops-web-viewer>
`;
```

### Custom service integration

```ts
import {
  serviceRegistry,
  CameraService,
  SelectionService,
} from '@ts3d-hoops/web-viewer-components/services';

class MyCustomService {
  constructor(
    private cameraService: CameraService,
    private selectionService: SelectionService,
  ) {}

  async focusOnSelected() {
    const selection = await this.selectionService.getSelection();
    if (selection.length > 0) {
      await this.cameraService.fitNodes(selection);
    }
  }
}

// Register custom service
const cameraService = serviceRegistry.get(CameraService);
const selectionService = serviceRegistry.get(SelectionService);
const myService = new MyCustomService(cameraService, selectionService);
```

### Event handling

```ts
// Listen for tree selection changes
const modelTree = document.querySelector('hoops-model-tree')!;
modelTree.addEventListener('selectionChange', (e) => {
  console.log('Model tree selection:', e.detail);
});

// Listen for viewer state changes
const viewer = document.querySelector('hoops-web-viewer')!;
viewer.addEventListener('model-loaded', (e) => {
  console.log('Model loaded successfully');
});

viewer.addEventListener('selection-changed', (e) => {
  console.log('Viewer selection changed:', e.detail);
});
```

## Modular imports

Import only the components you need:

```ts
// Individual components
import '@ts3d-hoops/web-viewer-components/hoops-web-viewer';
import '@ts3d-hoops/web-viewer-components/hoops-model-tree';
import '@ts3d-hoops/web-viewer-components/hoops-toolbar-buttons';

// Specific services
import { CameraService, SelectionService } from '@ts3d-hoops/web-viewer-components/services';

// Everything (not recommended for production)
import '@ts3d-hoops/web-viewer-components';
```

## Context management

Components use Lit Context for communication:

```ts
import { WebViewerContextManager } from '@ts3d-hoops/web-viewer-components';

// Context provides shared state between components
const contextManager = new WebViewerContextManager();
```

## Styling and theming

Components inherit theming from @ts3d-hoops/ui-kit and can be styled with CSS custom properties:

```css
hoops-web-viewer {
  --hoops-neutral-foreground: #ffffff;
  --hoops-accent-foreground: #0078d4;
  --hoops-body-font: 'Segoe UI', system-ui, sans-serif;
}

hoops-model-tree {
  border: 1px solid #ccc;
  border-radius: 4px;
}
```

## Storybook documentation

This package includes Storybook for component documentation and testing:

```bash
# Run Storybook locally (if you have the source)
npm run storybook
```

## TypeScript

Full TypeScript definitions are included for all components and services:

```ts
import type {
  WebViewerComponent,
  HoopsModelTreeElement,
  CameraService,
} from '@ts3d-hoops/web-viewer-components';
```

## Browser support

- Modern browsers with web component support
- ES2020+ environments
- WebGL-capable devices
- Works with all major bundlers (Vite, Webpack, Rollup, esbuild)

## Framework integration

### React

```tsx
import '@ts3d-hoops/web-viewer-components';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'hoops-web-viewer': any;
      'hoops-model-tree': any;
    }
  }
}

function ViewerApp() {
  return (
    <hoops-web-viewer endpoint-uri="/models/sample.scs">
      <hoops-model-tree slot="sidebar" />
    </hoops-web-viewer>
  );
}
```

### Vue

```vue
<template>
  <hoops-web-viewer :endpoint-uri="modelUri">
    <hoops-model-tree slot="sidebar" />
  </hoops-web-viewer>
</template>

<script setup>
import '@ts3d-hoops/web-viewer-components';
const modelUri = '/models/sample.scs';
</script>
```

## Related packages

- `@ts3d-hoops/web-viewer` — Core HOOPS Web Viewer library
- `@ts3d-hoops/web-viewer-components-react` — React wrappers for these components
- `@ts3d-hoops/ui-kit` — Base UI component library
- `@ts3d-hoops/streamcache` — Low-level streaming client

## License

Commercial license. For evaluation or production licensing, contact Tech Soft 3D.
