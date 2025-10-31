import { setup, assign, createActor } from 'xstate';

import { Selection, SelectionMode, WebViewer } from '@ts3d-hoops/web-viewer';
import { takeSnapshot } from '../utils/takeSnapshot';
import WebViewerComponent from '@ts3d-hoops/web-viewer-components/hoops-web-viewer';
import { getRegisteredViewer, registerViewer } from '../utils/registerViewer';
import { IViewService } from '@ts3d-hoops/web-viewer-components/services/view/types';
import { getService } from '@ts3d-hoops/web-viewer-components/services';

declare global {
  interface Window {
    hwv: WebViewer;
    hwvElm: WebViewerComponent;
  }
}

// Context Update Events
type ViewerReadyEvent = { type: 'viewerReady'; viewer: WebViewer; elm: WebViewerComponent };
type ModelReadyEvent = { type: 'modelReady' };
type FirstModelLoadedEvent = { type: 'firstModelLoaded' };
type AssemblyTreeReadyEvent = { type: 'assemblyTreeReady' };
type SceneReadyEvent = { type: 'sceneReady' };
type NodeSelectedEvent = { type: 'nodeSelected'; nodeId: number };

// Actions Events
type TakeSnapShotEvent = { type: 'takeSnapshot' };
type OpenEmptyViewerEvent = { type: 'openEmptyViewer' };
type OpenModelEvent = { type: 'openModel'; modelName: string };
type ImportModelEvent = { type: 'importModel'; modelName: string };
type ImportLocalModelEvent = { type: 'importLocalModel'; file: File };
type SelectNodesEvent = {
  type: 'selectNodes';
  nodeIds: number[];
  mode: SelectionMode;
  clear?: boolean;
};
type ClearSelectionEvent = { type: 'clearSelection'; triggerCallback?: boolean };
type SetNodesVisibilityEvent = {
  type: 'setNodesVisibility';
  nodeIds: number[];
  visibility: boolean;
  resetVisibility?: boolean;
};
type ResetNodesVisibilityEvent = {
  type: 'resetNodesVisibility';
};
type ActivateCadViewEvent = {
  type: 'activateCadView';
  nodeId: number;
};
type ActivateCadConfigurationEvent = {
  type: 'activateCadConfiguration';
  cadConfigurationId: number;
};

