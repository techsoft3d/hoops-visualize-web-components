import { useEffect, useRef } from 'react';
import { useSelector } from '@xstate/react';
import { uiActor } from '../statemachines/uiMachine';
import { viewerActor } from '../statemachines/viewerMachine';
import { HoopsSheetList } from '@ts3d-hoops/web-viewer-components-react';
import {
  HoopsSheetListElement,
  type SheetListNodeClickEvent,
} from '@ts3d-hoops/web-viewer-components';
import { getRegisteredViewer } from '../utils/registerViewer';

export default function SheetListPanel() {
  const uiState = useSelector(uiActor, (snapshot) => snapshot.context);
  const viewerState = useSelector(viewerActor, (snapshot) => snapshot.context);

  const sheetListRef = useRef<HoopsSheetListElement | null>(null);

  useEffect(() => {
    if (!sheetListRef.current || !viewerState.modelReady) {
      return;
    }

    const viewer = getRegisteredViewer('')!;
    const model = viewer.hwv.model;

    // Provide the IModel interface the SheetAdapter expects
    sheetListRef.current.model = {
      getSheetIds: () => viewer.hwv.sheetManager.getSheetIds(),
      getNodeName: (nodeId: number) => model.getNodeName(nodeId),
      isDrawing: () => model.isDrawing(),
    };
  }, [viewerState.modelReady]);

  const sheetListNodeClick = (e: Event) => {
    const event = e as SheetListNodeClickEvent;
    event.stopPropagation();

    const viewer = getRegisteredViewer('')!;
    viewer.hwv.sheetManager.setActiveSheetId(event.detail.nodeId);
  };

  return (
    <div className="right-panel-up" hidden={!uiState.sheetListShown}>
      <HoopsSheetList
        data-testid="sheetlist"
        className="tree"
        ref={sheetListRef}
        sheetListNodeClick={sheetListNodeClick}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
      ></HoopsSheetList>
    </div>
  );
}
