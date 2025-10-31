import { LitElement, html, css, HTMLTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { provide } from '@lit/context';
import type { ContextWrapper } from './context';
import { listContext } from './context';

import './hoops-list-element';
import './custom-events.d.ts';

/**
 * This class implements a list view as an HTML custom element. You can
 * integrate it in your application using the `hoops-list` tag.
 *
 * @export
 * @class List
 * @typedef {List}
 * @extends {LitElement}
 */
@customElement('hoops-list')
export default class List extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }

      .list {
        width: 100%;
        height: 100%;
      }
    `,
  ];

  /**
   * This property holds the selected elements in the list.
   * It is a reactive property so in order to update the component you need to
   * reassign the value (ie: this.selected = [...])
   *
   * @public
   * @type {number[]}
   */
  @property({ attribute: false })
  public selected: number[] = [];

  /**
   * The list context used to get the list elements data.
   * This is a reactive property that can be set externally but it cannot be
   * passed to the tag.
   *
   * To trigger an update when we edit the list we need to reassign it.
   * Usually you will reassign it to itself (ie: this.list = { ...this.list }).
   *
   * @public
   * @type {ListContext}
   */
  @provide({ context: listContext })
  @property({ attribute: false })
  public list = {
    context: {
      elementsData: undefined,
      sortedByValue: false,
      getContent(_context, key, _selected?) {
        return html`id: ${key}, value: ${this.elementsData?.get(key)}`;
      },
    },
  } as ContextWrapper;

  /**
   * This is a syntactic sugar to improve readability of updating the context.
   * this is equivalent to: `this.list = { ...this.list }`;
   *
   * @public
   */
  public updateContext() {
    this.list = { ...this.list };
  }

  /**
   * This is a syntactic sugar to improve readability of updating the selected.
   * this is equivalent to: `this.selected = [ ...this.selected ]`;
   *
   * @public
   */
  public updateSelected() {
    this.selected = [...this.selected];
  }

  protected override render(): unknown {
    if (this.list === undefined) {
      return html`<div class="list" />`;
    }
    let elements = this.list!.context!.elementsData;
    if (elements === undefined) {
      return html`<div class="list" />`;
    }

    if (this.list.context.sortedByValue === true) {
      elements = new Map([...elements].sort((a, b) => a[1].localeCompare(b[1])));
    }

    const elementsHtml: HTMLTemplateResult[] = [];
    elements.forEach((_value: string, key: number) => {
      const selected = this.selected.includes(key);
      elementsHtml.push(this.getElementHtml(key, selected));
    });

    return html`<div class="list">${elementsHtml}</div>`;
  }

  /**
   * Generate the HTML template for a element structure.
   *
   * @private
   * @param {number} [elementKey] ID of the element
   * @param {string} [elementName] Displayed name of the element
   * @param {boolean} [selected] Whether the element is selected
   * @returns {(HTMLTemplateResult)} a HTML template for the element
   * with support to expanding and click.
   */
  private getElementHtml(elementKey: number, selected: boolean): HTMLTemplateResult {
    return html`<hoops-list-element class="element" key=${elementKey} ?selected=${selected}>
    </hoops-list-element>`;
  }
}
