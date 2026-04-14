import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { componentBaseStyle } from '@ts3d-hoops/ui-kit';

/**
 * A node element representing a single sheet entry in the sheet list.
 *
 * @element hoops-sheet-list-node
 *
 * @attribute {number} nodeId - The sheet node id in the model
 * @attribute {string} nodeName - Display name of the sheet
 *
 * @example
 * ```html
 * <hoops-sheet-list-node nodeId="42" nodeName="Sheet 1"></hoops-sheet-list-node>
 * ```
 *
 * @since 2026.3.0
 */
@customElement('hoops-sheet-list-node')
export class SheetListNode extends LitElement {
  /** @internal */
  static styles = [
    componentBaseStyle,
    css`
      .sheet-list-node,
      .content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-flow: row nowrap;
      }

      .sheet-list-node.selected {
        color: var(--hoops-accent-foreground-hover, var(--blue, #0078d4));
        stroke: var(--hoops-accent-foreground-hover, var(--blue, #0078d4));
      }

      .content,
      .type-icon svg {
        width: 100%;
        height: 100%;
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
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    `,
  ];

  /**
   * The sheet node id.
   *
   * @type {number}
   */
  @property({ type: Number })
  nodeId = Number.NaN;

  /**
   * The display name of the sheet.
   *
   * @type {string}
   */
  @property({ type: String })
  nodeName = '';

  /** @internal */
  protected override render(): unknown {
    if (Number.isNaN(this.nodeId)) {
      return nothing;
    }

    return html`<div class="sheet-list-node ${this.selected ? 'selected' : ''}">
      <div class="content">
        <div class="title">${this.nodeName}</div>
      </div>
    </div>`;
  }

  /**
   * Whether the node is visually selected.
   *
   * @type {boolean}
   */
  @property({ type: Boolean })
  selected = false;
}
