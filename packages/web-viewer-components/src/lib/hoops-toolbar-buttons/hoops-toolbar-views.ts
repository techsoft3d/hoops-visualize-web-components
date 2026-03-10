import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { icons } from '@ts3d-hoops/ui-kit';

/**
 * Displays the toolbar button used to toggle the views panel.
 *
 * @element hoops-toolbar-views
 *
 * @attribute {'default' | 'accent'} color - Color style for the button
 *
 * @example
 * ```html
 * <hoops-toolbar-views color="accent"></hoops-toolbar-views>
 * ```
 *
 * @since 2025.7.0
 */
@customElement('hoops-toolbar-views')
export class HoopsViewsButtonElement extends LitElement {
  @property()
  color: 'default' | 'accent' = 'default';

  /** @internal */
  protected override render(): unknown {
    return html`<hoops-icon-button size="sm" title="Toggle views" .color=${this.color}
      >${icons.viewIcon}</hoops-icon-button
    >`;
  }
}

export default HoopsViewsButtonElement;
