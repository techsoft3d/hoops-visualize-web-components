import { LitElement, html, css, PropertyValues, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type ICuttingService } from '../services';

/**
 * A toolbar component for managing individual cutting plane operations.
 *
 * This component provides a set of action buttons for manipulating a specific
 * cutting plane within a cutting section. It offers functionality to customize,
 * invert, toggle visibility, and remove cutting planes.
 *
 * The toolbar automatically updates when the associated cutting plane changes
 * and only renders if a valid cutting plane exists at the specified indices.
 *
 * @element hoops-cutting-plane-toolbar
 * @fires change - Dispatched when the customize button is clicked
 *
 * @example
 * ```html
 * <hoops-cutting-plane-toolbar
 *   sectionIndex="0"
 *   planeIndex="1"
 *   .service=${cuttingService}
 *   @change=${this.handlePlaneCustomize}>
 * </hoops-cutting-plane-toolbar>
 * ```
 *
 * @example
 * ```typescript
 * // Listen for customize events
 * toolbar.addEventListener('change', (event) => {
 *   console.log('User wants to customize cutting plane');
 *   // Open customization dialog
 * });
 * ```
 */
@customElement('hoops-cutting-plane-toolbar')
export class HoopsCuttingPlaneToolbarElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }

      .container {
        display: flex;
      }

      .visibility-icon {
        width: 100%;
      }

      .remove-icon {
        width: 80%;
      }
    `,
  ];

  /**
   * The index of the cutting section containing the target cutting plane.
   * Used to identify which section contains the plane to be manipulated.
   *
   * @default -1
   */
  @property({ type: Number }) sectionIndex: number;

  /**
   * The index of the cutting plane within the specified cutting section.
   * Used to identify the specific plane to be manipulated by toolbar actions.
   *
   * @default -1
   */
  @property({ type: Number }) planeIndex: number;

  /**
   * The cutting service instance that provides cutting plane operations.
   * All toolbar actions are performed through this service interface.
   *
   * @default null
   */
  @property({ type: Object }) service: ICuttingService | null;

  /**
   * Constructs a new HoopsCuttingPlaneToolbarElement.
   *
   * Initializes the component with default property values and binds
   * the invalidateToolbar method for proper event handling context.
   */
  constructor() {
    super();
    this.sectionIndex = -1;
    this.planeIndex = -1;
    this.service = null;

    this.invalidateToolbar = this.invalidateToolbar.bind(this);
  }

  /**
   * Event handler that invalidates the toolbar when the associated cutting plane changes.
   *
   * This method listens for cutting plane change events and triggers a re-render
   * if the changed plane matches this toolbar's section and plane indices.
   *
   * @param event - Custom event containing section and plane indices that changed
   * @internal
   */
  private invalidateToolbar(event: CustomEvent<{ sectionIndex: number; planeIndex: number }>) {
    if (
      event.detail.sectionIndex === this.sectionIndex &&
      event.detail.planeIndex === this.planeIndex
    ) {
      this.requestUpdate();
    }
  }

  /**
   * Lifecycle method called after the first render.
   *
   * Sets up event listeners for cutting plane change events to keep the
   * toolbar synchronized with the state of its associated cutting plane.
   *
   * @param _changedProperties - Map of changed properties (not used)
   * @internal
   * @override
   */
  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    if (!this.service) {
      return;
    }

    this.service.addEventListener(
      'hoops-cutting-plane-change',
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
   * @override
   */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.service) {
      this.service.removeEventListener(
        'hoops-cutting-plane-change',
        this.invalidateToolbar as EventListener,
      );
    }
  }

  /**
   * Renders the cutting plane toolbar component.
   *
   * Creates a toolbar with four action buttons for cutting plane manipulation:
   * - Customize: Opens customization options for the cutting plane
   * - Invert: Reverses the cutting plane's orientation
   * - Toggle Visibility: Shows/hides the plane's reference geometry
   * - Remove: Deletes the cutting plane from the section
   *
   * The toolbar only renders if a valid cutting plane exists at the specified
   * section and plane indices. The visibility button icon changes based on
   * whether reference geometry is currently visible.
   *
   * @returns TemplateResult containing the toolbar buttons, or nothing if no plane exists
   * @internal
   */
  render() {
    const cuttingPlane = this.service?.getCuttingPlane(this.sectionIndex, this.planeIndex);
    if (!cuttingPlane) {
      return nothing;
    }

    const visible = !!cuttingPlane.referenceGeometry;

    return html`<div class="container">
      <hoops-button
        title="Customize Cutting Plane"
        iconSize="sm"
        @click=${(event: Event) => {
          event.stopPropagation();
          this.dispatchEvent(new CustomEvent('change', { bubbles: true, composed: true }));
        }}
      >
        <hoops-icon slot="icon" icon="editIcon"></hoops-icon>
      </hoops-button>
      <hoops-button title="Invert Cutting Plane" iconSize="sm" @click=${this.onInvertCuttingPlane}>
        <label slot="icon">
          <hoops-icon icon="invertIcon"></hoops-icon>
        </label>
      </hoops-button>
      <hoops-button
        title="Toggle Reference Geometry Visibility"
        iconSize="sm"
        @click=${this.onToggleVisibility}
      >
        <label slot="icon">
          <hoops-icon
            icon=${!visible ? 'visibilityHidden' : 'visibilityShown'}
            class="visibility-icon"
          ></hoops-icon>
        </label>
      </hoops-button>
      <hoops-icon-button title="Remove Cutting Plane" size="sm" @click=${this.onRemoveCuttingPlane}>
        <hoops-icon icon="removeIcon" class="remove-icon"></hoops-icon>
      </hoops-icon-button>
    </div>`;
  }

  /**
   * Handles the invert cutting plane button click event.
   *
   * Inverts the cutting plane by negating its normal vector and distance,
   * effectively flipping the plane's orientation to cut from the opposite side.
   *
   * @param event - The mouse click event from the invert button
   * @internal
   */
  private onInvertCuttingPlane(event: MouseEvent) {
    event.stopPropagation();
    if (!this.service) {
      return;
    }

    const cuttingPlane = this.service.getCuttingPlane(this.sectionIndex, this.planeIndex);
    if (!cuttingPlane) {
      return;
    }

    cuttingPlane.plane.normal.negate();
    cuttingPlane.plane.d = -cuttingPlane.plane.d;
    this.service.updateCuttingPlane(this.sectionIndex, this.planeIndex, {
      plane: cuttingPlane.plane,
    });
  }

  /**
   * Handles the toggle visibility button click event.
   *
   * Toggles the visibility of the cutting plane's reference geometry,
   * switching between showing and hiding the visual representation of the plane.
   *
   * @param event - The click event from the toggle visibility button
   * @internal
   */
  private onToggleVisibility(event: Event) {
    event.stopPropagation();

    if (!this.service) {
      return;
    }

    const cuttingPlane = this.service.getCuttingPlane(this.sectionIndex, this.planeIndex);
    if (!cuttingPlane) {
      return;
    }

    this.service.setCuttingPlaneVisibility(
      this.sectionIndex,
      this.planeIndex,
      !cuttingPlane.referenceGeometry,
    );
  }

  /**
   * Handles the remove cutting plane button click event.
   *
   * Removes the cutting plane from its section, permanently deleting it
   * from the cutting configuration. This action cannot be undone.
   *
   * @param event - The click event from the remove button
   * @internal
   */
  private onRemoveCuttingPlane(event: Event) {
    event.stopPropagation();
    if (!this.service) {
      return;
    }

    this.service.removeCuttingPlane(this.sectionIndex, this.planeIndex);
  }
}
