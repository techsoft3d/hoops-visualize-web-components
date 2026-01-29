import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * A custom web component that renders a visual separator line.
 *
 * This component provides a flexible separator that can be oriented either
 * horizontally or vertically. It's commonly used in UI layouts to visually
 * divide content sections, toolbar items, or menu groups.
 *
 * The separator respects CSS custom properties for theming and automatically
 * adjusts its styling based on the specified direction.
 *
 * @element hoops-separator
 *
 * @csspart separator - The main separator element (hr)
 *
 * @cssprop --hoops-separator-color - The color of the separator line (defaults to theme separator color)
 *
 * @example
 * ```html
 * <!-- Vertical separator (default) -->
 * <hoops-separator></hoops-separator>
 *
 * <!-- Horizontal separator -->
 * <hoops-separator direction="horizontal"></hoops-separator>
 * ```
 *
 * @example
 * ```html
 * <!-- In a toolbar with custom color -->
 * <div class="toolbar">
 *   <button>Item 1</button>
 *   <hoops-separator style="--hoops-separator-color: #ccc;"></hoops-separator>
 *   <button>Item 2</button>
 *   <hoops-separator></hoops-separator>
 *   <button>Item 3</button>
 * </div>
 * ```
 *
 * @example
 * ```html
 * <!-- Horizontal separator in a vertical layout -->
 * <div class="menu">
 *   <div class="menu-section">Section 1</div>
 *   <hoops-separator direction="horizontal"></hoops-separator>
 *   <div class="menu-section">Section 2</div>
 * </div>
 * ```
 */
@customElement('hoops-separator')
export class Separator extends LitElement {
  static styles = [
    css`
      :host {
        display: flex;
        align-items: center;
        align-self: stretch;
        justify-content: center;
      }
      .separator {
        border: none;
        border-left: 1px solid var(--hoops-separator-color, #f0f0f0);
      }
      .separator.separator-vertical {
        height: 80%;
        margin: 0px 4px;
        border-left: 1px solid var(--hoops-separator-color, #f0f0f0);
      }
      .separator.separator-horizontal {
        width: 80%;
        margin: 4px 0px;
        border-top: 1px solid var(--hoops-separator-color, #f0f0f0);
      }
    `,
  ];

  /**
   * The orientation of the separator line.
   *
   * Determines how the separator is displayed and oriented within its container:
   * - "vertical": Creates a vertical line (default), typically used in horizontal layouts like toolbars
   * - "horizontal": Creates a horizontal line, typically used in vertical layouts like menus
   *
   * The direction affects the separator's dimensions and border styling:
   * - Vertical separators have height (80%) and left border
   * - Horizontal separators have width (80%) and top border
   *
   * @default "vertical"
   *
   * @example
   * ```html
   * <!-- Vertical separator for toolbar -->
   * <div class="toolbar">
   *   <button>Cut</button>
   *   <hoops-separator direction="vertical"></hoops-separator>
   *   <button>Copy</button>
   * </div>
   *
   * <!-- Horizontal separator for menu -->
   * <div class="menu">
   *   <div>Menu Item 1</div>
   *   <hoops-separator direction="horizontal"></hoops-separator>
   *   <div>Menu Item 2</div>
   * </div>
   * ```
   */
  @property()
  direction: 'horizontal' | 'vertical' = 'vertical';

  /**
   * Renders the separator component template.
   *
   * Creates a simple `<hr>` element with CSS classes that determine the separator's
   * appearance based on the direction property. The element uses CSS custom properties
   * for theming and applies appropriate styling for either horizontal or vertical orientation.
   *
   * The rendered element:
   * - Uses semantic `<hr>` element for accessibility
   * - Applies base "separator" class for common styling
   * - Adds direction-specific class ("separator-horizontal" or "separator-vertical")
   * - Respects --hoops-separator-color CSS custom property for theming
   *
   * @returns TemplateResult containing an `<hr>` element with appropriate CSS classes
   *
   * @example
   * ```html
   * <!-- Rendered vertical separator -->
   * <hr class="separator separator-vertical" />
   *
   * <!-- Rendered horizontal separator -->
   * <hr class="separator separator-horizontal" />
   * ```
   *
   * @override
   */
  protected override render(): unknown {
    return html`<hr class="separator separator-${this.direction}" />`;
  }
}
