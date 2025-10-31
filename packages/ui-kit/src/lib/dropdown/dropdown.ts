import { css, html, LitElement } from 'lit';
import { StyleInfo, styleMap } from 'lit-html/directives/style-map.js';
import { customElement, property, queryAssignedElements, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import { componentBaseStyle } from '../css-common';

import '../icon-button';

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

  @property({ type: Boolean, reflect: true })
  preventCloseOnClickInside?: boolean;

  @state()
  menuShown = false;
  /**
   * Represents the position where the dropdown is located relative to the host element.
   * Possible values are "bottom", "top", "right", or "left".
   * Default value is "bottom".
   */
  @property()
  position: 'bottom' | 'top' | 'right' | 'left' = 'bottom';
  /**
   * Represents the anchor point of the dropdown,
   * It represents the edge the dropdown is aligning to
   * Possible values are "bottom", "top", "right", or "left".
   * Default value is "left".
   */
  @property()
  anchor?: 'bottom' | 'top' | 'right' | 'left';
  /**
   * Represents the CSS selector for elements that are focusable.
   * This includes <a>, <button>, <input>, <textarea>, <select>, <details> elements,
   * as well as elements with a non-negative tabindex attribute.
   */
  @property()
  focusableSelector =
    'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';
  /**
   * Represents an optional array of HTML elements used as slots for a dropdown component.
   *
   * @type {Array<HTMLElement>}
   */
  @queryAssignedElements({ slot: 'dropdown-popup' })
  dropdownSlot?: Array<HTMLElement>;
  /**
   * Represents the default slot elements that can be passed in a component.
   * @type {Array<HTMLElement>}
   */
  @queryAssignedElements()
  defaultSlot?: Array<HTMLElement>;
  /**￼
   * Represents the disabled state of the dropdown component.
   * Default value is false.
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
