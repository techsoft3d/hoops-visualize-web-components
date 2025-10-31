import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { icons } from '@ts3d-hoops/ui-kit';

@customElement('hoops-toolbar-views')
export class HoopsViewsButtonElement extends LitElement {
  @property()
  color: 'default' | 'accent' = 'default';

  protected override render(): unknown {
    return html`<hoops-icon-button size="sm" title="Toggle views" .color=${this.color}
      >${icons.viewIcon}</hoops-icon-button
    >`;
  }
}

export default HoopsViewsButtonElement;
