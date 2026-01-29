import { consume } from '@lit/context';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@ts3d-hoops/ui-kit';

import { componentBaseStyle } from '@ts3d-hoops/ui-kit';
import { IMeasurementService } from '../../services/measurement';
import WebViewerContextManager, {
  contextManagerContext,
  type WebViewerState,
  webViewerStateContext,
} from '../../context-manager';
import './hoops-tools-measurement-actions';
import './hoops-tools-measurement-item';
import { getService } from '../../services';

/**
 * A web component that displays and manages a group of measurement tools and measurements.
 *
 * This component provides:
 * - A measurement tools panel with action buttons
 * - A scrollable list of existing measurements
 *
 * @element hoops-tools-measurement-group
 *
 * @example
 * ```html
 * <hoops-tools-measurement-group></hoops-tools-measurement-group>
 * ```
 */
@customElement('hoops-tools-measurement-group')
export class HoopsToolsMeasurementGroupElement extends LitElement {
  static styles = [
    componentBaseStyle,
    css`
      :host {
        display: block;
      }

      .measurement-list {
        margin: 0.4rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        overflow-y: auto;
        border: 1px solid var(--hoops-foreground, #303030);
        border-radius: 0.25rem;
        scrollbar-width: thin;
        scrollbar-color: var(--hoops-neutral-foreground-20, #aaaaaa) transparent;
        background-color: var(--hoops-neutral-background-20, #fafafa);
        padding: 0.5rem;
      }

      .empty-state {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        opacity: 0.5;
        font-size: 0.875rem;
        font-weight: 500;
      }
    `,
  ];

  /**
   * Event handler for measurement updates.
   * Triggers a re-render of the component when measurements change.
   *
   * @returns {void}
   */
  handleMeasurementUpdate = (): void => this.requestUpdate();

  @consume({
    context: contextManagerContext,
    subscribe: true,
  })
  private contextManager?: WebViewerContextManager;

  private service!: IMeasurementService;

  connectedCallback(): void {
    super.connectedCallback();
    this.service = getService<IMeasurementService>('MeasurementService');
    this.service.addEventListener('hoops-measurement-updated', this.handleMeasurementUpdate);
  }

  @consume({ context: webViewerStateContext, subscribe: true })
  private webviewerState?: WebViewerState;

  /**
   * Lifecycle method called when the component is disconnected from the DOM.
   * Cleans up event listeners to prevent memory leaks.
   *
   * @override
   * @returns {void}
   */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.service.removeEventListener('hoops-measurement-updated', this.handleMeasurementUpdate);
  }

  /**
   * Handles measurement tool selection events.
   * Sets the active tool operator in the context manager when a measurement tool is selected.
   *
   * @param {MeasurementToolSelectedEvent} event - The measurement tool selection event
   * @returns {void}
   */
  handleMeasurementToolSelection(event: CustomEventMap['measurement-tool-selected']): void {
    if (!this.contextManager?.webViewer) {
      return;
    }
    const { operator } = event.detail;
    this.contextManager.activeToolOperator = operator;
  }

  /**
   * Handles measurement removal commands.
   * Removes the specified measurement from the measurement service.
   *
   * @param {MeasurementRemoveCommand} event - The measurement remove command event
   * @returns {void}
   */
  handleMeasurementRemoveCommand(event: CustomEventMap['hoops-measurement-remove-command']): void {
    const { measurement } = event.detail;
    this.service.removeMeasurement(measurement);
  }

  render() {
    const hasMeasurements = this.service.measurements.length > 0;
    return html`
      <hoops-tools-group label="Measurement">
        <hoops-tools-measurement-actions
          activeToolOperator=${this.webviewerState?.toolOperator}
          @measurement-tool-selected=${this.handleMeasurementToolSelection}
        ></hoops-tools-measurement-actions>
        <div class="measurement-list">
          ${hasMeasurements
            ? this.service.measurements.map(
                (m) =>
                  html`<hoops-tools-measurement-item
                    @hoops-measurement-remove-command=${this.handleMeasurementRemoveCommand}
                    .measurement=${m}
                  ></hoops-tools-measurement-item>`,
              )
            : html`<div class="empty-state">No measurements</div>`}
        </div>
      </hoops-tools-group>
    `;
  }
}

export default HoopsToolsMeasurementGroupElement;
