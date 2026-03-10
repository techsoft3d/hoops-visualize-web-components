import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { icons } from '@ts3d-hoops/ui-kit';

/**
 * Displays the toolbar button used to toggle the layers panel.
 *
 * @element hoops-toolbar-layers
 *
 * @attribute {'default' | 'accent'} color - Color style for the button
 *
 * @example
 * ```html
 * <hoops-toolbar-layers color="accent"></hoops-toolbar-layers>
 * ```
 *
 * @since 2025.7.0
 */
@customElement('hoops-toolbar-layers')
export class HoopsLayersButtonElement extends LitElement {
  @property()
  color: 'default' | 'accent' = 'default';

  /** @internal */
  protected override render(): unknown {
    return html`<hoops-icon-button size="sm" title="Toggle layers" .color=${this.color}
      >${icons.layers}</hoops-icon-button
    >`;
  }
}

export default HoopsLayersButtonElement;
