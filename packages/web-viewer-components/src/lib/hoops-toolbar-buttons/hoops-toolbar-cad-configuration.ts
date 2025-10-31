import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { icons } from '@ts3d-hoops/ui-kit';

@customElement('hoops-toolbar-cad-configuration')
export class HoopsCadConfigurationButtonElement extends LitElement {
  @property()
  color: 'default' | 'accent' = 'default';

  protected override render(): unknown {
    return html`<hoops-icon-button size="sm" title="Toggle CAD configurations" .color=${this.color}
      >${icons.cadConfiguration}</hoops-icon-button
    >`;
  }
}

export default HoopsCadConfigurationButtonElement;
