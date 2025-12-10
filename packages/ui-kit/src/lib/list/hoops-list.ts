import { LitElement, html, css, HTMLTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { provide } from '@lit/context';
import type { ContextWrapper } from './context';
import { listContext } from './context';

import './hoops-list-element';
import './custom-events.d.ts';

/**
 * Provides a list view component for displaying sortable elements.
 *
 * @element hoops-list
 *
 * @example
 * ```html
 * <hoops-list></hoops-list>
 *
 * <script>
 *   const list = document.getElementsByTagName("hoops-list")[0];
 *   list.list = {
 *     context: {
 *       elementsData: new Map([[1, 'Item A'], [2, 'Item B']]),
 *       sortedByValue: true,
 *       getContent: (context, key, selected) => `${key}: ${context.elementsData.get(key)}`
 *     }
 *   };
 *   list.selected = [1];
 * </script>
 * ```
 *
 * @since 2025.8.0
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
   * Array of selected element keys. Reassign to trigger updates.
   *
   * @default []
   */
  @property({ attribute: false })
  public selected: number[] = [];

  /**
   * Context wrapper providing list data access methods. Reassign to trigger updates.
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
   * Triggers a re-render by reassigning list context.
   *
   * @returns void
   */
  public updateContext(): void {
    this.list = { ...this.list };
  }

  /**
   * Triggers a re-render by reassigning selected elements.
   *
   * @returns void
   */
  public updateSelected(): void {
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
   * Generates HTML template for a list element.
   *
   * @internal
   * @param elementKey - The element's unique key
   * @param selected - Whether the element is selected
   * @returns HTML template for the element
   */
  private getElementHtml(elementKey: number, selected: boolean): HTMLTemplateResult {
    return html`<hoops-list-element class="element" key=${elementKey} ?selected=${selected}>
    </hoops-list-element>`;
  }
}
