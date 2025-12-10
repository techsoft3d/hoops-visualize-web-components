import { useSelector } from '@xstate/react';
import { uiActor } from '../statemachines/uiMachine';
import { HoopsCuttingPlanePanel } from '@ts3d-hoops/web-viewer-components-react';

export default function CuttingPlanesPanel() {
  const uiState = useSelector(uiActor, (snapshot) => snapshot.context);

  return (
    <div style={{ margin: '0 0.5rem 1rem 0.5rem' }} hidden={!uiState.cuttingPlaneShown}>
      <HoopsCuttingPlanePanel />
    </div>
  );
}
