import { consume } from '@lit/context';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';

import {
  cubeHiddenLine,
  cubeWireframe,
  wireframeShaded,
  noWireframeShaded,
  toonShader,
  goochShader,
  xRayShader,
} from '@ts3d-hoops/ui-kit/icons';
import { DrawMode } from '@ts3d-hoops/web-viewer';
import WebViewerContextManager, {
  contextManagerContext,
  webViewerStateContext,
  type WebViewerState,
} from '../context-manager';

const drawModeButtons = new Map([
  [DrawMode.Wireframe, { title: 'Wireframe', icon: cubeWireframe }],
  [DrawMode.Shaded, { title: 'Shaded', icon: noWireframeShaded }],
  [DrawMode.WireframeOnShaded, { title: 'Wireframe On Shaded', icon: wireframeShaded }],
  [DrawMode.HiddenLine, { title: 'Hidden Line', icon: cubeHiddenLine }],
  [DrawMode.XRay, { title: 'XRay', icon: xRayShader }],
  [DrawMode.Gooch, { title: 'Gooch', icon: goochShader }],
  [DrawMode.Toon, { title: 'Toon', icon: toonShader }],
]);
@customElement('hoops-toolbar-drawmode')
export class HoopsDrawmodeButtonElement extends LitElement {
  static styles = [
    css`
      .dropdown-content {
        display: flex;
        flex-direction: column;
        width: max-content;
        padding: 0.2rem 0;
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

  private setDrawMode(drawmode: DrawMode) {
    if (this.contextManager) {
      this.contextManager.setDrawMode(drawmode);
    }
  }

  protected override render(): unknown {
    const currentDrawMode =
      this.webViewerState && drawModeButtons.has(this.webViewerState.drawMode)
        ? this.webViewerState.drawMode
        : DrawMode.WireframeOnShaded;

    const currentIcon = drawModeButtons.get(currentDrawMode)!;

    return html`<hoops-dropdown position=${this.dropDownPosition}>
      <hoops-icon-button size="sm" title="Draw mode - ${currentIcon.title}"
        >${currentIcon.icon}</hoops-icon-button
      >
      <div class="dropdown-content" slot="dropdown-popup">
        ${map(
          drawModeButtons,
          (button) => html`
            <hoops-button
              .color=${this.webViewerState?.drawMode === button[0] ? 'accent' : 'default'}
              iconSize="sm"
              @click=${() => {
                this.setDrawMode(button[0]);
              }}
              title=${button[1].title}
            >
              <span slot="icon">${button[1].icon}</span>
              ${button[1].title}
            </hoops-button>
          `,
        )}
      </div>
    </hoops-dropdown>`;
  }
}

export default HoopsDrawmodeButtonElement;
