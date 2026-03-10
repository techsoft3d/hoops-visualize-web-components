import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '@ts3d-hoops/ui-kit';

/**
 * Provides an accordion wrapper for tool groups in the tools panel.
 *
 * @element hoops-tools-group
 *
 * @slot toolbar - Slot for group toolbar actions
 * @slot - Slot for group content
 *
 * @attribute {string} label - Header text displayed for the group
 *
 * @example
 * ```html
 * <hoops-tools-group label="Selection">
 *   <div>Group content</div>
 * </hoops-tools-group>
 * ```
 *
 * @since 2025.7.0
 */
@customElement('hoops-tools-group')
export class HoopsToolsGroupElement extends LitElement {
  /** @internal */
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: String })
  label = '';

  /** @internal */
  protected override render(): unknown {
    return html`
      <hoops-accordion>
        <div class="label" slot="header">${this.label}</div>
        <div class="toolbar" slot="toolbar">
          <slot name="toolbar"></slot>
        </div>
        <div class="content" slot="content">
          <slot></slot>
        </div>
      </hoops-accordion>
    `;
  }
}

export default HoopsToolsGroupElement;
