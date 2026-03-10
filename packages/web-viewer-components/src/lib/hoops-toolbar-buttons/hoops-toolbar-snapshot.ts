import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { icons } from '@ts3d-hoops/ui-kit';

/**
 * Displays the toolbar button used to capture a viewer snapshot.
 *
 * @element hoops-toolbar-snapshot
 *
 * @example
 * ```html
 * <hoops-toolbar-snapshot></hoops-toolbar-snapshot>
 * ```
 *
 * @since 2025.7.0
 */
@customElement('hoops-toolbar-snapshot')
export class HoopsSnapshotButtonElement extends LitElement {
  /** @internal */
  protected override render(): unknown {
    return html`<hoops-icon-button size="sm" title="Take snapshot"
      >${icons.snapshot}</hoops-icon-button
    >`;
  }
}

export default HoopsSnapshotButtonElement;
