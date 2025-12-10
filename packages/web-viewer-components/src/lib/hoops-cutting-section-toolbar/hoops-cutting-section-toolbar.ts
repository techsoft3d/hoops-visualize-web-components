import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { type ICuttingService } from '../services';
import {
  createReferenceGeometryFromAxis,
  createReferenceGeometryFromFaceNormal,
  Plane,
  Point3,
} from '@ts3d-hoops/common';

import { dropdown } from '@ts3d-hoops/ui-kit';

type HoopsDropDownMenuElement = dropdown.DropdownMenu;

/**
 * A comprehensive toolbar component for managing cutting section operations.
 *
 * This component provides a complete interface for cutting section management, including:
 * - Dropdown menu for creating cutting planes with various orientation presets
 * - Support for axis-aligned planes (X, Y, Z axes)
 * - Face-based plane creation using selected geometry
 * - Custom plane creation with arbitrary orientation
 * - Section-wide operations (visibility toggle, clear, activate/deactivate)
 * - Visual feedback for section state and capacity limits
 *
 * The toolbar automatically updates when cutting sections change and provides
 * intuitive controls for both novice and advanced users.
 *
 * @element hoops-cutting-section-toolbar
 *
 * @example
 * ```html
 * <hoops-cutting-section-toolbar
 *   sectionIndex="0"
 *   .service=${cuttingService}>
 * </hoops-cutting-section-toolbar>
 * ```
 *
 * @example
 * ```typescript
 * // Create and configure section toolbar
 * const toolbar = document.createElement('hoops-cutting-section-toolbar');
 * toolbar.sectionIndex = 0;
 * toolbar.service = cuttingService;
 * container.appendChild(toolbar);
 * ```
 *
 * @example
 * ```html
 * <!-- Toolbar with all sections -->
 * <div class="cutting-sections">
 *   <hoops-cutting-section-toolbar sectionIndex="0" .service=${service}></hoops-cutting-section-toolbar>
 *   <hoops-cutting-section-toolbar sectionIndex="1" .service=${service}></hoops-cutting-section-toolbar>
 * </div>
 * ```
 */
