import { IRedlineService, RedlineItemData, RedlineViewData, ServiceName } from '../lib/services';
import { Uuid } from '@ts3d-hoops/web-viewer';

export const redlineViewMap: Record<string, RedlineViewData> = {
  '1234-5678-9012-3456': {
    id: '1234-5678-9012-3456',
    items: [
      { id: 'markup1', type: 'Communicator.Markup.Redline.RedlineText' },
      { id: 'markup2', type: 'Communicator.Markup.Redline.RedlineCircle' },
      { id: 'markup3', type: 'Communicator.Markup.Redline.RedlineRectangle' },
      { id: 'markup4', type: 'Communicator.Markup.Redline.RedlinePolyline' },
    ],
  },
  '7890-1234-5678-9012': {
    id: '7890-1234-5678-9012',
    items: [
      { id: 'markup5', type: 'Communicator.Markup.Redline.RedlineText' },
      { id: 'markup6', type: 'Communicator.Markup.Redline.RedlineCircle' },
      { id: 'markup7', type: 'Communicator.Markup.Redline.RedlineRectangle' },
      { id: 'markup8', type: 'Communicator.Markup.Redline.RedlinePolyline' },
    ],
  },
};

export class RedlineServiceMock extends EventTarget implements IRedlineService {
  public readonly serviceName: ServiceName = 'RedlineService';

  public activeViewKey: Uuid | undefined;

  public viewMap: Record<string, RedlineViewData> = JSON.parse(JSON.stringify(redlineViewMap));

  public fn: (...args: any[]) => any;

  public getRedlineViews: () => RedlineViewData[];
  public getRedlineView: (uniqueId: Uuid) => RedlineViewData | undefined;
  public getRedlineViewKeys: () => Uuid[];
  public getActiveViewKey: () => Uuid | undefined;
  public setActiveView: (uniqueId: Uuid) => Promise<boolean>;
  public getActiveView: () => RedlineViewData | undefined;
  public removeRedlineItem: (viewId: Uuid, item: RedlineItemData) => Promise<void>;
  public reset: () => void;

  constructor(fn: (...args: any[]) => any) {
    super();
    this.fn = fn;

    this.getRedlineViews = this.fn((): RedlineViewData[] => {
      return Object.values(this.viewMap);
    });

    this.getRedlineView = this.fn((uniqueId: Uuid): RedlineViewData | undefined => {
      return this.viewMap[uniqueId] || undefined;
    });

    this.getRedlineViewKeys = this.fn((): Uuid[] => {
      return Object.keys(this.viewMap) as Uuid[];
    });

    this.getActiveViewKey = this.fn((): Uuid | undefined => {
      return this.activeViewKey;
    });

    this.getActiveView = this.fn((): RedlineViewData | undefined => {
      return this.getRedlineView(this.activeViewKey || '');
    });

    this.setActiveView = this.fn((uniqueId: Uuid): Promise<boolean> => {
      if (this.viewMap[uniqueId]) {
        this.activeViewKey = uniqueId;
        return Promise.resolve(true);
      }

      return Promise.resolve(false);
    });

    this.reset = fn((): void => {
      this.activeViewKey = undefined;
      this.viewMap = JSON.parse(JSON.stringify(redlineViewMap)); // Reset to initial state
      this.dispatchEvent(
        new CustomEvent('hoops-redline-service-reset', { bubbles: true, composed: true }),
      );
    });

    this.removeRedlineItem = fn(async (viewId: Uuid, item: RedlineItemData): Promise<void> => {
      if (this.viewMap[viewId]) {
        const view = this.viewMap[viewId];
        view.items = view.items.filter((redline) => redline.id !== item.id);
        this.dispatchEvent(
          new CustomEvent<{
            markupViewId: Uuid;
            markup: RedlineItemData;
          }>('hoops-redline-deleted', {
            detail: {
              markupViewId: viewId,
              markup: item,
            },
            bubbles: true,
            composed: true,
          }),
        );
        this.viewMap[viewId] = view;
        if (this.activeViewKey === viewId) {
          this.activeViewKey = undefined;
        }
      }
    });
  }

  removeRedlineView(uniqueId: Uuid): void {
    if (this.viewMap[uniqueId]) {
      delete this.viewMap[uniqueId];
      if (this.activeViewKey === uniqueId) {
        this.activeViewKey = undefined;
      }
    }
  }

  addView(view: RedlineViewData): void {
    if (!this.viewMap[view.id]) {
      this.viewMap[view.id] = view;
      this.activeViewKey = view.id; // Set the newly added view as active
    } else {
      console.warn(`View with id ${view.id} already exists.`);
    }
  }

  addRedline(viewId: Uuid, markup: RedlineItemData): void {
    if (this.viewMap[viewId]) {
      this.viewMap[viewId].items.push(markup);
    } else {
      console.warn(`View with id ${viewId} does not exist. Cannot add markup.`);
    }
  }

  clear(): void {
    this.viewMap = {};
  }

  fireRedlineCreatedEvent(detail: { markupViewId: Uuid; markup: RedlineItemData }): void {
    this.viewMap[detail.markupViewId] = this.viewMap[detail.markupViewId] || {
      id: detail.markupViewId,
      items: [],
    };
    this.viewMap[detail.markupViewId].items.push(detail.markup);
    this.dispatchEvent(
      new CustomEvent<{
        markupViewId: Uuid;
        markup: RedlineItemData;
      }>('hoops-redline-created', { detail, bubbles: true, composed: true }),
    );
  }

  fireRedlineDeletedEvent(detail: { markupViewId: Uuid; markup: RedlineItemData }): void {
    this.viewMap[detail.markupViewId] = this.viewMap[detail.markupViewId] || {
      id: detail.markupViewId,
      items: [],
    };
    const view = this.viewMap[detail.markupViewId];
    view.items = view.items.filter((item) => item.id !== detail.markup.id);
    this.viewMap[detail.markupViewId] = view;

    this.dispatchEvent(
      new CustomEvent<{
        markupViewId: Uuid;
        markup: RedlineItemData;
      }>('hoops-redline-deleted', { detail, bubbles: true, composed: true }),
    );
  }

  fireRedlineManagerResetEvent(): void {
    this.reset();
  }

  fireRedlineViewActivatedEvent(uniqueId: Uuid): void {
    this.activeViewKey = uniqueId;
    this.dispatchEvent(
      new CustomEvent<{ markupViewId: Uuid }>('hoops-markup-view-activated', {
        detail: { markupViewId: uniqueId },
        bubbles: true,
        composed: true,
      }),
    );
  }
}
