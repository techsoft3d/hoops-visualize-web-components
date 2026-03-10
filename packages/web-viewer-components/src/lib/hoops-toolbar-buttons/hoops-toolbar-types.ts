import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { icons } from '@ts3d-hoops/ui-kit';

/**
 * Displays the toolbar button used to toggle the types panel.
 *
 * @element hoops-toolbar-types
 *
 * @attribute {'default' | 'accent'} color - Color style for the button
 *
 * @example
 * ```html
 * <hoops-toolbar-types color="accent"></hoops-toolbar-types>
 * ```
 *
 * @since 2025.7.0
 */
@customElement('hoops-toolbar-types')
export class HoopsTypesButtonElement extends LitElement {
  @property()
  color: 'default' | 'accent' = 'default';

  /** @internal */
  protected override render(): unknown {
    return html`<hoops-icon-button size="sm" title="Toggle types" .color=${this.color}
      >${icons.typesIcon}</hoops-icon-button
    >`;
  }
}

export default HoopsTypesButtonElement;
