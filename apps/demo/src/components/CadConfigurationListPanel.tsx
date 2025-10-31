import { useEffect, useRef } from 'react';

import { HoopsCadConfigurationList } from '@ts3d-hoops/web-viewer-components-react';
import { useSelector } from '@xstate/react';
import { uiActor } from '../statemachines/uiMachine';
import { viewerActor } from '../statemachines/viewerMachine';
import {
  CadConfigurationListClickEvent,
  HoopsCadConfigurationListElement,
} from '@ts3d-hoops/web-viewer-components/hoops-cad-configuration-list/hoops-cad-configuration-list';
import { NodeId, NodeSource, WebViewer } from '@ts3d-hoops/web-viewer';
import { getRegisteredViewer } from '../utils/registerViewer';

export default function CadConfigurationListPanel() {
  const uiState = useSelector(uiActor, (snapshot) => snapshot.context);
  const viewerState = useSelector(viewerActor, (snapshot) => snapshot.context);

  const cadConfigurationListRef = useRef<HoopsCadConfigurationListElement | null>(null);

  useEffect(() => {
    if (!cadConfigurationListRef.current || !viewerState.modelReady) {
      return;
    }

    /**
     * Here we bind web viewer events to the cadConfigurationList
     */

    const cadConfigurationList = cadConfigurationListRef.current;

    const hwvFirstModelLoaded = (e: Event) => {
      const event = e as CustomEvent<{
        hwv: WebViewer;
        modelRootIds: NodeId[];
        isHwf: boolean;
      }>;
      cadConfigurationList.model = event.detail.hwv.model;
      const defaultConfiguration = event.detail.hwv.model.getDefaultCadConfiguration();
      if (defaultConfiguration) {
        cadConfigurationList.active = defaultConfiguration;
      }
    };

    const hwvSubtreeLoaded = (e: Event) => {
      const event = e as CustomEvent<{
        hwv: WebViewer;
        modelRootIds: NodeId[];
        source: NodeSource;
      }>;
      cadConfigurationList.model = event.detail.hwv.model;
    };

    const hwvSubtreeDeleted = (e: Event) => {
      const event = e as CustomEvent<{ hwv: WebViewer; modelRootIds: NodeId[] }>;
      cadConfigurationList.model = event.detail.hwv.model;
    };

    const hwvConfigurationActivated = (e: Event) => {
      const event = e as CustomEvent<{ hwv: WebViewer; nodeId: NodeId }>;
      cadConfigurationList.active = event.detail.nodeId;
    };

    const hwvModelSwitched = (e: Event) => {
      const event = e as CustomEvent<{
        hwv: WebViewer;
        clearOnly: boolean;
        modelRootIds: NodeId[];
      }>;
      cadConfigurationList.model = event.detail.hwv.model;
    };

    const viewer = getRegisteredViewer('')!;

    viewer.elm.addEventListener('hwvFirstModelLoaded', hwvFirstModelLoaded);
    viewer.elm.addEventListener('hwvSubtreeLoaded', hwvSubtreeLoaded);
    viewer.elm.addEventListener('hwvSubtreeDeleted', hwvSubtreeDeleted);
    viewer.elm.addEventListener('hwvConfigurationActivated', hwvConfigurationActivated);
    viewer.elm.addEventListener('hwvModelSwitched', hwvModelSwitched);

    cadConfigurationList.model = viewer.hwv.model;
    const currentCadConfiguration = viewer.hwv.model.getActiveCadConfiguration();
    if (currentCadConfiguration) {
      cadConfigurationList.active = currentCadConfiguration;
    }

    return () => {
      /**
       * To avoid any issue or performance drop we remove the listeners when the components are
       * unmounted
       */

      viewer.elm.removeEventListener('hwvSubtreeLoaded', hwvSubtreeLoaded);
      viewer.elm.removeEventListener('hwvFirstModelLoaded', hwvFirstModelLoaded);
      viewer.elm.removeEventListener('hwvSubtreeDeleted', hwvSubtreeDeleted);
      viewer.elm.removeEventListener('hwvConfigurationActivated', hwvConfigurationActivated);
      viewer.elm.removeEventListener('hwvModelSwitched', hwvModelSwitched);
    };
  }, [viewerState.modelReady]);

  /**
   * These are the CadConfigurationList callbacks. They will be attached to the CadConfigurationList's events
   */
  const cadConfigurationListClick = (e: Event) => {
    e.stopPropagation();
    const event = e as CadConfigurationListClickEvent;

    viewerActor.send({
      type: 'activateCadConfiguration',
      cadConfigurationId: event.detail.cadConfigurationId,
    });

    if (cadConfigurationListRef.current) {
      cadConfigurationListRef.current.active = event.detail.cadConfigurationId;
    }
  };

  return (
    <div
      className="right-panel-up cad-configuration-list"
      hidden={!uiState.cadConfigurationListShown}
    >
      <HoopsCadConfigurationList
        data-testid="cad-configuration-list"
        ref={cadConfigurationListRef}
        cadConfigurationListClick={cadConfigurationListClick}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
      ></HoopsCadConfigurationList>
    </div>
  );
}
