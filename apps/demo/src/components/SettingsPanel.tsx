import { HoopsSettingsPanel } from '@ts3d-hoops/web-viewer-components-react';
import { useSelector } from '@xstate/react';
import { uiActor } from '../statemachines/uiMachine';

export default function SettingsPanel() {
  const uiState = useSelector(uiActor, (snapshot) => snapshot.context);

  return (
    <div className="settings-panel" hidden={!uiState.settingsPanelShown}>
      <HoopsSettingsPanel data-testid="settings-panel" />
    </div>
  );
}
