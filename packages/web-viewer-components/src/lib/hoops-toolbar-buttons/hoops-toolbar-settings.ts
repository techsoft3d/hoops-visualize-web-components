import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { icons } from '@ts3d-hoops/ui-kit';

/**
 * Displays the toolbar button used to toggle the settings panel.
 *
 * @element hoops-toolbar-settings
 *
 * @attribute {'default' | 'accent'} color - Color style for the button
 *
 * @example
 * ```html
 * <hoops-toolbar-settings color="accent"></hoops-toolbar-settings>
 * ```
 *
 * @since 2025.7.0
 */
@customElement('hoops-toolbar-settings')
export class HoopsSettingsButtonElement extends LitElement {
  @property()
  color: 'default' | 'accent' = 'default';

  /** @internal */
  protected override render(): unknown {
    return html`<hoops-icon-button size="sm" title="Toggle settings panel" .color=${this.color}
      >${icons.settings}</hoops-icon-button
    >`;
  }
}

export default HoopsSettingsButtonElement;
