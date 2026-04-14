import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { icons } from '@ts3d-hoops/ui-kit';

/**
 * Displays the toolbar button used to toggle the sheets panel.
 *
 * @element hoops-toolbar-sheets
 *
 * @attribute {'default' | 'accent'} color - Color style for the button
 *
 * @example
 * ```html
 * <hoops-toolbar-sheets color="accent"></hoops-toolbar-sheets>
 * ```
 *
 * @since 2026.3.0
 */
@customElement('hoops-toolbar-sheets')
export class HoopsSheetsButtonElement extends LitElement {
  /**
   * The color style for the button.
   *
   * @type {'default' | 'accent'}
   */
  @property()
  color: 'default' | 'accent' = 'default';

  /** @internal */
  protected override render(): unknown {
    return html`<hoops-icon-button size="sm" title="Toggle sheets" .color=${this.color}
      >${icons.sheetsIcon}</hoops-icon-button
    >`;
  }
}

export default HoopsSheetsButtonElement;
