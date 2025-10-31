import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { icons } from '@ts3d-hoops/ui-kit';

@customElement('hoops-info-button')
export class InfoButton extends LitElement {
  @property({ reflect: true })
  tabindex = '0';

  @property({ reflect: true })
  role = 'button';

  @property()
  size = 'md';

  @property()
  color: 'default' | 'accent' = 'default';

  protected override render(): unknown {
    return html`<hoops-icon-button
      tabindex=${this.tabIndex}
      color=${this.color}
      role=${this.role}
      size=${this.size}
    >
      ${icons.info}
    </hoops-icon-button>`;
  }
}

export default InfoButton;
