import { icons } from '@ts3d-hoops/ui-kit';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Displays the toolbar button used to toggle the properties panel.
 *
 * @element hoops-toolbar-properties
 *
 * @attribute {'default' | 'accent'} color - Color style for the button
 *
 * @example
 * ```html
 * <hoops-toolbar-properties color="accent"></hoops-toolbar-properties>
 * ```
 *
 * @since 2025.7.0
 */
@customElement('hoops-toolbar-properties')
export class HoopsPropertiesButtonElement extends LitElement {
  @property()
  color: 'default' | 'accent' = 'default';

  /** @internal */
  protected override render(): unknown {
    return html`<hoops-icon-button title="Toggle properties" .color=${this.color}
      >${icons.search}</hoops-icon-button
    >`;
  }
}

export default HoopsPropertiesButtonElement;
