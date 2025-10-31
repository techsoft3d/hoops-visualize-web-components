import { css, html, LitElement, nothing, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import '../icons/hoops-icon';
import type { TreeItemExpandEvent } from './custom-events.d.ts';

/**
 * @hoops-tree-item
 * A custom element representing a tree item in a hierarchical structure.
 * It supports expansion and selection states, and can contain child elements.
 *
 * This component emits custom events for expansion (hoops-tree-item-expand)
 * and selection (hoops-tree-item-select) changes, allowing parent components
 * to respond to user interactions such as expanding/collapsing items
 * and selecting items.
 *
 * It is a very simple component that does not hold much logic. It is only responsible for rendering
 * the item label, icon, and children, and handling user interactions (expansion & selection).
 * it is meant to be used as a building block for trees without having to figure out how it works
 * internally.
 *
 * @fires hoops-tree-item-expand - Fired when the item is expanded or collapsed.
 * @fires hoops-tree-item-select - Fired when the item is selected or deselected.
 *
 * @slot - The default slot for the item label.
 * @slot icon - A named slot for an icon to be displayed next to the item label.
 * @slot children - A named slot for child elements, which will be displayed when the item is expanded.
 *
 * @csspart tree-item - The main container for the tree item.
 * @csspart expand-icon - The icon used to indicate expansion or collapse of the item.
 * @csspart children - The container for child elements, which can be expanded or collapsed.
 * @cssproperty --hoops-svg-accent-color - The accent color used for selected items.
 *
 * @todo integrate it in the HoopsTreeElement to create a unified tree system.
 * @todo move animations to a separate CSS file to share them and maintain them with ease.
 *
 */
@customElement('hoops-tree-item')
export class HoopsTreeItemElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        --scale-in-anim: scale-in-ver-top 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        --scale-out-anim: scale-out-ver-top 0.25s cubic-bezier(0.55, 0.085, 0.68, 0.53) both;
      }

      @media (prefers-reduced-motion: reduce) {
        :host {
          --scale-in-anim: none;
          --scale-out-anim: none;
        }
      }

      .tree-item {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        user-select: none;
      }

      .tree-item::before {
        content: '';
        display: inline-block;
        position: absolute;
        z-index: -1;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: transparent;
      }

      .tree-item:hover::before {
        background-color: color-mix(in srgb, var(--hoops-svg-accent-color) 15%, transparent);
      }

      .tree-item.selected {
        font-weight: bold;
        color: var(--hoops-svg-accent-color);
        stroke: var(--hoops-svg-accent-color);
        fill: var(--hoops-svg-accent-color);
      }

      .expand-icon {
        color: var(--hoops-foreground);
        stroke: var(--hoops-svg-stroke-color);
        fill: var(--hoops-svg-fill-color);
      }

      .children {
        padding-left: 1.5rem;
        height: min-content;
      }

      .children.expanded:not(.no-anim) {
        -webkit-animation: var(--scale-in-anim);
        animation: var(--scale-in-anim);
      }

      .children.collapsed:not(.no-anim) {
        -webkit-animation: var(--scale-out-anim);
        animation: var(--scale-out-anim);
      }

      @-webkit-keyframes scale-in-ver-top {
        0% {
          -webkit-transform: scaleY(0);
          transform: scaleY(0);
          -webkit-transform-origin: 100% 0%;
          transform-origin: 100% 0%;
          opacity: 1;
        }
        100% {
          -webkit-transform: scaleY(1);
          transform: scaleY(1);
          -webkit-transform-origin: 100% 0%;
          transform-origin: 100% 0%;
          opacity: 1;
        }
      }
      @keyframes scale-in-ver-top {
        0% {
          -webkit-transform: scaleY(0);
          transform: scaleY(0);
          -webkit-transform-origin: 100% 0%;
          transform-origin: 100% 0%;
          opacity: 1;
        }
        100% {
          -webkit-transform: scaleY(1);
          transform: scaleY(1);
          -webkit-transform-origin: 100% 0%;
          transform-origin: 100% 0%;
          opacity: 1;
        }
      }

      @-webkit-keyframes scale-out-ver-top {
        0% {
          -webkit-transform: scaleY(1);
          transform: scaleY(1);
          -webkit-transform-origin: 100% 0%;
          transform-origin: 100% 0%;
          opacity: 1;
        }
        100% {
          -webkit-transform: scaleY(0);
          transform: scaleY(0);
          -webkit-transform-origin: 100% 0%;
          transform-origin: 100% 0%;
          opacity: 1;
        }
      }
      @keyframes scale-out-ver-top {
        0% {
          -webkit-transform: scaleY(1);
          transform: scaleY(1);
          -webkit-transform-origin: 100% 0%;
          transform-origin: 100% 0%;
          opacity: 1;
        }
        100% {
          -webkit-transform: scaleY(0);
          transform: scaleY(0);
          -webkit-transform-origin: 100% 0%;
          transform-origin: 100% 0%;
          opacity: 1;
        }
      }
    `,
  ];

  @property({ type: Boolean })
  expanded = false;

  @property({ type: Boolean })
  selected = false;

  @property({ type: Boolean })
  leaf = false;

  @property({ type: Boolean, attribute: 'no-anim' })
  noAnim = false;

  @state()
  hidden = true;

  constructor() {
    super();
    this.hidden = !this.expanded;

    this.addEventListener('hoops-tree-item-expand', (e: TreeItemExpandEvent) => {
      if (e.target !== this) {
        return; // Ensure the event is from this instance
      }
      this.expanded = e.detail.expanded;
    });
  }

  protected willUpdate(_: PropertyValues): void {
    if (this.expanded) {
      this.hidden = false;
    } else {
      setTimeout(() => {
        this.hidden = true;
      }, 250); // Delay hiding to allow animation to complete
    }
  }

  protected render(): unknown {
    return html`
      <div
        class=${classMap({
          'tree-item': true,
          selected: this.selected,
        })}
        @click=${(e: MouseEvent) => {
          e.stopPropagation();
          this.dispatchEvent(
            new CustomEvent('hoops-tree-item-select', {
              bubbles: true,
              composed: true,
              detail: {
                selected: !this.selected,
              },
            }),
          );
        }}
      >
        <div
          class="expand-icon"
          @click=${(e: Event) => {
            e.stopPropagation();
            this.dispatchEvent(
              new CustomEvent('hoops-tree-item-expand', {
                bubbles: true,
                composed: true,
                detail: {
                  expanded: !this.expanded,
                },
              }),
            );
          }}
        >
          <slot name="icon">
            ${this.leaf
              ? nothing
              : html` <hoops-icon
                  icon=${this.expanded ? 'downIcon' : 'rightIcon'}
                  style="width:1rem;"
                ></hoops-icon>`}
          </slot>
        </div>
        <slot></slot>
      </div>
      ${this.leaf
        ? nothing
        : html`<div
            ?hidden=${this.hidden}
            class=${classMap({
              children: true,
              'no-anim': this.noAnim,
              expanded: this.expanded,
              collapsed: !this.hidden && !this.expanded,
            })}
          >
            <slot name="children"></slot>
          </div>`}
    `;
  }
}

export default HoopsTreeItemElement;
