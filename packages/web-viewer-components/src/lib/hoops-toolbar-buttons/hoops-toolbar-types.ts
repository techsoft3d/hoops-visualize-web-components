import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { icons } from '@ts3d-hoops/ui-kit';

@customElement('hoops-toolbar-types')
export class HoopsTypesButtonElement extends LitElement {
  @property()
  color: 'default' | 'accent' = 'default';

  protected override render(): unknown {
    return html`<hoops-icon-button size="sm" title="Toggle types" .color=${this.color}
      >${icons.typesIcon}</hoops-icon-button
    >`;
  }
}

export default HoopsTypesButtonElement;
