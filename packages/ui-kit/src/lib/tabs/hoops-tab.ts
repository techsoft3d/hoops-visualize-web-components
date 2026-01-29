import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * A single tab panel component to be used within `hoops-tabs`.
 *
 * This component represents a single tab with its label and content.
 * It should always be used as a child of `hoops-tabs`.
 *
 * @element hoops-tab
 *
 * @slot - Default slot for the tab panel content
 *
 * @attribute {string} label - The label text displayed in the tab header
 * @attribute {string} value - Optional value identifier for the tab
 * @attribute {string} icon - Optional icon to display in the tab header
 * @attribute {boolean} disabled - Whether the tab is disabled
 *
 * @example
 * ```html
 * <hoops-tab label="Settings" value="settings">
 *   <div>Settings content here</div>
 * </hoops-tab>
 * ```
 *
 * @since 2026.1.0
 */
@customElement('hoops-tab')
export class HoopsTabElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        height: 100%;
      }

      .panel {
        height: 100%;
        box-sizing: border-box;
      }
    `,
  ];

  /**
   * The label text displayed in the tab header.
   *
   * @default ''
   */
  @property({ type: String })
  label = '';

  /**
   * Optional value identifier for the tab.
   * Can be used with `selectByValue()` on the parent `hoops-tabs`.
   *
   * @default undefined
   */
  @property({ type: String })
  value?: string;

  /**
   * Optional icon to display before the label in the tab header.
   *
   * @default undefined
   */
  @property({ type: String })
  icon?: string;

  /**
   * Whether the tab is disabled and cannot be selected.
   *
   * @default false
   */
  @property({ type: Boolean })
  disabled = false;

  /**
   * Renders the tab panel content.
   *
   * @returns The template result
   * @internal
   */
  render() {
    return html`
      <div class="panel" role="tabpanel">
        <slot></slot>
      </div>
    `;
  }
}
