import { useEffect, useRef } from 'react';

import { HoopsLayerTree } from '@ts3d-hoops/web-viewer-components-react';
import { useSelector } from '@xstate/react';
import { uiActor } from '../statemachines/uiMachine';
import { viewerActor } from '../statemachines/viewerMachine';
import {
  HoopsLayerTreeElement,
  LayerTreeNodeSelectedEvent,
  LayerTreeVisibilityChanged,
} from '@ts3d-hoops/web-viewer-components';
import { BodyId, Event, NodeId, SelectionMode, WebViewer } from '@ts3d-hoops/web-viewer';
import { getRegisteredViewer } from '../utils/registerViewer';

export default function LayerTreePanel() {
  const uiState = useSelector(uiActor, (snapshot) => snapshot.context);
  const viewerState = useSelector(viewerActor, (snapshot) => snapshot.context);

  const layerTreeRef = useRef<HoopsLayerTreeElement | null>(null);

  useEffect(() => {
    if (!layerTreeRef.current || !viewerState.modelReady) {
      return;
    }

    /**
     * Here we bind the LayerTree callbacks to the viewer events using the WebViewerComponent
     * element attached to the window object
     */

    const layerTree = layerTreeRef.current;

    const hwvSelectionArray = (e: Event) => {
      const event = e as CustomEvent<{
        hwv: WebViewer;
        selectionEvents: Event.NodeSelectionEvent[];
        removed: boolean;
      }>;
      const selectedNodeIds = event.detail.hwv.selectionManager
        .getResults()
        .map((current) => current.getNodeId());

      layerTree.selectNodes(selectedNodeIds, true);
    };

    const hwvFirstModelLoaded = (e: Event) => {
      const event = e as CustomEvent<{
        hwv: WebViewer;
        modelRootIds: NodeId[];
        isHwf: boolean;
      }>;
      // In case of first load, we reset the model tree to initial state
      layerTree.layersContainer = event.detail.hwv.model;
    };

    const hwvVisibilityChanged = (e: Event) => {
      const event = e as CustomEvent<{
        hwv: WebViewer;
        shownBodyIds: BodyId[];
        hiddenBodyIds: BodyId[];
      }>;
      // Update eye icons when visibility changes in the webviewer
      layerTreeRef.current?.updateVisibility(event.detail.shownBodyIds, event.detail.hiddenBodyIds);
    };

    const viewer = getRegisteredViewer('')!;

    viewer.elm.addEventListener('hwvSelectionArray', hwvSelectionArray);
    viewer.elm.addEventListener('hwvFirstModelLoaded', hwvFirstModelLoaded);
    viewer.elm.addEventListener('hwvVisibilityChanged', hwvVisibilityChanged);

    layerTree.layersContainer = viewer.hwv.model;

    return () => {
      /**
       * To avoid any issue or performance drop we remove the listeners when the components are
       * unmounted
       */

      viewer.elm.removeEventListener('hwvSelectionArray', hwvSelectionArray);
      viewer.elm.removeEventListener('hwvFirstModelLoaded', hwvFirstModelLoaded);
      viewer.elm.removeEventListener('hwvVisibilityChanged', hwvVisibilityChanged);
    };
  }, [viewerState.modelReady]);

  const layerTreeNodeClick = (e: Event) => {
    const event = e as LayerTreeNodeSelectedEvent;
    event.stopPropagation();

    viewerActor.send({
      type: 'selectNodes',
      clear: true,
      nodeIds: event.detail.nodeIds,
      mode: SelectionMode.Add,
    });

    uiActor.send({
      type: 'setContextMenuShown',
      shown: event.detail.button === 2,
      position: { x: event.detail.clientX, y: event.detail.clientY },
    });
  };

  const layerTreeVisibilityChanged = (e: Event) => {
    const event = e as LayerTreeVisibilityChanged;
    event.stopPropagation();

    viewerActor.send({
      type: 'clearSelection',
      triggerCallback: false,
    });
    viewerActor.send({
      type: 'setNodesVisibility',
      nodeIds: event.detail.nodeIds,
      visibility: false,
      resetVisibility: true,
    });
  };

  return (
    <div className="right-panel-up" hidden={!uiState.layerTreeShown} data-testid="layertree">
      <HoopsLayerTree
        className="list"
        ref={layerTreeRef}
        layerTreeNodeClick={layerTreeNodeClick}
        layerTreeVisibilityChanged={layerTreeVisibilityChanged}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
      ></HoopsLayerTree>
    </div>
  );
}
