import { html, HTMLTemplateResult, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { RedlineServiceMock } from './RedlineServiceMock';
import { createUuid } from '@ts3d-hoops/web-viewer';
import { RedlineItemData } from '../lib/services';

@customElement('test-redline-service-event-panel')
export class RedlineServiceEventPanel extends LitElement {
  static styles = [];

  @property({ type: Object, attribute: false })
  public redlineService!: RedlineServiceMock;

  render() {
    return html`<div>
      <h2>Event panel</h2>
      <div style="display: flex; flex-flow: column wrap; gap: 0.5rem;">
        <button
          @click=${() => {
            this.redlineService.fireRedlineManagerResetEvent();
          }}
        >
          reset
        </button>
        <label for="views">
          Markup View:
          <input list="markup-existing-view" name="views" id="markup-creation-view" />
          <datalist id="markup-existing-view">
            ${this.redlineService
              .getRedlineViewKeys()
              .map((key) => html`<option value=${key}>${key}</option>`)}
          </datalist>
        </label>
        <label for="markup-id">
          Markup ID:
          <input
            type="text"
            name="markup-id"
            id="markup-id"
            id="markup-creation-id"
            placeholder="optional"
          />
        </label>
        <button
          @click=${() => {
            const viewElm = this.shadowRoot!.getElementById(
              'markup-creation-view',
            ) as HTMLInputElement;
            const markupIdElm = this.shadowRoot!.getElementById('markup-id') as HTMLInputElement;
            const markupViewId = viewElm.value || '1234-5678-9012-3456';
            const markupId = markupIdElm.value || createUuid();

            this.redlineService.fireRedlineCreatedEvent({
              markupViewId,
              markup: { id: markupId, type: 'Communicator.Markup.Redline.RedlineCircle' },
            });
          }}
        >
          create
        </button>
        <label for="markupItemSelect">
          Select Redline Item:
          <select name="markupItemSelect" id="markupItemSelect">
            ${this.redlineService.getRedlineViews().reduce<HTMLTemplateResult[]>((acc, view) => {
              const items = view.items.map(
                (item: RedlineItemData) =>
                  html`<option value=${`${view.id}/${item.id}`}>${item.id}</option>`,
              );

              acc.push(...items);
              return acc;
            }, [])}
          </select>
        </label>
        <button
          @click=${() => {
            const elm = this.shadowRoot!.getElementById('markupItemSelect') as HTMLSelectElement;
            const selectedItem = elm.value.split('/');
            const markupViewId = selectedItem[0];
            const markupId = selectedItem[1];
            this.redlineService.fireRedlineDeletedEvent({
              markupViewId: markupViewId,
              markup: { id: markupId, type: 'Communicator.Markup.Redline.RedlineCircle' },
            });
          }}
        >
          delete
        </button>
        <label for="markupViewSelect">
          Select Markup View:
          <select name="markupViewSelect" id="markupViewSelect">
            ${this.redlineService
              .getRedlineViewKeys()
              .map((key) => html`<option value=${key}>${key}</option>`)}
          </select>
        </label>
        <button
          @click=${() => {
            const elm = this.shadowRoot!.getElementById('markupViewSelect') as HTMLSelectElement;
            const selectedView = elm.value;
            this.redlineService.fireRedlineViewActivatedEvent(selectedView);
          }}
        >
          activate
        </button>
      </div>
    </div>`;
  }
}
