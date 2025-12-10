import { LitElement, html, css, SVGTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import * as icons from './icons';

/**
 * A web component that displays SVG icons from a predefined icon library.
 * 
 * Provides a simple interface for rendering SVG icons by name, with automatic
 * sizing and error handling for missing icons.
 *
 * @element hoops-icon
 * 
 * @cssprop --hoops-icon-width - Width of the icon container
 * @cssprop --hoops-icon-height - Height of the icon container
 * @cssprop --hoops-svg-stroke-color - Stroke color for SVG icon elements
 * @cssprop --hoops-svg-fill-color - Fill color for SVG icon elements
 * 
 * @attribute {string} icon - Name of the icon to display from the icon library
 * 
 * @example
 * ```html
 * <hoops-icon icon="home"></hoops-icon>
 * <hoops-icon icon="settings" style="width: 24px; height: 24px;"></hoops-icon>
 * ```
 * 
 * @since 2025.7.0
 */
@customElement('hoops-icon')
export class HoopsIcon extends LitElement {
  static styles = [
    css`
      :host {
        display: inline-block;
      }
      
      svg {
        width: 100%;
        height: 100%;
        display: block;
      }
    `,
  ];

  /**
   * The name of the icon to display from the icon library.
   * 
   * @default ''
   */
  @property({ type: String })
  icon = '';

  /**
   * Retrieves the SVG template for the specified icon name.
   * 
   * @returns The SVG template for the icon, or undefined if not found
   * 
   * @internal
   */

  private getIcon() {
    if (this.icon in icons) {
      return (icons as Record<string, SVGTemplateResult>)[this.icon];
    }

    console.warn(`unable to find hoops icon '${this.icon}'`, this);

    return undefined;
  }

  /**
   * Renders the icon component template.
   * 
   * @returns HTML template for the icon
   * 
   * @internal
   */
  render() {
    return html`${this.getIcon() ?? ''}`;
  }
}
