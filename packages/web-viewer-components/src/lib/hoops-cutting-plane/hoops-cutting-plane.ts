import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '@ts3d-hoops/ui-kit';
import '../hoops-cutting-plane-toolbar';
import '../hoops-cutting-plane-editor';

import type { ICuttingService } from '../services/cutting/types';

/**
 * A comprehensive cutting plane component that combines display, editing, and management capabilities.
 *
 * This component provides a complete interface for a single cutting plane, including:
 * - Collapsible accordion display with plane identification
 * - Integrated toolbar for quick actions (invert, visibility, remove)
 * - Expandable editor for detailed property modification
 * - Automatic service discovery and synchronization
 * - Real-time updates when cutting plane properties change
 *
 * The component uses an accordion layout where the header shows the plane name and toolbar,
 * and the content area contains the detailed editor. The editor visibility is controlled
 * by the toolbar's customize button.
 *
 * @element hoops-cutting-plane
 *
 * @example
 * ```html
 * <hoops-cutting-plane
 *   sectionIndex="0"
 *   planeIndex="1"
 *   .service=${cuttingService}>
 * </hoops-cutting-plane>
 * ```
 *
 * @example
 * ```typescript
 * // Create and configure cutting plane component
 * const planeComponent = document.createElement('hoops-cutting-plane');
 * planeComponent.sectionIndex = 0;
 * planeComponent.planeIndex = 1;
 * planeComponent.service = cuttingService;
 * container.appendChild(planeComponent);
 * ```
 *
 * @example
 * ```html
 * <!-- Multiple cutting planes in a list -->
 * <div class="cutting-planes-list">
 *   <hoops-cutting-plane sectionIndex="0" planeIndex="0"></hoops-cutting-plane>
 *   <hoops-cutting-plane sectionIndex="0" planeIndex="1"></hoops-cutting-plane>
 *   <hoops-cutting-plane sectionIndex="1" planeIndex="0"></hoops-cutting-plane>
 * </div>
 * ```
 */
@customElement('hoops-cutting-plane')
export class HoopsCuttingPlaneElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }

      .container {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        flex-flow: row nowrap;
        font-size: 0.75rem;
      }

      .header-content {
        display: flex;
        flex-grow: 1;
        align-items: center;
      }
    `,
  ];

  /**
   * Internal state controlling whether the detailed editor is currently visible.
   * Toggled by the toolbar's customize button to expand/collapse the editor.
   *
   * @default false
   * @private
   */
  @state()
  private showEditor: boolean;

  /**
   * The index of the cutting plane within the specified cutting section.
   * Used to identify the specific plane to display and manage.
   *
   * @default -1
   */
  @property({ type: Number })
  public planeIndex: number;

  /**
   * The index of the cutting section containing the target cutting plane.
   * Used to identify which section contains the plane to display.
   *
   * @default -1
   */
  @property({ type: Number })
  public sectionIndex: number;

  /**
   * The cutting service instance that provides cutting plane operations.
   * When not provided, the component will attempt to auto-discover the service.
   * If no service is available, the component renders nothing.
   *
   * @default undefined
   */
  @property({ type: Object })
  public service?: ICuttingService;

  /**
   * Constructs a new HoopsCuttingPlaneElement.
   *
   * Initializes the component with default property values and binds
   * the invalidateCuttingPlane method for proper event handling context.
   */
  constructor() {
    super();
    this.showEditor = false;
    this.planeIndex = -1;
    this.sectionIndex = -1;

    this.invalidateCuttingPlane = this.invalidateCuttingPlane.bind(this);
  }

  /**
   * Lifecycle method called after the first render.
   *
   * Sets up event listeners for cutting plane change events to keep the
   * component synchronized with the state of its associated cutting plane.
   *
   * @param _changedProperties - Map of changed properties (not used)
   * @protected
   * @override
   */
  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    if (!this.service) {
      return;
    }

    this.service.addEventListener(
      'hoops-cutting-plane-change',
      this.invalidateCuttingPlane as EventListener,
    );
  }

  /**
   * Lifecycle method called when the element is removed from the DOM.
   *
   * Cleans up event listeners to prevent memory leaks when the component
   * is no longer needed.
   *
   * @override
   */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.service) {
      this.service.removeEventListener(
        'hoops-cutting-plane-change',
        this.invalidateCuttingPlane as EventListener,
      );
    }
  }

  /**
   * Event handler that invalidates the component when the associated cutting plane changes.
   *
   * This method listens for cutting plane change events and triggers a re-render
   * if the changed plane matches this component's section and plane indices.
   *
   * @param event - Custom event containing section and plane indices that changed
   * @private
   */
  private invalidateCuttingPlane(event: CustomEvent<{ planeIndex: number; sectionIndex: number }>) {
    if (
      this.planeIndex === event.detail.planeIndex &&
      this.sectionIndex === event.detail.sectionIndex
    ) {
      this.requestUpdate();
    }
  }

  /**
   * Renders the cutting plane component.
   *
   * Creates an accordion-style interface with:
   * - Header showing plane icon and index-based name ("Cutting Plane N")
   * - Integrated toolbar in the accordion icon slot for quick actions
   * - Collapsible content area containing the detailed editor
   * - Automatic service discovery when no service is provided
   * - Conditional rendering based on valid indices and service availability
   *
   * The accordion expansion state is controlled by the toolbar's customize button,
   * allowing users to toggle between compact and detailed views.
   *
   * @returns TemplateResult containing the accordion interface, or nothing if invalid state
   */
  render() {
    if (this.planeIndex === -1 || this.sectionIndex === -1) {
      return nothing;
    }

    if (!this.service) {
      return nothing; // empty when service unavailable
    }

    return html`<hoops-accordion ?expanded=${this.showEditor}>
      <div slot="header" class="container">
        <div class="header-content">
          <hoops-icon icon="planeIcon"></hoops-icon>
          Cutting Plane ${this.planeIndex + 1}
        </div>
      </div>
      <div slot="icon">
        <hoops-cutting-plane-toolbar
          planeIndex=${this.planeIndex}
          sectionIndex=${this.sectionIndex}
          @change=${() => (this.showEditor = !this.showEditor)}
          .service=${this.service}
        ></hoops-cutting-plane-toolbar>
      </div>
      <div slot="content">
        <hoops-cutting-plane-editor
          sectionIndex=${this.sectionIndex}
          planeIndex=${this.planeIndex}
          .service=${this.service}
        ></hoops-cutting-plane-editor>
      </div>
    </hoops-accordion>`;
  }
}
