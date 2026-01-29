import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { type ICuttingService } from '../services';

import '../hoops-cutting-section-toolbar';

/**
 * A comprehensive cutting section component that manages multiple cutting planes as a group.
 *
 * This component provides a complete interface for a cutting section, which is a collection
 * of cutting planes that work together. It includes:
 * - Collapsible accordion display with section labeling
 * - Integrated toolbar for section-wide operations (add planes, visibility, clear, activate)
 * - Dynamic list of cutting plane components within the section
 * - Automatic expansion when new planes are added
 * - Real-time synchronization with cutting service events
 *
 * The component uses an accordion layout where the header shows the section name and toolbar,
 * and the content area contains a dynamic list of cutting plane components. The section
 * automatically expands when planes are added to provide immediate visual feedback.
 *
 * @element hoops-cutting-section
 *
 * @slot header - Slot for the section header content displaying the section label
 * @slot toolbar - Slot for the section toolbar with operation buttons (add, visibility, clear, activate)
 * @slot content - Slot for the cutting plane components within this section
 *
 * @cssprop --hoops-neutral-background-20 - Background color for the content area
 *
 * @attribute {number} sectionIndex - The index of the cutting section to display
 * @attribute {string} label - The display label shown in the accordion header
 *
 * @example
 * ```html
 * <hoops-cutting-section sectionIndex="0" label="Primary Section"></hoops-cutting-section>
 *
 * <script>
 *   const section = document.getElementsByTagName('hoops-cutting-section')[0];
 *   section.service = cuttingService;
 * </script>
 * ```
 *
 * @since 2025.8.0
 */
@customElement('hoops-cutting-section')
export class HoopsCuttingSectionElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }

      section {
        margin-bottom: '0.25rem';
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.125rem 0.25rem;
        width: 100%;
      }

      .header div {
        margin: 0;
        flex-grow: 1;
      }

      .content {
        min-height: 2rem;
        background-color: var(--hoops-neutral-background-20, #fafafa);
        padding: 0.25rem;
      }
    `,
  ];

  /**
   * The index of the cutting section to display and manage.
   * Used to identify which section's data and operations this component handles.
   *
   * @default 0
   */
  @property({ type: Number })
  sectionIndex = 0;

  /**
   * The display label for the cutting section shown in the accordion header.
   * Provides a human-readable name for the section to help users identify
   * different sections in multi-section scenarios.
   *
   * @default ""
   */
  @property({ type: String })
  label: string;

  /**
   * The cutting service instance that provides cutting section operations.
   * All section and plane operations are performed through this service interface.
   * When undefined, the component renders nothing.
   *
   * @default undefined
   */
  @property({ type: Object })
  service?: ICuttingService;

  /**
   * Internal state controlling whether the accordion section is currently expanded.
   * Automatically set to true when new cutting planes are added to provide
   * immediate visual feedback to the user.
   *
   * @default false
   * @internal
   */
  @state()
  expanded: boolean;

  /**
   * Constructs a new HoopsCuttingSectionElement.
   *
   * Initializes the component with default property values and binds
   * event handler methods for proper context preservation.
   */
  constructor() {
    super();
    this.expanded = false;
    this.label = '';

    this.invalidateSection = this.invalidateSection.bind(this);
    this.handleCuttingPlaneAdded = this.handleCuttingPlaneAdded.bind(this);
  }

  /**
   * Lifecycle method called after the first render.
   *
   * Sets up event listeners for cutting service events to keep the
   * section synchronized with the service state.
   *
   * @param _changedProperties - Map of changed properties
   * @internal
   */
  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    if (!this.service) {
      return;
    }

    this.service.addEventListener(
      'hoops-cutting-service-reset',
      this.invalidateSection as EventListener,
    );

    this.service.addEventListener(
      'hoops-cutting-section-change',
      this.invalidateSection as EventListener,
    );

    this.service.addEventListener(
      'hoops-cutting-plane-removed',
      this.invalidateSection as EventListener,
    );

    this.service.addEventListener(
      'hoops-cutting-plane-added',
      this.handleCuttingPlaneAdded as EventListener,
    );
  }

  /**
   * Lifecycle method called when the element is removed from the DOM.
   *
   * Cleans up all event listeners to prevent memory leaks.
   *
   * @internal
   */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (!this.service) {
      return;
    }

    this.service.removeEventListener(
      'hoops-cutting-service-reset',
      this.invalidateSection as EventListener,
    );

    this.service.removeEventListener(
      'hoops-cutting-section-change',
      this.invalidateSection as EventListener,
    );

    this.service.removeEventListener(
      'hoops-cutting-plane-removed',
      this.invalidateSection as EventListener,
    );

    this.service.removeEventListener(
      'hoops-cutting-plane-added',
      this.handleCuttingPlaneAdded as EventListener,
    );
  }

  /**
   * Event handler that invalidates the section when it changes.
   *
   * @param event - Custom event containing the section index that changed
   * @internal
   */
  private invalidateSection(event: CustomEvent<{ sectionIndex: number }>) {
    if (event.detail.sectionIndex === this.sectionIndex) {
      this.requestUpdate();
    }
  }

  /**
   * Event handler that handles cutting plane addition events.
   *
   * Automatically expands the accordion section when a new plane is added to provide
   * immediate visual feedback to the user.
   *
   * @param event - Custom event containing the section index where a plane was added
   * @internal
   */
  private handleCuttingPlaneAdded(event: CustomEvent<{ sectionIndex: number }>) {
    if (event.detail.sectionIndex === this.sectionIndex) {
      this.expanded = true;
      this.requestUpdate();
    }
  }

  /**
   * Renders the cutting section component.
   *
   * Creates an accordion-style interface with header, toolbar, and content slots.
   * The content area contains a dynamic list of cutting plane components.
   *
   * @returns TemplateResult - The accordion interface, or nothing if service is unavailable
   * @internal
   */
  render() {
    if (!this.service) {
      return nothing;
    }

    const section = this.service.getCuttingSection(this.sectionIndex);
    if (!section) {
      return nothing;
    }

    return html`<section>
      <hoops-accordion ?expanded=${this.expanded}>
        <div slot="header" class="header">
          <div>${this.label}</div>
        </div>
        <div slot="toolbar">
          <hoops-cutting-section-toolbar
            .service=${this.service}
            sectionIndex=${this.sectionIndex}
            onCuttingPlaneAdd=${() => {
              this.expanded = true;
            }}
          ></hoops-cutting-section-toolbar>
        </div>
        <div slot="content">
          <div class="content">
            ${section.cuttingPlanes.map(
              (_, i) =>
                html`<hoops-cutting-plane
                  sectionIndex=${this.sectionIndex}
                  planeIndex=${i}
                  .service=${this.service}
                ></hoops-cutting-plane>`,
            )}
          </div>
        </div>
      </hoops-accordion>
    </section>`;
  }
}
