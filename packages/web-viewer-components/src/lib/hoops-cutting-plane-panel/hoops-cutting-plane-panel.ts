import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { getService, ICuttingService } from '../services';

import '../hoops-cutting-section/hoops-cutting-section';

/**
 * A top-level panel component that provides a complete cutting planes management interface.
 *
 * This component serves as the main entry point for cutting plane functionality, providing
 * automatic service discovery, dynamic display of cutting sections, and comprehensive event
 * handling for real-time updates.
 *
 * @element hoops-cutting-plane-panel
 *
 * @service {ICuttingService} CuttingService - Service for managing cutting planes and sections
 *
 * @example
 * ```html
 * <hoops-cutting-plane-panel></hoops-cutting-plane-panel>
 *
 * <script>
 *   const panel = document.getElementsByTagName('hoops-cutting-plane-panel')[0];
 *   // Panel automatically discovers and connects to the cutting service
 * </script>
 * ```
 *
 * @since 2026.1.0
 */
@customElement('hoops-cutting-plane-panel')
export class HoopsCuttingPlanePanelElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }

      .container {
        margin: 0 0.5rem 1rem 0.5rem;
      }

      h3 {
        margin: 0.25rem 0;
      }
    `,
  ];

  /**
   * The cutting service instance discovered automatically during component connection.
   * Provides access to all cutting plane operations and state management.
   *
   * @internal
   */
  private service!: ICuttingService;

  /**
   * Lifecycle method called when the element is connected to the DOM.
   *
   * Automatically discovers and initializes the cutting service connection.
   *
   * @internal
   */
  connectedCallback(): void {
    super.connectedCallback();
    this.service = getService<ICuttingService>('CuttingService');
  }

  /**
   * Lifecycle method called after the first render.
   *
   * Sets up event listeners for cutting service events to keep the panel synchronized.
   *
   * @internal
   */
  firstUpdated() {
    this.service.addEventListener('hoops-cutting-service-reset', () => {
      this.requestUpdate();
    });

    this.service.addEventListener('hoops-cutting-sections-change', () => {
      this.requestUpdate();
    });

    this.service.addEventListener('hoops-cutting-section-change', () => {
      this.requestUpdate();
    });

    this.service.addEventListener('hoops-cutting-section-added', () => {
      this.requestUpdate();
    });

    this.service.addEventListener('hoops-cutting-section-removed', () => {
      this.requestUpdate();
    });
  }

  /**
   * Renders the cutting plane panel component.
   *
   * Creates a panel with header and dynamic list of cutting section components.
   *
   * @returns TemplateResult - The panel interface with cutting sections
   * @internal
   */
  render() {
    const cuttingSectionCount = this.service.getCuttingSectionCount();

    return html`<div class="container">
      <h3>Cutting Planes</h3>
      ${[...new Array(cuttingSectionCount)].map((_, i) => {
        return html`<hoops-cutting-section
          label=${`Section ${i + 1}`}
          sectionIndex=${i}
          .service=${this.service}
        ></hoops-cutting-section>`;
      })}
    </div>`;
  }
}
