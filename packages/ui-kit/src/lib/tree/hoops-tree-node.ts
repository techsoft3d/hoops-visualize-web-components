import { LitElement, html, css, nothing, HTMLTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import type { ContextWrapper } from './context';
import { treeContext } from './context';
import { BaseMouseEvent } from './types';
import { toBaseMouseEvent } from './utils';

export type * from './custom-events.d.ts';

/**
 * This class represent a node in a `hoops-tree`.
 *
 * @export
 * @class TreeNode
 * @typedef {TreeNode}
 * @extends {LitElement}
 */
@customElement('hoops-tree-node')
export default class TreeNode extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }

      .header {
        width: 100%;
        display: flex;
        flex-flow: row nowrap;
      }

      .expand-icon,
      .leaf-icon {
        width: 1.5rem;
        height: 1.5rem;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .leaf-icon {
        stroke: black;
        fill: black;
      }

      .expand-icon {
        cursor: pointer;
      }

      .expand-icon svg {
        width: 100%;
        height: 100%;
      }

      .expand-icon:hover {
        stroke: var(--hoops-accent-foreground-hover, var(--blue, #0078d4));
      }

      .children {
        display: none;
        padding-left: 0.5rem;
      }

      .children.expanded {
        display: block;
      }

      hoops-model-tree-node {
        width: 100%;
      }

      .node {
        color: var(--hoops-neutral-foreground-rest, color-mix(in srgb, #303030, #000000 20%));
        stroke: var(--hoops-neutral-foreground-rest, color-mix(in srgb, #303030, #000000 20%));
      }

      .node.selected {
        color: var(--hoops-accent-foreground-active, var(--blue, #0078d4));
        stroke: var(--hoops-accent-foreground-active, var(--blue, #0078d4));
      }

      .header-caption {
        width: calc(100% - 1.2rem);
      }
    `,
  ];

  /**
   * The context of the hoops-tree
   *
   * @type {?TreeContext}
   */
  @consume({ context: treeContext, subscribe: true })
  public tree?: ContextWrapper;

  /**
   * The id of the node in the tree.
   *
   * @type {number}
   */
  @property({ type: Number })
  public key: number = Number.NaN;

  /**
   * Whether the node is expanded or not
   *
   * @type {boolean}
   */
  @property({ type: Boolean })
  public expanded = false;

  /**
   * Whether the node is selected or not
   *
   * @type {boolean}
   */
  @property({ type: Boolean })
  public selected = false;

  /**
   * Wheteher or not a node is a leaaf.
   *
   * @type {boolean}
   */
  @property({ type: Boolean })
  public leaf = false;

  render() {
    if (Number.isNaN(this.key) || !this.tree) {
      return nothing;
    }

    const classNames = ['node'];
    if (this.selected) {
      classNames.push('selected');
    }

    return html`<div
      class=${classNames.join(' ')}
      @click=${this.handleNodeClick}
      @auxclick=${this.handleNodeAuxClick}
    >
      <div class="header">
        ${this.getExpandIcon()}
        <div class="header-caption">
          ${this.tree.context.getContent(
            this.tree.context,
            this.key,
            this.selected,
            this.tree.context.nodesData ? this.tree.context.nodesData[this.key] : undefined,
          )}
        </div>
      </div>
      <div class=${`children ${this.expanded ? 'expanded' : ''}`}>
        <slot></slot>
      </div>
    </div>`;
  }

  /**
   * Handles click on the expand icon.
   *
   * This will stop the propagation of the click and propagate a
   * hoops-tree-node-expand with information about the clicked node.
   *
   * @emits TreeNode#hoops-tree-node-expand
   *
   * @param {MouseEvent} event The event that triggered the listener.
   */
  private handleExpandClick(event: MouseEvent) {
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent<{ key: number; expanded: boolean; source: HTMLElement } & BaseMouseEvent>(
        'hoops-tree-node-expand',
        {
          bubbles: true,
          composed: true,
          detail: {
            key: this.key,
            expanded: !this.expanded,
            ...toBaseMouseEvent(event),
            source: this,
          },
        },
      ),
    );
  }

  /**
   * Handles click on the node.
   *
   * This will stop the propagation of the click and propagate a
   * hoops-tree-node-click with information about the clicked node.
   *
   * @emits TreeNode#hoops-tree-node-click
   *
   * @param {MouseEvent} event The event that triggered the listener.
   */
  private handleNodeClick(event: MouseEvent) {
    event.stopPropagation();
    const target = event.target as TreeNode;
    const detail = {
      key: this.key,
      ...toBaseMouseEvent(event),
      source: target,
    };

    this.dispatchEvent(
      new CustomEvent<{ key: number; source: HTMLElement } & BaseMouseEvent>(
        'hoops-tree-node-click',
        {
          bubbles: true,
          composed: true,
          detail,
        },
      ),
    );
  }

  /**
   * Handles right click on the node.
   *
   * This will stop the propagation of the aux click and propagate a
   * hoops-tree-node-aux-click with information about the clicked node.
   *
   * @emits TreeNode#hoops-tree-node-aux-click
   *
   * @param {MouseEvent} event The event that triggered the listener.
   */
  private handleNodeAuxClick(event: MouseEvent) {
    event.stopPropagation();
    const target = event.target as TreeNode;
    const detail = {
      key: this.key,
      ...toBaseMouseEvent(event),
      source: target,
    };

    this.dispatchEvent(
      new CustomEvent<{ key: number; source: HTMLElement } & BaseMouseEvent>(
        'hoops-tree-node-aux-click',
        {
          bubbles: true,
          composed: true,
          detail,
        },
      ),
    );
  }

  /**
   * Get the expand/collapse icon for a node. If a node is a leaf, it does not
   * make sense to have an expand/collapse icon but you may want to provide an
   * icon for the leafs which is supported by TreeContext
   *
   * @returns {(HTMLTemplateResult | typeof nothing)}
   */
  private getExpandIcon(): HTMLTemplateResult | typeof nothing {
    if (!this.tree) {
      return nothing;
    }

    if (this.leaf) {
      return html`<div class="leaf-icon">${this.tree.context.leafIcon ?? nothing}</div>`;
    }
    let icon = this.tree.context.collapsedIcon;
    if (this.expanded) {
      icon = this.tree.context.expandedIcon;
    }

    return html`<div class="expand-icon" @click=${this.handleExpandClick}>${icon}</div>`;
  }
}
