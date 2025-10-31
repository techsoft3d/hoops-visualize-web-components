import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  getService,
  IIFCRelationshipsService,
  RelatedElementInfo,
  RelationshipData,
} from '../services';

@customElement('hoops-ifc-relationship')
export class HoopsIFCRelationshipElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        padding: 0.4rem;
        padding-top: 0.8rem;
        border-top: 1px solid var(--hoops-separator-color);
        --hoops-svg-fill-color: var(--hoops-foreground);
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
        border-bottom: 1px solid var(--hoops-separator-color);
        stroke: var(--hoops-foreground);
        user-select: none;
      }
      .relationship-header:hover {
        background-color: color-mix(
          in srgb,
          var(--hoops-neutral-background-20),
          var(--hoops-foreground) 5%
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

  firstUpdated() {
    this.service = getService<IIFCRelationshipsService>('IFCRelationshipsService');
    this.service.addEventListener(
      'hoops-selection-ifc-relationships-changed',
      this.relationshipsChangedHandler,
    );
  }

  private relationshipsChangedHandler = ((event: CustomEvent<RelationshipData[]>) => {
    this.selectionRelationships = event.detail;
  }) as EventListener;

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.service) {
      this.service.removeEventListener(
        'hoops-selection-ifc-relationships-changed',
        this.relationshipsChangedHandler,
      );
    }
  }

  handleButtonClick(event: MouseEvent, relationship: RelatedElementInfo) {
    event.preventDefault();
    event.stopPropagation();
    if (!relationship.nodeId) {
      return;
    }

    this.service.selectNode(relationship.nodeId);
  }

  toggleRelationship(relationshipType: string) {
    this.expandedRelationships = {
      ...this.expandedRelationships,
      [relationshipType]: !this.expandedRelationships[relationshipType],
    };
  }

  isRelationshipExpanded(relationshipType: string): boolean {
    return !!this.expandedRelationships[relationshipType];
  }

  renderRelationshipIcon = (type: 'relating' | 'related') => {
    return (
      {
        relating: html`<i class="icon icon-arrow-right">←</i>`,
        related: html`<i class="icon icon-arrow-left">→</i>`,
      }[type] || nothing
    );
  };

  renderRelationships = (relationship: RelatedElementInfo) => {
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

  renderRelationshipData = (relationshipData: RelationshipData) => {
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
