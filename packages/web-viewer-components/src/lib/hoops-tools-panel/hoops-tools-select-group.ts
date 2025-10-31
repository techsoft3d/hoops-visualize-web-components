import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { consume } from '@lit/context';

import '@ts3d-hoops/ui-kit';
import WebViewerContextManager, {
  contextManagerContext,
  type WebViewerState,
  webViewerStateContext,
} from '../context-manager';
import { OperatorId } from '@ts3d-hoops/web-viewer';
import { icons } from '@ts3d-hoops/ui-kit';

import './hoops-tools-group';

@customElement('hoops-tools-select-group')
export class HoopsToolsSelectGroupElement extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .content {
      display: flex;
      gap: 0.5rem;
      padding: 0.5rem;
    }
  `;

  @consume({ context: contextManagerContext })
  private contextManager?: WebViewerContextManager;

  @consume({ context: webViewerStateContext, subscribe: true })
  private webViewerState?: WebViewerState;

  private setActiveTool(operator: OperatorId) {
    if (this.contextManager) {
      this.contextManager.activeToolOperator = operator;
    } else {
      console.error('Cannot set select tool: WebViewer not initialized');
    }
  }

  render() {
    return html`
      <hoops-tools-group label="Selection">
        <div class="content">
          <hoops-icon-button
            color=${this.webViewerState?.toolOperator === OperatorId.Select ? 'accent' : 'default'}
            @click=${() => {
              this.setActiveTool(OperatorId.Select);
            }}
            title="Select Parts"
          >
            ${icons.select}
          </hoops-icon-button>
          <hoops-icon-button
            color=${this.webViewerState?.toolOperator === OperatorId.AreaSelect
              ? 'accent'
              : 'default'}
            @click=${() => {
              this.setActiveTool(OperatorId.AreaSelect);
            }}
            title="Select Area"
          >
            ${icons.areaSelect}
          </hoops-icon-button>
        </div>
      </hoops-tools-group>
    `;
  }
}

export default HoopsToolsSelectGroupElement;
