# @ts3d-hoops/web-viewer-components-react

React component wrappers for @ts3d-hoops/web-viewer-components. This package provides React-friendly components that wrap the underlying web components, giving you proper TypeScript support, React event handling, and seamless integration with your React-based HOOPS Web Viewer applications.

- React 18+ compatible
- Full TypeScript support with proper event typing
- Complete viewer UI components (trees, toolbars, panels)
- Built on @lit/react for optimal performance
- Service architecture integration

## Installation

```bash
npm install @ts3d-hoops/web-viewer-components-react react
```

Note: React 18+ is required as a peer dependency.

## Quick start

```tsx
import React from 'react';
import {
  WebViewerComponent,
  HoopsModelTree,
  HoopsHomeButton,
  HoopsCameraButton,
  HoopsDrawmodeButton,
} from '@ts3d-hoops/web-viewer-components-react';

function ViewerApp() {
  const handleModelLoaded = (e: CustomEvent) => {
    console.log('Model loaded:', e.detail);
  };

  const handleModelTreeClick = (e: CustomEvent) => {
    console.log('Model tree node clicked:', e.detail);
  };

  return (
    <WebViewerComponent
      endpointUri="/models/sample.scs"
      enginePath="/engine"
      style={{ width: '100%', height: '600px' }}
      onHwvSceneReady={handleModelLoaded}
    >
      {/* Toolbar */}
      <div slot="toolbar" style={{ display: 'flex', gap: '4px' }}>
        <HoopsHomeButton />
        <HoopsCameraButton />
        <HoopsDrawmodeButton />
      </div>

      {/* Sidebar */}
      <HoopsModelTree
        slot="sidebar"
        style={{ width: '300px' }}
        onModelTreeNodeClick={handleModelTreeClick}
      />
    </WebViewerComponent>
  );
}
```

## Available components

### Core viewer

- **WebViewerComponent** — Main HOOPS Web Viewer with full event support
- **HoopsWebviewerContextManager** — Context management for component communication
- **HoopsServiceRegistry** — Service registry for viewer operations

### Toolbar buttons

- **HoopsHomeButton** — Home/fit view button
- **HoopsCameraButton** — Camera controls and projections
- **HoopsDrawmodeButton** — Rendering mode toggle (shaded, wireframe, etc.)
- **HoopsCameraOperatorButton** — Camera operation controls
- **HoopsExplodeButton** — Model explode controls
- **HoopsSnapshotButton** — Screenshot capture
- **HoopsRedlinesButton** — Markup and redlining tools
- **HoopsToolsButton** — Additional viewer tools
- **HoopsModelTreeButton** — Model tree panel toggle
- **HoopsLayersButton** — Layer management toggle
- **HoopsViewsButton** — View management toggle
- **HoopsTypesButton** — Object type filtering toggle
- **HoopsPropertiesButton** — Properties panel toggle
- **HoopsSettingsButton** — Settings panel toggle
- **HoopsCadConfigurationButton** — CAD configuration controls

### Trees and navigation

- **HoopsModelTree** — Hierarchical model structure tree
- **HoopsLayerTree** — CAD layer management tree
- **HoopsViewTree** — Saved views and configurations tree
- **HoopsTypesTree** — Object type filtering tree

### Panels and dialogs

- **HoopsToolsPanel** — Tool collection panel
- **HoopsSettingsPanel** — Viewer settings and preferences
- **HoopsCadConfigurationList** — CAD configuration selection
- **HoopsContextMenu** — Right-click context menu
- **HoopsInfoButton** — Information display button
- **HoopsIFCRelationship** — IFC relationship components

## Component examples

### Complete viewer application

```tsx
import React, { useState } from 'react';
import {
  WebViewerComponent,
  HoopsModelTree,
  HoopsLayerTree,
  HoopsSettingsPanel,
  HoopsHomeButton,
  HoopsCameraButton,
  HoopsDrawmodeButton,
  HoopsSnapshotButton,
} from '@ts3d-hoops/web-viewer-components-react';

function CompleteViewer() {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  return (
    <WebViewerComponent
      endpointUri="/models/assembly.scs"
      enginePath="/engine"
      style={{ width: '100vw', height: '100vh' }}
      onHwvSceneReady={() => console.log('Scene ready')}
      onHwvSelectionArray={(e) => setSelectedNodes(e.detail)}
    >
      {/* Toolbar */}
      <div
        slot="toolbar"
        style={{
          display: 'flex',
          gap: '4px',
          padding: '8px',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #ddd',
        }}
      >
        <HoopsHomeButton />
        <HoopsCameraButton />
        <HoopsDrawmodeButton />
        <HoopsSnapshotButton />
      </div>

      {/* Left sidebar with trees */}
      <div
        slot="sidebar"
        style={{
          width: '300px',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #ddd',
        }}
      >
        <HoopsModelTree
          style={{ flex: 1, minHeight: '300px' }}
          onModelTreeNodeClick={(e) => console.log('Model node:', e.detail)}
          onModelTreeNodeVisibilityChange={(e) => console.log('Visibility:', e.detail)}
        />
        <HoopsLayerTree
          style={{ flex: 1, minHeight: '200px' }}
          onLayerTreeNodeClick={(e) => console.log('Layer node:', e.detail)}
          onLayerTreeVisibilityChanged={(e) => console.log('Layer visibility:', e.detail)}
        />
      </div>

      {/* Right panel */}
      <HoopsSettingsPanel slot="panel" style={{ width: '250px' }} />
    </WebViewerComponent>
  );
}
```

