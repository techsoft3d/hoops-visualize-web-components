import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit-html/directives/style-map.js';

import '../button';
import '../icons';

/**
 * A custom web component that provides a color picker button interface.
 *
 * This component combines a visual button with a hidden HTML color input,
 * allowing users to select colors through the native color picker while
 * maintaining a custom button appearance. The button's stroke color is
 * dynamically updated to reflect the selected color.
 *
 * @element hoops-color-button
 *
 * @fires change - Dispatched when the color value changes through the color picker
 *
 * @attribute {string} title - The tooltip text displayed when hovering over the color button
 * @attribute {string} value - The current selected color value in hexadecimal format (e.g., "#ff0000")
 * @attribute {string} tabindex - The tab index for keyboard navigation accessibility
 * @attribute {string} role - The ARIA role for accessibility
 * @attribute {string} iconSize - The size of the icon displayed within the button
 * @attribute {'default' | 'accent'} color - The visual style variant of the button
 * @attribute {boolean} disabled - Whether the color button is disabled and non-interactive
 *
 * @example
 * ```html
 * <hoops-color-button
 *   title="Choose color"
 *   value="#ff0000"
 *   iconSize="lg"
 *   color="accent">
 *   <hoops-icon name="palette" slot="icon"></hoops-icon>
 *   Select Color
 * </hoops-color-button>
 *
 * <!-- Disabled color button -->
 * <hoops-color-button
 *   title="Color unavailable"
 *   value="#cccccc"
 *   disabled>
 *   <hoops-icon name="palette" slot="icon"></hoops-icon>
 * </hoops-color-button>
 *
 * <script>
 *   const colorButton = document.getElementsByTagName('hoops-color-button')[0];
 *   colorButton.addEventListener('change', (event) => {
 *     console.log('New color:', colorButton.value);
 *   });
 * </script>
 * ```
 *
 * @since 2025.7.0
 */
@customElement('hoops-color-button')
export class HoopsColorButtonElement extends LitElement {
  /** @internal */
  static styles = [
    css`
      :host {
        display: block;
      }

      hoops-button {
        position: 'relative';
        cursor: 'pointer';
      }

      hoops-button[disabled] {
        cursor: not-allowed;
      }

      input[type='color'] {
        display: 'inline-block';
        width: 0;
        height: 0;
        opacity: 0;
        position: 'absolute';
      }
    `,
  ];

  /**
   * The tooltip text displayed when hovering over the color button.
   * This should provide context about what the color selection is for.
   */
  @property({ type: String }) title: string;

  /**
   * The current selected color value in hexadecimal format (e.g., "#ff0000").
   * This value is used to set the initial color picker state and is updated
   * when the user selects a new color. The value also affects the button's
   * stroke color via CSS custom properties.
   */
  @property({ type: String }) value: string;

  /**
   * The tab index for keyboard navigation accessibility.
   * Controls the order in which the element receives focus when navigating
   * with the Tab key. Set to "0" by default to include in normal tab order.
   */
  @property({ reflect: true })
  tabindex = '0';

  /**
   * The ARIA role for accessibility.
   * Identifies the element as a button for screen readers and other
   * assistive technologies. Set to "button" by default.
   */
  @property({ reflect: true })
  role = 'button';

  /**
   * The size of the icon displayed within the button.
   * Controls the dimensions of any slotted icon content.
   *
   * @default "md"
   */
  @property()
  iconSize = 'md';

  /**
   * The visual style variant of the button.
   * Determines the button's appearance and color scheme.
   *
   * - "default": Standard button appearance
   * - "accent": Emphasized button with accent styling
   *
   * @default "default"
   */
  @property()
  color: 'default' | 'accent' = 'default';

  /**
   * Whether the color button is disabled and non-interactive.
   * When disabled, the button cannot be clicked and the color picker
   * is not accessible. The button will also show disabled styling.
   *
   * @default false
   */
  @property({ type: Boolean })
  disabled = false;

  /**
   * Constructs a new HoopsColorButtonElement with default values.
   *
   * Initializes the component with:
   * - Empty title
   * - White color value ("#ffffff")
   * - Disabled state set to false
   */
  constructor() {
    super();
    this.title = '';
    this.value = '#ffffff';
    this.disabled = false;
  }

  /** @internal */
  protected override render(): unknown {
    return html`
      <label>
        <hoops-button
          title=${this.title}
          tabindex=${this.tabindex}
          role=${this.role}
          iconSize=${this.iconSize}
          color=${this.color}
          ?disabled=${this.disabled}
          style=${styleMap({
            '--hoops-svg-stroke-color': this.value,
          })}
        >
          <slot name="icon" slot="icon"></slot>
          <slot></slot>
          <input
            type="color"
            value=${this.value}
            ?disabled=${this.disabled}
            @change=${(e: Event) => this.onChange((e.target as HTMLInputElement).value)}
          />
        </hoops-button>
      </label>
    `;
  }

  /**
   * Handles value changes from the color input element.
   *
   * When the user selects a new color through the color picker, this method
   * updates the component's value property and dispatches a standard 'change'
   * event to notify parent components of the color selection.
   *
   * @param value - The new color value in hexadecimal format from the color input
   *
   * @fires change - Standard change event indicating the color value has been updated
   *
   * @internal
   */
  private onChange(value: string) {
    this.value = value;
    this.dispatchEvent(new Event('change'));
  }
}
