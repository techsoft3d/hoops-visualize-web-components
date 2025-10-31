import { HoopsIcon, HoopsIconButton, HoopsSeparator, HoopsToolbar } from '@ts3d-hoops/ui-kit-react';
import {
  HoopsCameraButton,
  HoopsCameraOperatorButton,
  HoopsDrawmodeButton,
  HoopsHomeButton,
  HoopsLayersButton,
  HoopsModelTreeButton,
  HoopsCadConfigurationButton,
  HoopsPropertiesButton,
  HoopsSnapshotButton,
  HoopsViewsButton,
  HoopsTypesButton,
  HoopsExplodeButton,
  HoopsToolsButton,
  HoopsSettingsButton,
} from '@ts3d-hoops/web-viewer-components-react';
import { ReactNode, useEffect, useRef } from 'react';
import { useSelector } from '@xstate/react';
import { uiActor } from '../statemachines/uiMachine';
import { viewerActor } from '../statemachines/viewerMachine';
import { WebViewer } from '@ts3d-hoops/web-viewer';
import { getRegisteredViewer } from '../utils/registerViewer';

type Props = {
  children?: ReactNode;
};

export default function Toolbar({ children }: Props) {
  const uiState = useSelector(uiActor, (snapshot) => snapshot.context);
  const viewerState = useSelector(viewerActor, (snapshot) => snapshot.context);

  const hwvRef = useRef<WebViewer | null>(null);
  useEffect(() => {
    if (hwvRef.current) {
      return;
    }
    const viewer = getRegisteredViewer('');
    if (!viewer) {
      console.error('Viewer not found');
      return;
    }

    hwvRef.current = viewer.hwv;
  }, [viewerState.viewerReady]);

  return (
    <div slot="toolbar-left" data-testid="toolbar-left">
      <HoopsToolbar data-testid="toolbar">
        <HoopsModelTreeButton
          data-testid="modeltree-button"
          color={uiState.modelTreeShown ? 'accent' : 'default'}
          onClick={() =>
            uiActor.send({
              type: 'setModelTreeShown',
              shown: !uiState.modelTreeShown,
            })
          }
        />
        {uiState.ifcRelationshipEnabled && (
          <HoopsIconButton
            data-testid="ifc-relationships-button"
            color={uiState.ifcRelationshipViewShown ? 'accent' : 'default'}
            title="Toggle IFC relationships"
            onClick={() => {
              uiActor.send({
                type: 'setIfcRelationshipView',
                enabled: uiState.ifcRelationshipEnabled,
                shown: !uiState.ifcRelationshipViewShown,
              });
            }}
          >
            <HoopsIcon icon="relationshipIcon" style={{ width: '65%' }}></HoopsIcon>
          </HoopsIconButton>
        )}
        <HoopsLayersButton
          color={uiState.layerTreeShown ? 'accent' : 'default'}
          onClick={() =>
            uiActor.send({
              type: 'setLayerTreeShown',
              shown: !uiState.layerTreeShown,
            })
          }
        />
        <HoopsViewsButton
          color={uiState.viewTreeShown ? 'accent' : 'default'}
          onClick={() =>
            uiActor.send({
              type: 'setViewTreeShown',
              shown: !uiState.viewTreeShown,
            })
          }
        />
        <HoopsTypesButton
          color={uiState.typesTreeShown ? 'accent' : 'default'}
          onClick={() =>
            uiActor.send({
              type: 'setTypesTreeShown',
              shown: !uiState.typesTreeShown,
            })
          }
        />
        <HoopsCadConfigurationButton
          color={uiState.cadConfigurationListShown ? 'accent' : 'default'}
          onClick={() =>
            uiActor.send({
              type: 'setCadConfigurationListShown',
              shown: !uiState.cadConfigurationListShown,
            })
          }
        />
        <HoopsPropertiesButton
          color={uiState.propertyPanelShown ? 'accent' : 'default'}
          onClick={() =>
            uiActor.send({
              type: 'setPropertyPanelShown',
              shown: !uiState.propertyPanelShown,
            })
          }
        />
        <HoopsSeparator direction="horizontal" />
        <HoopsHomeButton />
        <HoopsCameraButton />
        <HoopsSnapshotButton onClick={() => viewerActor.send({ type: 'takeSnapshot' })} />
        <HoopsSeparator direction="horizontal" />
        <HoopsDrawmodeButton />
        <HoopsCameraOperatorButton />
        <HoopsIconButton
          onClick={() => {
            uiActor.send({ type: 'setCuttingPlaneShown', shown: !uiState.cuttingPlaneShown });
          }}
          title="Cutting Plane Menu"
        >
          <HoopsIcon icon="cuttingPlaneZ" style={{ width: '90%' }}></HoopsIcon>
        </HoopsIconButton>
        <HoopsSeparator direction="horizontal" />
        <HoopsExplodeButton webViewer={hwvRef.current} />
        <HoopsToolsButton
          color={uiState.toolsPanelShown ? 'accent' : 'default'}
          onClick={() =>
            uiActor.send({
              type: 'setToolsPanelShown',
              shown: !uiState.toolsPanelShown,
            })
          }
        />
        <div style={{ flexGrow: 1 }}>{children}</div>
        <HoopsSettingsButton
          color={uiState.settingsPanelShown ? 'accent' : 'default'}
          onClick={() =>
            uiActor.send({
              type: 'setSettingsPanelShown',
              shown: !uiState.settingsPanelShown,
            })
          }
        />
      </HoopsToolbar>
    </div>
  );
}
