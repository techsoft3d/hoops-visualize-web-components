import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

import './hoops-tools-select-group';
import './measurements/hoops-tools-measurement-group';
import './hoops-tools-redline-group';
import './hoops-tools-markup-group';

@customElement('hoops-tools-panel')
export class HoopsToolsPanelElement extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .hoops-tools-panel {
      display: flex;
      flex-direction: column;
    }

    .tools-group {
      display: flex;
      gap: 0.5rem;
      padding: 0.5rem;
      border: none;
      border-bottom: 1px solid var(--hoops-neutral-border, #303030);
    }
  `;

  render() {
    return html`
      <div class="hoops-tools-panel">
        <hoops-tools-select-group></hoops-tools-select-group>
        <hoops-tools-measurement-group></hoops-tools-measurement-group>
        <hoops-tools-redline-group></hoops-tools-redline-group>
        <hoops-tools-markup-group></hoops-tools-markup-group>
        <slot></slot>
      </div>
    `;
  }
}

export default HoopsToolsPanelElement;
