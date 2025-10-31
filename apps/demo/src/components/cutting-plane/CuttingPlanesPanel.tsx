import { useSelector } from '@xstate/react';
import { useEffect, useRef } from 'react';
import { viewerActor } from '../../statemachines/viewerMachine';
import { core, WebViewer } from '@ts3d-hoops/web-viewer';
import { getRegisteredViewer } from '../../utils/registerViewer';
import { CuttingSection } from './CuttingSection';
import { uiActor } from '../../statemachines/uiMachine';
import { cuttingPlaneActor } from '../../statemachines/cuttingPlaneMachine';

export default function CuttingPlanesPanel() {
  const viewerState = useSelector(viewerActor, (snapshot) => snapshot.context);
  const uiState = useSelector(uiActor, (snapshot) => snapshot.context);
  const cuttingPlaneState = useSelector(cuttingPlaneActor, (snapshot) => snapshot.context);

  const hwvRef = useRef<WebViewer | undefined>();

  useEffect(() => {
    if (hwvRef.current) {
      return;
    }

    const viewer = getRegisteredViewer('')!;

    hwvRef.current = viewer.hwv;

    viewer.elm.addEventListener('hwvSelectionArray', async () => {
      const selection = viewer.hwv.selectionManager.getLast();

      cuttingPlaneActor.send({
        type: 'set selected face',
        selectedFace: selection?.isFaceSelection()
          ? {
              position: selection.getPosition(),
              normal: selection.getFaceEntity().getNormal(),
            }
          : undefined,
      });
    });

    viewer.elm.addEventListener('hwvModelStructureReady', async () => {
      cuttingPlaneActor.send({
        type: 'init',
        modelBounding: await viewer.hwv.model.getModelBounding(true, false),
      });
    });

    viewer.elm.addEventListener('hwvVisibilityChanged', async () => {
      cuttingPlaneActor.send({
        type: 'set model bounding',
        modelBounding: await viewer.hwv.model.getModelBounding(true, false),
      });
    });

    viewer.elm.addEventListener('hwvCuttingSectionsLoaded', () => {
      cuttingPlaneActor.send({ type: 'update cutting sections' });
    });

    viewer.elm.addEventListener('hwvModelSwitched', () => {
      cuttingPlaneActor.send({ type: 'update cutting sections' });
    });

    viewer.elm.addEventListener('hwvAddCuttingSection', () => {
      cuttingPlaneActor.send({ type: 'update cutting sections' });
    });

    viewer.elm.addEventListener('hwvRemoveCuttingSection', () => {
      cuttingPlaneActor.send({ type: 'update cutting sections' });
    });

    viewer.elm.addEventListener('hwvCuttingPlaneDragEnd', (e) => {
      const event = e as CustomEvent<{
        hwv: WebViewer;
        cuttingSection: core.ICuttingSection;
        planeIndex: number;
      }>;
      const sectionIndex = [...Array(viewer.hwv.cuttingManager.getCuttingSectionCount())].findIndex(
        (_, index) =>
          viewer.hwv.cuttingManager.getCuttingSection(index) === event.detail.cuttingSection,
      );
      cuttingPlaneActor.send({
        type: 'update single cutting plane',
        sectionIndex,
        planeIndex: event.detail.planeIndex,
      });
    });
  }, [viewerState.modelReady]);

  return (
    <div style={{ margin: '0 0.5rem 1rem 0.5rem' }} hidden={!uiState.cuttingPlaneShown}>
      <h3 style={{ margin: '0.25rem 0' }}>Cutting Planes</h3>
      {viewerState.modelReady &&
        cuttingPlaneState.sections.map((_, i) => (
          <CuttingSection key={i} label={`Section ${i + 1}`} sectionIndex={i} />
        ))}
    </div>
  );
}
