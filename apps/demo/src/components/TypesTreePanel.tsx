import { useEffect, useRef } from 'react';
import { useSelector } from '@xstate/react';
import { uiActor } from '../statemachines/uiMachine';
import { viewerActor } from '../statemachines/viewerMachine';
import { getRegisteredViewer } from '../utils/registerViewer';
import { HoopsTypesTree } from '@ts3d-hoops/web-viewer-components-react';
import { HoopsTypesTreeElement } from '@ts3d-hoops/web-viewer-components';
import { SelectionMode, WebViewer, BodyId } from '@ts3d-hoops/web-viewer';

import type {
  TypesTreeNodeClickEvent,
  TypesTreeTypeNodeClickEvent,
} from '@ts3d-hoops/web-viewer-components';

// Define the type for the visibility change event, similar to the click event
type TypesTreeNodeVisibilityChangeEvent = CustomEvent<{
  nodeIds: number[];
  source: HTMLElement;
  button: number;
  clientX: number;
  clientY: number;
  visible: boolean;
}>;

export default function TypesTreePanel() {
  const uiState = useSelector(uiActor, (snapshot) => snapshot.context);
  const viewerState = useSelector(viewerActor, (snapshot) => snapshot.context);

  const typesTreeRef = useRef<HoopsTypesTreeElement>(null);

  useEffect(() => {
    if (!typesTreeRef.current || !viewerState.modelReady) {
      return;
    }

    const typesTree = typesTreeRef.current;

    const hwvVisibilityChanged = (e: Event) => {
      const event = e as CustomEvent<{
        hwv: WebViewer;
        shownBodyIds: BodyId[];
        hiddenBodyIds: BodyId[];
      }>;

      // Update eye icons when visibility changes in the webviewer
      typesTree.updateVisibility(event.detail.shownBodyIds, event.detail.hiddenBodyIds);
    };

    const viewer = getRegisteredViewer('')!;

    viewer.elm.addEventListener('hwvVisibilityChanged', hwvVisibilityChanged);

    typesTree.model = viewer.hwv.model;
  }, [viewerState.modelReady]);

  const typesTreeNodeClick = (e: Event) => {
    const event = e as TypesTreeNodeClickEvent;
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

  const typesTreeTypeNodeClick = (e: Event) => {
    const event = e as TypesTreeTypeNodeClickEvent;
    event.stopPropagation();
    // Select all model nodes associated with this type
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

  const typesTreeNodeVisibilityChange = (e: Event) => {
    const event = e as TypesTreeNodeVisibilityChangeEvent;
    event.stopPropagation();
    // Send a message to toggle visibility of the node
    viewerActor.send({
      type: 'setNodesVisibility',
      nodeIds: event.detail.nodeIds,
      visibility: event.detail.visible,
    });
  };

  return (
    <div className="right-panel-up" hidden={!uiState.typesTreeShown} data-testid="typestree">
      <HoopsTypesTree
        className="tree"
        ref={typesTreeRef}
        typesTreeNodeClick={typesTreeNodeClick}
        typesTreeTypeNodeClick={typesTreeTypeNodeClick}
        typesTreeNodeVisibilityChange={typesTreeNodeVisibilityChange}
        onContextMenu={(e: any) => {
          e.preventDefault();
        }}
      ></HoopsTypesTree>
    </div>
  );
}
