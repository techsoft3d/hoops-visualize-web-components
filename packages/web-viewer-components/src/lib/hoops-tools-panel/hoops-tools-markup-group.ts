import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { consume } from '@lit/context';

import '@ts3d-hoops/ui-kit';
import WebViewerContextManager, {
  contextManagerContext,
  webViewerStateContext,
  type WebViewerState,
} from '../context-manager';
import { OperatorId } from '@ts3d-hoops/web-viewer';
import { icons } from '@ts3d-hoops/ui-kit';
import { getService } from '../services';
import { formatNoteTextIcon, INoteTextService } from '../services/notetext';

/**
 * Renders markup note tools and the note text list in the tools panel.
 *
 * @element hoops-tools-markup-group
 *
 * @service {INoteTextService} NoteTextService - Service used to manage note text markups
 * @service {WebViewerContextManager} ContextManager - Context manager used to switch active operator
 *
 * @cssprop --hoops-foreground - Foreground color used for list rows and borders
 * @cssprop --hoops-accent-foreground - Accent color used for selected and hover states
 *
 * @example
 * ```html
 * <hoops-tools-markup-group></hoops-tools-markup-group>
 * ```
 *
 * @since 2025.7.0
 */
@customElement('hoops-tools-markup-group')
export class HoopsToolsGroupMarkupElement extends LitElement {
  /** @internal */
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
      border: 1px solid var(--hoops-foreground, #303030);
      background-color: var(--hoops-neutral-background-20, #fafafa);
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
      border-bottom: 1px dashed var(--hoops-foreground, #303030);
    }

    .markup.selected {
      background-color: color-mix(
        in srgb,
        var(--hoops-neutral-background-20, #fafafa),
        var(--hoops-accent-foreground-active, var(--blue, #0078d4)) 10%
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
      color: var(--hoops-accent-foreground, var(--blue, #0078d4));
      stroke: var(--hoops-accent-foreground, var(--blue, #0078d4));
      fill: var(--hoops-accent-foreground, var(--blue, #0078d4));
      background-color: color-mix(
        in srgb,
        var(--hoops-neutral-background-20, #fafafa),
        var(--hoops-foreground, #303030) 5%
      );
    }

    .remove {
      justify-self: flex-end;
    }

    .markup.selected .markupIcon,
    .markup.selected .remove svg {
      color: var(--hoops-accent-foreground, var(--blue, #0078d4));
      stroke: var(--hoops-accent-foreground, var(--blue, #0078d4));
      fill: var(--hoops-accent-foreground, var(--blue, #0078d4));
    }

    .placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--hoops-foreground, #303030);
      opacity: 0.5;
      font-size: 0.875rem;
      font-weight: 500;
    }
  `;

  @consume({ context: contextManagerContext })
  private contextManager?: WebViewerContextManager;

  @consume({ context: webViewerStateContext, subscribe: true })
  private webViewerState?: WebViewerState;

  private service?: INoteTextService;

  private setActiveTool(operator: OperatorId) {
    if (!this.contextManager) {
      console.error('Cannot set markup tool: WebViewer not initialized');
      return;
    }

    this.contextManager.activeToolOperator = operator;
  }

  onMarkupsUpdated = () => {
    this.requestUpdate();
  };

  /**
   * @internal
   */
  firstUpdated() {
    if (!this.contextManager) {
      console.error('Cannot initialize redline tools: WebViewer not initialized');
      return;
    }

    this.service = getService<INoteTextService>('NoteTextService');
    if (!this.service) {
      return;
    }

    this.service.addEventListener('hoops-note-text-created', this.onMarkupsUpdated);
    this.service.addEventListener('hoops-note-text-deleted', this.onMarkupsUpdated);
    this.service.addEventListener('hoops-note-text-updated', this.onMarkupsUpdated);
    this.service.addEventListener('hoops-note-text-hidden', this.onMarkupsUpdated);
    this.service.addEventListener('hoops-note-text-shown', this.onMarkupsUpdated);
    this.service.addEventListener('hoops-note-text-manager-reset', this.onMarkupsUpdated);
  }

  /**
   * @internal
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    if (!this.service) {
      return;
    }

    this.service.removeEventListener('hoops-note-text-created', this.onMarkupsUpdated);
    this.service.removeEventListener('hoops-note-text-deleted', this.onMarkupsUpdated);
    this.service.removeEventListener('hoops-note-text-updated', this.onMarkupsUpdated);
    this.service.removeEventListener('hoops-note-text-hidden', this.onMarkupsUpdated);
    this.service.removeEventListener('hoops-note-text-shown', this.onMarkupsUpdated);
    this.service.removeEventListener('hoops-note-text-manager-reset', this.onMarkupsUpdated);
  }

  private selectMarkup(id: string) {
    if (!this.service) {
      console.error('Cannot select markup: NoteTextService not initialized');
      return;
    }

    this.service.setActiveNoteText(id);
  }

  /** @internal */
  protected override render(): unknown {
    const service = getService<INoteTextService>('NoteTextService');
    const markups = service?.getNoteTexts() || [];
    const selectedMarkupId = service?.getActiveNoteTextKey();

    return html`
      <hoops-tools-group label="Markup">
        <div class="content">
          <div class="tools">
            <hoops-icon-button
              color=${this.webViewerState?.toolOperator === OperatorId.Note ? 'accent' : 'default'}
              @click=${() => {
                this.setActiveTool(OperatorId.Note);
              }}
              title="Note"
            >
              ${icons.note}
            </hoops-icon-button>
          </div>
          <div class="markups">
            ${markups.length
              ? markups.map(
                  (markup) => html`
                    <div
                      class=${['markup', markup.id === selectedMarkupId ? 'selected' : ''].join(
                        ' ',
                      )}
                      @click=${() => this.selectMarkup(markup.id)}
                    >
                      <div class="markupIcon">
                        <hoops-icon icon=${formatNoteTextIcon(markup.type)}></hoops-icon>
                      </div>
                      <div class="markupText">
                        ${markup.text || html`<div class="placeholder">No text</div>`}
                      </div>
                      <hoops-icon-button
                        class="remove"
                        @click=${(event: MouseEvent) => {
                          event.stopPropagation();
                          service?.removeNoteText(markup);
                        }}
                        >${icons.removeIcon}</hoops-icon-button
                      >
                    </div>
                  `,
                )
              : html`<div class="placeholder">No markups</div>`}
          </div>
        </div>
      </hoops-tools-group>
    `;
  }
}

export default HoopsToolsGroupMarkupElement;
