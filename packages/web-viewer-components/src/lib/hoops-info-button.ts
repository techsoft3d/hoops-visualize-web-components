import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { icons } from '@ts3d-hoops/ui-kit';

/**
 * Displays an information icon button for viewer UI actions.
 *
 * @element hoops-info-button
 *
 * @attribute {string} tabindex - Keyboard tab order index for the button
 * @attribute {string} role - ARIA role applied to the host
 * @attribute {string} size - Size variant passed to the underlying icon button
 * @attribute {'default' | 'accent'} color - Color style of the icon button
 *
 * @example
 * ```html
 * <hoops-info-button color="accent" size="sm"></hoops-info-button>
 * ```
 *
 * @since 2025.7.0
 */
@customElement('hoops-info-button')
export class InfoButton extends LitElement {
  @property({ reflect: true })
  tabindex = '0';

  @property({ reflect: true })
  role = 'button';

  @property()
  size = 'md';

  @property()
  color: 'default' | 'accent' = 'default';

  /** @internal */
  protected override render(): unknown {
    return html`<hoops-icon-button
      tabindex=${this.tabIndex}
      color=${this.color}
      role=${this.role}
      size=${this.size}
    >
      ${icons.info}
    </hoops-icon-button>`;
  }
}

export default InfoButton;
