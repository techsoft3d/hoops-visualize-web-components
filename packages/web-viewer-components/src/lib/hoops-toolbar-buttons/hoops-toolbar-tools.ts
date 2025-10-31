import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { icons } from '@ts3d-hoops/ui-kit';

@customElement('hoops-toolbar-tools')
export class HoopsToolsButtonElement extends LitElement {
  @property()
  color: 'default' | 'accent' = 'default';

  protected override render(): unknown {
    return html`<hoops-icon-button size="sm" title="Open tools panel" .color=${this.color}
      >${icons.toolsIcon}</hoops-icon-button
    >`;
  }
}

export default HoopsToolsButtonElement;
