import { useEffect, useRef } from 'react';

import { HoopsContextMenuElement } from '@ts3d-hoops/web-viewer-components';
import { HoopsContextMenu } from '@ts3d-hoops/web-viewer-components-react';
import { uiActor } from '../statemachines/uiMachine';
import { useSelector } from '@xstate/react';
import { viewerActor } from '../statemachines/viewerMachine';
import { getRegisteredViewer } from '../utils/registerViewer';

export default function ContextMenu() {
  const uiState = useSelector(uiActor, (snapshot) => snapshot.context);
  const viewerState = useSelector(viewerActor, (snapshot) => snapshot.context);

  const contextMenuRef = useRef<HoopsContextMenuElement | null>(null);

  useEffect(() => {
    if (!viewerState.viewerReady || !contextMenuRef.current) {
      return;
    }

    contextMenuRef.current.contextMenuWebViewer = getRegisteredViewer('')!.hwv;
  }, [viewerState.viewerReady]);

  useEffect(() => {
    if (!viewerState.modelReady || !contextMenuRef.current) {
      return;
    }
    contextMenuRef.current.contextMenuModel = getRegisteredViewer('')!.hwv.model;
  }, [viewerState.modelReady]);

  useEffect(() => {
    if (!contextMenuRef.current) {
      return;
    }
    contextMenuRef.current.activeItemId = Number.isNaN(viewerState.selectedNodeId)
      ? null
      : viewerState.selectedNodeId;
  }, [viewerState.selectedNodeId]);

  useEffect(() => {
    if (!contextMenuRef.current) {
      return;
    }
    contextMenuRef.current.x = uiState.contextMenuPosition.x;
    contextMenuRef.current.y = uiState.contextMenuPosition.y;
  }, [uiState.contextMenuPosition]);

  return (
    <HoopsContextMenu
      ref={contextMenuRef}
      hidden={!uiState.contextMenuShown}
      contextMenuItemClicked={() =>
        uiActor.send({
          type: 'setContextMenuShown',
          shown: false,
        })
      }
    ></HoopsContextMenu>
  );
}
