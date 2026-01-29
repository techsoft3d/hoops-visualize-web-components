import { LitElement, css, html } from 'lit-element';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import '../icons/hoops-icon';

/**
 * A custom web component that implements an accessible accordion using LitElement.
 *
 * @element hoops-accordion
 *
 * @slot header - Slot for the accordion header content
 * @slot toolbar - Slot for the accordion header toolbar
 * @slot icon - Slot for the accordion icon, defaults to an arrow icon
 * @slot content - Slot for the accordion content
 *
 * @csspart button - The button element that toggles the accordion
 * @csspart panel - The panel element that contains the accordion content
 *
 * @cssprop --hoops-svg-accent-color - The accent color for the accordion
 * @cssprop --hoops-svg-fill-color - The fill color for the accordion icon
 * @cssprop --hoops-background - The background color for the accordion panel
 * @cssprop --hoops-neutral-background-50 - The background color of accordion button
 * @cssprop --hoops-foreground - The foreground color for the accordion text
 *
 * @fires change - Dispatched when the accordion is toggled
 *
 * @attribute {boolean} expanded - Indicates whether the accordion is expanded
 * @attribute {boolean} disabled - Indicates whether the accordion is disabled
 * @attribute {number} level - The aria-level attribute for the heading element
 *
 * @example <hoops-accordion expanded><span slot="header">My Header</span><div slot="content">Content here</div></hoops-accordion>
 *
 * @since 2025.8.0
 */
@customElement('hoops-accordion')
export class HoopsAccordion extends LitElement {
  @property({ type: Boolean })
  expanded = false;

  @property({ type: Boolean })
  disabled = false;

  @property({ type: Number })
  level?: number;

  static styles = css`
    :host {
      display: block;
    }

    button {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 0.5rem;
      background-color: var(--hoops-neutral-background-50, #f0f0f0);
      color: var(--hoops-foreground, #303030);
      cursor: pointer;
      border: none;
      text-align: left;
      outline: none;
      font-size: 1.25rem;
    }

    slot[name='header']::slotted(*) {
      flex-grow: 1;
    }

    button[disabled] {
      cursor: not-allowed;
      filter: grayscale(1);
    }

    hoops-icon {
      display: flex;
      align-items: center;
      margin-left: 0.5rem;
      width: 2rem;
      height: 2rem;
      stroke: var(--hoops-foreground, #303030);
    }

    .panel {
      background-color: var(--hoops-background, #fafafa);
      color: var(--hoops-foreground, #303030);
      height: 100%;
      display: none;
      border: solid 1px var(--hoops-neutral-foreground-20, #1181d7);
    }

    .panel[aria-hidden='false'] {
      display: block;
    }

    .expandIcon {
      stroke: var(--hoops-foreground, #303030);
    }
  `;

  render() {
    return html`
      <div>
        <div role="heading" aria-level=${ifDefined(this.level)}>
          <button
            class="accordion-button"
            ?disabled=${this.disabled}
            role="button"
            aria-expanded=${this.expanded}
            aria-disabled=${this.disabled}
          >
            <slot name="header" @click=${this._toggle}></slot>
            <slot name="toolbar"></slot>
            <slot name="icon" @click=${this._toggle}>
              <hoops-icon
                class="expandIcon"
                icon=${this.expanded ? 'downIcon' : 'rightIcon'}
              ></hoops-icon>
            </slot>
          </button>
        </div>
        <div class="panel" role="region" aria-hidden=${!this.expanded}>
          <slot name="content"></slot>
        </div>
      </div>
    `;
  }

  /**
   * Toggles the accordion's expanded state.
   * @internal
   */
  private _toggle() {
    if (this.disabled) {
      return;
    }

    this.expanded = !this.expanded;
    this.dispatchEvent(new Event('change'));
  }
}

export default HoopsAccordion;
