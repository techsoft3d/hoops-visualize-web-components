import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

import './hoops-tools-select-group';
import './measurements/hoops-tools-measurement-group';
import './hoops-tools-redline-group';
import './hoops-tools-markup-group';

/**
 * Provides the tools panel container and renders built-in tool groups.
 *
 * @element hoops-tools-panel
 *
 * @slot - Slot for additional custom tool groups
 *
 * @example
 * ```html
 * <hoops-tools-panel></hoops-tools-panel>
 * ```
 *
 * @since 2025.7.0
 */
@customElement('hoops-tools-panel')
export class HoopsToolsPanelElement extends LitElement {
  /** @internal */
  static styles = css`
    :host {
      display: block;
    }

    .hoops-tools-panel {
      display: flex;
      flex-direction: column;
    }

    .tools-group {
      display: flex;
      gap: 0.5rem;
      padding: 0.5rem;
      border: none;
      border-bottom: 1px solid var(--hoops-neutral-border, #303030);
    }
  `;

  /** @internal */
  protected override render(): unknown {
    return html`
      <div class="hoops-tools-panel">
        <hoops-tools-select-group></hoops-tools-select-group>
        <hoops-tools-measurement-group></hoops-tools-measurement-group>
        <hoops-tools-redline-group></hoops-tools-redline-group>
        <hoops-tools-markup-group></hoops-tools-markup-group>
        <slot></slot>
      </div>
    `;
  }
}

export default HoopsToolsPanelElement;
