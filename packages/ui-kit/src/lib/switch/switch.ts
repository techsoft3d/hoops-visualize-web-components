import { LitElement, css, html } from 'lit-element';
import { customElement, property } from 'lit/decorators.js';

/**
 * A switch component.
 *
 * @element hoops-switch
 *
 * @prop {boolean} checked - The switch state
 * @prop {boolean} disabled - Whether or not the switch is disabled
 * @prop {string} label - The switch label
 *
 * @cssprop {Color} --hoops-accent-foreground-active - The color of the switch when checked
 */
@customElement('hoops-switch')
export class HoopsSwitchElement extends LitElement {
  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      --slider-color: color-mix(
        in srgb,
        var(--hoops-background, blue),
        var(--hoops-foreground, red) 30%
      );
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 1.825rem;
      height: 1rem;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;

      background-color: var(--slider-color);
      box-shadow: 0 0 1px var(--slider-color);
      transition: 0.4s;
      border-radius: 1rem;
    }

    .slider.disabled {
      cursor: not-allowed;
    }

    .slider:before {
      position: absolute;
      content: '';
      height: 1rem;
      width: 1rem;
      left: 0;
      bottom: calc(50% - 0.5rem);
      background-color: var(--hoops-background, #fafafa);
      transition: 0.4s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: var(--hoops-accent-foreground-active, var(--blue, #0078d4));
    }

    input:checked + .slider.disabled {
      background-color: var(--hoops-accent-foreground-active, var(--blue, #0078d4));
      filter: grayscale(1);
    }

    input:checked + .slider:before {
      transform: translateX(0.825rem);
    }
  `;

  @property({ type: Boolean })
  checked = false;

  @property({ type: Boolean })
  disabled = false;

  /**
   * The label will appear as a tooltip when hovering over the switch (using
   * title attribute). It will also be used as the aria-label for accessibility.
   *
   * @type {string}
   */
  @property({ type: String })
  label = '';

  render() {
    return html`
      <label
        class="switch"
        role="switch"
        title=${this.label}
        aria-label=${this.label}
        aria-checked=${this.checked}
        @click=${(event: Event) => event.stopPropagation()}
      >
        <input
          type="checkbox"
          .checked="${this.checked}"
          ?disabled=${this.disabled}
          @change="${this._toggle}"
        />
        <span class=${['slider', this.disabled ? 'disabled' : ''].join(' ')}></span>
      </label>
    `;
  }

  private _toggle(event: Event) {
    if (this.disabled) {
      return;
    }

    event.stopPropagation();
    this.checked = (event.target as HTMLInputElement).checked;
    this.dispatchEvent(new Event('change'));
  }
}

export default HoopsSwitchElement;