export const viewerMachine = setup({
  types: {
    context: {} as {
      viewerReady: boolean;
      assemblyTreeReady: boolean;
      modelReady: boolean;
      firstModelLoaded: boolean;
      sceneReady: boolean;
      viewerVersion: string;
      formatVersion: string;
      selectedNodeId: number;
    },
    events: {} as
      | ViewerReadyEvent
      | ModelReadyEvent
      | AssemblyTreeReadyEvent
      | SceneReadyEvent
      | TakeSnapShotEvent
      | OpenEmptyViewerEvent
      | NodeSelectedEvent
      | OpenModelEvent
      | ImportModelEvent
      | ImportLocalModelEvent
      | SelectNodesEvent
      | ClearSelectionEvent
      | SetNodesVisibilityEvent
      | ResetNodesVisibilityEvent
      | ActivateCadViewEvent
      | ActivateCadConfigurationEvent
      | FirstModelLoadedEvent,
  },
  actions: {
    assignViewer: assign({
      viewerReady: ({ event: e }) => {
        const event = e as ViewerReadyEvent;
        window.hwv = event.viewer;
        window.hwvElm = event.elm;
        registerViewer('', { hwv: event.viewer, elm: event.elm });
        return true;
      },
    }),
    assignVersion: assign({
      viewerVersion: () => getRegisteredViewer('')!.hwv.getViewerVersionString(),
      formatVersion: () => getRegisteredViewer('')!.hwv.getFormatVersionString(),
    }),
    assignAssemblyTreeReady: assign({
      assemblyTreeReady: true,
    }),
    setupViewer: () => {
      const viewService = getService<IViewService>('ViewService');
      viewService.setNavCubeVisible(true);
      viewService.setAxisTriadVisible(true);
    },
    assignSceneReady: assign({
      sceneReady: true,
    }),
    assignModelReady: assign({
      modelReady: true,
    }),
    assignFirstModelLoaded: assign({
      firstModelLoaded: true,
    }),
    assignSelectedNodeId: assign({
      selectedNodeId: ({ event }) => (event as NodeSelectedEvent).nodeId,
    }),
    takeSnapshot: () => takeSnapshot(getRegisteredViewer('')!.hwv),
    openEmptyViewer: () => (window.location.href = '.'),
    openModel: ({ event }) =>
      (window.location.href = `.?scs=${
        import.meta.env.VITE_MODEL_URL ? import.meta.env.VITE_MODEL_URL + '/' : ''
      }${(event as OpenModelEvent).modelName}`),
    importModel: ({ event }) => {
      const viewer = getRegisteredViewer('')!;
      viewer.hwv.model.loadSubtreeFromScsFile(
        viewer.hwv.model.getAbsoluteRootNode(),
        `${import.meta.env.VITE_MODEL_URL ? import.meta.env.VITE_MODEL_URL + '/' : ''}${
          (event as OpenModelEvent).modelName
        }`,
      );
    },
    importLocalModel: async ({ event }) => {
      const viewer = getRegisteredViewer('')!;
      viewer.hwv.model.loadSubtreeFromScsBuffer(
        viewer.hwv.model.getAbsoluteRootNode(),
        new Uint8Array(await (event as ImportLocalModelEvent).file.arrayBuffer()),
      );
    },
    selectNodes: ({ event }) => {
      const evt = event as SelectNodesEvent;
      const viewer = getRegisteredViewer('')!;

      if (evt.clear) {
        viewer.hwv.selectionManager.clear(false);
      }

      const selectionItems = evt.nodeIds.map((nodeId) => Selection.SelectionItem.create(nodeId));
      viewer.hwv.selectionManager.add(selectionItems, false);
    },
    clearSelection: ({ event }) => {
      const evt = event as ClearSelectionEvent;
      getRegisteredViewer('')!.hwv.selectionManager.clear(evt.triggerCallback);
    },
    setNodesVisibility: ({ event }) => {
      const evt = event as SetNodesVisibilityEvent;
      const viewer = getRegisteredViewer('')!;

      if (evt.resetVisibility) {
        viewer.hwv.model.resetNodesVisibility();
      }
      viewer.hwv.model.setNodesVisibility(evt.nodeIds, evt.visibility, false);
    },
    resetNodesVisibility: () => getRegisteredViewer('')!.hwv.model.resetNodesVisibility(),
    activateCadView: ({ event }) => {
      const nodeId = (event as ActivateCadViewEvent).nodeId;
      getRegisteredViewer('')!.hwv.model.activateCadView(nodeId);
    },
    activateCadConfiguration: ({ event }) => {
      const cadConfigurationId = (event as ActivateCadConfigurationEvent).cadConfigurationId;
      getRegisteredViewer('')!.hwv.model.activateCadConfiguration(cadConfigurationId);
    },
  },
}).createMachine({
  context: {
    viewerReady: false,
    assemblyTreeReady: false,
    modelReady: false,
    firstModelLoaded: false,
    sceneReady: false,
    viewerVersion: 'N/A',
    formatVersion: 'N/A',
    selectedNodeId: Number.NaN,
  },
  initial: 'Not Initialized',
  states: {
    'Not Initialized': {
      on: {
        viewerReady: {
          target: 'Wasm Loaded',
          actions: 'assignViewer',
        },
      },
    },
    'Wasm Loaded': {
      on: {
        sceneReady: {
          target: 'Scene Ready',
          actions: 'assignSceneReady',
        },
      },
    },
    'Scene Ready': {
      on: {
        assemblyTreeReady: {
          target: 'Assembly Tree Ready',
          actions: ['setupViewer', 'assignAssemblyTreeReady', 'assignVersion'],
        },
      },
    },
    'Assembly Tree Ready': {
      on: {
        modelReady: {
          target: 'Model Ready',
          actions: 'assignModelReady',
        },
      },
    },
    'Model Ready': {
      on: {
        firstModelLoaded: {
          actions: 'assignFirstModelLoaded',
        },
        nodeSelected: {
          actions: 'assignSelectedNodeId',
        },
        takeSnapshot: {
          actions: 'takeSnapshot',
        },
        openEmptyViewer: {
          actions: 'openEmptyViewer',
        },
        openModel: {
          actions: 'openModel',
        },
        importModel: {
          actions: 'importModel',
        },
        importLocalModel: {
          actions: 'importLocalModel',
        },
        selectNodes: {
          actions: 'selectNodes',
        },
        clearSelection: {
          actions: 'clearSelection',
        },
        setNodesVisibility: {
          actions: 'setNodesVisibility',
        },
        resetNodesVisibility: {
          actions: 'resetNodesVisibility',
        },
        activateCadView: {
          actions: 'activateCadView',
        },
        activateCadConfiguration: {
          actions: 'activateCadConfiguration',
        },
      },
    },
  },
});

export const viewerActor = createActor(viewerMachine);
viewerActor.start();