### Event handling

```tsx
import React from 'react';
import { WebViewerComponent, HoopsModelTree } from '@ts3d-hoops/web-viewer-components-react';

function EventExample() {
  // Viewer events
  const handleSceneReady = () => {
    console.log('Viewer is ready!');
  };

  const handleSelectionChange = (e: CustomEvent) => {
    console.log('Selection changed:', e.detail);
  };

  const handleModelLoadBegin = () => {
    console.log('Model loading started...');
  };

  // Tree events
  const handleModelTreeClick = (e: CustomEvent) => {
    const { nodeId, nodeName } = e.detail;
    console.log(`Clicked node: ${nodeName} (${nodeId})`);
  };

  const handleVisibilityChange = (e: CustomEvent) => {
    const { nodeId, visible } = e.detail;
    console.log(`Node ${nodeId} visibility: ${visible}`);
  };

  return (
    <WebViewerComponent
      endpointUri="/models/sample.scs"
      onHwvSceneReady={handleSceneReady}
      onHwvSelectionArray={handleSelectionChange}
      onHwvModelLoadBegin={handleModelLoadBegin}
      style={{ width: '100%', height: '500px' }}
    >
      <HoopsModelTree
        slot="sidebar"
        onModelTreeNodeClick={handleModelTreeClick}
        onModelTreeNodeVisibilityChange={handleVisibilityChange}
        style={{ width: '300px' }}
      />
    </WebViewerComponent>
  );
}
```

### Service integration

```tsx
import React, { useEffect, useState } from 'react';
import { WebViewerComponent } from '@ts3d-hoops/web-viewer-components-react';
import {
  CameraService,
  SelectionService,
  serviceRegistry,
} from '@ts3d-hoops/web-viewer-components/services';

function ServiceIntegration() {
  const [cameraService, setCameraService] = useState<CameraService | null>(null);
  const [selectionService, setSelectionService] = useState<SelectionService | null>(null);

  useEffect(() => {
    // Get services after viewer is ready
    const camera = serviceRegistry.get(CameraService);
    const selection = serviceRegistry.get(SelectionService);

    setCameraService(camera);
    setSelectionService(selection);
  }, []);

  const fitView = async () => {
    if (cameraService) {
      await cameraService.fitView();
    }
  };

  const clearSelection = async () => {
    if (selectionService) {
      await selectionService.clear();
    }
  };

  return (
    <div>
      <div style={{ padding: '8px' }}>
        <button onClick={fitView}>Fit View</button>
        <button onClick={clearSelection}>Clear Selection</button>
      </div>

      <WebViewerComponent
        endpointUri="/models/sample.scs"
        style={{ width: '100%', height: '500px' }}
      />
    </div>
  );
}
```

### Custom hooks

```tsx
import React, { useEffect, useState } from 'react';
import { WebViewerComponent } from '@ts3d-hoops/web-viewer-components-react';

// Custom hook for viewer state
function useViewerState() {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selection, setSelection] = useState<any[]>([]);

  const handleSceneReady = () => setIsReady(true);
  const handleLoadBegin = () => setIsLoading(true);
  const handleLoadEnd = () => setIsLoading(false);
  const handleSelection = (e: CustomEvent) => setSelection(e.detail);

  return {
    isReady,
    isLoading,
    selection,
    events: {
      onHwvSceneReady: handleSceneReady,
      onHwvModelLoadBegin: handleLoadBegin,
      onHwvFirstModelLoaded: handleLoadEnd,
      onHwvSelectionArray: handleSelection,
    },
  };
}

function ViewerWithHook() {
  const { isReady, isLoading, selection, events } = useViewerState();

  return (
    <div>
      <div style={{ padding: '8px' }}>
        Status: {isLoading ? 'Loading...' : isReady ? 'Ready' : 'Initializing'}
        {selection.length > 0 && <span> | Selected: {selection.length} items</span>}
      </div>

      <WebViewerComponent
        endpointUri="/models/sample.scs"
        style={{ width: '100%', height: '500px' }}
        {...events}
      />
    </div>
  );
}
```

