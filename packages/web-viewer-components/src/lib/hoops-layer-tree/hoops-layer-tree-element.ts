import { LitElement, css, html, nothing, HTMLTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { componentBaseStyle } from '@ts3d-hoops/ui-kit';
import { formatLayersIcon, formatNodeIcon, rightArrowIcon, downArrowIcon } from './utils';
import type { BaseMouseEvent } from '@ts3d-hoops/ui-kit/tree';
import { toBaseMouseEvent } from '@ts3d-hoops/ui-kit/tree';
import { halfVisibleIcon, hiddenIcon, visibleIcon } from '@ts3d-hoops/ui-kit/icons';

/**
 * The LayerTreeElement class implements a custom elements register with the tag
 * `hoops-layer-tree-element`.
 * This component represent a layer in the `hoops-layer-tree` component. It
 * contains properties to display to the user.
 *
 * The LayerTreeElement does not have any dependency to the @ts3d-hoops/web-viewer Model
 * class.
 *
 * @prop {number} layerId The id of the layer in the model
 * @prop {string} layerName The name of the layer
 * @prop {boolean} hidden The visibility state of the layer. By default boolean
 * args are recommended to be false so you can use this notation:
 * ```html
 * <hoops-layer-tree-element></hoops-layer-tree-element> <!-- <-- This layer is visible -->
 * <hoops-layer-tree-element hidden> <!-- <-- This layer is hidden -->
 * </hoops-layer-tree-element>
 * ```
 *
 * @export
 * @class LayerTreeElement
 * @typedef {LayerTreeElement}
 * @extends {LitElement}
 */
@customElement('hoops-layer-tree-element')
export class LayerTreeElement extends LitElement {
  static styles = [
    componentBaseStyle,
    css`
      :host {
        width: 100%;
      }

      .layer-tree-element {
        width: 100%;
        user-select: none;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-flow: row nowrap;
      }

      .type-icon,
      .visible-icon,
      .layer-icon,
      .layer-node-icon,
      .expand-icon {
        width: 1.2rem;
        height: 1.2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
      }

      .content {
        flex: 1;
      }

      .type-icon svg,
      .visible-icon svg,
      .layer-icon svg,
      .layer-node-icon svg,
      .expand-icon svg {
        width: 100%;
        height: 100%;
      }

      .layer-node-list {
        margin-left: 1rem;
      }

      .layer-node-list.collapsed {
        display: none;
      }

      .layer-node-element {
        display: flex;
        align-items: center;
      }

      .layer-tree-element.selected,
      .layer-node-element.selected {
        color: var(--hoops-accent-foreground-hover, var(--blue, #0078d4));
        stroke: var(--hoops-accent-foreground-hover, var(--blue, #0078d4));
        --hoops-svg-stroke-color: var(--hoops-accent-foreground-hover, var(--blue, #0078d4));
      }

      .layer-node-element:not(.selected) {
        color: var(--hoops-neutral-foreground, #303030);
        stroke: var(--hoops-neutral-foreground, #303030);
      }

      .title,
      .layer-node-title {
        width: 100%;
        padding-left: calc(0.4rem);
        cursor: pointer;
      }
    `,
  ];

  /**
   * The id of the layer to render.
   *
   * @type {number}
   */
  @property({ type: Number })
  layerId = Number.NaN;

  /**
   * The name of the layer to render.
   *
   * @type {string}
   */
  @property({ type: String })
  layerName = '';

  /**
   * The hidden attribute represent the visibility of the nodes in the viewer.
   * We use the negated visibility since usually boolean attribute default value
   * is false we prefer to add a hidden boolean attribute than to have
   * visible="true" or visible="false" on each layer.
   *
   * @type {Array<number>}
   */
  @property({ type: Array<number> })
  hiddenNodes: number[] = [];

  /**
   * Whether the layer is selected or not.
   *
   * @type {boolean}
   */
  @property({ type: Boolean })
  selected = false;

  /**
   * Which nodes are selected.
   *
   * @type {Array<number>}
   */
  @property({ type: Array<number> })
  selectedNodes: number[] = [];

  /**
   * List of nodes that belong to this layer
   *
   * @type {Map}
   */
  @property({ type: Object })
  layerNodes: Map<number, string> = new Map();

  /**
   * Whether the node is expanded or not
   *
   * @type {boolean}
   */
  @property({ type: Boolean })
  public expanded = false;

  /**
   * Map of the nodes' children that belong to this layer
   *
   * @type {Map<number, number[]>}
   */
  @property({ type: Map<number, number[]> })
  nodesChildren: Map<number, number[]> = new Map<number, number[]>();

  /**
   * Render the `layer-tree-element` element into the DOM
   * if the layerId is NaN it will return `nothing`, a value from Lit to let it
   * know not to add anything to the DOM.
   *
   * Otherwise, it returns an HTML Element that displays an icon based on the
   * type of the layer, the name of the layer and a clickable icon for the
   * visibility.
   *
   * When the layer visibility icon is clicked the
   * 'hoops-layer-visibility-change' event is emitted.
   *
   * If the hidden property change on the layer the icon will change.
   *
   * @returns {The `<layer-tree-element></layer-tree-element>` content or nothing}
   */
  protected override render() {
    /**
     * If the layerId is NaN there is nothing to display so e return nothing to
     * lit.
     */
    if (Number.isNaN(this.layerId)) {
      return nothing;
    }

    const classNames = ['layer-tree-element'];
    if (this.selected) {
      classNames.push('selected');
    }

    const nodesHtml: HTMLTemplateResult[] = [];
    this.layerNodes.forEach((v: string, k: number) => {
      nodesHtml.push(this.getNodeHtml(k, v));
    });

    const nodeListClassNames = ['layer-node-list'];
    if (!this.expanded) {
      nodeListClassNames.push('collapsed');
    }

    return html` <div class=${classNames.join(' ')}>
      <div class="header">
        ${this.getExpandIcon()}
        <div class="layer-icon">${formatLayersIcon()}</div>
        <div class="content" @click=${this.onLayerClicked} @auxclick=${this.onLayerClicked}>
          <div class="title">${this.layerName}</div>
        </div>
        <div class="visible-icon" @click=${this.onVisibilityClicked}>
          ${this.formatLayerVisibilityIcon()}
        </div>
      </div>
      <div class=${nodeListClassNames.join(' ')}>${nodesHtml}</div>
    </div>`;
  }

  private formatLayerVisibilityIcon(): HTMLTemplateResult | typeof nothing {
    if (this.hiddenNodes.length <= 0) {
      return html`${visibleIcon}`;
    }
    const layerNodes = Array.from(this.layerNodes.keys());
    if (layerNodes.length !== this.hiddenNodes.length) {
      if (this.hiddenNodes.some((value) => layerNodes.includes(value))) {
        return html`${halfVisibleIcon}`;
      } else {
        return html`${visibleIcon}`;
      }
    }
    const layerNodesSorted = [...layerNodes].sort();
    const hiddenNodesSorted = [...this.hiddenNodes].sort();
    if (layerNodesSorted.every((value, index) => value === hiddenNodesSorted[index])) {
      return html`${hiddenIcon}`;
    }
    return nothing;
  }

  public toggleSelection() {
    this.select(!this.selected);
  }

  public select(selected: boolean) {
    this.selectNodes([...this.layerNodes.keys()], selected);
    this.selected = selected;
  }

  public clearSelection() {
    this.selectedNodes = [];
    this.updateLayerElementSelection();
  }

  public updateVisibility(shownBodyIds: Array<number>, hiddenBodyIds: Array<number>) {
    this.hiddenNodes = Array.from(new Set([...this.hiddenNodes, ...hiddenBodyIds]));
    this.layerNodes.forEach((_, nodeId) => {
      if (shownBodyIds.includes(nodeId)) {
        this.hiddenNodes = this.hiddenNodes.filter((id) => id !== nodeId);
      }
    });
  }

  public selectNodes(nodeIds: number[], selected: boolean) {
    const hasCommonElements = this.getLayerNodeIds().some((item) => nodeIds.includes(item));
    if (!hasCommonElements) {
      return;
    }
    if (selected) {
      const childrenToAdd = new Array<number>();
      nodeIds.forEach((nodeId) => {
        if (this.nodesChildren.has(nodeId)) {
          childrenToAdd.push(...(this.nodesChildren.get(nodeId) ?? []));
        }
      });
      this.selectedNodes = [...nodeIds, ...childrenToAdd];
    } else {
      this.selectedNodes = this.selectedNodes.filter((item) => !nodeIds.includes(item));
    }
    this.updateLayerElementSelection();
  }

  public toggleNodeSelection(nodeId: number) {
    if (this.selectedNodes.includes(nodeId)) {
      this.selectedNodes = this.selectedNodes.filter((item) => item !== nodeId);
    } else {
      this.selectedNodes.push(nodeId);
    }
    this.updateLayerElementSelection();
  }

  public toggleVisibility() {
    if (this.hiddenNodes.length > 0) {
      this.hiddenNodes = [];
    } else {
      this.hiddenNodes = [...this.layerNodes.keys()];
    }
  }

  private updateLayerElementSelection() {
    this.selected = this.selectedNodes.length > 0;
  }

  private getLayerNodeIds(): number[] {
    return Array.from(this.layerNodes.keys());
  }

  private getNodeHtml(nodeId: number, nodeName: string): HTMLTemplateResult {
    const classNames = ['layer-node-element'];
    if (this.selectedNodes.includes(nodeId)) {
      classNames.push('selected');
    }

    const isNodeHidden = this.hiddenNodes.includes(nodeId);

    return html`<div
      class="${classNames.join(' ')}"
      nodeId=${nodeId}
      @click=${(event: MouseEvent) => this.onLayerNodeClicked(event, nodeId)}
      @auxclick=${(event: MouseEvent) => this.onLayerNodeClicked(event, nodeId)}
    >
      <div class="layer-node-icon">${formatNodeIcon()}</div>
      <div class="layer-node-title">${nodeName}</div>
      <hoops-icon
        class="visible-icon"
        icon="${isNodeHidden ? 'hiddenIcon' : 'visibleIcon'}"
        @click=${(event: MouseEvent) => this.onNodeVisibilityClicked(event, nodeId)}
      >
      </hoops-icon>
    </div>`;
  }

  /**
   * Get the expand/collapse icon for a layer node.
   *
   * @returns {(HTMLTemplateResult | typeof nothing)}
   */
  private getExpandIcon(): HTMLTemplateResult | typeof nothing {
    let icon = rightArrowIcon();
    if (this.expanded) {
      icon = downArrowIcon();
    }
    return html`<div class="expand-icon" @click=${this.handleExpandClick}>${icon}</div>`;
  }

  /**
   * Handles click on the expand icon.
   *
   * This will stop the propagation of the click and update
   * its expanded status
   *
   * @param {MouseEvent} event The event that triggered the listener.
   */
  private handleExpandClick(event: MouseEvent) {
    event.stopPropagation();
    this.expanded = !this.expanded;
  }

  /**
   * Handles a click on the visibility icon.
   * It stops the propagation of the click event and emit a
   * 'hoops-layer-visibility-change' that provides the layerId, the new
   * visibility and `this` element itself along with some mouse event
   * properties.
   * @param {MouseEvent} event The mouse event from the click on the layer
   */
  private onVisibilityClicked(event: MouseEvent) {
    event.stopPropagation();
    const visibility = this.hiddenNodes.length > 0;
    // dispatch visibility change
    this.dispatchEvent(
      new CustomEvent<
        { layerId: number; visibility: boolean; source: HTMLElement } & BaseMouseEvent
      >('hoops-layer-visibility-change', {
        bubbles: true,
        composed: true,
        detail: {
          ...toBaseMouseEvent(event),
          layerId: this.layerId,
          visibility: !visibility,
          source: this,
        },
      }),
    );
  }

  /**
   * Handles a click on the node visibility icon.
   * It stops the propagation of the click event and emit a
   * 'hoops-layer-node-visibility-change' that provides the nodeId, the new
   * visibility and `this` element itself along with some mouse event
   * properties.
   * @param {MouseEvent} event The mouse event from the click on the layer
   */
  private onNodeVisibilityClicked(event: MouseEvent, nodeId: number) {
    event.stopPropagation();
    if (this.hiddenNodes.includes(nodeId)) {
      this.hiddenNodes = this.hiddenNodes.filter((id) => id != nodeId);
    } else {
      this.hiddenNodes.push(nodeId);
      this.hiddenNodes = [...this.hiddenNodes];
    }

    // dispatch visibility change
    this.dispatchEvent(
      new CustomEvent<{ nodeIds: number[]; source: HTMLElement } & BaseMouseEvent>(
        'hoops-layer-node-visibility-change',
        {
          bubbles: true,
          composed: true,
          detail: {
            ...toBaseMouseEvent(event),
            nodeIds: this.hiddenNodes,
            source: this,
          },
        },
      ),
    );
  }

  /**
   * Handles a click on a node in the list.
   * It stops the propagation of the click event and emit a
   * 'hoops-layer-tree-node-clicked' that provides the nodeId
   * and `this` element itself along with some mouse event
   * properties.
   * @param {MouseEvent} event The mouse event from the click on the layer
   */
  private onLayerNodeClicked(event: MouseEvent, clickedNodeId: number) {
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent<{ layerId: number; nodeId: number; source: HTMLElement } & BaseMouseEvent>(
        'hoops-layer-tree-node-clicked',
        {
          bubbles: true,
          composed: true,
          detail: {
            ...toBaseMouseEvent(event),
            layerId: this.layerId,
            nodeId: clickedNodeId,
            source: this,
          },
        },
      ),
    );
  }

  /**
   * Handles a click on a single layer list element
   * It stops the propagation of the click event and emit a
   * 'hoops-layer-clicked' that provides the nodeId
   * and `this` element itself along with some mouse event
   * properties.
   * @param {MouseEvent} event The mouse event from the click on the layer
   */
  private onLayerClicked(event: MouseEvent) {
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent<{ layerId: number; source: HTMLElement } & BaseMouseEvent>(
        'hoops-layer-clicked',
        {
          bubbles: true,
          composed: true,
          detail: {
            ...toBaseMouseEvent(event),
            layerId: this.layerId,
            source: this,
          },
        },
      ),
    );
  }
}
