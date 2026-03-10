import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { icons } from '@ts3d-hoops/ui-kit';

/**
 * Displays the toolbar button used to open CAD configuration controls.
 *
 * @element hoops-toolbar-cad-configuration
 *
 * @attribute {'default' | 'accent'} color - Color style for the button
 *
 * @example
 * ```html
 * <hoops-toolbar-cad-configuration color="accent"></hoops-toolbar-cad-configuration>
 * ```
 *
 * @since 2025.7.0
 */
@customElement('hoops-toolbar-cad-configuration')
export class HoopsCadConfigurationButtonElement extends LitElement {
  @property()
  color: 'default' | 'accent' = 'default';

  /** @internal */
  protected override render(): unknown {
    return html`<hoops-icon-button size="sm" title="Toggle CAD configurations" .color=${this.color}
      >${icons.cadConfiguration}</hoops-icon-button
    >`;
  }
}

export default HoopsCadConfigurationButtonElement;
