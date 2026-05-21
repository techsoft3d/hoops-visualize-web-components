import '@ts3d-hoops/ui-kit';
import '@ts3d-hoops/web-viewer-components';

import { useEffect, useRef, useState } from 'react';

import { HoopsLayout } from '@ts3d-hoops/ui-kit-react';
import {
  HoopsWebviewerContextManager,
  HoopsServiceRegistry,
  WebViewerComponent,
} from '@ts3d-hoops/web-viewer-components-react';
import { Button, Event, FileType, WebViewer } from '@ts3d-hoops/web-viewer';

import { useSearchParams } from 'react-router-dom';
import AppHeader from './AppHeader';
import { useSelector } from '@xstate/react';
import { uiActor } from '../statemachines/uiMachine';
import { viewerActor } from '../statemachines/viewerMachine';
import Toolbar from './Toolbar';
import WebViewerCE from '@ts3d-hoops/web-viewer-components/hoops-web-viewer';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import ContextMenu from './ContextMenu';
import { parseViewerConfigFromParams } from '../utils/viewerConfig';
import { useSsrBackground } from '../utils/useSsrBackground';

export type ViewerProps = {
  sessionName?: string;
};

const DRAG_THRESHOLD = 5; // How many pixels it take for a right click to be considered a drag

export function Viewer(props: ViewerProps) {
  const uiState = useSelector(uiActor, (snapshot) => snapshot.context);
  const viewerState = useSelector(viewerActor, (snapshot) => snapshot.context);

  const centralWidgetRef = useRef<HTMLDivElement | null>(null);
  const [webViewer, setWebViewer] = useState<WebViewer | null>(null);

  const [searchParams, _] = useSearchParams();
  const viewerConfig = parseViewerConfigFromParams(searchParams);

  useSsrBackground(viewerConfig.rendererType === 'server', webViewer, viewerState.sceneReady);

  const modelFormatter = (viewerType?: string, model?: string): string | undefined => {
    if (viewerType === 'scs') {
      return undefined;
    }

    if (!model) {
      return undefined;
    }

    return model;
  };

  const hwvReady = (e: Event) => {
    const hwv = (e as CustomEvent<WebViewer>).detail;

    setWebViewer(hwv);

    viewerActor.send({ type: 'viewerReady', viewer: hwv, elm: e.target as WebViewerCE });
  };

  const hwvModelStructureReady = () => {
    viewerActor.send({ type: 'modelReady' });
  };

  const hwvFirstModelLoaded = (e: Event) => {
    const event = e as CustomEvent<{
      hwv: WebViewer;
    }>;
    const { hwv } = event.detail;
    const isIfc =
      hwv?.model.getModelFileTypeFromNode(
        hwv?.model.getNodeChildren(hwv?.model.getAbsoluteRootNode())[0],
      ) === FileType.Ifc;

    uiActor.send({
      type: 'setIfcRelationshipView',
      enabled: isIfc,
      shown: uiState.ifcRelationshipViewShown,
    });
  };

  const hwvSelectionArray = (e: Event) => {
    const event = e as CustomEvent<{
      hwv: WebViewer;
      selectionEvents: Event.NodeSelectionEvent[];
      removed: boolean;
    }>;
    const { selectionEvents } = event.detail;
    let nodeId = Number.NaN;
    if (selectionEvents.length > 0) {
      nodeId = selectionEvents[selectionEvents.length - 1].getSelection().getNodeId();
    }

    viewerActor.send({
      type: 'nodeSelected',
      nodeId,
    });
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (webViewer && webViewer.getSceneReady()) {
        webViewer.resizeCanvas();
      }
    });

    resizeObserver.observe(centralWidgetRef.current!);
  }, []);

  const lastRightClick = useRef<number | null>(null);
  const rightClickPosition = useRef<{ x: number; y: number } | null>(null);

  return (
    <HoopsServiceRegistry>
      <HoopsWebviewerContextManager>
        <HoopsLayout
          floatingPanels
          onClickCapture={() => uiActor.send({ type: 'setContextMenuShown', shown: false })}
          onAuxClickCapture={() => uiActor.send({ type: 'setContextMenuShown', shown: false })}
        >
          <AppHeader
            versions={viewerState}
            sessionName={props.sessionName ?? viewerConfig.model ?? 'untitled'}
            infoShown={uiState.infoShown}
            onInfoToggled={(shown) => uiActor.send({ type: 'setInfoShown', shown })}
            onOpenEmpty={() => viewerActor.send({ type: 'openEmptyViewer' })}
            onOpenModel={(modelName) => viewerActor.send({ type: 'openModel', modelName })}
            onImportModel={(modelName) => viewerActor.send({ type: 'importModel', modelName })}
            onImportLocalModel={async (file: File) =>
              viewerActor.send({ type: 'importLocalModel', file })
            }
          />
          <Toolbar />
          <LeftPanel />
          <div slot="central-widget" ref={centralWidgetRef}>
            <WebViewerComponent
              className="viewer"
              empty={viewerConfig.empty}
              endpointUri={viewerConfig.endpointUri}
              model={modelFormatter(viewerConfig.viewerType, viewerConfig.model)}
              rendererType={viewerConfig.rendererType}
              streamingMode={viewerConfig.streamingMode}
              enginePath="."
              hwvReady={hwvReady}
              hwvFirstModelLoaded={hwvFirstModelLoaded}
              hwvAssemblyTreeReady={() => viewerActor.send({ type: 'assemblyTreeReady' })}
              hwvSceneReady={() => viewerActor.send({ type: 'sceneReady' })}
              hwvModelStructureReady={hwvModelStructureReady}
              hwvSelectionArray={hwvSelectionArray}
              onClick={() => {
                uiActor.send({
                  type: 'setContextMenuShown',
                  shown: false,
                });
                webViewer?.getViewElement()?.focus();
              }}
              onMouseDown={(e) => {
                if (e.button === Button.Right) {
                  lastRightClick.current = Date.now();
                  rightClickPosition.current = { x: e.clientX, y: e.clientY };
                } else {
                  lastRightClick.current = null;
                  rightClickPosition.current = null;
                }
              }}
              onMouseMove={(e) => {
                // Check for drag on any mouse movement while right button might be down
                if (rightClickPosition.current) {
                  const deltaX = Math.abs(e.clientX - rightClickPosition.current.x);
                  const deltaY = Math.abs(e.clientY - rightClickPosition.current.y);
                  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                  // A right mouse click is considered a drag if moved more than DRAG_THRESHOLD pixels
                  if (distance > DRAG_THRESHOLD) {
                    lastRightClick.current = null; // Cancel context menu
                    rightClickPosition.current = null;
                  }
                }
              }}
              onAuxClick={(e) => {
                if (e.button !== Button.Right) {
                  return;
                }

                // Only show context menu if no drag was detected (lastRightClick not canceled)
                if (lastRightClick.current !== null) {
                  uiActor.send({
                    type: 'setContextMenuShown',
                    shown: true,
                    position: { x: e.clientX, y: e.clientY },
                  });
                } else {
                  uiActor.send({ type: 'setContextMenuShown', shown: false });
                }

                // Reset right click tracking
                lastRightClick.current = null;
                rightClickPosition.current = null;
              }}
            />
            <ContextMenu />
          </div>
          <RightPanel />
        </HoopsLayout>
      </HoopsWebviewerContextManager>
    </HoopsServiceRegistry>
  );
}

export default Viewer;
