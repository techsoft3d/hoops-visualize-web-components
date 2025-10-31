import { HoopsToolsPanel } from '@ts3d-hoops/web-viewer-components-react';
import { useSelector } from '@xstate/react';
import { uiActor } from '../statemachines/uiMachine';

export default function ToolsPanel() {
  const uiState = useSelector(uiActor, (snapshot) => snapshot.context);

  return (
    <div hidden={!uiState.toolsPanelShown} data-testid="tools-panel">
      Tools
      <HoopsToolsPanel />
    </div>
  );
}
