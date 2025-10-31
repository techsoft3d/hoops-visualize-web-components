import { NodeType } from '@ts3d-hoops/web-viewer';
import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { componentBaseStyle } from '@ts3d-hoops/ui-kit';
import { formatNodeType, formatNodeTypeIcon, formatNodeVisibilityIcon } from './utils';
import type { BaseMouseEvent } from '@ts3d-hoops/ui-kit/tree';
import { toBaseMouseEvent } from '@ts3d-hoops/ui-kit/tree';
import type { BranchVisibility } from './types';

/**
 * The ModelTreeNode class implements a custom elements register with the tag
 * `hoops-model-tree-node`.
 * This component represent a node in the `hoops-model-tree` component. It
 * contains properties to display to the user.
 *
 * The ModelTreeNode does not have any dependency to the @ts3d-hoops/web-viewer Model
 * class.
 *
 * @prop {number} nodeId The id of the node in the model
 * @prop {string} nodeName The name of the node
 * @prop {number} nodeType The type of the node (casted into a `NodeType`)
 * @prop {boolean} isRoot The node is a root
 * @prop {boolean} hidden The visibility state of the node. By default boolean
 * args are recommended to be false so you can use this notation:
 * ```html
 * <hoops-model-tree-node></hoops-model-tree-node> <!-- <-- This node is visible -->
 * <hoops-model-tree-node hidden> <!-- <-- This node is hidden -->
 * </hoops-model-tree-node>
 * ```
 *
 * @export
 * @class ModelTreeNode
 * @typedef {ModelTreeNode}
 * @extends {LitElement}
 */
@customElement('hoops-model-tree-node')
export class ModelTreeNode extends LitElement {
  static styles = [
    componentBaseStyle,
    css`
      .model-tree-node,
      .content {
        display: flex;
        align-items: center;
        flex-flow: row nowrap;
      }

      .model-tree-node.selected {
        color: var(--hoops-accent-foreground-hover);
        stroke: var(--hoops-accent-foreground-hover);
        --hoops-svg-stroke-color: var(--hoops-accent-foreground-hover);
      }

      .type-icon,
      .visible-icon {
        width: 1.2rem;
        height: 1.2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
      }

      .content {
        width: calc(100% - 1.8rem);
      }

      .type-icon svg,
      .visible-icon svg {
        width: 100%;
        height: 100%;
      }

      .content .title {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .content:hover,
      .visible-icon:hover {
        color: var(--hoops-accent-foreground-hover);
        stroke: var(--hoops-accent-foreground-hover);
        fill: var(--hoops-accent-foreground-hover);
        --hoops-svg-stroke-color: var(--hoops-accent-foreground-hover);
      }

      .title {
        padding-left: calc(0.4rem);
        cursor: pointer;
      }
    `,
  ];

  /**
   * The id of the node to render.
   *
   * @type {number}
   */
  @property({ type: Number })
  nodeId = Number.NaN;

  /**
   * The name of the node to render.
   *
   * @type {string}
   */
  @property({ type: String })
  nodeName = '';

  /**
   * The type of the node to render.
   *
   * @type {number}
   */
  @property({ type: Number })
  nodeType = NodeType.Unknown;

  /**
   * If the node is a root.
   *
   * @type {boolean}
   */
  @property({ type: Boolean })
  isRoot = false;

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
   * Whether the node is selected or not.
   *
   * @type {boolean}
   */
  @property({ type: Boolean })
  selected = false;

  /**
   * Render the `model-tree-node` element into the DOM
   * if the nodeId is NaN it will return `nothing`, a value from Lit to let it
   * know not to add anything to the DOM.
   *
   * Otherwise, it returns an HTML Element that displays an icon based on the
   * type of the node, the name of the node and a clickable icon for the
   * visibility.
   *
   * When the node visibility icon is clicked the
   * 'hoops-model-tree-node-visibility-change' event is emitted.
   *
   * If the hidden property change on the node the icon will change.
   *
   * @returns {The `<model-tree-node></model-tree-node>` content or nothing}
   */
  protected override render() {
    /**
     * If the nodeId is NaN there is nothing to display so e return nothing to
     * lit.
     */
    if (Number.isNaN(this.nodeId)) {
      return nothing;
    }

    const classNames = ['model-tree-node'];
    if (this.selected) {
      classNames.push('selected');
    }

    return html`<div class=${classNames.join(' ')}>
      <div class="content">
        <div class="type-icon" title=${formatNodeType(this.nodeType)}>
          ${formatNodeTypeIcon(this.isRoot, this.nodeType)}
        </div>
        <div class="title" title=${this.nodeName}>${this.nodeName}</div>
      </div>
      <div class="visible-icon" @click=${this.onVisibilityClicked}>
        ${formatNodeVisibilityIcon(this.visibility)}
      </div>
    </div>`;
  }

  /**
   * Handles a click on the visibility icon.
   * It stops the propagation of the click event and emit a
   * 'hoops-model-tree-node-visibility-change' that provides the nodeId, the new
   * visibility and `this` element itself along with some mouse event
   * properties.
   * @param {MouseEvent} event The mouse event from the click on the node
   */
  private onVisibilityClicked(event: MouseEvent) {
    event.stopPropagation();
    let isVisible = true;
    switch (this.visibility) {
      case 'Shown':
        isVisible = false;
        break;
      case 'Hidden':
        isVisible = true;
        break;
      // Show everything if some children are hidden
      case 'Mixed':
        isVisible = true;
        break;
    }
    // dispatch visibility change
    this.dispatchEvent(
      new CustomEvent<
        { nodeId: number; visibility: boolean; source: HTMLElement } & BaseMouseEvent
      >('hoops-model-tree-node-visibility-change', {
        bubbles: true,
        composed: true,
        detail: {
          ...toBaseMouseEvent(event),
          nodeId: this.nodeId,
          visibility: isVisible,
          source: this,
        },
      }),
    );
  }
}
