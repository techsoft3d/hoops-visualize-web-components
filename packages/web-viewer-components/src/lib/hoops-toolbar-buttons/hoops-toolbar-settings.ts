import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { icons } from '@ts3d-hoops/ui-kit';

@customElement('hoops-toolbar-settings')
export class HoopsSettingsButtonElement extends LitElement {
  @property()
  color: 'default' | 'accent' = 'default';

  protected override render(): unknown {
    return html`<hoops-icon-button size="sm" title="Toggle settings panel" .color=${this.color}
      >${icons.settings}</hoops-icon-button
    >`;
  }
}

export default HoopsSettingsButtonElement;
