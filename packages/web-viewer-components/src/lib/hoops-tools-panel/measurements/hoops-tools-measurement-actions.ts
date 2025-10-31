import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '@ts3d-hoops/ui-kit';
import { componentBaseStyle, icons } from '@ts3d-hoops/ui-kit';
import { OperatorId } from '@ts3d-hoops/web-viewer';

/**
 * @element hoops-tools-measurement-actions
 * @description Provides measurement tool selection buttons for the Hoops Tools Panel.
 * This component displays interactive buttons for different measurement tools including
 * point-to-point distance, face-to-face distance, face angle, and edge length measurements.
 *
 * It is a dumb component that dispatches operator IDs on selection, with no knowledge of the webviewer.
 * The component highlights the currently active measurement tool based on the activeToolOperator property.
 *
 * @fires measurement-tool-selected - Dispatched when a measurement tool button is clicked
 *
 * @attr {OperatorId} activeToolOperator - The currently active measurement tool operator.
 *   When set, the corresponding button will be highlighted with accent color.
 *
 * @example
 * ```html
 * <hoops-tools-measurement-actions
 *   .activeToolOperator=${OperatorId.MeasurePointPointDistance}
 *   @measurement-tool-selected=${this.handleToolSelection}>
 * </hoops-tools-measurement-actions>
 * ```
 *
 * @example
 * ```typescript
 * // Handle measurement tool selection
 * handleToolSelection(event: MeasurementToolSelectedEvent) {
 *   const { operator } = event.detail;
 *   this.webViewer.setActiveOperator(operator);
 * }
 * ```
 */
@customElement('hoops-tools-measurement-actions')
export class HoopsToolsMeasurementActionsElement extends LitElement {
  static styles = [
    componentBaseStyle,
    css`
      :host {
        display: flex;
        gap: 0.5rem;
        padding: 0.5rem;
        border: none;
      }
    `,
  ];

  @property({ type: Number })
  activeToolOperator?: OperatorId;

  selectMeasurementTool(operator: OperatorId) {
    this.dispatchEvent(
      new CustomEvent('measurement-tool-selected', {
        detail: { operator },
      }),
    );
  }

  render() {
    return html`
      <hoops-icon-button
        color=${this.activeToolOperator === OperatorId.MeasurePointPointDistance
          ? 'accent'
          : 'default'}
        @click="${this.selectMeasurementTool.bind(this, OperatorId.MeasurePointPointDistance)}"
        title="Measure Point to Point"
      >
        ${icons.measurePoint}
      </hoops-icon-button>
      <hoops-icon-button
        color=${this.activeToolOperator === OperatorId.MeasureFaceFaceDistance
          ? 'accent'
          : 'default'}
        @click="${this.selectMeasurementTool.bind(this, OperatorId.MeasureFaceFaceDistance)}"
        title="Measure Distance Between Faces"
      >
        ${icons.measureDistance}
      </hoops-icon-button>
      <hoops-icon-button
        color=${this.activeToolOperator === OperatorId.MeasureFaceFaceAngle ? 'accent' : 'default'}
        @click="${this.selectMeasurementTool.bind(this, OperatorId.MeasureFaceFaceAngle)}"
        title="Measure Angle Between Faces"
      >
        ${icons.measureAngle}
      </hoops-icon-button>
      <hoops-icon-button
        color=${this.activeToolOperator === OperatorId.MeasureEdgeLength ? 'accent' : 'default'}
        @click="${this.selectMeasurementTool.bind(this, OperatorId.MeasureEdgeLength)}"
        title="Measure Edges"
      >
        ${icons.measureEdge}
      </hoops-icon-button>
    `;
  }
}

export default HoopsToolsMeasurementActionsElement;
