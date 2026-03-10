import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Renders one selectable markup item with icon and toolbar content.
 *
 * @element hoops-markup-item
 *
 * @slot - Slot for markup text label content
 * @slot icon - Slot for the markup type icon
 * @slot toolbar - Slot for trailing markup actions
 *
 * @fires hoops-select-markup - Emitted when the markup item is selected
 *
 * @attribute {string} markupId - Unique markup identifier
 * @attribute {boolean} selected - Indicates whether the item is selected
 *
 * @cssprop --hoops-foreground - Foreground color for row and separators
 * @cssprop --hoops-accent-foreground - Accent color used on hover and selected states
 *
 * @example
 * ```html
 * <hoops-markup-item markupId="markup-1" selected>
 *   Label
 *   <hoops-icon slot="icon"></hoops-icon>
 * </hoops-markup-item>
 * ```
 *
 * @since 2025.7.0
 */
@customElement('hoops-markup-item')
export class HoopsMarkupItemElement extends LitElement {
  /** @internal */
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

  /** @internal */
  protected override render(): unknown {
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
