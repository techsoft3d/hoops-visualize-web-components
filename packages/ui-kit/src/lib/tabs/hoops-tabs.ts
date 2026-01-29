import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state, queryAssignedElements } from 'lit/decorators.js';
import { TabChangeEventDetail } from './types';

import './custom-events.d.ts';
import { HoopsTabElement } from './hoops-tab';

/**
 * A tab container component that manages multiple tab panels.
 *
 * This component provides a tabbed interface where users can switch between different content panels.
 * It handles keyboard navigation, ARIA attributes, and tab selection state management.
 *
 * Key features:
 * - Automatic tab panel management via slotted `hoops-tab` elements
 * - Keyboard navigation with arrow keys (Left/Right for horizontal, Up/Down for vertical)
 * - Home and End key support for first/last tab navigation
 * - ARIA-compliant accessibility with proper roles and attributes
 * - Customizable tab positioning (top, bottom, left, right)
 * - CSS custom properties for theming
 * - Support for disabled tabs
 * - Selection by index or by value
 *
 * @element hoops-tabs
 *
 * @slot - Default slot for `hoops-tab` child elements
 *
 * @cssprop --hoops-tabs-header-background - Background color of the tab header area
 * @cssprop --hoops-tabs-header-border-color - Border color of the tab header
 * @cssprop --hoops-tabs-active-indicator-color - Color of the active tab indicator line
 * @cssprop --hoops-tabs-active-indicator-height - Height/width of the active tab indicator
 * @cssprop --hoops-tabs-gap - Gap between tabs
 *
 * @fires hoops-tabs-change - Emitted when the selected tab changes. Detail contains selectedIndex and selectedValue.
 *
 * @attribute {number} selectedIndex - The index of the currently selected tab (default: 0)
 * @attribute {'top' | 'bottom' | 'left' | 'right'} position - Position of the tab headers relative to content (default: 'top')
 *
 * @example
 * ```html
 * <!-- Basic usage -->
 * <hoops-tabs selectedIndex="0">
 *   <hoops-tab label="Settings" value="settings" icon="⚙️">
 *     <div>Settings content here</div>
 *   </hoops-tab>
 *   <hoops-tab label="Profile" value="profile" icon="👤">
 *     <div>Profile content here</div>
 *   </hoops-tab>
 * </hoops-tabs>
 *
 * <!-- With disabled tab -->
 * <hoops-tabs>
 *   <hoops-tab label="Tab 1">Content 1</hoops-tab>
 *   <hoops-tab label="Tab 2" disabled>Disabled tab</hoops-tab>
 *   <hoops-tab label="Tab 3">Content 3</hoops-tab>
 * </hoops-tabs>
 *
 * <!-- Position variants -->
 * <hoops-tabs position="left">
 *   <hoops-tab label="Left Tab 1">Content</hoops-tab>
 *   <hoops-tab label="Left Tab 2">Content</hoops-tab>
 * </hoops-tabs>
 *
 * <script>
 *   const tabs = document.getElementsByTagName("hoops-tabs")[0];
 *
 *   // Listen for tab changes
 *   tabs.addEventListener("hoops-tabs-change", (e) => {
 *     console.log("Selected tab index:", e.detail.selectedIndex);
 *     console.log("Selected tab value:", e.detail.selectedValue);
 *   });
 *
 *   // Programmatically select tab by value
 *   tabs.selectByValue("profile");
 * </script>
 * ```
 *
 * @since 2026.1.0
 */
