import { consume, ContextConsumer } from '@lit/context';
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { icons } from '@ts3d-hoops/ui-kit';
import '@ts3d-hoops/ui-kit/icon-button';
import '@ts3d-hoops/ui-kit/button';
import '@ts3d-hoops/ui-kit/common';

import {
  CallbackMap,
  DefaultTransitionDuration,
  Event,
  Point3,
  ViewOrientation,
  WebViewer,
} from '@ts3d-hoops/web-viewer';
import WebViewerContextManager, {
  contextManagerContext,
  webViewerContext,
} from '../context-manager';
import { getService, ICameraService, Projection } from '../services';

@customElement('hoops-toolbar-camera')
export class HoopsCameraButtonElement extends LitElement {
  static styles = [
    css`
      .dropdown-content {
        display: flex;
        flex-direction: column;
        width: max-content;
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

  @state()
  private faceSelected = false;

  @consume({ context: contextManagerContext })
  private contextManager?: WebViewerContextManager;

  private cameraService!: ICameraService;

  private webViewer?: WebViewer = undefined;
  // @ts-expect-error ContextConsumer callback is used for WebViewer context updates
  private webViewerContext = new ContextConsumer(this, {
    context: webViewerContext,
    callback: (value) => {
      this.webViewerChanged(value);
    },
    subscribe: true,
  });
  private webViewerCallbacks?: CallbackMap = undefined;

  private webViewerChanged(webViewer: WebViewer) {
    if (this.webViewer && this.webViewerCallbacks) {
      this.webViewer.unsetCallbacks(this.webViewerCallbacks);
    }
    this.webViewer = webViewer;
    if (this.webViewer) {
      const selectionItem = this.webViewer.selectionManager.getLast();
      this.faceSelected = selectionItem !== null && selectionItem.isFaceSelection();

      this.webViewerCallbacks = {
        selectionArray: (events: Event.NodeSelectionEvent[]) => {
          if (events.length > 0) {
            const selection = events[events.length - 1];
            const selectionItem = selection.getSelection();
            this.faceSelected = selectionItem !== null && selectionItem.isFaceSelection();
          } else {
            this.faceSelected = false;
          }
        },
      };
      this.webViewer.setCallbacks(this.webViewerCallbacks);
    }
  }

  private orientToFace() {
    if (!this.webViewer || !this.faceSelected) {
      return;
    }

    const selectionItem = this.webViewer.selectionManager.getLast();

    if (!selectionItem || !selectionItem.isFaceSelection()) {
      return;
    }

    const view = this.webViewer.view;

    const normal = selectionItem.getFaceEntity().getNormal();
    const position = selectionItem.getPosition();

    const camera = view.getCamera();

    let up = Point3.cross(normal, new Point3(0, 1, 0));
    if (up.length() < 0.001) {
      up = Point3.cross(normal, new Point3(1, 0, 0));
    }

    const zoomDelta = camera.getPosition().subtract(camera.getTarget()).length();

    camera.setTarget(position);
    camera.setPosition(Point3.add(position, Point3.scale(normal, zoomDelta)));
    camera.setUp(up);

    view.fitBounding(
      selectionItem.getFaceEntity().getBounding(),
      DefaultTransitionDuration,
      camera,
    );
  }

  private setProjection(projection: Projection) {
    this.cameraService.setProjectionMode(projection);
  }

  private setOrientation(viewOrientation: ViewOrientation) {
    if (this.contextManager && this.contextManager.webViewer) {
      this.contextManager.webViewer.view.setViewOrientation(viewOrientation);
    }
  }

  handleServiceUpdate = (): void => this.requestUpdate();

  connectedCallback(): void {
    super.connectedCallback();
    this.cameraService = getService<ICameraService>('CameraService');
    this.cameraService.addEventListener('hoops-projection-mode-changed', this.handleServiceUpdate);
    this.cameraService.addEventListener('hoops-camera-service-reset', this.handleServiceUpdate);
  }

  disconnectedCallback(): void {
    if (this.cameraService) {
      this.cameraService.removeEventListener(
        'hoops-projection-mode-changed',
        this.handleServiceUpdate,
      );
      this.cameraService.removeEventListener(
        'hoops-camera-service-reset',
        this.handleServiceUpdate,
      );
    }
  }

  protected override render(): unknown {
    return html`<hoops-dropdown position=${this.dropDownPosition}>
      <hoops-icon-button size="sm" title="Camera">${icons.camera}</hoops-icon-button>
      <div class="dropdown-content" slot="dropdown-popup">
        <hoops-button
          .color=${this.cameraService.getProjectionMode() === 'Orthographic' ? 'accent' : 'default'}
          title="Orthographic projection"
          iconSize="sm"
          @click=${() => {
            this.setProjection('Orthographic');
          }}
        >
          <span slot="icon">${icons.orthoView}</span>
          Orthographic Projection
        </hoops-button>
        <hoops-button
          .color=${this.cameraService.getProjectionMode() === 'Perspective' ? 'accent' : 'default'}
          iconSize="sm"
          title="Perspective projection"
          @click=${() => {
            this.setProjection('Perspective');
          }}
        >
          <span slot="icon">${icons.perspectiveView}</span>
          Perspective Projection
        </hoops-button>

        <hoops-separator direction="horizontal"></hoops-separator>

        <hoops-button
          title="Iso view"
          iconSize="sm"
          @click=${() => {
            this.setOrientation(ViewOrientation.Iso);
          }}
        >
          <span slot="icon">${icons.viewIso}</span>
          Iso View
        </hoops-button>

        <hoops-button
          iconSize="sm"
          title="Top view"
          @click=${() => {
            this.setOrientation(ViewOrientation.Top);
          }}
        >
          <span slot="icon">${icons.cubeTop}</span>
          Top View
        </hoops-button>
        <hoops-button
          iconSize="sm"
          title="Bottom view"
          @click=${() => {
            this.setOrientation(ViewOrientation.Bottom);
          }}
        >
          <span slot="icon">${icons.cubeBottom}</span>
          Bottom View
        </hoops-button>
        <hoops-button
          iconSize="sm"
          title="Left view"
          @click=${() => {
            this.setOrientation(ViewOrientation.Left);
          }}
        >
          <span slot="icon">${icons.cubeLeft}</span>
          Left View
        </hoops-button>
        <hoops-button
          iconSize="sm"
          title="Right view"
          @click=${() => {
            this.setOrientation(ViewOrientation.Right);
          }}
        >
          <span slot="icon">${icons.cubeRight}</span>
          Right View
        </hoops-button>
        <hoops-button
          iconSize="sm"
          title="Front view"
          @click=${() => {
            this.setOrientation(ViewOrientation.Front);
          }}
        >
          <span slot="icon">${icons.cubeFront}</span>
          Front View
        </hoops-button>
        <hoops-button
          iconSize="sm"
          title="Back view"
          @click=${() => {
            this.setOrientation(ViewOrientation.Back);
          }}
        >
          <span slot="icon">${icons.cubeBack}</span>
          Back View
        </hoops-button>

        <hoops-button
          title="Orient camera to selected face"
          iconSize="sm"
          ?disabled=${!this.faceSelected}
          @click=${() => {
            this.orientToFace();
          }}
        >
          <span slot="icon">${icons.viewFace}</span>
          Orient to Selected Face
        </hoops-button>
      </div>
    </hoops-dropdown>`;
  }
}

export default HoopsCameraButtonElement;
