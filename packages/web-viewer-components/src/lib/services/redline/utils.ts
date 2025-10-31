import { Markup } from '@ts3d-hoops/web-viewer';
import { RedlineItemData, RedlineViewData } from './types';

export function formatRedlineItem(markup: Markup.MarkupItem): RedlineItemData {
  return {
    id: markup.uniqueId,
    type: markup.getClassName(),
  };
}

export function formatRedlineView(view: Markup.MarkupView): RedlineViewData {
  return {
    id: view.getUniqueId(),
    items: view.getMarkup().map(formatRedlineItem),
  };
}

export function formatRedlineIcon(className: string): string {
  switch (className) {
    case 'Communicator.Markup.Redline.RedlineCircle':
      return 'redlineCircle';
    case 'Communicator.Markup.Redline.RedlineRectangle':
      return 'redlineRectangle';
    case 'Communicator.Markup.Redline.RedlinePolyline':
      return 'redlineFreehand';
    case 'Communicator.Markup.Redline.RedlineText':
      return 'redlineNote';
    default:
      console.warn(`Unknown redline class name: ${className}`);
      return 'undefined';
  }
}
