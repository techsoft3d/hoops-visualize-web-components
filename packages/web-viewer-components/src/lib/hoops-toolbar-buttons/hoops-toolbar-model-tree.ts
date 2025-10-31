import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { icons } from '@ts3d-hoops/ui-kit';

@customElement('hoops-toolbar-model-tree')
export class HoopsModelTreeButtonElement extends LitElement {
  @property()
  color: 'default' | 'accent' = 'default';

  protected override render(): unknown {
    return html`<hoops-icon-button size="sm" title="Toggle model tree" .color=${this.color}
      >${icons.modelTree}</hoops-icon-button
    >`;
  }
}

export default HoopsModelTreeButtonElement;
