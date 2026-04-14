import { html } from 'lit';
import { describe, expect, it, vi } from 'vitest';

import { renderTemplate } from '../testing/utils';
import './hoops-sheet-list';
import { HoopsSheetListElement } from './hoops-sheet-list';
import { SheetAdapter } from './SheetAdapter';
import { IModel } from './types';

/**
 * Creates a mock IModel with configurable sheets.
 */
function createMockModel(
  options: {
    sheetIds?: number[];
    nodeNames?: Map<number, string>;
    isDrawing?: boolean;
  } = {},
): IModel {
  const sheetIds = options.sheetIds ?? [];
  const nodeNames = options.nodeNames ?? new Map<number, string>();

  return {
    getSheetIds: vi.fn(() => sheetIds),
    getNodeName: vi.fn((nodeId: number) => nodeNames.get(nodeId) ?? null),
    isDrawing: vi.fn(() => options.isDrawing ?? true),
  };
}

describe('hoops-sheet-list', () => {
  it('should render', async () => {
    await renderTemplate(html`<hoops-sheet-list></hoops-sheet-list>`);
    const el = document.querySelector('hoops-sheet-list') as HoopsSheetListElement;
    await el.updateComplete;

    expect(el).toBeTruthy();
    expect(el.listElement).toBeTruthy();
  });

  it('should accept a model and populate the list', async () => {
    await renderTemplate(html`<hoops-sheet-list></hoops-sheet-list>`);
    const el = document.querySelector('hoops-sheet-list') as HoopsSheetListElement;
    await el.updateComplete;

    const model = createMockModel({
      sheetIds: [1, 2],
      nodeNames: new Map([
        [1, 'Sheet A'],
        [2, 'Sheet B'],
      ]),
    });
    el.model = model;

    expect(el.sheetAdapter?.elementsData.size).toBe(2);
    expect(el.sheetAdapter?.elementsData.get(1)).toBe('Sheet A');
    expect(el.sheetAdapter?.elementsData.get(2)).toBe('Sheet B');
  });

  it('should return empty selected array by default', async () => {
    await renderTemplate(html`<hoops-sheet-list></hoops-sheet-list>`);
    const el = document.querySelector('hoops-sheet-list') as HoopsSheetListElement;
    await el.updateComplete;

    expect(el.selected).toEqual([]);
  });

  it('should fire hoops-sheet-list-node-click on list element click', async () => {
    await renderTemplate(html`<hoops-sheet-list></hoops-sheet-list>`);
    const el = document.querySelector('hoops-sheet-list') as HoopsSheetListElement;
    await el.updateComplete;

    const listener = vi.fn();
    el.addEventListener('hoops-sheet-list-node-click', listener);

    // Simulate a click event from the inner list
    const innerList = el.listElement!;
    innerList.dispatchEvent(
      new CustomEvent('hoops-list-element-click', {
        bubbles: true,
        composed: true,
        detail: { key: 42, source: innerList },
      }),
    );

    expect(listener).toHaveBeenCalledOnce();
    expect(listener.mock.calls[0][0].detail.nodeId).toBe(42);
  });

  it('should select and deselect nodes via selectNodes', async () => {
    await renderTemplate(html`<hoops-sheet-list></hoops-sheet-list>`);
    const el = document.querySelector('hoops-sheet-list') as HoopsSheetListElement;
    await el.updateComplete;

    el.selectNodes([1, 2], true);
    expect(el.selected).toEqual([1, 2]);

    el.selectNodes([1], false);
    expect(el.selected).toEqual([2]);
  });

  it('should throw when setting sheetAdapter before list initialisation', () => {
    const el = new HoopsSheetListElement();
    expect(() => {
      el.sheetAdapter = new SheetAdapter();
    }).toThrow();
  });

  it('should throw when calling selectNodes before list initialisation', () => {
    const el = new HoopsSheetListElement();
    expect(() => el.selectNodes([1], true)).toThrow();
  });

  it('should throw when setting selected before list initialisation', () => {
    const el = new HoopsSheetListElement();
    expect(() => {
      el.selected = [1];
    }).toThrow();
  });

  it('should throw when setting model before adapter initialisation', () => {
    const el = new HoopsSheetListElement();
    expect(() => {
      el.model = createMockModel();
    }).toThrow();
  });
});
