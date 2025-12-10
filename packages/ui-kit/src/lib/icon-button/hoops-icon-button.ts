import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * A circular icon button component with customizable size, color, and accessibility features.
 *
 * Provides a clickable button specifically designed for displaying icons with proper
 * keyboard navigation, hover effects, and disabled states.
 *
 * @element hoops-icon-button
 *
 * @slot - Default slot for icon content (typically SVG elements)
 *
 * @cssprop --hoops-neutral-foreground - Default icon color
 * @cssprop --hoops-accent-foreground - Icon color when using accent variant
 * @cssprop --hoops-neutral-foreground-active - Icon color when button is hovered/focused/active
 * @cssprop --hoops-accent-foreground-active - Accent icon color when button is hovered/focused/active
 * @cssprop --hoops-neutral-background-hover - Background color on hover/focus/active states
 * @cssprop --hoops-svg-stroke-color - Stroke color for SVG icons in accent mode
 * @cssprop --hoops-xl-icon-button-size - Size of extra large button container
 * @cssprop --hoops-xl-icon-button-content-size - Size of extra large button content
 * @cssprop --hoops-md-icon-button-size - Size of medium button container
 * @cssprop --hoops-md-icon-button-content-size - Size of medium button content
 * @cssprop --hoops-sm-icon-button-size - Size of small button container
 * @cssprop --hoops-sm-icon-button-content-size - Size of small button content
 *
 * @attribute {string} tabindex - Tab order index for keyboard navigation
 * @attribute {string} role - ARIA role for accessibility
 * @attribute {'xl' | 'md' | 'sm'} size - Size variant of the button
 * @attribute {'default' | 'accent'} color - Color variant of the button
 * @attribute {boolean} disabled - Whether the button is disabled
 *
 * @example
 * ```html
 * <hoops-icon-button size="md" color="accent">
 *   <svg>...</svg>
 * </hoops-icon-button>
 * ```
 *
 * @since 2025.7.0
 */
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

  /**
   * Handles keyboard interactions for the button.
   *
   * @param keypressEvent - The keyboard event to handle
   * @returns void
   *
   * @internal
   */
  private handleKeypress(keypressEvent: KeyboardEvent) {
    if (keypressEvent.key === 'Space' || keypressEvent.key === 'Enter') {
      keypressEvent.preventDefault();
      keypressEvent.stopPropagation();
      if (!this.disabled) {
        this.click();
      }
    }
  }

  /**
   * Tab order index for keyboard navigation.
   *
   * @default '0'
   */
  @property({ reflect: true })
  tabindex = '0';

  /**
   * ARIA role for accessibility.
   *
   * @default 'button'
   */
  @property({ reflect: true })
  role = 'button';

  /**
   * Size variant of the button.
   *
   * @default 'md'
   */
  @property()
  size = 'md';

  /**
   * Color variant of the button.
   *
   * @default 'default'
   */
  @property()
  color: 'default' | 'accent' = 'default';

  /**
   * Whether the button is disabled and non-interactive.
   *
   * @default false
   */
  @property({ type: Boolean })
  disabled = false;

  /**
   * Renders the icon button component template.
   *
   * @returns HTML template for the icon button
   *
   * @internal
   */
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
