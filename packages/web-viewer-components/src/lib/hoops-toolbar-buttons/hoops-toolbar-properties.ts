import { icons } from '@ts3d-hoops/ui-kit';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hoops-toolbar-properties')
export class HoopsPropertiesButtonElement extends LitElement {
  @property()
  color: 'default' | 'accent' = 'default';

  protected override render(): unknown {
    return html`<hoops-icon-button title="Toggle properties" .color=${this.color}
      >${icons.search}</hoops-icon-button
    >`;
  }
}

export default HoopsPropertiesButtonElement;