@customElement('hoops-tabs')
export class HoopsTabsElement extends LitElement {
  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
      }

      :host([position='bottom']) {
        flex-direction: column-reverse;
      }

      :host([position='left']) {
        flex-direction: row;
      }

      :host([position='right']) {
        flex-direction: row-reverse;
      }

      .tab-header {
        display: flex;
        flex-wrap: nowrap;
        background: var(
          --hoops-tabs-header-background,
          var(--hoops-neutral-background-50, #f0f0f0)
        );
        border-bottom: 1px solid
          var(--hoops-tabs-header-border-color, var(--hoops-neutral-foreground-20, #e0e0e0));
        gap: var(--hoops-tabs-gap, 0);
        overflow-x: auto;
        scrollbar-width: thin;
      }

      :host([position='left']) .tab-header,
      :host([position='right']) .tab-header {
        flex-direction: column;
        border-bottom: none;
        overflow-x: visible;
        overflow-y: auto;
      }

      :host([position='left']) .tab-header {
        border-right: 1px solid
          var(--hoops-tabs-header-border-color, var(--hoops-neutral-foreground-20, #e0e0e0));
      }

      :host([position='right']) .tab-header {
        border-left: 1px solid
          var(--hoops-tabs-header-border-color, var(--hoops-neutral-foreground-20, #e0e0e0));
      }

      :host([position='bottom']) .tab-header {
        border-bottom: none;
        border-top: 1px solid
          var(--hoops-tabs-header-border-color, var(--hoops-neutral-foreground-20, #e0e0e0));
      }

      .tab-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.75rem 1rem;
        background: transparent;
        border: none;
        color: var(--hoops-neutral-foreground, var(--hoops-foreground, #303030));
        cursor: pointer;
        font-size: 0.875rem;
        font-weight: 500;
        white-space: nowrap;
        position: relative;
        transition:
          background-color 0.15s ease,
          color 0.15s ease;
        outline: none;
      }

      .tab-button:hover:not([disabled]) {
        background: var(--hoops-neutral-background-hover, rgba(0, 0, 0, 0.05));
      }

      .tab-button:focus-visible {
        outline: 2px solid var(--hoops-accent-foreground, #0078d4);
        outline-offset: -2px;
      }

      .tab-button[aria-selected='true'] {
        color: var(--hoops-accent-foreground, #0078d4);
      }

      .tab-button[aria-selected='true']::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: var(--hoops-tabs-active-indicator-height, 2px);
        background: var(
          --hoops-tabs-active-indicator-color,
          var(--hoops-accent-foreground, #0078d4)
        );
      }

      :host([position='left']) .tab-button[aria-selected='true']::after {
        top: 0;
        bottom: 0;
        left: auto;
        right: 0;
        width: var(--hoops-tabs-active-indicator-height, 2px);
        height: auto;
      }

      :host([position='right']) .tab-button[aria-selected='true']::after {
        top: 0;
        bottom: 0;
        left: 0;
        right: auto;
        width: var(--hoops-tabs-active-indicator-height, 2px);
        height: auto;
      }

      :host([position='bottom']) .tab-button[aria-selected='true']::after {
        top: 0;
        bottom: auto;
      }

      .tab-button[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .tab-content {
        flex: 1;
        overflow: auto;
      }

      .tab-panel {
        display: none;
        height: 100%;
      }

      .tab-panel[aria-hidden='false'] {
        display: block;
      }

      .tab-icon {
        margin-right: 0.5rem;
        display: flex;
        align-items: center;
      }

      .tab-icon:empty {
        display: none;
        margin-right: 0;
      }
    `,
  ];

  /**
   * The index of the currently selected tab.
   *
   * @default 0
   */
  @property({ type: Number, reflect: true })
  selectedIndex = 0;

  /**
   * Position of the tab headers relative to the content.
   *
   * @default 'top'
   */
  @property({ type: String, reflect: true })
  position: 'top' | 'bottom' | 'left' | 'right' = 'top';

  /**
   * Slotted tab elements.
   * @internal
   */
  @queryAssignedElements({ selector: 'hoops-tab' })
  private _tabs!: HoopsTabElement[];

  /**
   * Internal state tracking tab metadata for rendering.
   * @internal
   */
  @state()
  private _tabsMetadata: Array<{
    label: string;
    disabled: boolean;
    icon?: string;
    value?: string;
  }> = [];

  connectedCallback(): void {
    super.connectedCallback();
    this._updateTabsMetadata();
    this.requestUpdate();
  }

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);
    if (changedProperties.has('selectedIndex')) {
      this._updateTabVisibility();
    }
  }

  /**
   * Updates the metadata array from slotted tabs.
   * @internal
   */
  private _updateTabsMetadata(): void {
    if (!this._tabs || this._tabs.length === 0) {
      return;
    }

    this._tabsMetadata = this._tabs.map((tab) => ({
      label: tab.label || '',
      disabled: tab.disabled || false,
      icon: tab.icon,
      value: tab.value,
    }));

    this._updateTabVisibility();
  }

  /**
   * Updates the visibility of tab panels based on selected index.
   * @internal
   */
  private _updateTabVisibility(): void {
    if (!this._tabs) {
      return;
    }

    this._tabs.forEach((tab, index) => {
      const isSelected = index === this.selectedIndex;
      tab.setAttribute('aria-hidden', String(!isSelected));
      tab.style.display = isSelected ? 'block' : 'none';
    });
  }

  /**
   * Handles slot changes to update tab metadata.
   * @internal
   */
  private _handleSlotChange(): void {
    // Wait for custom elements to be upgraded before reading their properties
    requestAnimationFrame(() => {
      this._updateTabsMetadata();
    });
  }

  /**
   * Handles tab button click.
   *
   * @param index - Index of the clicked tab
   * @internal
   */
  private _handleTabClick(index: number): void {
    if (this._tabsMetadata[index]?.disabled) {
      return;
    }

    this._selectTab(index);
  }

  /**
   * Handles keyboard navigation between tabs.
   *
   * @param event - Keyboard event
   * @param currentIndex - Current tab index
   * @internal
   */
  private _handleKeyDown(event: KeyboardEvent, currentIndex: number): void {
    const isVertical = this.position === 'left' || this.position === 'right';
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';

    let newIndex = currentIndex;

    switch (event.key) {
      case prevKey:
        event.preventDefault();
        newIndex = this._findPreviousEnabledTab(currentIndex);
        break;
      case nextKey:
        event.preventDefault();
        newIndex = this._findNextEnabledTab(currentIndex);
        break;
      case 'Home':
        event.preventDefault();
        newIndex = this._findFirstEnabledTab();
        break;
      case 'End':
        event.preventDefault();
        newIndex = this._findLastEnabledTab();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this._selectTab(currentIndex);
        return;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      this._focusTab(newIndex);
    }
  }

  /**
   * Finds the previous enabled tab index.
   *
   * @param currentIndex - Current tab index
   * @returns Previous enabled tab index or current index if none found
   * @internal
   */
  private _findPreviousEnabledTab(currentIndex: number): number {
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (!this._tabsMetadata[i]?.disabled) {
        return i;
      }
    }
    // Wrap around
    for (let i = this._tabsMetadata.length - 1; i > currentIndex; i--) {
      if (!this._tabsMetadata[i]?.disabled) {
        return i;
      }
    }
    return currentIndex;
  }

  /**
   * Finds the next enabled tab index.
   *
   * @param currentIndex - Current tab index
   * @returns Next enabled tab index or current index if none found
   * @internal
   */
  private _findNextEnabledTab(currentIndex: number): number {
    for (let i = currentIndex + 1; i < this._tabsMetadata.length; i++) {
      if (!this._tabsMetadata[i]?.disabled) {
        return i;
      }
    }
    // Wrap around
    for (let i = 0; i < currentIndex; i++) {
      if (!this._tabsMetadata[i]?.disabled) {
        return i;
      }
    }
    return currentIndex;
  }

  /**
   * Finds the first enabled tab index.
   *
   * @returns First enabled tab index or 0 if none found
   * @internal
   */
  private _findFirstEnabledTab(): number {
    for (let i = 0; i < this._tabsMetadata.length; i++) {
      if (!this._tabsMetadata[i]?.disabled) {
        return i;
      }
    }
    return 0;
  }

  /**
   * Finds the last enabled tab index.
   *
   * @returns Last enabled tab index or last index if none found
   * @internal
   */
  private _findLastEnabledTab(): number {
    for (let i = this._tabsMetadata.length - 1; i >= 0; i--) {
      if (!this._tabsMetadata[i]?.disabled) {
        return i;
      }
    }
    return this._tabsMetadata.length - 1;
  }

  /**
   * Focuses a tab button by index.
   *
   * @param index - Tab index to focus
   * @internal
   */
  private _focusTab(index: number): void {
    const tabButtons = this.shadowRoot?.querySelectorAll('.tab-button');
    const button = tabButtons?.[index] as HTMLButtonElement | undefined;
    button?.focus();
  }

  /**
   * Selects a tab by index and dispatches change event.
   *
   * @param index - Tab index to select
   * @internal
   */
  private _selectTab(index: number): void {
    if (index === this.selectedIndex || this._tabsMetadata[index]?.disabled) {
      return;
    }

    this.selectedIndex = index;

    const detail: TabChangeEventDetail = {
      selectedIndex: index,
      selectedValue: this._tabsMetadata[index]?.value,
    };

    this.dispatchEvent(
      new CustomEvent<TabChangeEventDetail>('hoops-tabs-change', {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Selects a tab by its value property.
   *
   * @param value - The value of the tab to select
   */
  selectByValue(value: string): void {
    const index = this._tabsMetadata.findIndex((tab) => tab.value === value);
    if (index !== -1) {
      this._selectTab(index);
    }
  }

  /**
   * Renders the component.
   *
   * @returns The template result
   * @internal
   */
  render() {
    return html`
      <div class="tab-header" role="tablist">
        ${this._tabsMetadata.map(
          (tab, index) => html`
            <button
              class="tab-button"
              role="tab"
              aria-selected="${this.selectedIndex === index}"
              aria-controls="panel-${index}"
              id="tab-${index}"
              tabindex="${this.selectedIndex === index ? 0 : -1}"
              ?disabled="${tab.disabled}"
              @click="${() => this._handleTabClick(index)}"
              @keydown="${(e: KeyboardEvent) => this._handleKeyDown(e, index)}"
            >
              ${tab.icon ? html`<span class="tab-icon">${tab.icon}</span>` : ''} ${tab.label}
            </button>
          `,
        )}
      </div>
      <div class="tab-content">
        <slot @slotchange="${this._handleSlotChange}"></slot>
      </div>
    `;
  }
}