## Event reference

The WebViewerComponent supports all HOOPS Web Viewer events as React props:

### Core events

- `onHwvReady` — Viewer initialization complete
- `onHwvSceneReady` — Scene and model ready for interaction
- `onHwvFirstModelLoaded` — First model loaded successfully

### Model events

- `onHwvModelLoadBegin` — Model loading started
- `onHwvModelStructureReady` — Model structure parsed
- `onHwvModelSwitched` — Model switched in multi-model scenarios

### Interaction events

- `onHwvSelectionArray` — Selection changed
- `onHwvBeginInteraction` — User interaction started
- `onHwvEndInteraction` — User interaction ended
- `onHwvCamera` — Camera changed
- `onHwvContextMenu` — Right-click context menu

### View events

- `onHwvViewCreated` — View created
- `onHwvViewLoaded` — View loaded
- `onHwvViewOrientation` — View orientation changed

### Measurement events

- `onHwvMeasurementCreated` — Measurement created
- `onHwvMeasurementDeleted` — Measurement deleted
- `onHwvRedlineCreated` — Redline markup created

### Error events

- `onHwvModelLoadFailure` — Model failed to load
- `onHwvTimeout` — Operation timeout
- `onHwvWebGlContextLost` — WebGL context lost

## TypeScript support

All components are fully typed for TypeScript with proper event interfaces:

```tsx
import React from 'react';
import type { CustomEvent } from 'react';
import { WebViewerComponent, HoopsModelTree } from '@ts3d-hoops/web-viewer-components-react';

interface ViewerProps {
  modelUrl: string;
  onReady?: () => void;
}

function TypedViewer({ modelUrl, onReady }: ViewerProps) {
  const handleModelTreeClick = (e: CustomEvent) => {
    // e.detail is properly typed
    const { nodeId, nodeName } = e.detail;
    console.log(`Clicked: ${nodeName}`);
  };

  return (
    <WebViewerComponent
      endpointUri={modelUrl}
      onHwvSceneReady={onReady}
      style={{ width: '100%', height: '500px' }}
    >
      <HoopsModelTree slot="sidebar" onModelTreeNodeClick={handleModelTreeClick} />
    </WebViewerComponent>
  );
}
```

## Comparison with vanilla web components

| Feature           | @ts3d-hoops/web-viewer-components | @ts3d-hoops/web-viewer-components-react |
| ----------------- | --------------------------------- | --------------------------------------- |
| React integration | Manual JSX declarations needed    | Native React components                 |
| TypeScript        | Generic web component types       | Full React component types              |
| Event handling    | DOM events only                   | React SyntheticEvents + Custom Events   |
| Props             | Attributes only                   | React props + attributes                |
| Tree shaking      | ✅                                | ✅                                      |
| Bundle size       | Smaller                           | Slightly larger (+@lit/react)           |

## Performance

- Built on @lit/react for optimal React integration
- Components are lazy-loaded and tree-shakable
- No unnecessary re-renders thanks to Lit's efficient change detection
- Minimal overhead over vanilla web components

## Browser support

- React 18+
- Modern browsers with web component support
- WebGL-capable devices
- ES2020+ environments
- Works with all major bundlers (Vite, Webpack, Create React App)

## Related packages

- `@ts3d-hoops/web-viewer-components` — The underlying web component library
- `@ts3d-hoops/web-viewer` — Core HOOPS Web Viewer library
- `@ts3d-hoops/ui-kit-react` — React wrappers for base UI components
- `@ts3d-hoops/streamcache` — Low-level streaming client

## Migration from @ts3d-hoops/web-viewer-components

If you're using @ts3d-hoops/web-viewer-components web components directly in React:

**Before:**

```tsx
// Manual JSX declarations needed
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'hoops-web-viewer': any;
      'hoops-model-tree': any;
    }
  }
}

<hoops-web-viewer endpoint-uri="/models/sample.scs">
  <hoops-model-tree slot="sidebar" />
</hoops-web-viewer>;
```

**After:**

```tsx
import { WebViewerComponent, HoopsModelTree } from '@ts3d-hoops/web-viewer-components-react';

<WebViewerComponent endpointUri="/models/sample.scs">
  <HoopsModelTree slot="sidebar" />
</WebViewerComponent>;
```

## License

Commercial license. For evaluation or production licensing, contact Tech Soft 3D.