@customElement('hoops-cutting-section-toolbar')
export class HoopsCuttingSectionToolbarElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }

      .container {
        display: flex;
        gap: 0.25rem;
        justify-content: center;
        align-items: center;
      }

      .cutting-plane-icon {
        width: 80%;
      }
    `,
  ];

  /**
   * The index of the cutting section to manage with this toolbar.
   * Used to identify which section's operations this toolbar controls.
   *
   * @default -1
   */
  @property({ type: Number })
  public sectionIndex: number;

  /**
   * The cutting service instance that provides cutting section operations.
   * All toolbar operations are performed through this service interface.
   * When undefined, the toolbar renders nothing.
   *
   * @default undefined
   */
  @property({ type: Object })
  public service?: ICuttingService;

  /**
   * Query selector for the dropdown menu element used for plane creation options.
   * Used to programmatically control dropdown visibility after plane creation.
   *
   * @internal
   */
  @query('hoops-dropdown')
  private _dropdown?: HoopsDropDownMenuElement;

  /**
   * Constructs a new HoopsCuttingSectionToolbarElement.
   *
   * Initializes the component with default property values and binds
   * the invalidateToolbar method for proper event handling context.
   */
  constructor() {
    super();
    this.sectionIndex = -1;

    this.invalidateToolbar = this.invalidateToolbar.bind(this);
  }

  /**
   * Lifecycle method called after the first render.
   *
   * Sets up event listeners for cutting section and face selection change events
   * to keep the toolbar synchronized with the current state of the cutting section
   * and user selections.
   *
   * @param _changedProperties - Map of changed properties (not used)
   * @internal
   */
  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    if (!this.service) {
      return;
    }

    this.service.addEventListener(
      'hoops-cutting-section-change',
      this.invalidateToolbar as EventListener,
    );

    this.service.addEventListener(
      'hoops-cutting-face-selection-change',
      this.invalidateToolbar as EventListener,
    );
  }

  /**
   * Lifecycle method called when the element is removed from the DOM.
   *
   * Cleans up event listeners to prevent memory leaks when the toolbar
   * is no longer needed.
   *
   * @internal
   */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.service) {
      this.service.removeEventListener(
        'hoops-cutting-section-change',
        this.invalidateToolbar as EventListener,
      );

      this.service.removeEventListener(
        'hoops-cutting-face-selection-change',
        this.invalidateToolbar as EventListener,
      );
    }
  }

  /**
   * Event handler that invalidates the toolbar when the associated cutting section changes.
   *
   * This method listens for cutting section and face selection change events and triggers
   * a re-render if the changed section matches this toolbar's section index or if the
   * event affects face selection state.
   *
   * @param event - Custom event containing section index or general selection changes
   * @internal
   */
  private invalidateToolbar(event: CustomEvent<{ sectionIndex: number }> | CustomEvent) {
    if (event.detail === null || event.detail.sectionIndex === this.sectionIndex) {
      this.requestUpdate();
    }
  }

  /**
   * Hides the dropdown menu after a plane creation operation.
   *
   * This method programmatically closes the dropdown to provide better user experience
   * after plane creation, preventing the menu from staying open unnecessarily.
   *
   * @internal
   */
  private hideDropdown() {
    if (this._dropdown && this._dropdown.menuShown) {
      this._dropdown.menuShown = false;
    }
  }

  /**
   * Renders the cutting section toolbar component.
   *
   * Creates a comprehensive toolbar with:
   * - Dropdown menu for plane creation with 5 preset options:
   *   - X-axis aligned plane
   *   - Y-axis aligned plane
   *   - Z-axis aligned plane
   *   - Face-based plane (using selected geometry)
   *   - Custom plane with arbitrary orientation
   * - Reference geometry visibility toggle button
   * - Clear section button to remove all planes
   * - Active/inactive state switch for the entire section
   *
   * The toolbar provides visual feedback for:
   * - Section capacity limits (max 3 planes)
   * - Face selection availability
   * - Section active/inactive state
   * - Reference geometry visibility state
   *
   * @returns TemplateResult containing the toolbar interface, or nothing if no service exists
   */
  render() {
    if (!this.service) {
      return nothing;
    }
    const section = this.service.getCuttingSection(this.sectionIndex);
    const selectedFace = this.service.getSelectedFace();
    const cuttingPlaneCount = this.service.getCuttingPlaneCount(this.sectionIndex) ?? 0;
    const sectionFull = cuttingPlaneCount >= 3;

    return html`<div class="container" @click=${(event: Event) => event.stopPropagation()}>
      <hoops-dropdown ?disabled=${sectionFull}>
        <hoops-icon-button ?disabled=${sectionFull}>
          <hoops-icon icon="addIcon"></hoops-icon>
        </hoops-icon-button>
        <div slot="dropdown-popup">
          <hoops-icon-button
            title="Create Cutting Plane An X Axis"
            @click=${(event: MouseEvent) => {
              event.stopPropagation();
              if (!this.service) {
                return;
              }

              const modelBounding = this.service.getModelBounding();
              this.service.addCuttingPlane(this.sectionIndex, {
                plane: Plane.createFromCoefficients(1, 0, 0, -modelBounding.max.x),
                referenceGeometry: section?.hideReferenceGeometry
                  ? undefined
                  : createReferenceGeometryFromAxis('x', modelBounding),
              });
              this.hideDropdown();
            }}
          >
            <hoops-icon icon="cuttingPlaneX" class="cutting-plane-icon"></hoops-icon>
          </hoops-icon-button>
          <hoops-icon-button
            title="Create Cutting Plane An Y Axis"
            @click=${(event: MouseEvent) => {
              event.stopPropagation();
              if (!this.service) {
                return;
              }

              const modelBounding = this.service.getModelBounding();
              this.service.addCuttingPlane(this.sectionIndex, {
                plane: Plane.createFromCoefficients(0, 1, 0, -modelBounding.max.y),
                referenceGeometry: section?.hideReferenceGeometry
                  ? undefined
                  : createReferenceGeometryFromAxis('y', modelBounding),
              });
              this.hideDropdown();
            }}
          >
            <hoops-icon icon="cuttingPlaneY" class="cutting-plane-icon"></hoops-icon>
          </hoops-icon-button>
          <hoops-icon-button
            title="Create Cutting Plane An Z Axis"
            @click=${(event: MouseEvent) => {
              event.stopPropagation();
              if (!this.service) {
                return;
              }

              const modelBounding = this.service.getModelBounding();
              this.service.addCuttingPlane(this.sectionIndex, {
                plane: Plane.createFromCoefficients(0, 0, 1, -modelBounding.max.z),
                referenceGeometry: section?.hideReferenceGeometry
                  ? undefined
                  : createReferenceGeometryFromAxis('z', modelBounding),
              });
              this.hideDropdown();
            }}
          >
            <hoops-icon icon="cuttingPlaneZ" class="cutting-plane-icon"></hoops-icon>
          </hoops-icon-button>
          <hoops-icon-button
            ?disabled=${!selectedFace}
            title="Create Cutting Plane An Selected Face"
            @click=${(event: MouseEvent) => {
              event.stopPropagation();
              if (!this.service) {
                return;
              }

              const modelBounding = this.service.getModelBounding();
              const selectedFace = this.service.getSelectedFace();
              if (!selectedFace) {
                return;
              }

              this.service.addCuttingPlane(this.sectionIndex, {
                plane: Plane.createFromPointAndNormal(selectedFace.position, selectedFace.normal),
                referenceGeometry: section?.hideReferenceGeometry
                  ? undefined
                  : createReferenceGeometryFromFaceNormal(
                      selectedFace.normal,
                      selectedFace.position,
                      modelBounding,
                    ),
              });
              this.hideDropdown();
            }}
          >
            <hoops-icon icon="viewFace" class="cutting-plane-icon"></hoops-icon>
          </hoops-icon-button>
          <hoops-icon-button
            title="Create Custom Cutting Plane"
            size="sm"
            @click=${(event: MouseEvent) => {
              event.stopPropagation();
              if (!this.service) {
                return;
              }

              const normal = new Point3(1, 1, 0).normalize();
              const center = this.service?.getModelBounding().center();

              this.service.addCuttingPlane(this.sectionIndex, {
                plane: Plane.createFromPointAndNormal(center, normal),
                referenceGeometry: section?.hideReferenceGeometry
                  ? undefined
                  : createReferenceGeometryFromFaceNormal(
                      normal,
                      center,
                      this.service.getModelBounding(),
                    ),
              });
              this.hideDropdown();
            }}
          >
            <hoops-icon icon="editIcon" class="cutting-plane-icon"></hoops-icon>
          </hoops-icon-button>
        </div>
      </hoops-dropdown>
      <hoops-icon-button ?disabled=${!section?.active} title="Toggle Cutting Plane Visibility">
        <hoops-icon
          title="Toggle Cutting Planes Visibility"
          icon=${section && section.hideReferenceGeometry
            ? 'cuttingPlaneSection'
            : 'cuttingPlaneSectionToggle'}
          class="cutting-plane-icon"
          @click=${(e: MouseEvent) => {
            e.stopPropagation();
            if (!this.service || !section) {
              return;
            }

            this.service.setCuttingSectionGeometryVisibility(
              this.sectionIndex,
              !section.hideReferenceGeometry,
            );
          }}
        ></hoops-icon>
      </hoops-icon-button>
      <hoops-icon-button
        ?disabled=${!section?.active}
        title="Clear Cutting Section"
        @click=${(e: MouseEvent) => {
          e.stopPropagation();
          if (!this.service) return;
          this.service.clearCuttingSection(this.sectionIndex);
        }}
      >
        <hoops-icon icon="cuttingPlaneReset" class="cutting-plane-icon"></hoops-icon>
      </hoops-icon-button>
      <hoops-switch
        ?checked=${section?.active}
        @change=${(e: Event) => {
          e.stopPropagation();
          if (!this.service || !section) {
            return;
          }

          this.service.setCuttingSectionState(this.sectionIndex, !section.active);
        }}
      ></hoops-switch>
    </div>`;
  }
}
