import { formatRedlineItem, formatRedlineView, formatRedlineIcon } from './utils';
import { RedlineItemData, RedlineViewData } from './types';
import { describe, it, expect, vi } from 'vitest';

describe('formatRedlineItem', () => {
  it('should format a markup item correctly', () => {
    const markupItem = {
      uniqueId: 'item1',
      getClassName: () => 'Communicator.Markup.Redline.RedlineCircle',
    } as any;

    const result: RedlineItemData = formatRedlineItem(markupItem);

    expect(result).toEqual({
      id: 'item1',
      type: 'Communicator.Markup.Redline.RedlineCircle',
    });
  });
});

describe('formatRedlineView', () => {
  it('should format a markup view with items', () => {
    const markupItems = [
      {
        uniqueId: 'item1',
        getClassName: () => 'Communicator.Markup.Redline.RedlineCircle',
      },
      {
        uniqueId: 'item2',
        getClassName: () => 'Communicator.Markup.Redline.RedlineRectangle',
      },
    ];
    const markupView = {
      getUniqueId: () => 'view1',
      getMarkup: () => markupItems,
    } as any;

    const result: RedlineViewData = formatRedlineView(markupView);

    expect(result).toEqual({
      id: 'view1',
      items: [
        { id: 'item1', type: 'Communicator.Markup.Redline.RedlineCircle' },
        { id: 'item2', type: 'Communicator.Markup.Redline.RedlineRectangle' },
      ],
    });
  });

  it('should handle empty markup items', () => {
    const markupView = {
      getUniqueId: () => 'view2',
      getMarkup: () => [],
    } as any;

    const result: RedlineViewData = formatRedlineView(markupView);

    expect(result).toEqual({
      id: 'view2',
      items: [],
    });
  });
});

describe('formatRedlineIcon', () => {
  it('should return correct icon for RedlineCircle', () => {
    expect(formatRedlineIcon('Communicator.Markup.Redline.RedlineCircle')).toBe('redlineCircle');
  });

  it('should return correct icon for RedlineRectangle', () => {
    expect(formatRedlineIcon('Communicator.Markup.Redline.RedlineRectangle')).toBe(
      'redlineRectangle',
    );
  });

  it('should return correct icon for RedlinePolyline', () => {
    expect(formatRedlineIcon('Communicator.Markup.Redline.RedlinePolyline')).toBe(
      'redlineFreehand',
    );
  });

  it('should return correct icon for RedlineText', () => {
    expect(formatRedlineIcon('Communicator.Markup.Redline.RedlineText')).toBe('redlineNote');
  });

  it('should warn and return "undefined" for unknown class', () => {
    const warnSpy = vi.spyOn(console, 'warn');
    expect(formatRedlineIcon('UnknownClass')).toBe('undefined');
    expect(warnSpy).toHaveBeenCalledWith('Unknown redline class name: UnknownClass');
    warnSpy.mockRestore();
  });
});
