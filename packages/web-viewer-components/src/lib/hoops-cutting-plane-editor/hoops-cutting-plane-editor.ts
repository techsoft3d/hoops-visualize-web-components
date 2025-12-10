import { CoordinateInputChangeEvent, HoopsCoordinateInputElement } from '@ts3d-hoops/ui-kit/common';
import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { customElement, property, queryAll } from 'lit/decorators.js';
import colorString from 'color-string';
import { Color, IColor } from '@ts3d-hoops/common';
import { CuttingPlane, type ICuttingService } from '../services';
import { Debouncer } from '@ts3d-hoops/ui-kit';

/**
 * A comprehensive editor component for modifying cutting plane properties.
 *
 * This component provides a full interface for editing all aspects of a cutting plane,
 * including geometric properties (normal vector and distance), visual properties
 * (colors and opacity), and real-time preview updates.
 *
 * Key features:
 * - Coordinate inputs for plane normal vector (x, y, z) and distance (d)
 * - Color pickers for face color and border color
 * - Opacity slider for transparency control
 * - Real-time updates with debounced service calls
 * - Automatic synchronization with cutting plane changes
 * - Conditional rendering based on cutting plane existence
 *
 * @element hoops-cutting-plane-editor
 *
 * @example
 * ```html
 * <hoops-cutting-plane-editor
 *   sectionIndex="0"
 *   planeIndex="1"
 *   .service=${cuttingService}>
 * </hoops-cutting-plane-editor>
 * ```
 *
 * @example
 * ```typescript
 * // Create and configure editor
 * const editor = document.createElement('hoops-cutting-plane-editor');
 * editor.sectionIndex = 0;
 * editor.planeIndex = 1;
 * editor.service = cuttingService;
 * container.appendChild(editor);
 * ```
 */
