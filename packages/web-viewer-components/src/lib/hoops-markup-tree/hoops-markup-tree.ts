import { LitElement, PropertyValues, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { type IRedlineService } from '../services';
import '../hoops-markup-view';
import { DeleteRedlineItemEvent } from './custom-events';

@customElement('hoops-markup-tree')
export class HoopsMarkupTreeElement extends LitElement {
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

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    this.redlineService?.addEventListener('hoops-redline-created', this.onUpdate);
    this.redlineService?.addEventListener('hoops-redline-deleted', this.onUpdate);
    this.redlineService?.addEventListener('hoops-redline-view-deleted', this.onUpdate);
    this.redlineService?.addEventListener('hoops-redline-service-reset', this.onUpdate);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.redlineService?.removeEventListener('hoops-redline-created', this.onUpdate);
    this.redlineService?.removeEventListener('hoops-redline-deleted', this.onUpdate);
    this.redlineService?.removeEventListener('hoops-redline-view-deleted', this.onUpdate);
    this.redlineService?.removeEventListener('hoops-redline-service-reset', this.onUpdate);
  }

  protected render(): unknown {
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
