import { nothing } from 'lit';
import { describe, expect, it, vi } from 'vitest';

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

describe('SheetAdapter', () => {
  it('should initialise with empty elementsData and sortedByValue true', () => {
    const adapter = new SheetAdapter();

    expect(adapter.elementsData.size).toBe(0);
    expect(adapter.sortedByValue).toBe(true);
    expect(adapter.model).toBeUndefined();
  });

  it('should return nothing when model is not set', () => {
    const adapter = new SheetAdapter();

    const result = adapter.getContent(adapter, 1, false);

    expect(result).toBe(nothing);
  });

  it('should return an HTML template when model is set', () => {
    const model = createMockModel({
      sheetIds: [10],
      nodeNames: new Map([[10, 'Sheet 1']]),
    });
    const adapter = new SheetAdapter();
    adapter.model = model;

    const result = adapter.getContent(adapter, 10, false);

    expect(result).not.toBe(nothing);
  });

  it('should use "Unnamed sheet" when getNodeName returns null', () => {
    const model = createMockModel({
      sheetIds: [10],
      nodeNames: new Map(),
    });
    const adapter = new SheetAdapter();
    adapter.model = model;

    const result = adapter.getContent(adapter, 10, false);

    expect(result).not.toBe(nothing);
    expect(model.getNodeName).toHaveBeenCalledWith(10);
  });
});
