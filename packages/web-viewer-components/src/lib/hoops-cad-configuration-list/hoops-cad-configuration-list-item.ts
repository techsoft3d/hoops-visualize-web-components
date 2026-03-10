import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { componentBaseStyle, icons } from '@ts3d-hoops/ui-kit';

/**
 * A custom element representing an item in the CAD configuration list.
 *
 * This component displays a CAD configuration with its active state and interactive controls.
 * It does not have any dependency on the @ts3d-hoops/web-viewer Model class.
 *
 * @element hoops-cad-configuration-list-item
 *
 * @attribute {number} cadConfigurationId - The id of the CAD configuration in the model
 * @attribute {string} cadConfigurationName - The name of the CAD configuration
 * @attribute {boolean} active - Whether the CAD configuration is active or not
 *
 * @example
 * ```html
 * <hoops-cad-configuration-list-item cadConfigurationId="1" cadConfigurationName="Config A"></hoops-cad-configuration-list-item>
 * <hoops-cad-configuration-list-item cadConfigurationId="2" cadConfigurationName="Config B" active></hoops-cad-configuration-list-item>
 * ```
 *
 * @since 2025.8.0
 */
@customElement('hoops-cad-configuration-list-item')
export class CadConfigurationListItemElement extends LitElement {
  /** @internal */
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
        color: var(--hoops-accent-foreground-hover, var(--blue, #0078d4));
        stroke: var(--hoops-accent-foreground-hover, var(--blue, #0078d4));
        fill: var(--hoops-accent-foreground-hover, var(--blue, #0078d4));
        --hoops-svg-stroke-color: var(--hoops-accent-foreground-hover, var(--blue, #0078d4));
      }

      .cad-configuration-item.active {
        color: var(--hoops-accent-foreground, var(--blue, #0078d4));
        stroke: var(--hoops-accent-foreground, var(--blue, #0078d4));
        --hoops-svg-stroke-color: var(--hoops-accent-foreground, var(--blue, #0078d4));
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

  /** @internal */
  protected override render(): unknown {
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
