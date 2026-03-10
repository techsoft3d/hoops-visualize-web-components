import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { icons } from '@ts3d-hoops/ui-kit';

/**
 * Displays the toolbar button used to toggle the model tree panel.
 *
 * @element hoops-toolbar-model-tree
 *
 * @attribute {'default' | 'accent'} color - Color style for the button
 *
 * @example
 * ```html
 * <hoops-toolbar-model-tree color="accent"></hoops-toolbar-model-tree>
 * ```
 *
 * @since 2025.7.0
 */
@customElement('hoops-toolbar-model-tree')
export class HoopsModelTreeButtonElement extends LitElement {
  @property()
  color: 'default' | 'accent' = 'default';

  /** @internal */
  protected override render(): unknown {
    return html`<hoops-icon-button size="sm" title="Toggle model tree" .color=${this.color}
      >${icons.modelTree}</hoops-icon-button
    >`;
  }
}

export default HoopsModelTreeButtonElement;
