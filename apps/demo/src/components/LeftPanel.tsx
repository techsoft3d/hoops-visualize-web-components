import { useSelector } from '@xstate/react';
import { uiActor } from '../statemachines/uiMachine';
import ModelTreePanel from './ModelTreePanel';
import CuttingPlanesPanel from './cutting-plane/CuttingPlanesPanel';
import ToolsPanel from './ToolsPanel';
import SettingsPanel from './SettingsPanel';
import IFCRelationshipView from './IFCRelationshipView';

export default function LeftPanel() {
  const uiState = useSelector(uiActor, (snapshot) => snapshot.context);

  return (
    <div slot="panel-left" data-testid="panel-left" hidden={!uiState.leftPanelShown}>
      <div className="left-panel-up">
        <CuttingPlanesPanel />
        <ModelTreePanel />
        <ToolsPanel />
        <SettingsPanel />
      </div>
      <div hidden={!uiState.ifcRelationshipViewShown}>
        <IFCRelationshipView />
      </div>
    </div>
  );
}
