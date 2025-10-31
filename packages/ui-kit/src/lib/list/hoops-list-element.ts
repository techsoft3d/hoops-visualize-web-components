import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ContextWrapper } from './context';
import { listContext } from './context';
import { BaseMouseEvent } from './types';
import { toBaseMouseEvent } from './utils';

/**
 * This class represent a element in a `hoops-list`.
 *
 * @export
 * @class ListElement
 * @typedef {ListElement}
 * @extends {LitElement}
 */
@customElement('hoops-list-element')
export default class ListElement extends LitElement {
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

      hoops-model-list-element {
        width: 100%;
      }

      .element {
        color: var(--hoops-neutral-foreground-rest);
        stroke: var(--hoops-neutral-foreground-rest);
      }

      .element.selected {
        color: var(--hoops-accent-foreground-active);
        stroke: var(--hoops-accent-foreground-active);
      }
    `,
  ];

  /**
   * The context of the hoops-list
   *
   * @type {?ListContext}
   */
  @consume({ context: listContext, subscribe: true })
  public list?: ContextWrapper;

  /**
   * The id of the element in the list.
   *
   * @type {number}
   */
  @property({ type: Number })
  public key: number = Number.NaN;

  /**
   * The displayed name of the element in the list.
   *
   * @type {string}
   */
  @property({ type: String })
  public name = '';

  /**
   * Whether the element is selected or not
   *
   * @type {boolean}
   */
  @property({ type: Boolean })
  public selected = false;

  render() {
    const classNames = ['element'];
    if (this.selected) {
      classNames.push('selected');
    }
    return html`<div class=${classNames.join(' ')} @click=${this.handleElementClick}>
      <div class="header" elementId=${this.key}>
        ${this.list?.context.getContent(this.list!.context, this.key, this.selected)}
        <slot></slot>
      </div>
    </div>`;
  }

  /**
   * Handles click on the element.
   *
   * This will stop the propagation of the click and propagate a
   * hoops-list-element-click with information about the clicked element.
   *
   * @emits ListElement#hoops-list-element-click
   *
   * @param {MouseEvent} event The event that triggered the listener.
   */
  private handleElementClick(event: MouseEvent) {
    event.stopPropagation();
    const target = event.target as ListElement;
    const detail = {
      key: this.key,
      ...toBaseMouseEvent(event),
      source: target,
    };
    this.dispatchEvent(
      new CustomEvent<{ key: number; source: HTMLElement } & BaseMouseEvent>(
        'hoops-list-element-click',
        {
          bubbles: true,
          composed: true,
          detail,
        },
      ),
    );
  }
}
