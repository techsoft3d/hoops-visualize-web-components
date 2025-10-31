import { html } from 'lit';

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HoopsMarkupViewElement } from './hoops-markup-view';

import './hoops-markup-view';
import { renderTemplate } from '../testing/utils';

import { RedlineServiceMock } from '../../mocks/RedlineServiceMock';

describe('HoopsMarkupViewElement', () => {
  const service = new RedlineServiceMock(vi.fn);

  beforeEach(() => {
    service.fireRedlineManagerResetEvent();
  });

  it('should render correctly when empty', async () => {
    await renderTemplate(html`<hoops-markup-view></hoops-markup-view>`);
    const element = document.querySelector('hoops-markup-view') as HoopsMarkupViewElement;
    await element.updateComplete;

    const divElm = element.shadowRoot?.querySelector('div');

    expect(element).toBeInstanceOf(HoopsMarkupViewElement);
    expect(element.uuid).toBeFalsy();
    expect(element.shadowRoot?.querySelector('hoops-markup-item')).toBeNull();

    expect(divElm).not.toBeNull();
    expect(divElm).toHaveTextContent('No view found for UUID: ""');
  });

  it('should render correctly with an invalid UUID', async () => {
    const uuid = '9876-5432-1098-7654';
    await renderTemplate(
      html`<hoops-markup-view .redlineService=${service} uuid=${uuid}></hoops-markup-view>`,
    );
    const element = document.querySelector('hoops-markup-view') as HoopsMarkupViewElement;
    await element.updateComplete;

    const divElm = element.shadowRoot?.querySelector('div');

    expect(element).toBeInstanceOf(HoopsMarkupViewElement);
    expect(element.uuid).toBe(uuid);
    expect(element.shadowRoot?.querySelector('hoops-markup-item')).toBeNull();

    expect(divElm).not.toBeNull();
    expect(divElm).toHaveTextContent(`No view found for UUID: "${uuid}"`);
  });

  it('should render correctly with a valid UUID', async () => {
    const uuid = '1234-5678-9012-3456';

    await renderTemplate(
      html`<hoops-markup-view .redlineService=${service} uuid="${uuid}"></hoops-markup-view>`,
    );
    const element = document.querySelector('hoops-markup-view') as HoopsMarkupViewElement;
    await element.updateComplete;

    expect(element).toBeInstanceOf(HoopsMarkupViewElement);
    expect(element.uuid).toBe(uuid);

    const treeItem = element.shadowRoot?.querySelector('hoops-tree-item');
    expect(treeItem).not.toBeNull();
    expect(treeItem).toHaveTextContent(uuid);

    const children = treeItem?.querySelector('div[slot="children"]');
    expect(children).not.toBeNull();
    const markupItem = children?.querySelectorAll('hoops-markup-item');
    expect(markupItem).toHaveLength(4);
  });

  it('should handle redline created event', async () => {
    const uuid = '1234-5678-9012-3456';
    await renderTemplate(
      html`<hoops-markup-view .redlineService=${service} uuid="${uuid}"></hoops-markup-view>`,
    );
    const element = document.querySelector('hoops-markup-view') as HoopsMarkupViewElement;
    await element.updateComplete;

    service.fireRedlineCreatedEvent({
      markupViewId: uuid,
      markup: { id: 'new-redline', type: '' },
    });

    await element.updateComplete;
    expect(element.shadowRoot?.querySelectorAll('hoops-markup-item')).toHaveLength(5);
  });

  it('should handle redline deleted event', async () => {
    const uuid = '1234-5678-9012-3456';
    await renderTemplate(
      html`<hoops-markup-view .redlineService=${service} uuid="${uuid}"></hoops-markup-view>`,
    );
    const element = document.querySelector('hoops-markup-view') as HoopsMarkupViewElement;
    await element.updateComplete;

    service.fireRedlineDeletedEvent({
      markupViewId: uuid,
      markup: { id: 'markup1', type: 'Communicator.Markup.Redline.RedlineText' },
    });

    await element.updateComplete;
    expect(element.shadowRoot?.querySelectorAll('hoops-markup-item')).toHaveLength(3);
  });

  it('should handle redline manager reset event', async () => {
    const uuid = '1234-5678-9012-3456';
    await renderTemplate(
      html`<hoops-markup-view .redlineService=${service} uuid="${uuid}"></hoops-markup-view>`,
    );
    const element = document.querySelector('hoops-markup-view') as HoopsMarkupViewElement;
    await element.updateComplete;

    service.fireRedlineCreatedEvent({
      markupViewId: uuid,
      markup: { id: 'new-redline', type: 'Communicator.Markup.Redline.RedlineCircle' },
    });

    await element.updateComplete;

    vi.clearAllMocks();
    service.fireRedlineManagerResetEvent();

    await element.updateComplete;
    expect(service.getRedlineView).toHaveBeenCalledTimes(1);
    expect(service.getActiveViewKey).toHaveBeenCalledTimes(1);
    expect(element.shadowRoot?.querySelectorAll('hoops-markup-item')).toHaveLength(4);
  });

  it('should handle markup view activated event', async () => {
    const uuid = '1234-5678-9012-3456';
    await renderTemplate(
      html`<hoops-markup-view .redlineService=${service} uuid="${uuid}"></hoops-markup-view>`,
    );
    const element = document.querySelector('hoops-markup-view') as HoopsMarkupViewElement;
    await element.updateComplete;

    vi.clearAllMocks();
    service.fireRedlineViewActivatedEvent(uuid);

    await element.updateComplete;
    expect(service.getActiveViewKey).toHaveBeenCalled();
    expect((service.getActiveViewKey as ReturnType<typeof vi.fn>).mock.results[0].value).toBe(uuid);
    expect(element.shadowRoot?.querySelector('hoops-tree-item')?.hasAttribute('selected')).toBe(
      true,
    );
  });

  it('should not select the item if the active view key does not match', async () => {
    const uuid = '1234-5678-9012-3456';
    await renderTemplate(
      html`<hoops-markup-view .redlineService=${service} uuid="${uuid}"></hoops-markup-view>`,
    );
    const element = document.querySelector('hoops-markup-view') as HoopsMarkupViewElement;
    await element.updateComplete;

    vi.clearAllMocks();
    service.fireRedlineViewActivatedEvent('different-uuid');

    await element.updateComplete;
    expect(service.getActiveViewKey).toHaveBeenCalled();
    expect((service.getActiveViewKey as ReturnType<typeof vi.fn>).mock.results[0].value).toBe(
      'different-uuid',
    );
    expect(element.shadowRoot?.querySelector('hoops-tree-item')?.hasAttribute('selected')).toBe(
      false,
    );
  });

  it('should select the view when a markup item is selected', async () => {
    const uuid = '1234-5678-9012-3456';
    await renderTemplate(
      html`<hoops-markup-view .redlineService=${service} uuid="${uuid}"></hoops-markup-view>`,
    );
    const element = document.querySelector('hoops-markup-view') as HoopsMarkupViewElement;
    await element.updateComplete;

    const treeItem = element.shadowRoot?.querySelector('hoops-tree-item') as HTMLElement;
    expect(treeItem).not.toBeNull();

    vi.clearAllMocks();
    treeItem?.dispatchEvent(
      new CustomEvent('hoops-tree-item-select', {
        bubbles: true,
        composed: true,
        detail: { selected: true },
      }),
    );
    await element.updateComplete;

    expect(service.setActiveView).toHaveBeenCalledWith(uuid);
  });

  it('should support removing a markup item via the toolbar', async () => {
    const uuid = '1234-5678-9012-3456';
    const deleteMock = vi.fn();
    await renderTemplate(
      html`<hoops-markup-view
        .redlineService=${service}
        uuid=${uuid}
        @hoops-delete-redline=${(e: CustomEvent) => deleteMock(e.detail)}
      ></hoops-markup-view>`,
    );
    const element = document.querySelector('hoops-markup-view') as HoopsMarkupViewElement;
    await element.updateComplete;

    const markupItem = element.shadowRoot?.querySelector('hoops-markup-item');
    expect(markupItem).not.toBeNull();

    const deleteButton = markupItem?.querySelector('hoops-icon-button') as HTMLElement;
    expect(deleteButton).not.toBeNull();

    deleteButton.click();
    await element.updateComplete;

    expect(deleteMock).toHaveBeenCalledTimes(1);
    const detail = {
      markupViewId: uuid,
      markupItem: { id: 'markup1', type: 'Communicator.Markup.Redline.RedlineText' },
    };

    expect(deleteMock.mock.calls[0][0]).toEqual(detail);
  });
});
