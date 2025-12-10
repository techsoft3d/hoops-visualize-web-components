import { css, html, LitElement } from 'lit';
import { StyleInfo, styleMap } from 'lit-html/directives/style-map.js';
import { customElement, property, queryAssignedElements, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import { componentBaseStyle } from '../css-common';

import '../icon-button';

/**
 * A customizable dropdown menu component with flexible positioning and keyboard navigation.
 *
 * Provides a trigger element that opens a floating panel with menu content, supporting
 * various positioning options and accessibility features.
 *
 * @element hoops-dropdown
 *
 * @slot - Default slot for the dropdown trigger element (button, icon, etc.)
 * @slot dropdown-popup - Content to display in the dropdown panel
 *
 * @cssprop --hoops-dropdown-z-index - Z-index for the dropdown panel
 * @cssprop --hoops-dropdown-background-color - Background color of the dropdown panel
 * @cssprop --hoops-dropdown-menu-border-color - Border color of the dropdown panel
 * @cssprop --hoops-dropdown-menu-radius - Border radius of the dropdown panel
 * @cssprop --hoops-dropdown-menu-border-size - Border width of the dropdown panel
 * @cssprop --hoops-dropdown-menu-border-style - Border style of the dropdown panel
 * @cssprop --hoops-dropdown-box-shadow - Box shadow for the dropdown panel
 * @cssprop --hoops-dropdown-gap - Gap between trigger and dropdown panel
 *
 * @fires hoops-dropdown-opened - Emitted when the dropdown is opened
 * @fires hoops-dropdown-closed - Emitted when the dropdown is closed
 *
 * @attribute {boolean} preventCloseOnClickInside - Prevents closing when clicking inside dropdown
 * @attribute {'bottom' | 'top' | 'right' | 'left'} position - Position of dropdown relative to trigger
 * @attribute {'bottom' | 'top' | 'right' | 'left'} anchor - Anchor point for dropdown alignment
 * @attribute {string} focusableSelector - CSS selector for focusable elements
 * @attribute {boolean} disabled - Whether the dropdown is disabled
 *
 * @example
 * ```html
 * <hoops-dropdown position="bottom" anchor="left">
 *   <button>Menu</button>
 *   <div slot="dropdown-popup">
 *     <button>Option 1</button>
 *     <button>Option 2</button>
 *   </div>
 * </hoops-dropdown>
 * ```
 *
 * @since 2025.7.0
 */
@customElement('hoops-dropdown')
export default class DropdownMenu extends LitElement {
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static styles = [
    componentBaseStyle,
    css`
      :host {
        position: relative;
        display: inline-block;
      }

      .dropdown-panel {
        position: absolute;
        z-index: var(--hoops-dropdown-z-index, 10);
        margin: 0;
        padding: 0;
        min-width: 1rem;
        background: var(--hoops-dropdown-background-color, #fcfcfc);
        border-color: var(--hoops-dropdown-menu-border-color, #90909090);
        border-radius: var(--hoops-dropdown-menu-radius, 0px);
        border-width: var(--hoops-dropdown-menu-border-size, 0px);
        border-style: var(--hoops-dropdown-menu-border-style, solid);
        box-shadow: var(
          --hoops-dropdown-box-shadow,
          0 1px 3px rgba(0, 0, 0, 0.12),
          0 1px 2px rgba(0, 0, 0, 0.24)
        );
      }

      ::slotted([slot='dropdown-popup']) {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
    `,
  ];

  /**
   * Prevents the dropdown from closing when clicking inside the dropdown panel.
   *
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  preventCloseOnClickInside = false;

  /**
   * Controls whether the dropdown menu is currently visible.
   *
   * @internal
   */
  @state()
  menuShown = false;

  /**
   * Position of the dropdown relative to the trigger element.
   *
   * @default 'bottom'
   */
  @property()
  position: 'bottom' | 'top' | 'right' | 'left' = 'bottom';

  /**
   * Anchor point for dropdown alignment relative to the trigger element.
   *
   * @default undefined
   */
  @property()
  anchor?: 'bottom' | 'top' | 'right' | 'left';

  /**
   * CSS selector for elements that should be focusable within the dropdown.
   *
   * By default this includes <a>, <button>, <input>, <textarea>, <select>, <details> elements,
   * as well as elements with a non-negative tabindex attribute.
   * CSS selector for elements that should be focusable within the dropdown.
   *
   * @default 'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
   */
  @property()
  focusableSelector =
    'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';

  /**
   * Elements assigned to the dropdown-popup slot.
   *
   * @internal
   */
  @queryAssignedElements({ slot: 'dropdown-popup' })
  dropdownSlot?: Array<HTMLElement>;

  /**
   * Elements assigned to the default slot (trigger elements).
   *
   * @internal
   */
  @queryAssignedElements()
  defaultSlot?: Array<HTMLElement>;

  /**
   * Whether the dropdown is disabled and non-interactive.
   *
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  constructor() {
    super();

    this.addEventListener('focusout', (event: FocusEvent) => {
      const isFocusLost = event.relatedTarget !== this;
      const isFocusingDropdown =
        (event.relatedTarget as Element)?.closest('hoops-dropdown') === this;
      if (isFocusLost && !isFocusingDropdown) {
        this.menuShown = false;
      }
    });

    document.addEventListener('click', (e) => {
      const clickInside = e.composedPath().some((el) => el === this);
      if (this.preventCloseOnClickInside && clickInside) {
        return;
      }

      // Clicking something which is not the menu button closes the menu
      if (e.target !== this) {
        this.menuShown = false;
      }
    });
  }

  /**
   * Focuses on the first item in the dropdown list of focusable elements.
   *
   * @return {void}
   */
  private focusFirstDropdownItem(): void {
    this.focusableDropdownChildren?.item(0)?.focus();
  }

  /**
   * Retrieves the focusable children within the dropdown slot element.
   *
   * @return {NodeListOf<HTMLElement> | undefined} A list of HTMLElements representing the focusable children
   */
  get focusableDropdownChildren(): NodeListOf<HTMLElement> | undefined {
    return this.dropdownSlot?.at(0)?.querySelectorAll<HTMLElement>(this.focusableSelector);
  }

  /**
   * Returns the positional styles for a dropdown based on the current position.
   * The styles include properties such as 'left', 'right', 'top', 'bottom' and 'margin'.
   *
   * @returns {StyleInfo} Object representing the positional styles for the dropdown
   */
  get dropdownPositionalStyles(): StyleInfo {
    const GAP = 'var(--hoops-dropdown-gap, 0.2rem)';
    const positions: { [key: string]: StyleInfo } = {
      left: { right: '100%', top: '0', 'margin-right': GAP },
      right: { left: '100%', top: '0', 'margin-left': GAP },
      bottom: { top: '100%', left: '0', 'margin-top': GAP },
      top: { bottom: '100%', left: '0', 'margin-bottom': GAP },
    };
    let position = { ...positions[this.position] };

    if (this.anchor) {
      const anchorAdjustments: { [key: string]: { [key: string]: string } } = {
        top: { top: '0', bottom: 'initial' },
        bottom: { bottom: '0', top: 'initial' },
        left: { left: '0', right: 'initial' },
        right: { right: '0', left: 'initial' },
      };

      position = { ...position, ...anchorAdjustments[this.anchor] };
    }
    return position;
  }

  /**
   * Toggles the dropdown menu visibility based on the current state.
   *
   * @param {PointerEvent} event - The pointer event triggering the dropdown toggle.
   *
   * @return {Promise<void>}
   */
  async toggleDropdown(event: PointerEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled) {
      return;
    }

    this.menuShown = !this.menuShown;

    if (this.menuShown) {
      await this.updateComplete;
      this.focusFirstDropdownItem();
    }
  }

  protected override render(): unknown {
    return html`
      <slot @click=${this.toggleDropdown}></slot>
      ${when(
        this.menuShown,
        () =>
          html` <div class="dropdown-panel" style="${styleMap(this.dropdownPositionalStyles)}">
            <slot name="dropdown-popup"></slot>
          </div>`,
      )}
    `;
  }
}
