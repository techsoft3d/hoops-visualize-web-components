import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { renderTemplate, tick } from '../testing/utils';
import './hoops-tab';
import { HoopsTabElement } from './hoops-tab';

describe('hoops-tab', () => {
  it('should have default properties', async () => {
    await renderTemplate(html`<hoops-tab></hoops-tab>`);
    const tab: HoopsTabElement = document.querySelector('hoops-tab')!;

    expect(tab.label).toBe('');
    expect(tab.value).toBeUndefined();
    expect(tab.icon).toBeUndefined();
    expect(tab.disabled).toBe(false);
  });

  it('should set and retrieve label property', async () => {
    await renderTemplate(html`<hoops-tab label="Settings"></hoops-tab>`);
    const tab: HoopsTabElement = document.querySelector('hoops-tab')!;

    expect(tab.label).toBe('Settings');
  });

  it('should set and retrieve value property', async () => {
    await renderTemplate(html`<hoops-tab value="settings-tab"></hoops-tab>`);
    const tab: HoopsTabElement = document.querySelector('hoops-tab')!;

    expect(tab.value).toBe('settings-tab');
  });

  it('should set and retrieve icon property', async () => {
    await renderTemplate(html`<hoops-tab icon="gear"></hoops-tab>`);
    const tab: HoopsTabElement = document.querySelector('hoops-tab')!;

    expect(tab.icon).toBe('gear');
  });

  it('should set disabled property', async () => {
    await renderTemplate(html`<hoops-tab disabled></hoops-tab>`);
    const tab: HoopsTabElement = document.querySelector('hoops-tab')!;

    expect(tab.disabled).toBe(true);
  });

  it('should render panel with tabpanel role', async () => {
    await renderTemplate(html`<hoops-tab></hoops-tab>`);
    const tab: HoopsTabElement = document.querySelector('hoops-tab')!;
    const panel = tab.shadowRoot?.querySelector('[role="tabpanel"]');

    expect(panel).toBeTruthy();
    expect(panel?.classList.contains('panel')).toBe(true);
  });

  it('should render slot for content', async () => {
    await renderTemplate(html`<hoops-tab><p id="test-content">Test Content</p></hoops-tab>`);
    const tab: HoopsTabElement = document.querySelector('hoops-tab')!;
    const content = tab.querySelector('#test-content');

    expect(content).toBeTruthy();
    expect(content?.textContent).toBe('Test Content');
  });

  it('should render multiple slotted elements', async () => {
    await renderTemplate(html`
      <hoops-tab>
        <div class="content1">Content 1</div>
        <div class="content2">Content 2</div>
      </hoops-tab>
    `);
    const tab: HoopsTabElement = document.querySelector('hoops-tab')!;
    const content1 = tab.querySelector('.content1');
    const content2 = tab.querySelector('.content2');

    expect(content1).toBeTruthy();
    expect(content2).toBeTruthy();
  });

  it('should support HTML content in slot', async () => {
    await renderTemplate(html`
      <hoops-tab>
        <h1>Title</h1>
        <p>Paragraph</p>
      </hoops-tab>
    `);
    const tab: HoopsTabElement = document.querySelector('hoops-tab')!;
    const heading = tab.querySelector('h1');
    const paragraph = tab.querySelector('p');

    expect(heading?.textContent).toBe('Title');
    expect(paragraph?.textContent).toBe('Paragraph');
  });

  it('should update label property when attribute changes', async () => {
    await renderTemplate(html`<hoops-tab label="Initial"></hoops-tab>`);
    const tab: HoopsTabElement = document.querySelector('hoops-tab')! as HoopsTabElement;

    expect(tab.label).toBe('Initial');

    tab.setAttribute('label', 'Updated');
    await tab.updateComplete;

    expect(tab.label).toBe('Updated');
  });

  it('should update value property when attribute changes', async () => {
    await renderTemplate(html`<hoops-tab value="initial"></hoops-tab>`);
    const tab: HoopsTabElement = document.querySelector('hoops-tab')!;

    expect(tab.value).toBe('initial');

    tab.setAttribute('value', 'updated');
    await tab.updateComplete;

    expect(tab.value).toBe('updated');
  });

  it('should update icon property when attribute changes', async () => {
    await renderTemplate(html`<hoops-tab icon="initial"></hoops-tab>`);
    const tab: HoopsTabElement = document.querySelector('hoops-tab')!;

    expect(tab.icon).toBe('initial');

    tab.setAttribute('icon', 'updated');
    await tab.updateComplete;

    expect(tab.icon).toBe('updated');
  });

  it('should update disabled property when attribute changes', async () => {
    await renderTemplate(html`<hoops-tab></hoops-tab>`);
    const tab: HoopsTabElement = document.querySelector('hoops-tab')!;

    expect(tab.disabled).toBe(false);

    tab.setAttribute('disabled', '');
    await tab.updateComplete;

    expect(tab.disabled).toBe(true);

    tab.removeAttribute('disabled');
    await tab.updateComplete;

    expect(tab.disabled).toBe(false);
  });

  it('should have correct tag name', async () => {
    await renderTemplate(html`<hoops-tab></hoops-tab>`);
    const tab = document.querySelector('hoops-tab')!;

    expect(tab.tagName).toBe('HOOPS-TAB');
  });

  it('should work with all properties set', async () => {
    await renderTemplate(
      html`<hoops-tab label="Settings" value="settings" icon="gear" disabled>
        <div>Tab Content</div>
      </hoops-tab>`,
    );
    const tab: HoopsTabElement = document.querySelector('hoops-tab')!;

    expect(tab.label).toBe('Settings');
    expect(tab.value).toBe('settings');
    expect(tab.icon).toBe('gear');
    expect(tab.disabled).toBe(true);

    const content = tab.querySelector('div');
    expect(content?.textContent).toBe('Tab Content');
  });
});
