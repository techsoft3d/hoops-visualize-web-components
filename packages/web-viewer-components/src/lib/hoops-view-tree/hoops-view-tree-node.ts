import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { componentBaseStyle } from '@ts3d-hoops/ui-kit';

/**
 * A custom element representing a node in the view tree.
 *
 * This component displays a view tree node with its properties and interactive controls.
 * It does not have any dependency on the @ts3d-hoops/web-viewer Model class.
 *
 * @element hoops-view-tree-node
 *
 * @attribute {number} nodeId - The id of the node in the model
 * @attribute {string} nodeName - The name of the node
 *
 * @example
 * ```html
 * <hoops-view-tree-node nodeId="1" nodeName="View 1"></hoops-view-tree-node>
 * ```
 *
 * @since 2025.8.0
 */
@customElement('hoops-view-tree-node')
export class ViewTreeNode extends LitElement {
  /** @internal */
  static styles = [
    componentBaseStyle,
    css`
      .view-tree-node,
      .content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-flow: row nowrap;
      }

      .view-tree-node.selected {
        color: var(--hoops-accent-foreground-hover, var(--blue, #0078d4));
        stroke: var(--hoops-accent-foreground-hover, var(--blue, #0078d4));
      }

      .content,
      .type-icon svg {
        width: 100%;
        height: 100%;
      }

      .content .title {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .content:hover {
        color: var(--hoops-accent-foreground-hover, var(--blue, #0078d4));
        stroke: var(--hoops-accent-foreground-hover, var(--blue, #0078d4));
        fill: var(--hoops-accent-foreground-hover, var(--blue, #0078d4));
      }

      .title {
        width: 100%;
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

  /** @internal */
  protected override render(): unknown {
    /**
     * If the nodeId is NaN there is nothing to display so e return nothing to
     * lit.
     */
    if (Number.isNaN(this.nodeId)) {
      return nothing;
    }

    return html`<div class="view-tree-node">
      <div class="content">
        <div class="title">${this.nodeName}</div>
      </div>
    </div>`;
  }
}
