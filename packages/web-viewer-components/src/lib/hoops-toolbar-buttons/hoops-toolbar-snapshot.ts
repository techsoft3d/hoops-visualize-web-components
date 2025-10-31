import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { icons } from '@ts3d-hoops/ui-kit';

@customElement('hoops-toolbar-snapshot')
export class HoopsSnapshotButtonElement extends LitElement {
  protected override render(): unknown {
    return html`<hoops-icon-button size="sm" title="Take snapshot"
      >${icons.snapshot}</hoops-icon-button
    >`;
  }
}

export default HoopsSnapshotButtonElement;
