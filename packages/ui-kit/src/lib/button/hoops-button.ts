import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * A customizable button component with icon support and multiple styling options.
 *
 * Provides a flexible button implementation with configurable colors, sizes, and accessibility features.
 * Supports keyboard navigation and can be disabled when needed.
 *
 * @element hoops-button
 *
 * @slot icon - Icon content to display before the button text
 * @slot - Default slot for button text content
 *
 * @cssprop --hoops-neutral-foreground - Default text color for the button
 * @cssprop --hoops-accent-foreground - Text color when using accent color variant
 * @cssprop --hoops-neutral-foreground-active - Text color when button is hovered/focused/active
 * @cssprop --hoops-accent-foreground-active - Accent text color when button is hovered/focused/active
 * @cssprop --hoops-neutral-background-hover - Background color on hover/focus/active states
 * @cssprop --hoops-svg-stroke-color - Stroke color for SVG icons in accent mode
 * @cssprop --hoops-xl-icon-button-content-size - Size for extra large icons
 * @cssprop --hoops-md-icon-button-content-size - Size for medium icons
 * @cssprop --hoops-sm-icon-button-content-size - Size for small icons
 *
 * @attribute {string} tabindex - Tab order index for keyboard navigation
 * @attribute {string} role - ARIA role for accessibility
 * @attribute {string} iconSize - Size of the icon (xl, md, sm)
 * @attribute {'default' | 'accent'} color - Color variant of the button
 * @attribute {boolean} disabled - Whether the button is disabled
 *
 * @example
 * ```html
 * <hoops-button color="accent" iconSize="md">
 *   <svg slot="icon">...</svg>
 *   Click me
 * </hoops-button>
 * ```
 *
 * @since 2025.7.0
 */
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
        color: var(--hoops-neutral-foreground, var(--hoops-foreground, #303030));
        width: 100%;
        padding: 0.4rem 0.6rem;
        transition: background-color linear 0.2s;
        align-items: center;
        justify-content: flex-start;
        cursor: pointer;
        overflow: hidden;
      }
      .container[color='default'] {
        color: var(--hoops-neutral-foreground, var(--hoops-foreground, #303030));
      }
      .container[color='accent'] {
        color: var(--hoops-accent-foreground, var(--blue, #0078d4));
        --hoops-svg-stroke-color: var(--hoops-accent-foreground, var(--blue, #0078d4));
      }

      :host(:is(:hover, :active, :focus))
        .container[color='default']:not([hoopsdisabled]):is(:hover, :active, :focus) {
        color: var(--hoops-neutral-foreground-active, #f0f0f0);
        background-color: var(--hoops-neutral-background-hover, #303030cc);
      }
      :host(:is(:hover, :active, :focus))
        .container[color='accent']:not([hoopsdisabled]):is(:hover, :active, :focus) {
        color: var(--hoops-accent-foreground-active, #f0f0f0);
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

  /**
   * Handles keyboard interactions for the button.
   *
   * @param keypressEvent - The keyboard event to handle
   * @returns void
   *
   * @internal
   */
  handleKeypress(keypressEvent: KeyboardEvent) {
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
   * Size of the icon displayed in the button.
   *
   * @default 'md'
   */
  @property()
  iconSize = 'md';

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
   * Renders the button component template.
   *
   * @returns HTML template for the button
   *
   * @internal
   */
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
