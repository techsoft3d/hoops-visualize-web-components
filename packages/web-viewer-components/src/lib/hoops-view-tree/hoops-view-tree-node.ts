import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { componentBaseStyle } from '@ts3d-hoops/ui-kit';

/**
 * The ViewTreeNode class implements a custom elements register with the tag
 * `hoops-view-tree-node`.
 * This component represent a node in the `hoops-view-tree` component. It
 * contains properties to display to the user.
 *
 * The ViewTreeNode does not have any dependency to the @ts3d-hoops/web-viewer Model
 * class.
 *
 * @prop {number} nodeId The id of the node in the model
 * @prop {string} nodeName The name of the node
 *
 * @export
 * @class ViewTreeNode
 * @typedef {ViewTreeNode}
 * @extends {LitElement}
 */
@customElement('hoops-view-tree-node')
export class ViewTreeNode extends LitElement {
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
        color: var(--hoops-accent-foreground-hover);
        stroke: var(--hoops-accent-foreground-hover);
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
        color: var(--hoops-accent-foreground-hover);
        stroke: var(--hoops-accent-foreground-hover);
        fill: var(--hoops-accent-foreground-hover);
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

  /**
   * Render the `view-tree-node` element into the DOM
   * if the nodeId is NaN it will return `nothing`, a value from Lit to let it
   * know not to add anything to the DOM.
   *
   * When the node visibility icon is clicked the
   * 'hoops-view-tree-node-visibility-change' event is emitted.
   *
   * If the hidden property change on the node the icon will change.
   *
   * @returns {The `<view-tree-node></view-tree-node>` content or nothing}
   */
  protected override render() {
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
