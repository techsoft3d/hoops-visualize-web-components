import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { componentBaseStyle } from '@ts3d-hoops/ui-kit';
import { BaseMouseEvent, toBaseMouseEvent } from '@ts3d-hoops/ui-kit/tree';
import type { BranchVisibility } from '../hoops-model-tree/types';
import { formatNodeVisibilityIcon } from '../hoops-model-tree/utils';

/**
 * The TypeTreeNode class implements a custom elements register with the tag
 * `hoops-types-tree-node`.
 * This component represent a node in the `hoops-types-tree` component. It
 * contains properties to display to the user.
 *
 * The TypeTreeNode does not have any dependency to the @ts3d-hoops/web-viewer Model
 * class.
 *
 * @prop {number} nodeId The id of the node in the model
 * @prop {string} nodeName The name of the node
 *
 * @export
 * @class TypeTreeNode
 * @typedef {TypeTreeNodeElement}
 * @extends {LitElement}
 */
@customElement('hoops-types-tree-node')
export class TypeTreeNodeElement extends LitElement {
  static styles = [
    componentBaseStyle,
    css`
      :host {
        display: block;
        width: 100%;
        user-select: none;
      }
      .types-tree-node {
        display: flex;
        align-items: center;
        flex-direction: row;
        width: 100%;
        user-select: none;
      }

      .expand-icon {
        flex-shrink: 0;
        margin-right: 0.4rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .content {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        align-items: center;
      }

      .title {
        flex: 1 1 auto;
        min-width: 0;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        padding-left: 0;
        cursor: pointer;
        user-select: none;
      }

      .visible-icon {
        width: 1.2rem;
        height: 1.2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        margin-left: 0.4rem;
      }

      .types-tree-node.selected {
        color: var(--hoops-accent-foreground-hover);
        stroke: var(--hoops-accent-foreground-hover);
      }

      .content:hover {
        color: var(--hoops-accent-foreground-hover);
        stroke: var(--hoops-accent-foreground-hover);
        fill: var(--hoops-accent-foreground-hover);
      }
    `,
  ];

  /**
   * The tree id of the node for UI purposes (not related to the model)
   */
  @property({ type: Number })
  nodeId = Number.NaN;

  /**
   * The id of the node represented by this element
   */
  @property({ type: Number })
  modelNodeId = Number.NaN;

  /**
   * The name of the node
   */
  @property({ type: String })
  nodeName = '';

  /**
   * The nodes associated with this type node
   */
  @property({ type: Array })
  modelNodes: number[] = [];

  /**
   * The visibility attribute represents the visibility of the node in the viewer.
   * It may be one of the following three states:
   * - `Shown` - The node and all of its children are visible.
   * - `Hidden` - The node and all of its children are hidden.
   * - `Mixed` - The node is visible, but some of its
   *   children are not visible.
   *
   * @type {BranchVisibility}
   */
  @property({ type: String })
  visibility: BranchVisibility = 'Shown';

  /**
   * Render the `types-tree-node` element into the DOM
   * if the nodeId is NaN it will return `nothing`, a value from Lit to let it
   * know not to add anything to the DOM.
   *
   * When the node visibility icon is clicked the
   * 'hoops-types-tree-node-visibility-change' event is emitted.
   *
   * If the hidden property change on the node the icon will change.
   *
   * @returns {The `<types-tree-node></types-tree-node>` content or nothing}
   */
  protected override render() {
    const handleClick = (event: MouseEvent) => {
      if (!Number.isNaN(this.modelNodeId)) {
        // Individual model node click
        this.onNodeClicked(this.modelNodeId, event);
      } else if (this.isTypeNode() && this.modelNodes.length > 0) {
        // Type node click - select all associated model nodes
        this.onTypeNodeClicked(this.modelNodes, event);
      }
    };

    const handleVisibilityClick = (event: MouseEvent) => {
      this.onVisibilityClicked(event);
    };

    return html`
      <div class="types-tree-node">
        <div class="content" @click=${handleClick} @auxclick=${handleClick}>
          <div class="title">${this.nodeName}</div>
        </div>
        <div class="visible-icon" @click=${handleVisibilityClick}>
          ${formatNodeVisibilityIcon(this.visibility)}
        </div>
      </div>
    `;
  }

  private onNodeClicked = (nodeId: number, event: MouseEvent) => {
    event.stopPropagation();
    // Dispatch a custom event with the nodeId
    this.dispatchEvent(
      new CustomEvent<{ nodeId: number; source: HTMLElement } & BaseMouseEvent>(
        'hoops-types-tree-node-click',
        {
          bubbles: true,
          composed: true,
          detail: {
            nodeId,
            source: this,
            ...toBaseMouseEvent(event),
          },
        },
      ),
    );
  };

  private onTypeNodeClicked = (nodeIds: number[], event: MouseEvent) => {
    event.stopPropagation();
    // Dispatch a custom event with all the nodeIds for type node selection
    this.dispatchEvent(
      new CustomEvent<{ nodeIds: number[]; source: HTMLElement; isTypeNode: boolean } & BaseMouseEvent>(
        'hoops-types-tree-type-node-click',
        {
          bubbles: true,
          composed: true,
          detail: {
            nodeIds,
            source: this,
            isTypeNode: true,
            ...toBaseMouseEvent(event),
          },
        },
      ),
    );
  };

  public isTypeNode(): boolean {
    return !(typeof this.modelNodeId === 'number' && !isNaN(this.modelNodeId));
  }

  private onVisibilityClicked = (event: MouseEvent) => {
    event.stopPropagation();
    const nodeIds = this.isTypeNode() ? this.modelNodes : [this.modelNodeId];
    const isVisible = this.visibility === 'Shown' ? false : true;

    // Dispatch a custom event with the nodeId for visibility change
    this.dispatchEvent(
      new CustomEvent<
        {
          nodeIds: number[];
          source: HTMLElement;
          visible: boolean;
          isTypeNode: boolean;
          treeNodeId: number;
        } & BaseMouseEvent
      >('hoops-types-tree-node-visibility-change', {
        bubbles: true,
        composed: true,
        detail: {
          nodeIds: nodeIds,
          source: this,
          visible: isVisible,
          isTypeNode: this.isTypeNode(),
          treeNodeId: this.nodeId,
          ...toBaseMouseEvent(event),
        },
      }),
    );
  };
}
