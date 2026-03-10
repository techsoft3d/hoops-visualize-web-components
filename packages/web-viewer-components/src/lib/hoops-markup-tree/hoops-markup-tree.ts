import { LitElement, PropertyValues, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { type IRedlineService } from '../services';
import '../hoops-markup-view';
import { DeleteRedlineItemEvent } from './custom-events';

/**
 * Displays a tree of markup views from the redline service.
 *
 * @element hoops-markup-tree
 *
 * @service {IRedlineService} RedlineService - Service used to list and update markup views
 *
 * @example
 * ```html
 * <hoops-markup-tree></hoops-markup-tree>
 * ```
 *
 * @since 2025.7.0
 */
@customElement('hoops-markup-tree')
export class HoopsMarkupTreeElement extends LitElement {
  /** @internal */
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  @property({ type: Object, attribute: false })
  public redlineService?: IRedlineService;

  private onUpdate = () => this.requestUpdate();

  /**
   * @internal
   */
  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    this.redlineService?.addEventListener('hoops-redline-created', this.onUpdate);
    this.redlineService?.addEventListener('hoops-redline-deleted', this.onUpdate);
    this.redlineService?.addEventListener('hoops-redline-view-deleted', this.onUpdate);
    this.redlineService?.addEventListener('hoops-redline-service-reset', this.onUpdate);
  }

  /**
   * @internal
   */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.redlineService?.removeEventListener('hoops-redline-created', this.onUpdate);
    this.redlineService?.removeEventListener('hoops-redline-deleted', this.onUpdate);
    this.redlineService?.removeEventListener('hoops-redline-view-deleted', this.onUpdate);
    this.redlineService?.removeEventListener('hoops-redline-service-reset', this.onUpdate);
  }

  /** @internal */
  protected override render(): unknown {
    return html`${this.redlineService?.getRedlineViewKeys().map(
      (key) =>
        html`<hoops-markup-view
          .redlineService=${this.redlineService as any}
          uuid=${key}
          @hoops-delete-redline=${(e: DeleteRedlineItemEvent) => {
            this.redlineService?.removeRedlineItem(e.detail.markupViewId, e.detail.markupItem);
          }}
        ></hoops-markup-view>`,
    )}`;
  }
}

export default HoopsMarkupTreeElement;
