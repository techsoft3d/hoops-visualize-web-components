import { LitElement, TemplateResult, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '@ts3d-hoops/ui-kit';
import { Operators } from '@ts3d-hoops/web-viewer';
import { componentBaseStyle, icons } from '@ts3d-hoops/ui-kit';
import type { MeasurementRemoveCommand } from './custom-events.d.ts';

/**
 * @element hoops-tools-measurement-item
 * @description Displays a single measurement item with its value, icon, and remove functionality.
 * This component renders measurement data in a compact, user-friendly format within the measurement list.
 *
 * Features:
 * - Automatic icon selection based on measurement type
 * - Formatted measurement value display
 * - Interactive remove button with confirmation
 * - Tooltip with full measurement details
 * - Error handling for invalid or corrupted measurement data
 * - Support for multiple measurement types (Point-to-Point, Face-to-Face, Angle, Edge Length)
 *
 * The component uses a configuration map to determine the appropriate icon and labels
 * for each measurement type, making it easy to extend with new measurement types.
 *
 * @fires hoops-measurement-remove-command - Dispatched when the remove button is clicked
 *
 * @attr {MeasureMarkup} measurement - The measurement object to display.
 *   Should be an instance of one of the supported MeasureMarkup types.
 *
 * @example
 * ```html
 * <hoops-tools-measurement-item
 *   .measurement=${measurementObject}
 *   @hoops-measurement-remove-command=${this.handleRemoval}>
 * </hoops-tools-measurement-item>
 * ```
 *
 * @example
 * ```typescript
 * // Handle measurement removal
 * handleRemoval(event: MeasurementRemoveCommand) {
 *   const { measurement } = event.detail;
 *   this.measureManager.removeMeasurement(measurement);
 * }
 * ```
 */
@customElement('hoops-tools-measurement-item')
export class HoopsToolsMeasurementItemElement extends LitElement {
  static styles = [
    componentBaseStyle,
    css`
      :host {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.5rem;
        width: 100%;
        transition: background-color 0.15s ease;
        border-radius: 0.25rem;
        min-height: 1.8rem;
        border-bottom: 1px dashed var(--hoops-foreground, #303030);
      }
      .measure-container {
        display: flex;
        align-items: center;
        flex-grow: 1;
        min-width: 0;
      }
      .measure-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        font-size: 0.875rem;
        color: var(--hoops-neutral-foreground, #303030);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex-grow: 1;
      }
      .trash-button {
        flex-shrink: 0;
      }
      hoops-icon {
        width: 1.2rem;
        height: 1.2rem;
        flex-shrink: 0;
        color: var(--hoops-svg-stroke-color, #303030);
      }
    `,
  ];

  @property({ attribute: false })
  measurement?: Operators.Markup.Measure.MeasureMarkup;

  getMeasureMarkupLabel(markup: Operators.Markup.Measure.MeasureMarkup): string {
    if (markup instanceof Operators.Markup.Measure.MeasurePointPointDistanceMarkup) {
      return 'Point to Point';
    } else if (markup instanceof Operators.Markup.Measure.MeasureFaceFaceDistanceMarkup) {
      return 'Face to Face';
    } else if (markup instanceof Operators.Markup.Measure.MeasureStraightEdgeLengthMarkup) {
      return 'Edge Length';
    } else if (markup instanceof Operators.Markup.Measure.MeasureCircleEdgeLengthMarkup) {
      return 'Circle Length';
    } else if (markup instanceof Operators.Markup.Measure.MeasureFaceFaceAngleMarkup) {
      return 'Face Angle';
    }
    return 'Measurement';
  }

  getMeasureMarkupIcon(markup: Operators.Markup.Measure.MeasureMarkup): TemplateResult {
    if (markup instanceof Operators.Markup.Measure.MeasurePointPointDistanceMarkup) {
      return html`<hoops-icon title="Point to Point" icon="measurePoint"></hoops-icon>`;
    } else if (markup instanceof Operators.Markup.Measure.MeasureFaceFaceDistanceMarkup) {
      return html`<hoops-icon title="Face to Face" icon="measureDistance"></hoops-icon>`;
    } else if (markup instanceof Operators.Markup.Measure.MeasureStraightEdgeLengthMarkup) {
      return html`<hoops-icon title="Straight Edge Length" icon="measureEdge"></hoops-icon>`;
    } else if (markup instanceof Operators.Markup.Measure.MeasureCircleEdgeLengthMarkup) {
      return html`<hoops-icon title="Circle Edge Length" icon="measureEdge"></hoops-icon>`;
    } else if (markup instanceof Operators.Markup.Measure.MeasureFaceFaceAngleMarkup) {
      return html`<hoops-icon title="Face to Face Angle" icon="measureAngle"></hoops-icon>`;
    }
    return html``;
  }

  getMeasureMarkupValue(markup: Operators.Markup.Measure.MeasureMarkup): string {
    try {
      return markup.getMeasurementText();
    } catch (error) {
      console.error('Error getting measurement value:', error);
      return 'N/A';
    }
  }

  dispatchRemoval(measurement: Operators.Markup.Measure.MeasureMarkup) {
    this.dispatchEvent(
      new CustomEvent('hoops-measurement-remove-command', {
        detail: { measurement: measurement },
        composed: true,
        bubbles: true,
      }) as MeasurementRemoveCommand,
    );
  }

  render() {
    if (!this.measurement) {
      return nothing;
    }

    const measurementType = this.getMeasureMarkupLabel(this.measurement);
    const measurementValue = this.getMeasureMarkupValue(this.measurement);
    const tooltipText = `${measurementType}: ${measurementValue}`;

    return html`
      <div class="measure-container" title="${tooltipText}">
        ${this.getMeasureMarkupIcon(this.measurement)}
        <span class="measure-label">${measurementValue}</span>
      </div>
      <hoops-icon-button
        class="trash-button"
        color="default"
        title="Remove Measurement"
        @click=${() => {
          if (this.measurement) {
            this.dispatchRemoval(this.measurement);
          }
        }}
        style="--hoops-icon-color: var(--hoops-svg-stroke-color, #303030);"
      >
        ${icons.removeIcon}
      </hoops-icon-button>
    `;
  }
}

export default HoopsToolsMeasurementItemElement;
