import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { icons } from '@ts3d-hoops/ui-kit';

@customElement('hoops-toolbar-layers')
export class HoopsLayersButtonElement extends LitElement {
  @property()
  color: 'default' | 'accent' = 'default';

  protected override render(): unknown {
    return html`<hoops-icon-button size="sm" title="Toggle layers" .color=${this.color}
      >${icons.layers}</hoops-icon-button
    >`;
  }
}

export default HoopsLayersButtonElement;
