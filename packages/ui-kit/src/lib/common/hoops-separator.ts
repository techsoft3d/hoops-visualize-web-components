import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

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
        border-left: 1px solid var(--hoops-separator-color);
      }
      .separator.separator-vertical {
        height: 80%;
        margin: 0px 4px;
        border-left: 1px solid var(--hoops-separator-color);
      }
      .separator.separator-horizontal {
        width: 80%;
        margin: 4px 0px;
        border-top: 1px solid var(--hoops-separator-color);
      }
    `,
  ];

  @property()
  direction: 'horizontal' | 'vertical' = 'vertical';

  protected override render(): unknown {
    return html`<hr class="separator separator-${this.direction}" />`;
  }
}
