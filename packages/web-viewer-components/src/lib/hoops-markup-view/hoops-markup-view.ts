import { LitElement, PropertyValues, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '@ts3d-hoops/ui-kit';
import '../hoops-markup-item';
import { Uuid } from '@ts3d-hoops/web-viewer';
import { type IRedlineService, formatRedlineIcon, RedlineItemData } from '../services';

@customElement('hoops-markup-view')
export class HoopsMarkupViewElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }

      hoops-markup-item {
        display: block;
        width: 100%;
      }
    `,
  ];

  @property({ type: String })
  public uuid = '';

  @property({ type: Object, attribute: false })
  public itemFilter: (item: { id: string; type: string }) => boolean = () => true;

  @property({ type: Object, attribute: false })
  public redlineService?: IRedlineService;

  // Arrow function to avoid binding issues
  private onRedlineCreated = () => {
    this.requestUpdate();
  };

  // Arrow function to avoid binding issues
  private onRedlineDeleted = () => {
    this.requestUpdate();
  };
  private onRedlineViewDeleted = () => {
    this.requestUpdate();
  };

  // Arrow function to avoid binding issues
  private onMarkupManagerReset = () => {
    this.requestUpdate();
  };

  private onMarkupViewActivated = () => {
    this.requestUpdate();
  };

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);

    this.redlineService?.addEventListener('hoops-redline-created', this.onRedlineCreated);
    this.redlineService?.addEventListener('hoops-redline-deleted', this.onRedlineDeleted);
    this.redlineService?.addEventListener('hoops-redline-view-deleted', this.onRedlineViewDeleted);
    this.redlineService?.addEventListener('hoops-redline-service-reset', this.onMarkupManagerReset);
    this.redlineService?.addEventListener(
      'hoops-markup-view-activated',
      this.onMarkupViewActivated,
    );
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    this.redlineService?.removeEventListener('hoops-redline-created', this.onRedlineCreated);
    this.redlineService?.removeEventListener('hoops-redline-deleted', this.onRedlineDeleted);
    this.redlineService?.removeEventListener(
      'hoops-redline-view-deleted',
      this.onRedlineViewDeleted,
    );
    this.redlineService?.removeEventListener(
      'hoops-redline-service-reset',
      this.onMarkupManagerReset,
    );
    this.redlineService?.removeEventListener(
      'hoops-markup-view-activated',
      this.onMarkupViewActivated,
    );
  }

  protected render(): unknown {
    const view = this.redlineService?.getRedlineView(this.uuid);
    if (!view) {
      return html`<div>No view found for UUID: "${this.uuid}"</div>`;
    }
    const selected = this.redlineService?.getActiveViewKey() === this.uuid;

    return html`<hoops-tree-item
      ?selected=${selected}
      ?expanded=${selected}
      @hoops-tree-item-select=${(e: CustomEvent) => {
        const selected = e.detail.selected;
        if (selected && this.redlineService?.getActiveViewKey() !== this.uuid) {
          this.redlineService?.setActiveView(this.uuid);
        }
      }}
    >
      ${this.uuid}
      <div slot="children">
        ${view.items.filter(this.itemFilter).map(
          (item) =>
            html`<hoops-tree-item leaf>
              <hoops-markup-item markupId=${item.id}>
                <hoops-icon
                  icon=${formatRedlineIcon(item.type)}
                  slot="icon"
                  style="width: 1rem"
                ></hoops-icon>
                <span>${item.id}</span>
                <div slot="toolbar">
                  <hoops-icon-button
                    @click=${() => {
                      this.dispatchEvent(
                        new CustomEvent<{
                          markupViewId: Uuid;
                          markupItem: RedlineItemData;
                        }>('hoops-delete-redline', {
                          detail: { markupViewId: view.id, markupItem: item },
                          bubbles: true,
                          composed: true,
                        }),
                      );
                    }}
                  >
                    <hoops-icon icon="removeIcon"></hoops-icon>
                  </hoops-icon-button>
                </div>
              </hoops-markup-item>
            </hoops-tree-item>`,
        )}
      </div>
    </hoops-tree-item>`;
  }
}

export default HoopsMarkupViewElement;
