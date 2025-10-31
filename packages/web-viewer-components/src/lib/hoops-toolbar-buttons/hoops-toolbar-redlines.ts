import { consume } from '@lit/context';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { OperatorId } from '@ts3d-hoops/web-viewer';
import WebViewerContextManager, {
  contextManagerContext,
  webViewerStateContext,
  type WebViewerState,
} from '../context-manager';
import { redlineCircle, redlineFreehand, redlineRectangle, redlineNote } from '@ts3d-hoops/ui-kit/icons';

const redlineButtons = new Map([
  [OperatorId.RedlineCircle, { title: 'Circle', icon: redlineCircle }],
  [OperatorId.RedlineText, { title: 'Text', icon: redlineNote }],
  [OperatorId.RedlineRectangle, { title: 'Rectangle', icon: redlineRectangle }],
  [OperatorId.RedlinePolyline, { title: 'Free hand', icon: redlineFreehand }],
]);

@customElement('hoops-toolbar-redlines')
export class HoopsRedlinesButtonElement extends LitElement {
  static styles = [
    css`
      .dropdown-content {
        display: flex;
        flex-direction: column;
        width: max-content;
        padding: 0.2rem 0;
      }

      .active {
        background-color: var(--hoops-neutral-background-hover, #303030cc);
        border-radius: 50%;
      }
    `,
  ];

  @consume({ context: contextManagerContext })
  private contextManager?: WebViewerContextManager;

  @consume({ context: webViewerStateContext, subscribe: true })
  private webViewerState?: WebViewerState;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('keydown', this.handleKeyDown);
  }
  disconnectedCallback() {
    window.removeEventListener('keydown', this.handleKeyDown);
    super.disconnectedCallback();
  }
  private handleKeyDown = (event: KeyboardEvent) => {
    // End redline operation when escale is pressed
    if (event.key === 'Escape') {
      this.setRedlineMode(OperatorId.Select);
    }
  };

  private setRedlineMode(redlineOperatorId: OperatorId) {
    if (this.contextManager) {
      this.contextManager.setRedlineOperator(redlineOperatorId);
    } else {
      console.error('Cannot set redline mode: WebViewer not initialized');
    }
  }

  protected override render(): unknown {
    let redlineMode =
      this.webViewerState && redlineButtons.has(this.webViewerState.toolOperator)
        ? this.webViewerState.toolOperator
        : OperatorId.RedlineText;
    if (!redlineButtons.has(redlineMode)) {
      redlineMode = OperatorId.RedlineText;
    }
    const currentIcon = redlineButtons.get(redlineMode)?.icon;
    const iconButtonClasses = [this.contextManager?.isRedlineOperatorActive() ? 'active' : ''].join(
      ' ',
    );

    return html`<hoops-dropdown position="right">
      <hoops-icon-button class="${iconButtonClasses}" size="sm" title="Redline markups"
        >${currentIcon}</hoops-icon-button
      >
      <div class="dropdown-content" slot="dropdown-popup">
        ${map(
          redlineButtons,
          (button) => html`
            <hoops-button
              iconSize="sm"
              @click=${() => {
                this.setRedlineMode(button[0]);
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

export default HoopsRedlinesButtonElement;
