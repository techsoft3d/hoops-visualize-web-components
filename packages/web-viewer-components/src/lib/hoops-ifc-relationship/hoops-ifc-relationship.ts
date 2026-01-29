import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  getService,
  IIFCRelationshipsService,
  RelatedElementInfo,
  RelationshipData,
} from '../services';

/**
 * Provides a component for displaying IFC relationships in BIM models.
 *
 * This component shows hierarchical relationships between IFC elements, allowing users to explore
 * how building components relate to each other. It displays relationship types, element names,
 * and provides navigation to related elements through selection.
 *
 * The component automatically updates when selection changes and provides expandable/collapsible
 * relationship groups with smooth animations (unless disabled).
 *
 * @element hoops-ifc-relationship
 *
 * @cssprop --hoops-separator-color - Color for borders and separators
 * @cssprop --hoops-foreground - Text and icon color
 * @cssprop --hoops-svg-fill-color - Fill color for SVG icons
 * @cssprop --hoops-neutral-background-20 - Background color for hover states
 *
 * @attribute {boolean} no-anim - Disables animations when set
 *
 * @example
 * ```html
 * <hoops-ifc-relationship no-anim></hoops-ifc-relationship>
 * ```
 *
 * @since 2025.8.0
 */
@customElement('hoops-ifc-relationship')
export class HoopsIFCRelationshipElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        padding: 0.4rem;
        padding-top: 0.8rem;
        border-top: 1px solid var(--hoops-separator-color, #f0f0f0);
        --hoops-svg-fill-color: var(--hoops-foreground, #303030);
        min-height: 16rem;
      }
      .section-title {
        font-weight: 400;
        margin-bottom: 0.4rem;
      }
      .relationship-label {
        font-weight: 500;
        font-size: 0.875rem;
        margin-bottom: 0.2rem;
      }
      .relationships {
        max-height: 8rem;
        overflow-y: auto;
        margin-bottom: 0.6rem;
      }
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      hoops-button {
        font-size: 0.875rem;
      }
      .relationship-item {
        cursor: pointer;
      }
      .relationship-header {
        display: flex;
        cursor: pointer;
        padding: 0.3rem 0;
        border-bottom: 1px solid var(--hoops-separator-color, #f0f0f0);
        stroke: var(--hoops-foreground, #303030);
        user-select: none;
      }
      .relationship-header:hover {
        background-color: color-mix(
          in srgb,
          var(--hoops-neutral-background-20, #fafafa),
          var(--hoops-foreground, #303030) 5%
        );
      }
      .relationship-toggle {
        display: flex;
        align-items: center;
        margin-right: 0.5rem;
      }
      .relationship-content {
        overflow: hidden;
      }
      .relationship-content:not(.no-anim) {
        transition: max-height 0.3s ease;
      }
      .relationship-content.collapsed {
        max-height: 0;
      }
      .relationship-content.expanded {
        max-height: 200px;
      }
    `,
  ];

  service!: IIFCRelationshipsService;

  /**
   * When true, animations will be disabled for this component
   */
  @property({ type: Boolean, attribute: 'no-anim' })
  noAnim = false;

  @state()
  selectionRelationships: RelationshipData[] | undefined;

  @state()
  expandedRelationships: Record<string, boolean> = {};

  /**
   * Lifecycle callback when component is first updated.
   *
   * Initializes the IFC relationships service and sets up event listeners
   * for relationship changes based on selection.
   *
   * @returns {void}
   */
  firstUpdated() {
    this.service = getService<IIFCRelationshipsService>('IFCRelationshipsService');
    this.service.addEventListener(
      'hoops-selection-ifc-relationships-changed',
      this.relationshipsChangedHandler,
    );
  }

  /**
   * Handles IFC relationships changed events from the service.
   *
   * Updates the component's selection relationships state when the IFC relationships
   * service broadcasts changes based on current selection.
   *
   * @internal
   * @param event - Custom event containing the updated relationship data array
   * @returns {void}
   */
  private relationshipsChangedHandler = ((event: CustomEvent<RelationshipData[]>) => {
    this.selectionRelationships = event.detail;
  }) as EventListener;

  /**
   * Lifecycle callback when component is removed from the DOM.
   *
   * Cleans up event listeners for IFC relationships service to prevent memory leaks.
   *
   * @returns {void}
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.service) {
      this.service.removeEventListener(
        'hoops-selection-ifc-relationships-changed',
        this.relationshipsChangedHandler,
      );
    }
  }

  /**
   * Handles click events on relationship element buttons.
   *
   * Selects the corresponding node in the model when a relationship element is clicked,
   * allowing navigation through related IFC elements.
   *
   * @internal
   * @param event - The mouse click event
   * @param relationship - The relationship element information containing node ID
   * @returns {void}
   */
  private handleButtonClick(event: MouseEvent, relationship: RelatedElementInfo) {
    event.preventDefault();
    event.stopPropagation();
    if (!relationship.nodeId) {
      return;
    }

    this.service.selectNode(relationship.nodeId);
  }

  /**
   * Toggles the expanded/collapsed state of a relationship group.
   *
   * Controls the visibility of relationship elements within a specific relationship type,
   * with smooth animations (unless disabled via no-anim attribute).
   *
   * @param relationshipType - The type name of the relationship to toggle
   * @returns {void}
   */
  toggleRelationship(relationshipType: string) {
    this.expandedRelationships = {
      ...this.expandedRelationships,
      [relationshipType]: !this.expandedRelationships[relationshipType],
    };
  }

  /**
   * Checks whether a relationship group is currently expanded.
   *
   * @param relationshipType - The type name of the relationship to check
   * @returns {boolean} True if the relationship group is expanded, false otherwise
   */
  isRelationshipExpanded(relationshipType: string): boolean {
    return !!this.expandedRelationships[relationshipType];
  }

  /**
   * Renders the appropriate directional icon for relationship types.
   *
   * Creates visual indicators to show the direction of IFC relationships:
   * - 'relating': Shows left arrow (←) indicating this element relates to others
   * - 'related': Shows right arrow (→) indicating this element is related by others
   *
   * @internal
   * @param type - The relationship direction type ('relating' or 'related')
   * @returns {TemplateResult | typeof nothing} HTML template with directional icon or nothing if invalid type
   */
  private renderRelationshipIcon = (type: 'relating' | 'related') => {
    return (
      {
        relating: html`<i class="icon icon-arrow-right">←</i>`,
        related: html`<i class="icon icon-arrow-left">→</i>`,
      }[type] || nothing
    );
  };

  /**
   * Renders a single relationship element as a clickable button.
   *
   * Creates an interactive list item for each related IFC element, including:
   * - Directional icon showing relationship type (relating/related)
   * - Element name and BIM ID for identification
   * - Click handler for element selection and navigation
   * - Disabled state when element lacks required IDs
   *
   * @internal
   * @param relationship - The relationship element information to render
   * @returns {TemplateResult | typeof nothing} HTML template for the relationship item or nothing if invalid
   */
  private renderRelationships = (relationship: RelatedElementInfo) => {
    if (!relationship) {
      return nothing;
    }
    return html`<li class="relationship-item">
      <hoops-button
        ?disabled="${!(relationship.nodeId && relationship.bimId)}"
        @click="${(e: MouseEvent) => this.handleButtonClick(e, relationship)}"
      >
        ${this.renderRelationshipIcon(relationship.role)} ${relationship.name}
        #${relationship.bimId}
      </hoops-button>
    </li>`;
  };

  /**
   * Renders a complete relationship group with expandable/collapsible functionality.
   *
   * Creates a hierarchical display for a relationship type including:
   * - Expandable header with toggle icon and element count
   * - Collapsible content area with smooth animations (unless disabled)
   * - List of related elements within the relationship type
   * - Proper accessibility attributes for screen readers
   *
   * @internal
   * @param relationshipData - The relationship group data containing type name and elements
   * @returns {TemplateResult | typeof nothing} HTML template for the relationship group or nothing if no elements
   */
  private renderRelationshipData = (relationshipData: RelationshipData) => {
    if (!relationshipData?.elements?.length) {
      return nothing;
    }

    const isExpanded = this.isRelationshipExpanded(relationshipData.typeName);

    return html`<div class="relationship-item" aria-expanded="${isExpanded}">
      <div class="relationship-type">
        <div
          class="relationship-header"
          @click="${() => this.toggleRelationship(relationshipData.typeName)}"
        >
          <div class="relationship-toggle">
            <hoops-icon
              icon=${isExpanded ? 'downIcon' : 'rightIcon'}
              style="width:1rem;"
            ></hoops-icon>
          </div>
          <div class="relationship-label">
            ${relationshipData.typeName} (${relationshipData.elements.length})
          </div>
        </div>
        <div
          class="relationship-content ${isExpanded ? 'expanded' : 'collapsed'} ${this.noAnim
            ? 'no-anim'
            : ''}"
        >
          <div class="relationships">
            <ul>
              ${relationshipData.elements?.map((rel) => this.renderRelationships(rel))}
            </ul>
          </div>
        </div>
      </div>
    </div>`;
  };

  /**
   * Renders the IFC relationships component template.
   *
   * Creates a hierarchical display of IFC relationships based on current selection,
   * with expandable groups and interactive elements for navigation.
   *
   * @returns {unknown} The HTML template for the IFC relationships panel
   */
  render() {
    const selectionRelationships = this.selectionRelationships ?? [];
    return html`
      <div data-testid="ifc-relationships-panel">
        <div class="section-title">Relationships</div>
        <div data-testid="relationships-tree">
          ${selectionRelationships.map(this.renderRelationshipData)}
        </div>
      </div>
    `;
  }
}
