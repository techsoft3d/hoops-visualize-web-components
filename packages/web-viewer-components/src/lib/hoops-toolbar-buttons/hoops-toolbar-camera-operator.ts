import { consume } from '@lit/context';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';

import { icons } from '@ts3d-hoops/ui-kit';

import { OperatorId } from '@ts3d-hoops/web-viewer';
import WebViewerContextManager, {
  CameraOperatorPosition,
  contextManagerContext,
  webViewerStateContext,
  type WebViewerState,
} from '../context-manager';
import { getService } from '../services';
import { IFloorplanService } from '../services/floorplan';

const cameraOperatorIcons = new Map([
  [OperatorId.Navigate, { title: 'Orbit camera', icon: icons.orbit }],
  [OperatorId.Turntable, { title: 'Turntable', icon: icons.cameraTurntable }],
  [OperatorId.WalkMode, { title: 'Walk', icon: icons.walk }],
]);
@customElement('hoops-toolbar-camera-operator')
export class HoopsCameraOperatorButtonElement extends LitElement {
  static styles = [
    css`
      .dropdown-content {
        display: flex;
        flex-direction: row;
        padding: 0.2rem;
        gap: 0.2rem;
      }
    `,
  ];

  /**
   * Represents the position where the dropdown is located relative to the button.
   * Possible values are "bottom", "top", "right", or "left".
   * Default value is "right".
   */
  @property()
  dropDownPosition: 'bottom' | 'top' | 'right' | 'left' = 'right';

  @consume({ context: contextManagerContext })
  private contextManager?: WebViewerContextManager;

  @consume({ context: webViewerStateContext, subscribe: true })
  private webViewerState?: WebViewerState;

  private setCameraOp(cameraOp: OperatorId) {
    if (!this.contextManager || !this.contextManager.webViewer) {
      return;
    }

    this.contextManager.webViewer.view.operatorManager.set(cameraOp, CameraOperatorPosition);
    this.contextManager.refreshCameraOperator();

    if (cameraOp === OperatorId.WalkMode) {
      // Walk mode triggers activate floorplan on certain models
      const fpService = getService<IFloorplanService>('FloorplanService');
      fpService.reset();
    }
  }

  protected override render(): unknown {
    const currentCameraOperatorIcon =
      this.webViewerState && cameraOperatorIcons.has(this.webViewerState.topCameraOperator)
        ? cameraOperatorIcons.get(this.webViewerState.topCameraOperator)!
        : cameraOperatorIcons.get(OperatorId.Navigate);

    return html`<hoops-dropdown position=${this.dropDownPosition}>
      <hoops-icon-button size="sm" title="Camera operator - ${currentCameraOperatorIcon?.title}"
        >${currentCameraOperatorIcon?.icon}</hoops-icon-button
      >
      <div class="dropdown-content" slot="dropdown-popup">
        ${map(
          cameraOperatorIcons,
          (button) => html`
            <hoops-icon-button
              .color=${this.webViewerState?.topCameraOperator === button[0] ? 'accent' : 'default'}
              size="sm"
              title=${button[1].title}
              @click=${() => {
                this.setCameraOp(button[0]);
              }}
            >
              ${button[1].icon}
            </hoops-icon-button>
          `,
        )}
      </div>
    </hoops-dropdown>`;
  }
}
