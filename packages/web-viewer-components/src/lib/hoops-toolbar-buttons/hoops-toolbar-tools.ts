import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { icons } from '@ts3d-hoops/ui-kit';

/**
 * Displays the toolbar button used to open the tools panel.
 *
 * @element hoops-toolbar-tools
 *
 * @attribute {'default' | 'accent'} color - Color style for the button
 *
 * @example
 * ```html
 * <hoops-toolbar-tools color="accent"></hoops-toolbar-tools>
 * ```
 *
 * @since 2025.7.0
 */
@customElement('hoops-toolbar-tools')
export class HoopsToolsButtonElement extends LitElement {
  @property()
  color: 'default' | 'accent' = 'default';

  /** @internal */
  protected override render(): unknown {
    return html`<hoops-icon-button size="sm" title="Open tools panel" .color=${this.color}
      >${icons.toolsIcon}</hoops-icon-button
    >`;
  }
}

export default HoopsToolsButtonElement;
