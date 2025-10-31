import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
 * Basic vertical toolbar to stack buttons
 *
 * @export
 * @class Toolbar
 * @typedef {Toolbar}
 * @extends {LitElement}
 */
@customElement('hoops-toolbar')
export class Toolbar extends LitElement {
  static styles = [
    css`
      .toolbar {
        display: flex;
        flex-direction: column;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        gap: 0.1rem;
        align-items: center;
        width: 48px;
        height: calc(100% - 1rem);
        overflow: visible;
        --hoops-dropdown-gap: 0.8rem;
      }
    `,
  ];

  protected override render(): unknown {
    return html`<div class="toolbar">
      <slot></slot>
    </div>`;
  }
}

export default Toolbar;
