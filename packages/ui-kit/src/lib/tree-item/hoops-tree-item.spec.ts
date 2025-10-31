import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { html } from 'lit';

import { renderTemplate, tick } from '../testing/utils';
import HoopsTreeItemElement from './hoops-tree-item';

import './hoops-tree-item';

describe('hoops-tree-item', () => {
  it('should render a tree item with the default slot', async () => {
    await renderTemplate(html` <hoops-tree-item></hoops-tree-item> `);

    const treeItem = document.querySelector('hoops-tree-item') as HoopsTreeItemElement;
    expect(treeItem).not.toBeNull();
    expect(treeItem.shadowRoot?.querySelector('.tree-item')).not.toBeNull();
    expect(treeItem.shadowRoot?.querySelector('.expand-icon')).not.toBeNull();
    expect(treeItem.shadowRoot?.querySelector('hoops-icon[icon="rightIcon"]')).not.toBeNull();
    expect(treeItem.shadowRoot?.querySelector('.tree-item slot')).not.toBeNull();
    expect(treeItem.shadowRoot?.querySelector('.children')).not.toBeNull();
    expect(treeItem.shadowRoot?.querySelector('.children')!.hasAttribute('hidden')).toBe(true);
    expect(treeItem.shadowRoot?.querySelector('.children slot[name="children"]')).not.toBeNull();
  });

  it('should render a tree item with a label', async () => {
    await renderTemplate(html` <hoops-tree-item>Tree Item</hoops-tree-item> `);

    const treeItem = document.querySelector('hoops-tree-item') as HoopsTreeItemElement;
    expect(treeItem.shadowRoot?.querySelector('.tree-item')).not.toBeNull();
    const slot = treeItem.shadowRoot?.querySelector(
      '.tree-item slot:not([name])',
    ) as HTMLSlotElement;
    expect(slot).not.toBeNull();
    expect(
      slot
        .assignedNodes()
        .map((current) => current.textContent)
        .join('')
        .trim(),
    ).toBe('Tree Item');
  });

  it('should render a tree leafs without an icon', async () => {
    await renderTemplate(html`
      <hoops-tree-item><span slot="icon">Icon</span>Tree Item</hoops-tree-item>
    `);

    const treeItem = document.querySelector('hoops-tree-item') as HoopsTreeItemElement;
    expect(treeItem.shadowRoot?.querySelector('.expand-icon')).not.toBeNull();
    const slot = treeItem.shadowRoot?.querySelector(
      '.expand-icon slot[name="icon"]',
    ) as HTMLSlotElement;
    expect(slot).not.toBeNull();
    expect(slot.assignedNodes.length).toBe(0);
  });

  it('should render selected tree item', async () => {
    await renderTemplate(html` <hoops-tree-item selected>Selected Tree Item</hoops-tree-item> `);

    const treeItem = document.querySelector('hoops-tree-item') as HoopsTreeItemElement;
    expect(treeItem.shadowRoot?.querySelector('.tree-item.selected')).not.toBeNull();
  });

  it('should render expanded tree item', async () => {
    await renderTemplate(html` <hoops-tree-item expanded>Expanded Tree Item</hoops-tree-item> `);

    const treeItem = document.querySelector('hoops-tree-item') as HoopsTreeItemElement;
    expect(treeItem.shadowRoot?.querySelector('hoops-icon[icon="downIcon"]')).not.toBeNull();
    expect(treeItem.shadowRoot?.querySelector('.children.expanded')).not.toBeNull();
    expect(treeItem.shadowRoot?.querySelector('.children.collapsed')).toBeNull();
    expect(treeItem.shadowRoot?.querySelector('.children.hidden')).toBeNull();
    expect(treeItem.shadowRoot?.querySelector('.children')?.hasAttribute('hidden')).toBeFalsy();
  });

  it('should render collapsed tree item', async () => {
    await renderTemplate(html` <hoops-tree-item>Collapsed Tree Item</hoops-tree-item> `);

    const treeItem = document.querySelector('hoops-tree-item') as HoopsTreeItemElement;
    treeItem.expanded = true;
    await tick();
    treeItem.expanded = false;
    await tick();

    expect(treeItem.shadowRoot?.querySelector('hoops-icon[icon="rightIcon"]')).not.toBeNull();
    expect(treeItem.shadowRoot?.querySelector('.children.collapsed')).not.toBeNull();
    expect(treeItem.shadowRoot?.querySelector('.children.expanded')).toBeNull();
    expect(treeItem.shadowRoot?.querySelector('.children.hidden')).toBeNull();
    expect(treeItem.shadowRoot?.querySelector('.children')?.hasAttribute('hidden')).toBeFalsy();
  });

  it('should render hidden tree item on first load if not expanded', async () => {
    await renderTemplate(html` <hoops-tree-item>Hidden Tree Item</hoops-tree-item> `);

    const treeItem = document.querySelector('hoops-tree-item') as HoopsTreeItemElement;
    expect(treeItem.shadowRoot?.querySelector('hoops-icon[icon="rightIcon"]')).not.toBeNull();
    expect(treeItem.shadowRoot?.querySelector('.children.expanded')).toBeNull();
    expect(treeItem.shadowRoot?.querySelector('.children.collapsed')).toBeNull();
    expect(treeItem.shadowRoot?.querySelector('.children')?.hasAttribute('hidden')).toBeTruthy();
  });

  it('should render children in the slot', async () => {
    await renderTemplate(html`
      <hoops-tree-item>
        <span slot="icon">Icon</span>
        Tree Item
        <div slot="children">
          <hoops-tree-item>Child Item 1</hoops-tree-item>
          <hoops-tree-item>Child Item 2</hoops-tree-item>
        </div>
      </hoops-tree-item>
    `);

    const treeItem = document.querySelector('hoops-tree-item') as HoopsTreeItemElement;
    const childrenSlot = treeItem.shadowRoot?.querySelector(
      '.children slot[name="children"]',
    ) as HTMLSlotElement;
    expect(childrenSlot).not.toBeNull();
    const assignedElements = childrenSlot?.assignedElements() || [];
    expect(assignedElements.length).toBe(1);
    const childItems = assignedElements[0].querySelectorAll('hoops-tree-item');

    expect(childItems.length).toBe(2);
    expect(childItems[0].textContent?.trim()).toBe('Child Item 1');
    expect(childItems[1].textContent?.trim()).toBe('Child Item 2');
  });

  it('should toggle expanded state on click', async () => {
    await renderTemplate(html` <hoops-tree-item>Toggle Item</hoops-tree-item> `);

    const treeItem = document.querySelector('hoops-tree-item') as HoopsTreeItemElement;
    const expandIcon = treeItem.shadowRoot?.querySelector('.expand-icon') as HTMLElement;

    expect(treeItem.expanded).toBe(false);
    expandIcon.click();
    await tick();
    expect(treeItem.expanded).toBe(true);
    expect(treeItem.shadowRoot?.querySelector('.children.expanded')).not.toBeNull();

    expandIcon.click();
    await tick();
    expect(treeItem.expanded).toBe(false);
    expect(treeItem.shadowRoot?.querySelector('.children.collapsed')).not.toBeNull();
  });

  it('should dispatch select event on click', async () => {
    await renderTemplate(html`
      <hoops-tree-item>
        Selectable Item
        <div slot="children">
          <hoops-tree-item id="child-1">Child Item 1</hoops-tree-item>
          <hoops-tree-item>Child Item 2</hoops-tree-item>
        </div>
      </hoops-tree-item>
    `);

    const treeItem = document.querySelector('hoops-tree-item') as HoopsTreeItemElement;
    const container = treeItem.shadowRoot?.querySelector('.tree-item') as HTMLElement;
    expect(treeItem.selected).toBe(false);

    const promiseSelect = new Promise<boolean>((resolve) => {
      treeItem.addEventListener('hoops-tree-item-select', ((event: CustomEvent) => {
        expect(event.detail.selected).toBe(true);
        resolve(event.detail.selected);
      }) as any);
    });
    container.click();

    expect(promiseSelect).resolves.toBe(true);
  });

  it('should support overriding the expand icon', async () => {
    await renderTemplate(html`
      <hoops-tree-item>
        <span slot="icon">📁</span>
        Custom Expand Icon
        <div slot="children">
          <hoops-tree-item>Child Item 1</hoops-tree-item>
          <hoops-tree-item>Child Item 2</hoops-tree-item>
        </div>
      </hoops-tree-item>
    `);

    const treeItem = document.querySelector('hoops-tree-item') as HoopsTreeItemElement;
    const iconSlot = treeItem.shadowRoot?.querySelector(
      '.expand-icon slot[name="icon"]',
    ) as HTMLSlotElement;
    expect(iconSlot).not.toBeNull();
    const assignedNodes = iconSlot.assignedNodes();
    expect(assignedNodes.length).toBeGreaterThan(0);
    expect(
      assignedNodes
        .map((item) => item.textContent)
        .join('')
        .trim(),
    ).toBe('📁');
  });
});
