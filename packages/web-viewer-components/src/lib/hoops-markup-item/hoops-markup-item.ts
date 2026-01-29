import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hoops-markup-item')
export class HoopsMarkupItemElement extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .markup {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      cursor: pointer;
      border-bottom: 1px dashed var(--hoops-foreground, #303030);
    }

    .icon {
      width: 1.25rem;
      height: 1.25rem;
    }

    .label {
      flex-grow: 1;
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .markup:hover,
    .markup:hover .icon {
      color: var(--hoops-accent-foreground, var(--blue, #0078d4));
      stroke: var(--hoops-accent-foreground, var(--blue, #0078d4));
      fill: var(--hoops-accent-foreground, var(--blue, #0078d4));
      background-color: color-mix(
        in srgb,
        var(--hoops-neutral-background-20, #fafafa),
        var(--hoops-foreground, #303030) 5%
      );
    }

    .markup.selected {
      background-color: color-mix(
        in srgb,
        var(--hoops-neutral-background-20, #fafafa),
        var(--hoops-accent-foreground-active, var(--blue, #0078d4)) 10%
      );
    }

    .markup.selected,
    .markup.selected .icon,
    .markup.selected .toolbar {
      color: var(--hoops-accent-foreground, var(--blue, #0078d4));
      stroke: var(--hoops-accent-foreground, var(--blue, #0078d4));
      fill: var(--hoops-accent-foreground, var(--blue, #0078d4));
    }
  `;

  @property({ type: String })
  markupId = '';

  @property({ type: Boolean })
  selected = false;

  render() {
    return html`<div
      class=${`markup ${this.selected ? 'selected' : ''}`}
      @click=${() =>
        this.dispatchEvent(
          new CustomEvent<string>('hoops-select-markup', {
            detail: this.markupId,
            bubbles: true,
            composed: true,
          }),
        )}
    >
      <div class="icon">
        <slot name="icon"></slot>
      </div>
      <div class="label"><slot></slot></div>
      <div class="toolbar">
        <slot name="toolbar"></slot>
      </div>
    </div>`;
  }
}

export default HoopsMarkupItemElement;
