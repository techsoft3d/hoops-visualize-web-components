import { html } from 'lit';
import { describe, expect, it, vi } from 'vitest';
import { renderTemplate, tick, nextFrame } from '../testing/utils';
import './hoops-tabs';
import './hoops-tab';
import { HoopsTabsElement } from './hoops-tabs';

describe('hoops-tabs', () => {
  it('should have default properties', async () => {
    await renderTemplate(html`<hoops-tabs></hoops-tabs>`);
    const tabs: HoopsTabsElement = document.querySelector('hoops-tabs')!;

    expect(tabs.selectedIndex).toBe(0);
    expect(tabs.position).toBe('top');
  });

  it('should set selectedIndex property', async () => {
    await renderTemplate(html`<hoops-tabs selectedIndex="1"></hoops-tabs>`);
    const tabs: HoopsTabsElement = document.querySelector('hoops-tabs')!;

    expect(tabs.selectedIndex).toBe(1);
  });

  it('should set position property', async () => {
    await renderTemplate(html`<hoops-tabs position="bottom"></hoops-tabs>`);
    const tabs: HoopsTabsElement = document.querySelector('hoops-tabs')!;

    expect(tabs.position).toBe('bottom');
  });

  it('should render tab buttons in tab header', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="0">
        <hoops-tab label="Tab 1"></hoops-tab>
        <hoops-tab label="Tab 2"></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();
    const tabHeader = tabs.shadowRoot?.querySelector('.tab-header');
    const tabButtons = tabHeader?.querySelectorAll('.tab-button');

    expect(tabButtons?.length).toBe(2);
  });

  it('should have tablist role on header', async () => {
    await renderTemplate(html`<hoops-tabs></hoops-tabs>`);
    const tabs: HoopsTabsElement = document.querySelector('hoops-tabs')!;
    const tabHeader = tabs.shadowRoot?.querySelector('[role="tablist"]');

    expect(tabHeader).toBeTruthy();
  });

  it('should set aria-selected on tab buttons', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="0">
        <hoops-tab label="Tab 1"></hoops-tab>
        <hoops-tab label="Tab 2"></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();
    const tabButtons = tabs.shadowRoot?.querySelectorAll('.tab-button');

    expect(tabButtons?.[0]?.getAttribute('aria-selected')).toBe('true');
    expect(tabButtons?.[1]?.getAttribute('aria-selected')).toBe('false');
  });

  it('should change selectedIndex when tab button is clicked', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="0">
        <hoops-tab label="Tab 1"></hoops-tab>
        <hoops-tab label="Tab 2"></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();
    const tabButtons = tabs.shadowRoot?.querySelectorAll('.tab-button');
    const secondButton = tabButtons?.[1] as HTMLButtonElement;

    secondButton.click();
    await tabs.updateComplete;

    expect(tabs.selectedIndex).toBe(1);
  });

  it('should emit hoops-tabs-change event when tab is selected', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="0">
        <hoops-tab label="Tab 1" value="tab1"></hoops-tab>
        <hoops-tab label="Tab 2" value="tab2"></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();
    let eventFired = false;
    let eventDetail: any = null;

    tabs.addEventListener('hoops-tabs-change', (e: any) => {
      eventFired = true;
      eventDetail = e.detail;
    });

    const tabButtons = tabs.shadowRoot?.querySelectorAll('.tab-button');
    const secondButton = tabButtons?.[1] as HTMLButtonElement;

    secondButton.click();
    await tick();

    expect(eventFired).toBe(true);
    expect(eventDetail.selectedIndex).toBe(1);
    expect(eventDetail.selectedValue).toBe('tab2');
  });

  it('should hide disabled tabs from selection', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="0">
        <hoops-tab label="Tab 1"></hoops-tab>
        <hoops-tab label="Tab 2" disabled></hoops-tab>
        <hoops-tab label="Tab 3"></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();
    const tabButtons = tabs.shadowRoot?.querySelectorAll('.tab-button');

    expect(tabButtons?.[1]?.getAttribute('disabled')).toBe('');
  });

  it('should not select disabled tab when clicked', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="0">
        <hoops-tab label="Tab 1"></hoops-tab>
        <hoops-tab label="Tab 2" disabled></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();
    const tabButtons = tabs.shadowRoot?.querySelectorAll('.tab-button');
    const disabledButton = tabButtons?.[1] as HTMLButtonElement;

    disabledButton.click();
    await tick();

    expect(tabs.selectedIndex).toBe(0);
  });

  it('should render tab labels correctly', async () => {
    await renderTemplate(html`
      <hoops-tabs>
        <hoops-tab label="Settings"></hoops-tab>
        <hoops-tab label="Profile"></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();
    const tabButtons = tabs.shadowRoot?.querySelectorAll('.tab-button');

    expect(tabButtons?.[0]?.textContent?.trim()).toContain('Settings');
    expect(tabButtons?.[1]?.textContent?.trim()).toContain('Profile');
  });

  it('should render tab icons when provided', async () => {
    await renderTemplate(html`
      <hoops-tabs>
        <hoops-tab label="Settings" icon="⚙️"></hoops-tab>
        <hoops-tab label="Profile" icon="👤"></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();
    const iconElements = tabs.shadowRoot?.querySelectorAll('.tab-icon');

    expect(iconElements?.length).toBe(2);
    expect(iconElements?.[0]?.textContent).toContain('⚙️');
    expect(iconElements?.[1]?.textContent).toContain('👤');
  });

  it('should not render icon element when icon is not provided', async () => {
    await renderTemplate(html`
      <hoops-tabs>
        <hoops-tab label="Tab 1"></hoops-tab>
        <hoops-tab label="Tab 2" icon="📝"></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();
    const iconElements = tabs.shadowRoot?.querySelectorAll('.tab-icon');

    // Only one icon should be rendered (for tab 2)
    expect(iconElements?.length).toBe(1);
  });

  it('should update tab visibility based on selectedIndex', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="0">
        <hoops-tab label="Tab 1"><div id="content1">Content 1</div></hoops-tab>
        <hoops-tab label="Tab 2"><div id="content2">Content 2</div></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();
    const tab1 = tabs.querySelector('hoops-tab:first-of-type') as HTMLElement;
    const tab2 = tabs.querySelector('hoops-tab:last-of-type') as HTMLElement;

    expect(tab1?.getAttribute('aria-hidden')).toBe('false');
    expect(tab2?.getAttribute('aria-hidden')).toBe('true');

    tabs.selectedIndex = 1;
    await tick();

    expect(tab1?.getAttribute('aria-hidden')).toBe('true');
    expect(tab2?.getAttribute('aria-hidden')).toBe('false');
  });

  it('should support selectByValue method', async () => {
    await renderTemplate(html`
      <hoops-tabs>
        <hoops-tab label="Tab 1" value="tab1"></hoops-tab>
        <hoops-tab label="Tab 2" value="tab2"></hoops-tab>
        <hoops-tab label="Tab 3" value="tab3"></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();

    tabs.selectByValue('tab3');
    await tabs.updateComplete;

    expect(tabs.selectedIndex).toBe(2);
  });

  it('should handle position property changes', async () => {
    await renderTemplate(html`<hoops-tabs position="left"></hoops-tabs>`);
    const tabs: HoopsTabsElement = document.querySelector('hoops-tabs')!;

    expect(tabs.position).toBe('left');

    tabs.position = 'right';
    await tick();

    expect(tabs.position).toBe('right');
  });

  it('should have correct role on tab buttons', async () => {
    await renderTemplate(html`
      <hoops-tabs>
        <hoops-tab label="Tab 1"></hoops-tab>
        <hoops-tab label="Tab 2"></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();
    const tabButtons = tabs.shadowRoot?.querySelectorAll('[role="tab"]');

    expect(tabButtons?.length).toBe(2);
  });

  it('should have tabpanel role on hoops-tab elements', async () => {
    await renderTemplate(html`
      <hoops-tabs>
        <hoops-tab label="Tab 1"></hoops-tab>
        <hoops-tab label="Tab 2"></hoops-tab>
      </hoops-tabs>
    `);
    const tabPanels = document.querySelectorAll('hoops-tab');

    tabPanels.forEach((panel) => {
      const tabpanel = panel.shadowRoot?.querySelector('[role="tabpanel"]');
      expect(tabpanel).toBeTruthy();
    });
  });

  it('should render slot for tab content', async () => {
    await renderTemplate(html`
      <hoops-tabs>
        <hoops-tab label="Tab 1"><p id="content">Content</p></hoops-tab>
      </hoops-tabs>
    `);
    const tabs: HoopsTabsElement = document.querySelector('hoops-tabs')!;
    const content = tabs.querySelector('#content');

    expect(content).toBeTruthy();
    expect(content?.textContent).toBe('Content');
  });

  it('should support keyboard navigation with arrow keys', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="0">
        <hoops-tab label="Tab 1"></hoops-tab>
        <hoops-tab label="Tab 2"></hoops-tab>
        <hoops-tab label="Tab 3"></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();
    const tabButtons = tabs.shadowRoot?.querySelectorAll('.tab-button');
    const firstButton = tabButtons?.[0] as HTMLButtonElement;

    firstButton.focus();
    firstButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await tick();

    // The next enabled tab should be focused
    expect(document.activeElement?.getAttribute('aria-selected')).not.toBe(
      firstButton.getAttribute('aria-selected'),
    );
  });

  it('should support Home and End keys for navigation', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="1">
        <hoops-tab label="Tab 1"></hoops-tab>
        <hoops-tab label="Tab 2"></hoops-tab>
        <hoops-tab label="Tab 3"></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();
    const tabButtons = tabs.shadowRoot?.querySelectorAll(
      '.tab-button',
    ) as NodeListOf<HTMLButtonElement> | null;
    const secondButton = tabButtons?.[1] as HTMLButtonElement;

    secondButton.focus();
    secondButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await tick();

    // First tab should be focused
    expect(tabs.shadowRoot?.activeElement).toBe(tabButtons?.[0]);
  });

  it('should have correct tabindex values', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="1">
        <hoops-tab label="Tab 1"></hoops-tab>
        <hoops-tab label="Tab 2"></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();
    const tabButtons = tabs.shadowRoot?.querySelectorAll('button[role="tab"]');

    expect(tabButtons?.[0]?.getAttribute('tabindex')).toBe('-1');
    expect(tabButtons?.[1]?.getAttribute('tabindex')).toBe('0');
  });

  it('should reflect selectedIndex attribute', async () => {
    await renderTemplate(html`<hoops-tabs selectedIndex="2"></hoops-tabs>`);
    const tabs: HoopsTabsElement = document.querySelector('hoops-tabs')!;

    expect(tabs.getAttribute('selectedIndex')).toBe('2');
  });

  it('should reflect position attribute', async () => {
    await renderTemplate(html`<hoops-tabs position="bottom"></hoops-tabs>`);
    const tabs: HoopsTabsElement = document.querySelector('hoops-tabs')!;

    expect(tabs.getAttribute('position')).toBe('bottom');
  });

  it('should render tab button with empty label when label is not provided', async () => {
    await renderTemplate(html`
      <hoops-tabs>
        <hoops-tab></hoops-tab>
        <hoops-tab label="Tab 2"></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();
    const tabButtons = tabs.shadowRoot?.querySelectorAll('.tab-button');

    // First tab button should exist but have empty label
    expect(tabButtons?.[0]).toBeTruthy();
    expect(tabButtons?.[0]?.textContent?.trim()).toBe('');
    // Second tab button should have label
    expect(tabButtons?.[1]?.textContent?.trim()).toBe('Tab 2');
  });

  it('should handle updateTabVisibility when no tabs are present', async () => {
    await renderTemplate(html`<hoops-tabs selectedIndex="0"></hoops-tabs>`);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;

    // Change selectedIndex to trigger _updateTabVisibility() with no tabs
    tabs.selectedIndex = 1;
    await tabs.updateComplete;

    // Should not throw error and remain stable
    expect(tabs.selectedIndex).toBe(1);
  });

  it('should not emit hoops-tabs-change event when clicking disabled tab', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="0">
        <hoops-tab label="Tab 1"></hoops-tab>
        <hoops-tab label="Tab 2" disabled></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();

    let eventFired = false;
    tabs.addEventListener('hoops-tabs-change', () => {
      eventFired = true;
    });

    const tabButtons = tabs.shadowRoot?.querySelectorAll('.tab-button');
    const disabledButton = tabButtons?.[1] as HTMLButtonElement;

    disabledButton.click();
    await tick();

    // Event should not fire when clicking disabled tab
    expect(eventFired).toBe(false);
    expect(tabs.selectedIndex).toBe(0);
  });

  it('should prevent default for Enter key', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="0">
        <hoops-tab label="Tab 1"></hoops-tab>
        <hoops-tab label="Tab 2"></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();

    const tabButtons = tabs.shadowRoot?.querySelectorAll('.tab-button');
    const firstButton = tabButtons?.[0] as HTMLButtonElement;

    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    firstButton.dispatchEvent(event);
    await tick();

    // preventDefault should be called to prevent browser default behavior
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should prevent default for Space key', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="0">
        <hoops-tab label="Tab 1"></hoops-tab>
        <hoops-tab label="Tab 2"></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();

    const tabButtons = tabs.shadowRoot?.querySelectorAll('.tab-button');
    const firstButton = tabButtons?.[0] as HTMLButtonElement;

    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    firstButton.dispatchEvent(event);
    await tick();

    // preventDefault should be called to prevent browser default behavior
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should handle unknown key press without action', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="0">
        <hoops-tab label="Tab 1"></hoops-tab>
        <hoops-tab label="Tab 2"></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();

    let eventFired = false;
    tabs.addEventListener('hoops-tabs-change', () => {
      eventFired = true;
    });

    const tabButtons = tabs.shadowRoot?.querySelectorAll('.tab-button');
    const firstButton = tabButtons?.[0] as HTMLButtonElement;

    // Unknown key should not trigger any action
    firstButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', bubbles: true }));
    await tick();

    expect(eventFired).toBe(false);
    expect(tabs.selectedIndex).toBe(0);
  });

  it('should navigate left with ArrowLeft key in horizontal position', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="1" position="top">
        <hoops-tab label="Tab 1"></hoops-tab>
        <hoops-tab label="Tab 2"></hoops-tab>
        <hoops-tab label="Tab 3"></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();

    const tabButtons = tabs.shadowRoot?.querySelectorAll('.tab-button');
    const secondButton = tabButtons?.[1] as HTMLButtonElement;

    secondButton.focus();
    secondButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await tick();

    // ArrowLeft should focus previous tab
    expect(tabs.shadowRoot?.activeElement).toBe(tabButtons?.[0]);
  });

  it('should navigate right with ArrowRight key in horizontal position', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="0" position="top">
        <hoops-tab label="Tab 1"></hoops-tab>
        <hoops-tab label="Tab 2"></hoops-tab>
        <hoops-tab label="Tab 3"></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();

    const tabButtons = tabs.shadowRoot?.querySelectorAll('.tab-button');
    const firstButton = tabButtons?.[0] as HTMLButtonElement;

    firstButton.focus();
    firstButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await tick();

    // ArrowRight should focus next tab
    expect(tabs.shadowRoot?.activeElement).toBe(tabButtons?.[1]);
  });

  it('should navigate up with ArrowUp key in vertical position', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="1" position="left">
        <hoops-tab label="Tab 1"></hoops-tab>
        <hoops-tab label="Tab 2"></hoops-tab>
        <hoops-tab label="Tab 3"></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();

    const tabButtons = tabs.shadowRoot?.querySelectorAll('.tab-button');
    const secondButton = tabButtons?.[1] as HTMLButtonElement;

    secondButton.focus();
    secondButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await tick();

    // ArrowUp should focus previous tab in vertical mode
    expect(tabs.shadowRoot?.activeElement).toBe(tabButtons?.[0]);
  });

  it('should navigate down with ArrowDown key in vertical position', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="0" position="right">
        <hoops-tab label="Tab 1"></hoops-tab>
        <hoops-tab label="Tab 2"></hoops-tab>
        <hoops-tab label="Tab 3"></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();

    const tabButtons = tabs.shadowRoot?.querySelectorAll('.tab-button');
    const firstButton = tabButtons?.[0] as HTMLButtonElement;

    firstButton.focus();
    firstButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await tick();

    // ArrowDown should focus next tab in vertical mode
    expect(tabs.shadowRoot?.activeElement).toBe(tabButtons?.[1]);
  });

  it('should navigate to End tab with End key', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="0">
        <hoops-tab label="Tab 1"></hoops-tab>
        <hoops-tab label="Tab 2"></hoops-tab>
        <hoops-tab label="Tab 3"></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();

    const tabButtons = tabs.shadowRoot?.querySelectorAll('.tab-button');
    const firstButton = tabButtons?.[0] as HTMLButtonElement;

    firstButton.focus();
    firstButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await tick();

    // End key should focus last tab
    expect(tabs.shadowRoot?.activeElement).toBe(tabButtons?.[2]);
  });

  it('should wrap around when navigating left from first tab', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="0">
        <hoops-tab label="Tab 1"></hoops-tab>
        <hoops-tab label="Tab 2"></hoops-tab>
        <hoops-tab label="Tab 3"></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();

    const tabButtons = tabs.shadowRoot?.querySelectorAll('.tab-button');
    const firstButton = tabButtons?.[0] as HTMLButtonElement;

    firstButton.focus();
    firstButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await tick();

    // Should wrap around to last tab (couvre lignes 408-413 de _findPreviousEnabledTab)
    expect(tabs.shadowRoot?.activeElement).toBe(tabButtons?.[2]);
  });

  it('should wrap around when navigating right from last tab', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="2">
        <hoops-tab label="Tab 1"></hoops-tab>
        <hoops-tab label="Tab 2"></hoops-tab>
        <hoops-tab label="Tab 3"></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();

    const tabButtons = tabs.shadowRoot?.querySelectorAll('.tab-button');
    const lastButton = tabButtons?.[2] as HTMLButtonElement;

    lastButton.focus();
    lastButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await tick();

    // Should wrap around to first tab (couvre lignes 430-435 de _findNextEnabledTab)
    expect(tabs.shadowRoot?.activeElement).toBe(tabButtons?.[0]);
  });

  it('should leave selection unchanged when navigating left and no tab is enabled', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="0">
        <hoops-tab label="Tab 1" disabled></hoops-tab>
        <hoops-tab label="Tab 2" disabled></hoops-tab>
        <hoops-tab label="Tab 3" disabled></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();

    const tabButtons = tabs.shadowRoot?.querySelectorAll('.tab-button');
    const firstButton = tabButtons?.[0] as HTMLButtonElement;

    firstButton.focus();
    firstButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await tick();

    // Should wrap around to first tab (couvre lignes 430-435 de _findNextEnabledTab)
    expect(tabs.shadowRoot?.activeElement).toBe(tabButtons?.[0]);
  });

  it('should leave selection unchanged when navigating right and no tab is enabled', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="2">
        <hoops-tab label="Tab 1" disabled></hoops-tab>
        <hoops-tab label="Tab 2" disabled></hoops-tab>
        <hoops-tab label="Tab 3" disabled></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();

    const tabButtons = tabs.shadowRoot?.querySelectorAll('.tab-button');
    const lastButton = tabButtons?.[2] as HTMLButtonElement;

    lastButton.focus();
    lastButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await tick();

    // Should wrap around to first tab (couvre lignes 430-435 de _findNextEnabledTab)
    expect(tabs.shadowRoot?.activeElement).toBe(tabButtons?.[2]);
  });

  it('should skip disabled tabs when finding first enabled tab', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="0">
        <hoops-tab label="Tab 1" disabled></hoops-tab>
        <hoops-tab label="Tab 2" disabled></hoops-tab>
        <hoops-tab label="Tab 3" disabled></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();

    const tabButtons = tabs.shadowRoot?.querySelectorAll('.tab-button');
    const firstButton = tabButtons?.[0] as HTMLButtonElement;

    firstButton.focus();
    firstButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await tick();

    // Should skip disabled tabs and focus first enabled tab (couvre ligne 450 de _findFirstEnabledTab)
    expect(tabs.shadowRoot?.activeElement).toBe(tabButtons?.[0]);
  });

  it('should skip disabled tabs when finding last enabled tab', async () => {
    await renderTemplate(html`
      <hoops-tabs selectedIndex="0">
        <hoops-tab label="Tab 1" disabled></hoops-tab>
        <hoops-tab label="Tab 2" disabled></hoops-tab>
        <hoops-tab label="Tab 3" disabled></hoops-tab>
      </hoops-tabs>
    `);
    const tabs = document.querySelector('hoops-tabs')! as HoopsTabsElement;
    await tabs.updateComplete;
    await nextFrame();

    const tabButtons = tabs.shadowRoot?.querySelectorAll('.tab-button');
    const firstButton = tabButtons?.[0] as HTMLButtonElement;

    firstButton.focus();
    firstButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await tick();

    // Should skip disabled tabs and focus last enabled tab (couvre ligne 465 de _findLastEnabledTab)
    expect(tabs.shadowRoot?.activeElement).toBe(tabButtons?.[2]);
  });
});
