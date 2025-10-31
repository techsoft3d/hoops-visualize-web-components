import { html } from 'lit';
import { describe, it, expect, vi } from 'vitest';

import { renderTemplate } from '../testing/utils';

import './hoops-markup-item';
import { HoopsMarkupItemElement } from './hoops-markup-item';

describe('hoops-markup-item', () => {
  it('should be defined', () => {
    const markupItem = document.createElement('hoops-markup-item');
    expect(markupItem).toBeInstanceOf(HTMLElement);
  });

  it('should render correctly without any properties', async () => {
    renderTemplate(html`<hoops-markup-item>test</hoops-markup-item>`);
    const markupItem = document.querySelector('hoops-markup-item') as HoopsMarkupItemElement;
    expect(markupItem).not.toBeNull();

    await markupItem!.updateComplete;
    expect(markupItem?.shadowRoot?.querySelector('.markup')).not.toBeNull();
    expect(markupItem?.shadowRoot?.querySelector('.icon')).not.toBeNull();
    const slotIcon = markupItem?.shadowRoot?.querySelector(
      '.icon slot[name="icon"]',
    ) as HTMLSlotElement;
    expect(slotIcon).not.toBeNull();
    expect(slotIcon.assignedElements().length).toBe(0);

    expect(markupItem?.shadowRoot?.querySelector('.label')).not.toBeNull();
    const slotLabel = markupItem?.shadowRoot?.querySelector(
      '.label slot:not([name])',
    ) as HTMLSlotElement;
    expect(slotLabel).not.toBeNull();
    expect(slotLabel.assignedElements().length).toBe(0);
    expect(markupItem?.shadowRoot?.querySelector('.toolbar')).not.toBeNull();
    const slotToolbar = markupItem?.shadowRoot?.querySelector(
      '.toolbar slot[name="toolbar"]',
    ) as HTMLSlotElement;
    expect(slotToolbar).not.toBeNull();
    expect(slotToolbar.assignedElements().length).toBe(0);
  });

  it('should render with markupId', async () => {
    renderTemplate(html`<hoops-markup-item markupId="test-id"></hoops-markup-item>`);
    const markupItem = document.querySelector('hoops-markup-item') as HoopsMarkupItemElement;
    expect(markupItem.markupId).toBe('test-id');

    await markupItem!.updateComplete;
    expect(markupItem.hasAttribute('markupId')).toBeTruthy();
    expect(markupItem.getAttribute('markupId')).toBe('test-id');
  });

  it('should render with label', async () => {
    renderTemplate(html`<hoops-markup-item>Markup With Label</hoops-markup-item>`);
    const markupItem = document.querySelector('hoops-markup-item') as HoopsMarkupItemElement;

    await markupItem!.updateComplete;
  });

  it('should render with selected style', async () => {
    renderTemplate(html`<hoops-markup-item selected>Selected Markup</hoops-markup-item>`);
    const markupItem = document.querySelector('hoops-markup-item') as HoopsMarkupItemElement;

    await markupItem!.updateComplete;
    const markupDiv = markupItem.shadowRoot?.querySelector('.markup') as HTMLDivElement;
    expect(markupDiv.classList.contains('selected')).toBeTruthy();
  });

  it('should emit hoops-select-markup event on click', async () => {
    const clickHandler = vi.fn();
    document.addEventListener('hoops-select-markup', clickHandler);

    renderTemplate(html`<hoops-markup-item markupId="test-id">Test Markup</hoops-markup-item>`);
    const markupItem = document.querySelector('hoops-markup-item') as HoopsMarkupItemElement;

    await markupItem!.updateComplete;
    const markupDiv = markupItem.shadowRoot?.querySelector('.markup') as HTMLDivElement;
    markupDiv.click();

    expect(clickHandler).toHaveBeenCalledTimes(1);
    expect(clickHandler.mock.calls[0][0].detail).toBe('test-id');

    document.removeEventListener('hoops-select-markup', clickHandler);
  });
});
