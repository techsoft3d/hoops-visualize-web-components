import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hoops-icon-button')
export default class HoopsIconButton extends LitElement {
  static styles = [
    css`
      :host {
        display: inline-block;
        user-select: none;
      }
      .container {
        border: none;
        display: flex;
        align-items: center;
        background-color: transparent;
        color: var(--hoops-neutral-foreground);
        transition: background-color linear 0.2s;
        justify-content: center;
        cursor: pointer;
        border-radius: 50%;
        overflow: hidden;
      }
      .container[color='default'] {
        color: var(--hoops-neutral-foreground);
      }
      .container[color='accent'] {
        color: var(--hoops-accent-foreground);
        --hoops-svg-stroke-color: var(--hoops-accent-foreground);
      }
      :host(:is(:hover, :active, :focus))
        .container[color='default']:not([hoopsdisabled]):is(:hover, :active, :focus) {
        color: var(--hoops-neutral-foreground-active);
        background-color: var(--hoops-neutral-background-hover, #303030cc);
      }
      :host(:is(:hover, :active, :focus))
        .container[color='accent']:not([hoopsdisabled]):is(:hover, :active, :focus) {
        color: var(--hoops-accent-foreground-active);
        background-color: var(--hoops-neutral-background-hover, #303030cc);
      }
      .container[size='xl'] {
        height: var(--hoops-xl-icon-button-size, 2.8rem);
        width: var(--hoops-xl-icon-button-size, 2.8rem);
      }
      [size='xl'] ::slotted(*) {
        width: var(--hoops-xl-icon-button-content-size, 2.6rem);
        height: var(--hoops-xl-icon-button-content-size, 2.6rem);
      }
      .container[size='md'] {
        height: var(--hoops-md-icon-button-size, 2rem);
        width: var(--hoops-md-icon-button-size, 2rem);
      }
      [size='md'] ::slotted(*) {
        width: var(--hoops-md-icon-button-content-size, 1.6rem);
        height: var(--hoops-md-icon-button-content-size, 1.6rem);
      }
      .container[size='sm'] {
        height: var(--hoops-sm-icon-button-size, 1.8rem);
        width: var(--hoops-sm-icon-button-size, 1.8rem);
      }
      [size='sm'] ::slotted(*) {
        width: var(--hoops-sm-icon-button-content-size, 1.2rem);
        height: var(--hoops-sm-icon-button-content-size, 1.2rem);
      }
      .container[hoopsdisabled] {
        cursor: auto;
        opacity: 0.25;
      }
    `,
  ];

  constructor() {
    super();
    this.addEventListener('keypress', this.handleKeypress);
  }

  handleKeypress(keypressEvent: KeyboardEvent) {
    if (keypressEvent.key === 'Space' || keypressEvent.key === 'Enter') {
      keypressEvent.preventDefault();
      keypressEvent.stopPropagation();
      if (!this.disabled) {
        this.click();
      }
    }
  }

  @property({ reflect: true })
  tabindex = '0';

  @property({ reflect: true })
  role = 'button';

  @property()
  size = 'md';

  @property()
  color: 'default' | 'accent' = 'default';

  @property({ type: Boolean })
  disabled = false;

  protected override render(): unknown {
    return html`
      <div
        class="container"
        size=${this.size}
        color="${this.color}"
        ?hoopsdisabled=${this.disabled}
      >
        <slot></slot>
      </div>
    `;
  }
}
