import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '@ts3d-hoops/ui-kit';

@customElement('hoops-tools-group')
export class HoopsToolsGroupElement extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: String })
  label = '';

  render() {
    return html`
      <hoops-accordion>
        <div class="label" slot="header">${this.label}</div>
        <div class="toolbar" slot="toolbar">
          <slot name="toolbar"></slot>
        </div>
        <div class="content" slot="content">
          <slot></slot>
        </div>
      </hoops-accordion>
    `;
  }
}

export default HoopsToolsGroupElement;
