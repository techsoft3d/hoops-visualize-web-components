import { useEffect, useRef } from 'react';
import { useSelector } from '@xstate/react';
import { uiActor } from '../statemachines/uiMachine';
import { viewerActor } from '../statemachines/viewerMachine';
import { HoopsViewTree } from '@ts3d-hoops/web-viewer-components-react';
import { HoopsViewTreeElement, type ViewTreeNodeClickEvent } from '@ts3d-hoops/web-viewer-components';
import { getRegisteredViewer } from '../utils/registerViewer';

export default function ViewTreePanel() {
  const uiState = useSelector(uiActor, (snapshot) => snapshot.context);
  const viewerState = useSelector(viewerActor, (snapshot) => snapshot.context);

  const viewTreeRef = useRef<HoopsViewTreeElement | null>(null);

  useEffect(() => {
    if (!viewTreeRef.current || !viewerState.modelReady) {
      return;
    }

    const viewTree = viewTreeRef.current;
    const viewer = getRegisteredViewer('')!;

    viewTree.model = viewer.hwv.model;
  }, [viewerState.modelReady]);

  const viewTreeNodeClick = (e: Event) => {
    const event = e as ViewTreeNodeClickEvent;
    event.stopPropagation();

    viewerActor.send({
      type: 'clearSelection',
      triggerCallback: false,
    });
    viewerActor.send({
      type: 'activateCadView',
      nodeId: event.detail.nodeId,
    });
  };

  return (
    <div className="right-panel-up" hidden={!uiState.viewTreeShown}>
      <HoopsViewTree
        data-testid="viewtree"
        className="tree"
        ref={viewTreeRef}
        viewTreeNodeClick={viewTreeNodeClick}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
      ></HoopsViewTree>
    </div>
  );
}
