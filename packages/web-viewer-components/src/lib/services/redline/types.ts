import { Uuid } from '@ts3d-hoops/web-viewer';
import { IService } from '../types';
import { MarkupItemData, MarkupViewData } from '../markup';

const RedlineItemTypes = [
  'Communicator.Markup.Redline.RedlineCircle',
  'Communicator.Markup.Redline.RedlineRectangle',
  'Communicator.Markup.Redline.RedlinePolyline',
  'Communicator.Markup.Redline.RedlineText',
] as const;

export type RedlineItemType = (typeof RedlineItemTypes)[number];

export interface RedlineItemData extends MarkupItemData {
  type: RedlineItemType | (string & {});
}

export interface RedlineViewData extends MarkupViewData {
  items: RedlineItemData[];
}

export interface IRedlineService extends IService {
  getRedlineViews(): RedlineViewData[];
  getRedlineView(uniqueId: Uuid): RedlineViewData | undefined;
  getRedlineViewKeys(): Uuid[];
  getActiveViewKey(): Uuid | undefined;
  setActiveView(uniqueId: Uuid): Promise<boolean>;
  getActiveView(): RedlineViewData | undefined;
  removeRedlineItem(viewId: Uuid, item: RedlineItemData): Promise<void>;
  removeRedlineView(uniqueId: Uuid): void;
  reset(): void;
}