@customElement('hoops-cutting-plane-editor')
export class HoopsCuttingPlaneEditorElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }

      .color-container {
        display: grid;
        grid-template-columns: min-content auto;
        gap: 0.25rem;
        margin-top: 1rem;
        align-items: center;
      }

      .color-ui {
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-end;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
      }
    `,
  ];

  /**
   * The index of the cutting section containing the target cutting plane.
   * Used to identify which section contains the plane to be edited.
   *
   * @default 0
   */
  @property({ type: Number }) sectionIndex: number;

  /**
   * The index of the cutting plane within the specified cutting section.
   * Used to identify the specific plane to be edited.
   *
   * @default 0
   */
  @property({ type: Number }) planeIndex: number;

  /**
   * The cutting service instance that provides cutting plane operations.
   * All editor operations are performed through this service interface.
   * When undefined, the editor renders nothing.
   *
   * @default undefined
   */
  @property({ type: Object }) service?: ICuttingService;

  /**
   * Query selector for all coordinate input elements within the editor.
   * Used for batch operations like requesting updates when the plane changes.
   */
  @queryAll('hoops-coordinate-input') coordinateInputs!: Array<HoopsCoordinateInputElement>;

  /**
   * Timeout handle for debouncing rapid changes to prevent excessive service calls.
   * Ensures that multiple rapid changes are batched into a single update operation.
   *
   * @internal
   */
  private debouncer: Debouncer<[CuttingPlane], Promise<void>>;

  /**
   * Constructs a new HoopsCuttingPlaneEditorElement.
   *
   * Initializes the component with default property values and binds
   * the invalidateEditor method for proper event handling context.
   */
  constructor() {
    super();
    this.sectionIndex = 0;
    this.planeIndex = 0;

    this.invalidateEditor = this.invalidateEditor.bind(this);
    this.debouncer = new Debouncer(
      async (cuttingPlane: CuttingPlane) =>
        this.service?.updateCuttingPlane(this.sectionIndex, this.planeIndex, cuttingPlane),
    );
  }

  /**
   * Lifecycle method called after the first render.
   *
   * Sets up event listeners for cutting plane change events to keep the
   * editor synchronized with the state of its associated cutting plane.
   * Also triggers an initial update to ensure the UI reflects current state.
   *
   * @param _changedProperties - Map of changed properties (not used)
   * @internal
   */
  firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    if (!this.service) {
      return;
    }

    this.service.addEventListener(
      'hoops-cutting-plane-change',
      this.invalidateEditor as EventListener,
    );
    // Ensure UI updates after service acquisition
    this.requestUpdate();
  }

  /**
   * Lifecycle method called when the element is removed from the DOM.
   *
   * Cleans up event listeners to prevent memory leaks when the editor
   * is no longer needed.
   *
   * @internal
   */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.service) {
      this.service.removeEventListener(
        'hoops-cutting-plane-change',
        this.invalidateEditor as EventListener,
      );
    }

    this.debouncer.clear();
  }

  /**
   * Renders the cutting plane editor component.
   *
   * Creates a comprehensive editing interface with:
   * - Four coordinate inputs for plane normal vector (x, y, z) and distance (d)
   * - Color pickers for border color and face color
   * - Opacity slider for transparency control
   * - Real-time value display for colors
   * - Conditional enabling based on reference geometry existence
   *
   * The editor only renders if both a service and valid cutting plane exist.
   * Normal vector inputs are constrained to [-1, 1] range, while distance
   * is constrained by the model's bounding box size.
   *
   * @returns TemplateResult containing the editor interface, or nothing if no service/plane exists
   */
  render() {
    if (!this.service) {
      return nothing;
    }

    const cuttingPlane = this.service.getCuttingPlane(this.sectionIndex, this.planeIndex);
    if (!cuttingPlane) {
      return nothing;
    }

    const modelBounding = this.service.getModelBounding();
    const boxSize = modelBounding.extents().length();

    const color = (
      cuttingPlane.color
        ? colorString.to.hex(cuttingPlane.color.r, cuttingPlane.color.g, cuttingPlane.color.b)
        : '#000000'
    ) as string;

    const lineColor = (
      cuttingPlane.lineColor
        ? colorString.to.hex(
            cuttingPlane.lineColor.r,
            cuttingPlane.lineColor.g,
            cuttingPlane.lineColor.b,
          )
        : '#000000'
    ) as string;

    return html`
      <div style="padding: 0.5rem">
        <hoops-coordinate-input
          label="x"
          .value=${cuttingPlane.plane.normal.x}
          min="-1"
          max="1"
          @hoops-coordinate-changed=${(event: Event) =>
            this.updatePlane('x', (event as CoordinateInputChangeEvent).detail.value)}
        ></hoops-coordinate-input>
        <hoops-coordinate-input
          label="y"
          .value=${cuttingPlane.plane.normal.y}
          min="-1"
          max="1"
          @hoops-coordinate-changed=${(event: Event) =>
            this.updatePlane('y', (event as CoordinateInputChangeEvent).detail.value)}
        ></hoops-coordinate-input>
        <hoops-coordinate-input
          label="z"
          .value=${cuttingPlane.plane.normal.z}
          min="-1"
          max="1"
          @hoops-coordinate-changed=${(event: Event) =>
            this.updatePlane('z', (event as CoordinateInputChangeEvent).detail.value)}
        ></hoops-coordinate-input>
        <hoops-coordinate-input
          label="d"
          .value=${cuttingPlane.plane.d}
          min=${-boxSize}
          max=${boxSize}
          @hoops-coordinate-changed=${(event: Event) =>
            this.updatePlane('d', (event as CoordinateInputChangeEvent).detail.value)}
        ></hoops-coordinate-input>
        <div class="color-container">
          <div>borders:</div>
          <div class="color-ui">
            <div>${lineColor}</div>
            <hoops-color-button
              title="Set Cutting Plane Borders Color"
              iconSize="sm"
              .value=${lineColor}
              ?disabled=${cuttingPlane.referenceGeometry === undefined}
              @change=${(event: Event) => {
                this?.service?.setCuttingPlaneLineColor(
                  this.sectionIndex,
                  this.planeIndex,
                  this.htmlToHwvColor((event.target as HTMLInputElement).value),
                );
              }}
            >
              <hoops-icon
                slot="icon"
                icon="borderIcon"
                style="--hoops-svg-stroke-color: ${lineColor}; cursor: pointer"
              ></hoops-icon>
            </hoops-color-button>
          </div>
          <div>color:</div>
          <div class="color-ui">
            <div>${color}</div>
            <hoops-color-button
              title="Set Cutting Plane Color"
              iconSize="sm"
              .value=${color}
              ?disabled=${cuttingPlane.referenceGeometry === undefined}
              @change=${(event: Event) => {
                this?.service?.setCuttingPlaneColor(
                  this.sectionIndex,
                  this.planeIndex,
                  this.htmlToHwvColor((event.target as HTMLInputElement).value),
                );
              }}
            >
              <hoops-icon slot="icon" icon="fillIcon"></hoops-icon>
            </hoops-color-button>
          </div>
          <div>opacity:</div>
          <div style="position: relative; display: flex; align-items: center">
            <input
              style="width: 100%"
              className="vertical-slider"
              type="range"
              min=${0}
              max=${1}
              step="0.01"
              .value=${(cuttingPlane.opacity ?? 1).toString()}
              @change=${(event: Event) => {
                event.stopPropagation();
                const value = parseFloat((event.target as HTMLInputElement).value);
                this.service?.setCuttingPlaneOpacity(this.sectionIndex, this.planeIndex, value);
              }}
            />
            <hoops-icon
              icon="opacityIcon"
              style="'--hoops-svg-stroke-color': color; margin: 0.4rem 0.6rem;"
            ></hoops-icon>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Handles debounced updates to the cutting plane.
   *
   * Implements a debouncing mechanism to prevent excessive service calls
   * when the user makes rapid changes. Updates are delayed by 500ms and
   * any new changes reset the timer.
   *
   * @param cuttingPlane - The modified cutting plane to apply to the service
   * @internal
   */
  private onChange(cuttingPlane: CuttingPlane) {
    if (!this.service) {
      return;
    }

    // Catch and ignore promise rejections from cancelled debounce calls
    // This happens when rapid changes occur before the debounce delay completes
    this.debouncer.debounce(500, cuttingPlane).catch((e?: Error) => {
      // Silently ignore - debounce was cancelled by a newer call
      if (e) {
        throw e;
      }
    });
  }

  /**
   * Event handler that invalidates the editor when the associated cutting plane changes.
   *
   * This method listens for cutting plane change events and triggers a re-render
   * if the changed plane matches this editor's section and plane indices.
   * Also updates all coordinate input elements to reflect the new values.
   *
   * @param event - Custom event containing section and plane indices that changed
   * @internal
   */
  private invalidateEditor(event: CustomEvent<{ sectionIndex: number; planeIndex: number }>) {
    if (
      event.detail.sectionIndex === this.sectionIndex &&
      event.detail.planeIndex === this.planeIndex
    ) {
      this.requestUpdate();
      this.coordinateInputs.forEach((input) => input.requestUpdate());
    }
  }

  /**
   * Updates a specific axis or distance property of the cutting plane.
   *
   * Modifies either the normal vector components (x, y, z) or the distance (d)
   * of the cutting plane and triggers a debounced update to the service.
   *
   * @param axis - The plane property to update ('x', 'y', 'z' for normal vector, 'd' for distance)
   * @param value - The new value for the specified property
   * @internal
   */
  private updatePlane(axis: 'x' | 'y' | 'z' | 'd', value: number) {
    if (!this.service) {
      return;
    }

    const cuttingPlane = this.service.getCuttingPlane(this.sectionIndex, this.planeIndex);
    if (!cuttingPlane) {
      return;
    }

    if (axis === 'd') {
      cuttingPlane.plane.d = value;
    } else {
      cuttingPlane.plane.normal[axis] = value;
    }

    this.onChange(cuttingPlane);
  }

  /**
   * Converts an HTML color string to a HOOPS Web Viewer color object.
   *
   * Parses various HTML color formats (hex, rgb, etc.) and converts them
   * to the IColor interface used by the HOOPS Web Viewer. Returns black
   * as a fallback if the color string cannot be parsed.
   *
   * @param color - HTML color string (e.g., "#ff0000", "rgb(255,0,0)", "red")
   * @returns IColor object with RGB values, or black (0,0,0) if parsing fails
   * @internal
   */
  private htmlToHwvColor(color: string): IColor {
    const rgb = colorString.get.rgb(color);
    if (!rgb) {
      return new Color(0, 0, 0);
    }

    return new Color(rgb[0], rgb[1], rgb[2]);
  }
}

export default HoopsCuttingPlaneEditorElement;
