import { useEffect, useRef } from 'react';

import { HoopsModelTree } from '@ts3d-hoops/web-viewer-components-react';
import { useSelector } from '@xstate/react';
import { uiActor } from '../statemachines/uiMachine';
import { viewerActor } from '../statemachines/viewerMachine';
import { HoopsModelTreeElement, ModelTreeNodeClickEvent } from '@ts3d-hoops/web-viewer-components';
import { ModelTreeNodeVisibilityClickEvent } from '@ts3d-hoops/web-viewer-components/hoops-model-tree/hoops-model-tree';
import { Event, NodeId, NodeSource, SelectionMode, WebViewer } from '@ts3d-hoops/web-viewer';
import { getRegisteredViewer } from '../utils/registerViewer';

export default function ModelTreePanel() {
  const uiState = useSelector(uiActor, (snapshot) => snapshot.context);
  const viewerState = useSelector(viewerActor, (snapshot) => snapshot.context);

  const modelTreeRef = useRef<HoopsModelTreeElement | null>(null);

  useEffect(() => {
    if (!modelTreeRef.current || !viewerState.modelReady) {
      return;
    }

    /**
     * Here we bind the ModelTree callbacks to the viewer events using the WebViewerComponent
     * element attached to the window object
     */

    const modelTree = modelTreeRef.current;

    const hwvSelectionArray = (e: Event) => {
      const event = e as CustomEvent<{
        hwv: WebViewer;
        selectionEvents: Event.NodeSelectionEvent[];
        removed: boolean;
      }>;
      const hwv = event.detail.hwv;
      const selectedNodeIds = hwv.selectionManager
        .getResults()
        .map((current) => current.getNodeId());
      modelTree.selected = selectedNodeIds;

      if (selectedNodeIds.length === 0) {
        return;
      }

      const pathFromNode = (from: NodeId): number[] => {
        const parent = hwv.model.getNodeParent(from);
        if (parent === null) {
          return [from];
        }

        return [...pathFromNode(parent), from];
      };

      const tree = modelTree.treeElement;
      if (tree === undefined) {
        return;
      }

      // Expand the path to the selected nodes
      for (const nodeId of selectedNodeIds) {
        const path = pathFromNode(nodeId);
        tree.expandPath(path);
      }

      // Scroll to the first selected node
      requestAnimationFrame(() => {
        const firstSelectedNodeId = selectedNodeIds[0];
        const nodeElement = tree.shadowRoot?.querySelector(
          `hoops-tree-node[key="${firstSelectedNodeId}"]`,
        );
        if (nodeElement) {
          nodeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      });
    };

    const hwvVisibilityChanged = (e: Event) => {
      const event = e as CustomEvent<{ shownBodyIds: number[]; hiddenBodyIds: number[] }>;
      event.detail.shownBodyIds.forEach((nodeId: number) =>
        modelTree.updateNodeData(nodeId, { visibility: 'Shown' }),
      );

      event.detail.hiddenBodyIds.forEach((nodeId: number) =>
        modelTree.updateNodeData(nodeId, { visibility: 'Hidden' }),
      );
    };

    const hwvSubtreeLoaded = (e: Event) => {
      const event = e as CustomEvent<{
        hwv: WebViewer;
        modelRootIds: NodeId[];
        source: NodeSource;
      }>;
      event.detail.modelRootIds.forEach((nodeId) => {
        const parentNode = event.detail.hwv.model.getNodeParent(nodeId);
        if (parentNode) {
          modelTree.refreshNodeData(parentNode);
        }
      });
    };

    const hwvFirstModelLoaded = (e: Event) => {
      const event = e as CustomEvent<{
        hwv: WebViewer;
        modelRootIds: NodeId[];
        isHwf: boolean;
      }>;
      // In case of first load, we reset the model tree to initial state
      modelTree.model = event.detail.hwv.model;
    };

    const hwvSubtreeDeleted = (e: Event) => {
      const event = e as CustomEvent<{ hwv: WebViewer; modelRootIds: NodeId[] }>;
      event.detail.modelRootIds.forEach((nodeId) => {
        modelTree.removeNode(nodeId);
      });
    };

    const viewer = getRegisteredViewer('')!;

    viewer.elm.addEventListener('hwvSelectionArray', hwvSelectionArray);
    viewer.elm.addEventListener('hwvVisibilityChanged', hwvVisibilityChanged);
    viewer.elm.addEventListener('hwvSubtreeLoaded', hwvSubtreeLoaded);
    viewer.elm.addEventListener('hwvFirstModelLoaded', hwvFirstModelLoaded);
    viewer.elm.addEventListener('hwvSubtreeDeleted', hwvSubtreeDeleted);

    modelTree.model = viewer.hwv.model;

    return () => {
      /**
       * To avoid any issue or performance drop we remove the listeners when the components are
       * unmounted
       */

      viewer.elm.removeEventListener('hwvSelectionArray', hwvSelectionArray);
      viewer.elm.removeEventListener('hwvVisibilityChanged', hwvVisibilityChanged);
      viewer.elm.removeEventListener('hwvSubtreeLoaded', hwvSubtreeLoaded);
      viewer.elm.removeEventListener('hwvFirstModelLoaded', hwvFirstModelLoaded);
      viewer.elm.removeEventListener('hwvSubtreeDeleted', hwvSubtreeDeleted);
    };
  }, [viewerState.modelReady]);

  /**
   * These are the ModelTree callbacks. They will be attached to the ModelTree's events
   */
  const modelTreeNodeClick = (e: Event) => {
    const event = e as ModelTreeNodeClickEvent;
    event.stopPropagation();

    viewerActor.send({
      type: 'selectNodes',
      clear: true,
      nodeIds: [event.detail.nodeId],
      mode: SelectionMode.Add,
    });

    uiActor.send({
      type: 'setContextMenuShown',
      shown: event.detail.button === 2,
      position: { x: event.detail.clientX, y: event.detail.clientY },
    });
  };

  const modelTreeNodeVisibilityChange = (e: Event) => {
    const event = e as ModelTreeNodeVisibilityClickEvent;
    event.stopPropagation();
    if (!modelTreeRef.current) {
      return;
    }

    viewerActor.send({
      type: 'setNodesVisibility',
      nodeIds: [event.detail.nodeId],
      visibility: event.detail.visibility,
    });
    modelTreeRef.current.updateNodeData(event.detail.nodeId, {
      visible: event.detail.visibility,
    });
  };

  return (
    <div hidden={!uiState.modelTreeShown}>
      <HoopsModelTree
        data-testid="modeltree"
        className="tree"
        ref={modelTreeRef}
        modelTreeNodeClick={modelTreeNodeClick}
        modelTreeNodeVisibilityChange={modelTreeNodeVisibilityChange}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
      ></HoopsModelTree>
    </div>
  );
}
