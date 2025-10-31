import { useEffect, useState } from 'react';
import LayerTreePanel from './LayerTreePanel';
import ViewTreePanel from './ViewTreePanel';
import CadConfigurationListPanel from './CadConfigurationListPanel';
import PropertiesView from './properties-view';
import { useSelector } from '@xstate/react';
import { uiActor } from '../statemachines/uiMachine';
import { viewerActor } from '../statemachines/viewerMachine';
import { core } from '@ts3d-hoops/web-viewer';
import { getRegisteredViewer } from '../utils/registerViewer';
import TypesTreePanel from './TypesTreePanel';

export default function RightPanel() {
  const uiState = useSelector(uiActor, (snapshot) => snapshot.context);
  const viewerState = useSelector(viewerActor, (snapshot) => snapshot.context);

  const [model, setModel] = useState<core.IModel | undefined>(undefined);

  useEffect(() => {
    if (!viewerState.modelReady) {
      return;
    }

    const viewer = getRegisteredViewer('')!;
    setModel(viewer.hwv.model);
  }, [viewerState.modelReady]);

  return (
    <div slot="panel-right" data-testid="panel-right" hidden={!uiState.rightPanelShown}>
      <LayerTreePanel />
      <ViewTreePanel />
      <TypesTreePanel />
      <CadConfigurationListPanel />
      <div hidden={!uiState.propertyPanelShown}>
        <PropertiesView model={model} nodeId={viewerState.selectedNodeId} />
      </div>
    </div>
  );
}
