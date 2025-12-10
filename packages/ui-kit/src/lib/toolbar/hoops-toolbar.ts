import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
 * A basic vertical toolbar component for stacking buttons and other interactive elements.
 *
 * This component provides a flexible container with consistent spacing and alignment
 * for toolbar buttons. It automatically arranges child elements vertically with
 * proper gaps and centers them within a fixed-width container.
 *
 * @element hoops-toolbar
 *
 * @slot - Default slot for toolbar buttons and other interactive elements
 *
 * @cssprop --hoops-dropdown-gap - Gap spacing for dropdown elements within the toolbar (default: 0.8rem)
 *
 * @example
 * ```html
 * <hoops-toolbar>
 *   <button>Button 1</button>
 *   <button>Button 2</button>
 *   <button>Button 3</button>
 * </hoops-toolbar>
 *
 * <script>
 *   const toolbar = document.getElementsByTagName("hoops-toolbar")[0];
 *   // Toolbar will automatically arrange children vertically
 * </script>
 * ```
 *
 * @since 2025.7.0
 */
@customElement('hoops-toolbar')
export class Toolbar extends LitElement {
  static styles = [
    css`
      .toolbar {
        display: flex;
        flex-direction: column;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        gap: 0.1rem;
        align-items: center;
        width: 48px;
        height: calc(100% - 1rem);
        overflow: visible;
        --hoops-dropdown-gap: 0.8rem;
      }
    `,
  ];

  /**
   * Renders the toolbar container with default slot for child elements.
   *
   * @returns The toolbar template with a flex column layout and default slot
   * @internal
   */
  protected override render(): unknown {
    return html`<div class="toolbar">
      <slot></slot>
    </div>`;
  }
}

export default Toolbar;
