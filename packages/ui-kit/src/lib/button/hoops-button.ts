import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hoops-button')
export default class HoopsButton extends LitElement {
  static styles = [
    css`
      :host {
        align-self: stretch;
      }
      .container {
        border: none;
        display: flex;
        box-sizing: border-box;
        background-color: transparent;
        color: var(--hoops-neutral-foreground);
        width: 100%;
        padding: 0.4rem 0.6rem;
        transition: background-color linear 0.2s;
        align-items: center;
        justify-content: flex-start;
        cursor: pointer;
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

      ::slotted([slot='icon']) {
        margin-right: 0.2rem;
      }

      [size='xl'] ::slotted([slot='icon']) {
        width: var(--hoops-xl-icon-button-content-size, 2.6rem);
        height: var(--hoops-xl-icon-button-content-size, 2.6rem);
      }
      [size='md'] ::slotted([slot='icon']) {
        width: var(--hoops-md-icon-button-content-size, 1.6rem);
        height: var(--hoops-md-icon-button-content-size, 1.6rem);
      }
      [size='sm'] ::slotted([slot='icon']) {
        width: var(--hoops-sm-icon-button-content-size, 1.2rem);
        height: var(--hoops-sm-icon-button-content-size, 1.2rem);
      }

      .container[aria-disabled] {
        cursor: default;
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
  iconSize = 'md';

  @property()
  color: 'default' | 'accent' = 'default';

  @property({ type: Boolean })
  disabled = false;

  protected override render(): unknown {
    return html`
      <div
        class="container"
        size=${this.iconSize}
        color=${this.color}
        ?aria-disabled=${this.disabled}
      >
        <slot name="icon"></slot>
        <span>
          <slot></slot>
        </span>
      </div>
    `;
  }
}
