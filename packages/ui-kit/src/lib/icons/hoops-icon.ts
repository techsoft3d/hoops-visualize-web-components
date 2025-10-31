import { LitElement, html, css, SVGTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import * as icons from './icons';

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

  @property({ type: String })
  icon: string;

  constructor() {
    super();
    this.icon = '';
  }

  private getIcon() {
    if (this.icon in icons) {
      return (icons as Record<string, SVGTemplateResult>)[this.icon];
    }

    console.warn(`unable to find hoops icon '${this.icon}'`, this);

    return undefined;
  }

  render() {
    return html`${this.getIcon() ?? ''}`;
  }
}
