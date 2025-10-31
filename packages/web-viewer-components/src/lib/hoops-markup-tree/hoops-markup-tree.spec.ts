import { html } from 'lit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HoopsMarkupTreeElement } from './hoops-markup-tree';
import { RedlineServiceMock } from '../../mocks/RedlineServiceMock';

import './hoops-markup-tree';
import { renderTemplate } from '../testing/utils';
import { HoopsMarkupViewElement } from '../hoops-markup-view';

describe('hoops-markup-tree', () => {
  const redlineService = new RedlineServiceMock(vi.fn);

  beforeEach(() => {
    redlineService.fireRedlineManagerResetEvent();
    vi.clearAllMocks();
  });

  it('renders no markup views if there are no redlines', async () => {
    redlineService.clear();
    await renderTemplate(
      html`<hoops-markup-tree .redlineService=${redlineService}></hoops-markup-tree>`,
    );
    const elm = document.querySelector('hoops-markup-tree') as HoopsMarkupTreeElement;
    await elm.updateComplete;

    expect(elm).not.toBeNull();

    expect(elm.shadowRoot!.querySelectorAll('hoops-markup-view').length).toEqual(0);
  });

  it('renders each markup views', async () => {
    await renderTemplate(
      html`<hoops-markup-tree .redlineService=${redlineService}></hoops-markup-tree>`,
    );
    const elm = document.querySelector('hoops-markup-tree') as HoopsMarkupTreeElement;
    await elm.updateComplete;

    const views = elm.shadowRoot!.querySelectorAll('hoops-markup-view');
    expect(views.length).toEqual(2);
    expect(views[0].getAttribute('uuid')).toEqual('1234-5678-9012-3456');
    expect(views[1].getAttribute('uuid')).toEqual('7890-1234-5678-9012');
  });

  it('updates when a redline is created', async () => {
    await renderTemplate(
      html`<hoops-markup-tree .redlineService=${redlineService}></hoops-markup-tree>`,
    );

    const elm = document.querySelector('hoops-markup-tree') as HoopsMarkupTreeElement;
    await elm.updateComplete;

    const markupViewId = '1234-5678-9012-3456';
    const markupId = '0000-0000-0000-0000';

    redlineService.fireRedlineCreatedEvent({
      markupViewId,
      markup: { id: markupId, type: 'Communicator.Markup.Redline.RedlineCircle' },
    });

    await elm.updateComplete;

    expect(elm.shadowRoot!.querySelectorAll('hoops-markup-view').length).toEqual(2);
    const markupViews = elm.shadowRoot!.querySelectorAll('hoops-markup-view');
    expect(markupViews[0].getAttribute('uuid')).toEqual('1234-5678-9012-3456');
    expect(markupViews[1].getAttribute('uuid')).toEqual('7890-1234-5678-9012');

    expect(markupViews[0].shadowRoot!.querySelectorAll('hoops-markup-item').length).toEqual(5);
  });

  it.skip('updates when a redline is deleted', async () => {
    await renderTemplate(
      html`<hoops-markup-tree .redlineService=${redlineService}></hoops-markup-tree>`,
    );
    const elm = document.querySelector('hoops-markup-tree') as HoopsMarkupTreeElement;
    await elm.updateComplete;

    redlineService.dispatchEvent(new CustomEvent('hoops-redline-deleted'));
    await elm.updateComplete;

    expect(elm.shadowRoot!.querySelectorAll('hoops-markup-view').length).toEqual(0);
  });

  it.skip('updates when the redline service is reset', async () => {
    await renderTemplate(
      html`<hoops-markup-tree .redlineService=${redlineService}></hoops-markup-tree>`,
    );
    const elm = document.querySelector('hoops-markup-tree') as HoopsMarkupTreeElement;
    await elm.updateComplete;

    redlineService.dispatchEvent(new CustomEvent('hoops-redline-service-reset'));

    await elm.updateComplete;
    expect(elm.shadowRoot!.querySelectorAll('hoops-markup-view').length).toEqual(0);
  });

  it('deletes a redline item when the delete event is fired', async () => {
    await renderTemplate(
      html`<hoops-markup-tree .redlineService=${redlineService}></hoops-markup-tree>`,
    );
    const elm = document.querySelector('hoops-markup-tree') as HoopsMarkupTreeElement;
    await elm.updateComplete;

    const markupViewId = '1234-5678-9012-3456';
    const markupId = '0000-0000-0000-0000';

    redlineService.fireRedlineCreatedEvent({
      markupViewId,
      markup: { id: markupId, type: 'Communicator.Markup.Redline.RedlineCircle' },
    });

    await elm.updateComplete;

    const markupViews = elm.shadowRoot!.querySelectorAll('hoops-markup-view');
    const hoopsMarkupView = markupViews[0] as HoopsMarkupViewElement;

    expect(hoopsMarkupView.shadowRoot!.querySelectorAll('hoops-markup-item').length).toEqual(5);

    const promise = new Promise<void>((resolve) => {
      redlineService.addEventListener('hoops-redline-deleted', () => resolve());
    });

    hoopsMarkupView.dispatchEvent(
      new CustomEvent('hoops-delete-redline', {
        bubbles: true,
        composed: true,
        detail: { markupViewId, markupItem: { id: markupId } },
      }),
    );

    await hoopsMarkupView.updateComplete;

    expect(redlineService.removeRedlineItem).toHaveBeenCalledTimes(1);

    await promise;
    await hoopsMarkupView.updateComplete;
    expect(hoopsMarkupView.shadowRoot!.querySelectorAll('hoops-markup-item').length).toEqual(4);
  });
});
