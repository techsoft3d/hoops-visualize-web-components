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

import '../hoops-markup-tree';
import { getService, IRedlineService } from '../services';

@customElement('hoops-tools-redline-group')
export class HoopsToolsRedlineGroupElement extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .content {
      padding: 0.5rem;
    }

    .tools {
      display: flex;
      gap: 0.5rem;
      padding: 0.5rem;
    }

    .markups {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.5rem;

      border-radius: 0.25rem;
      border: 1px solid var(--hoops-foreground);
      background-color: var(--hoops-neutral-background-20);
      max-height: 10rem;
      overflow-y: auto;
    }

    .markup {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      cursor: pointer;
      border-bottom: 1px dashed var(--hoops-foreground);
    }

    .markup.selected {
      background-color: color-mix(
        in srgb,
        var(--hoops-neutral-background-20),
        var(--hoops-accent-foreground-active) 10%
      );
    }

    .markupIcon {
      width: 1.25rem;
      height: 1.25rem;
    }

    .markupText {
      flex-grow: 1;
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: calc(100% - 5rem);
    }

    .markup:hover,
    .markup:hover .markupIcon {
      color: var(--hoops-accent-foreground);
      stroke: var(--hoops-accent-foreground);
      fill: var(--hoops-accent-foreground);
      background-color: color-mix(
        in srgb,
        var(--hoops-neutral-background-20),
        var(--hoops-foreground) 5%
      );
    }

    .remove {
      justify-self: flex-end;
    }

    .markup.selected .markupIcon,
    .markup.selected .remove svg {
      color: var(--hoops-accent-foreground);
      stroke: var(--hoops-accent-foreground);
      fill: var(--hoops-accent-foreground);
    }

    .placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--hoops-foreground);
      opacity: 0.5;
      font-size: 0.875rem;
      font-weight: 500;
    }

    hoops-markup-tree {
      overflow-y: auto;
      overflow-x: hidden;
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
      console.error('Cannot set redline tool: WebViewer not initialized');
    }
  }

  private service?: IRedlineService;

  onMarkupsUpdated = () => {
    this.requestUpdate();
  };

  firstUpdated() {
    if (!this.contextManager) {
      console.error('Cannot initialize redline tools: WebViewer not initialized');
      return;
    }

    this.service = getService<IRedlineService>('RedlineService');
    if (!this.service) {
      return;
    }

    this.service.addEventListener('hoops-redline-created', this.onMarkupsUpdated);
    this.service.addEventListener('hoops-redline-deleted', this.onMarkupsUpdated);
    this.service.addEventListener('hoops-redline-view-deleted', this.onMarkupsUpdated);
    this.service.addEventListener('hoops-markup-manager-reset', this.onMarkupsUpdated);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (!this.service) {
      return;
    }

    this.service.removeEventListener('hoops-redline-created', this.onMarkupsUpdated);
    this.service.removeEventListener('hoops-redline-deleted', this.onMarkupsUpdated);
    this.service.removeEventListener('hoops-redline-view-deleted', this.onMarkupsUpdated);
    this.service.removeEventListener('hoops-markup-manager-reset', this.onMarkupsUpdated);
  }

  render() {
    return html`
      <hoops-tools-group label="Redline">
        <div class="content">
          <div class="tools">
            <hoops-icon-button
              color=${this.webViewerState?.toolOperator === OperatorId.RedlineCircle
                ? 'accent'
                : 'default'}
              @click=${() => {
                this.setActiveTool(OperatorId.RedlineCircle);
              }}
              title="Redline Circle"
            >
              ${icons.redlineCircle}
            </hoops-icon-button>
            <hoops-icon-button
              color=${this.webViewerState?.toolOperator === OperatorId.RedlineText
                ? 'accent'
                : 'default'}
              @click=${() => {
                this.setActiveTool(OperatorId.RedlineText);
              }}
              title="Redline Note"
            >
              ${icons.redlineNote}
            </hoops-icon-button>
            <hoops-icon-button
              color=${this.webViewerState?.toolOperator === OperatorId.RedlineRectangle
                ? 'accent'
                : 'default'}
              @click=${() => {
                this.setActiveTool(OperatorId.RedlineRectangle);
              }}
              title="Redline Rectangle"
            >
              ${icons.redlineRectangle}
            </hoops-icon-button>
            <hoops-icon-button
              color=${this.webViewerState?.toolOperator === OperatorId.RedlinePolyline
                ? 'accent'
                : 'default'}
              @click=${() => {
                this.setActiveTool(OperatorId.RedlinePolyline);
              }}
              title="Redline Freehand"
            >
              ${icons.redlineFreehand}
            </hoops-icon-button>
          </div>
          <div class="markups">
            ${!this.service?.getRedlineViewKeys().length
              ? html`<div class="placeholder">No Redlines</div>`
              : html`<hoops-markup-tree .redlineService=${this.service}></hoops-markup-tree>`}
          </div>
        </div>
      </hoops-tools-group>
    `;
  }
}

export default HoopsToolsRedlineGroupElement;
