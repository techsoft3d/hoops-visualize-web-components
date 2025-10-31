import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { componentBaseStyle, icons } from '@ts3d-hoops/ui-kit';

/**
 * The CadConfigurationListItemElement class implements a custom elements register with the tag
 * `hoops-cad-configuration-list-item`.
 * This component represent an item in the `hoops-cad-configuration-list` component. It
 * contains properties to display to the user.
 *
 * The CadConfigurationListItemElement does not have any dependency to the @ts3d-hoops/web-viewer Model
 * class.
 *
 * @prop {number} cadConfigurationId The id of CAD configuration in the model
 * @prop {string} cadConfigurationName The name of the CAD configuration
 * @prop {boolean} active Whether the CAD configuration is active or not
 *
 * @export
 * @class CadConfigurationListItemElement
 * @typedef {CadConfigurationListItemElement}
 * @extends {LitElement}
 */
@customElement('hoops-cad-configuration-list-item')
export class CadConfigurationListItemElement extends LitElement {
  static styles = [
    componentBaseStyle,
    css`
      :host {
        flex-grow: 1;
      }

      .cad-configuration-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-flow: row nowrap;
        cursor: pointer;
      }

      .cad-configuration-item:hover {
        color: var(--hoops-accent-foreground-hover);
        stroke: var(--hoops-accent-foreground-hover);
        fill: var(--hoops-accent-foreground-hover);
        --hoops-svg-stroke-color: var(--hoops-accent-foreground-hover);
      }

      .cad-configuration-item.active {
        color: var(--hoops-accent-foreground);
        stroke: var(--hoops-accent-foreground);
        --hoops-svg-stroke-color: var(--hoops-accent-foreground);
      }

      .title {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        width: 100%;
        padding-left: calc(0.4rem);
      }

      .icon {
        width: 1.2rem;
        height: 1.2rem;
      }
    `,
  ];

  /**
   * The id of the CAD configuration to render.
   *
   * @type {number}
   */
  @property({ type: Number })
  cadConfigurationId = Number.NaN;

  /**
   * The name of the CAD configuration to render.
   *
   * @type {string}
   */
  @property({ type: String })
  cadConfigurationName = '';

  /**
   * Whether the CAD configuration is active or not.
   *
   * @type {boolean}
   */
  @property({ type: Boolean })
  active = false;

  /**
   * Render the cad configuration item into the DOM
   * if the cadConfigurationId is NaN it will return `nothing`, a value from Lit to let it
   * know not to add anything to the DOM.
   *
   * @returns {The html content or nothing}
   */
  protected override render() {
    /**
     * If the cadConfigurationId is NaN there is nothing to display so we return nothing to
     * lit.
     */
    if (Number.isNaN(this.cadConfigurationId)) {
      return nothing;
    }

    const classNames = ['cad-configuration-item'];
    if (this.active) {
      classNames.push('active');
    }

    return html`<div class=${classNames.join(' ')}>
      <div class="icon">${icons.cadConfiguration}</hoops-icon></div>
      <div class="title">${this.cadConfigurationName}</div>
    </div>`;
  }
}
