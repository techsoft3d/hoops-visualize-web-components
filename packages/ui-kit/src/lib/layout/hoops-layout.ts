import { css, html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export type HoopsLayoutSlotName =
  | 'menu-bar'
  | 'status-bar'
  | 'panel-left'
  | 'panel-right'
  | 'panel-top'
  | 'panel-bottom'
  | 'toolbar-left'
  | 'toolbar-right'
  | 'toolbar-top'
  | 'toolbar-bottom'
  | 'central-widget';

@customElement('hoops-layout')
export class HoopsLayout extends LitElement {
  private static buildFloatablePanelStyle(position: string) {
    const expandsHorizontally = position == 'left' || position == 'right';

    const positionedPanelClassname = unsafeCSS(`panel-${position}`);

    return css`
      .panel.panel--floating.${positionedPanelClassname} {
        position: relative;
        ${unsafeCSS(expandsHorizontally ? 'width' : 'height')}: 0;
        background: hotpink;
        display: flex;
      }
      .panel.${positionedPanelClassname} {
        ${unsafeCSS(expandsHorizontally ? 'height' : 'width')}: 100%;
      }
      .panel.${positionedPanelClassname}.panel--floating slot {
        position: absolute;
        z-index: 2;
      }
      .panel.${positionedPanelClassname} slot {
        ${unsafeCSS(expandsHorizontally ? 'width' : 'height')}: var(--panel-size);
        ${unsafeCSS(expandsHorizontally ? 'height' : 'width')}: 100%;
        ${unsafeCSS(position)}: 0;
      }
    `;
  }

  static styles = [
    css`
      :host {
        box-sizing: border-box;
        width: var(--hoops-layout-width, 100vw);
        height: var(--hoops-layout-height, 100vh);
        overflow: hidden;

        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
      }

      .central-row {
        flex-grow: 1;
        display: flex;
        height: 100%;
      }

      slot {
        display: flex;
        transition: opacity linear 0.5s;
        transition-behavior: allow-discrete;
      }

      ::slotted([slot='menu-bar']) {
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      slot[name='menu-bar'] {
        min-height: 48px;
      }
      slot[name='status-bar'] {
        min-height: 16px;
      }

      slot[name='menu-bar'],
      slot[name='status-bar'] {
        width: 100%;
      }

      slot[name='central-widget'] {
        flex-grow: 1;
      }

      slot[name='toolbar-left'],
      slot[name='toolbar-right'] {
        width: var(--toolbar-size);
      }

      slot[name='toolbar-top'],
      slot[name='toolbar-bottom'] {
        height: var(--toolbar-size);
      }

      ::slotted(*) {
        height: 100%;
        width: 100%;
      }

      [aria-hidden='true'] {
        display: none;
      }
    `,
    HoopsLayout.buildFloatablePanelStyle('left'),
    HoopsLayout.buildFloatablePanelStyle('right'),
    HoopsLayout.buildFloatablePanelStyle('top'),
    HoopsLayout.buildFloatablePanelStyle('bottom'),
  ];

  @state()
  slotsShown: Record<string, boolean> = {};

  @property({ type: Boolean })
  floatingPanels?: boolean;

  /**
   * Determines whether a specific slot is visible.
   *
   * @param {HoopsLayoutSlotName} slotName - The name of the slot to check visibility for.
   * @returns {boolean} - Returns `true` if the slot is visible, `false` otherwise.
   */
  isSlotVisible = (slotName: HoopsLayoutSlotName): boolean => !!this.slotsShown[slotName];

  /**
   * Mutates the visibility state of a slot.
   *
   * @param {HoopsLayoutSlotName} slotName - The name of the slot to mutate.
   * @param {boolean} shown - The visibility state to set for the slot.
   * @returns {void}
   */
  setSlotVisibility(slotName: HoopsLayoutSlotName, shown: boolean) {
    this.slotsShown = Object.assign({}, this.slotsShown, Object.fromEntries([[slotName, shown]]));
  }

  /**
   * Hides the specified slot in the Hoops layout.
   *
   * @param {HoopsLayoutSlotName} name - The name of the slot to hide.
   */
  hideSlot = (name: HoopsLayoutSlotName) => this.setSlotVisibility(name, false);

  /**
   * Sets the visibility of a layout slot to be shown.
   *
   * @param {HoopsLayoutSlotName} name - The name of the layout slot.
   * @returns {void}
   */
  showSlot = (name: HoopsLayoutSlotName) => this.setSlotVisibility(name, true);

  /**
   * Toggles the visibility of a layout slot.
   *
   * @param {HoopsLayoutSlotName} name - The name of the layout slot to toggle.
   * @returns {void}
   */
  toggleSlotVisibility = (name: HoopsLayoutSlotName) =>
    this.setSlotVisibility(name, !this.isSlotVisible(name));

  /**
   * handleSlotChange updates the visibility of the slots according to the number
   * of slotted elements it has, 0 means the slot element should now be hidden
   * @param {Event} e - The event object.
   * @return {void}
   */
  private handleSlotChange(e: Event) {
    const slotElement = e.target as HTMLSlotElement;
    const slotName = slotElement.getAttribute('name') as HoopsLayoutSlotName;
    this.setSlotVisibility(slotName, !!slotElement.assignedElements().length);
  }

  /**
   * Build a slot element with the given slotName.
   *
   * @param {HoopsLayoutSlotName} slotName - The name of the slot to be built.
   * @return {Element} The constructed slot element.
   */
  private buildSlotElement(slotName: HoopsLayoutSlotName) {
    return html`<slot
      name=${slotName}
      @slotchange=${this.handleSlotChange}
      aria-hidden=${!this.isSlotVisible(slotName)}
    ></slot>`;
  }

  /**
   * Builds a panel element.
   *
   * @param {HoopsLayoutSlotName} slotName - The name of the slot for the panel element.
   * @returns {HTMLElement} - The panel element.
   */
  private builPanelElement(slotName: HoopsLayoutSlotName) {
    return html`<div class="panel ${slotName} ${this.floatingPanels ? 'panel--floating' : ''}">
      ${this.buildSlotElement(slotName)}
    </div> `;
  }

  protected override render(): unknown {
    return html`
      ${this.buildSlotElement('menu-bar')} ${this.buildSlotElement('toolbar-top')}
      ${this.builPanelElement('panel-top')}
      <div class="central-row">
        ${this.buildSlotElement('toolbar-left')} ${this.builPanelElement('panel-left')}
        ${this.buildSlotElement('central-widget')} ${this.builPanelElement('panel-right')}
        ${this.buildSlotElement('toolbar-right')}
      </div>
      ${this.builPanelElement('panel-bottom')} ${this.buildSlotElement('toolbar-bottom')}
      ${this.builPanelElement('status-bar')}
    `;
  }
}

export default HoopsLayout;
