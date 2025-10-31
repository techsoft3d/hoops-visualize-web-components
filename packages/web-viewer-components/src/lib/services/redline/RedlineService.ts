import { CallbackMap, Markup, MarkupManager, Uuid } from '@ts3d-hoops/web-viewer';
import { IRedlineService, RedlineItemData, RedlineViewData } from './types';
import { formatRedlineItem, formatRedlineView } from './utils';

export default class RedlineService extends EventTarget implements IRedlineService {
  public readonly serviceName = 'RedlineService' as const;

  private _markupManager?: MarkupManager;

  private callbackMap: CallbackMap;

  constructor(markupManager?: MarkupManager) {
    super();
    this._markupManager = markupManager;

    this.redlineCreated = this.redlineCreated.bind(this);
    this.redlineDeleted = this.redlineDeleted.bind(this);
    this.viewDeleted = this.viewDeleted.bind(this);

    this.callbackMap = {
      redlineCreated: this.redlineCreated,
      redlineDeleted: this.redlineDeleted,
      viewDeleted: this.viewDeleted,
    };
    if (this._markupManager) {
      this.bind();
    }
  }

  private redlineCreated(markup: Markup.MarkupItem): void {
    if (!this._markupManager) {
      throw new Error('MarkupManager is not set');
    }

    const markupItemData = formatRedlineItem(markup);
    const markupViewId = this._markupManager.getMarkupViewKeys().find((key) => {
      const view = this._markupManager!.getMarkupView(key);
      return view && view.getMarkup().find((item) => item.uniqueId === markup.uniqueId);
    });

    if (!markupViewId) {
      console.warn('Markup view not found for the created redline', markupItemData);
      return;
    }
    
    this._markupManager.selectMarkup(markup, this._markupManager.viewer.view);

    this.dispatchEvent(
      new CustomEvent<{
        markupViewId: Uuid;
        markup: RedlineItemData;
      }>('hoops-redline-created', {
        detail: {
          markupViewId,
          markup: markupItemData,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private redlineDeleted(markup: Markup.MarkupItem): void {
    if (!this._markupManager) {
      throw new Error('MarkupManager is not set');
    }

    const markupViewId = this._markupManager.getMarkupViewKeys().find((key) => {
      const view = this._markupManager!.getMarkupView(key);
      return view && view.getMarkup().find((item) => item.uniqueId === markup.uniqueId);
    });

    if (!markupViewId) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent<{
        markupViewId: Uuid;
        markup: RedlineItemData;
      }>('hoops-redline-deleted', {
        detail: {
          markupViewId,
          markup: formatRedlineItem(markup),
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private viewDeleted(view: Markup.MarkupView): void {
    if (!this._markupManager) {
      throw new Error('MarkupManager is not set');
    }

    this.dispatchEvent(
      new CustomEvent<{
        markupViewId: Uuid;
      }>('hoops-redline-view-deleted', {
        detail: {
          markupViewId: view.getUniqueId(),
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private bind() {
    if (!this._markupManager) {
      throw new Error('MarkupManager is not set');
    }

    this._markupManager.viewer.setCallbacks(this.callbackMap);
  }

  private unbind() {
    if (!this._markupManager) {
      throw new Error('MarkupManager is not set');
    }
    this._markupManager.viewer.unsetCallbacks(this.callbackMap);
  }

  public get markupManager(): MarkupManager | undefined {
    return this._markupManager;
  }

  public set markupManager(value: MarkupManager | undefined) {
    if (this._markupManager === value) {
      return;
    }

    if (this._markupManager) {
      this.unbind();
    }

    this._markupManager = value;
    this.bind();
    this.dispatchEvent(
      new CustomEvent('hoops-redline-service-reset', { bubbles: true, composed: true }),
    );
  }

  public reset(): void {
    this.dispatchEvent(
      new CustomEvent('hoops-redline-service-reset', { bubbles: true, composed: true }),
    );
  }

  public getRedlineViewKeys(): Uuid[] {
    return this._markupManager?.getMarkupViewKeys() || [];
  }

  public getRedlineViews(): RedlineViewData[] {
    return (
      this._markupManager?.getMarkupViewKeys().map((key) => {
        return formatRedlineView(this._markupManager!.getMarkupView(key)!);
      }) || []
    );
  }

  public getRedlineView(uniqueId: Uuid): RedlineViewData | undefined {
    const view = this._markupManager?.getMarkupView(uniqueId);
    if (!view) {
      return undefined;
    }

    return formatRedlineView(view);
  }

  public getActiveViewKey(): Uuid | undefined {
    if (!this._markupManager) {
      return undefined;
    }

    const activeView = this._markupManager.getActiveMarkupView(this._markupManager.viewer.view);
    return activeView ? activeView.getUniqueId() : undefined;
  }

  public async setActiveView(uniqueId: Uuid): Promise<boolean> {
    if (!this.markupManager) {
      throw new Error('MarkupManager is not set');
    }

    return this.markupManager
      .activateMarkupViewWithPromise(uniqueId, this.markupManager.viewer.view)
      .then((result) => {
        if (result) {
          this.dispatchEvent(
            new CustomEvent<{ markupViewId: Uuid }>('hoops-markup-view-activated', {
              detail: {
                markupViewId: uniqueId,
              },
              bubbles: true,
              composed: true,
            }),
          );
        }

        return result;
      });
  }

  public getActiveView(): RedlineViewData | undefined {
    const activeViewKey = this.getActiveViewKey();
    if (!activeViewKey) {
      return undefined;
    }

    const view = this._markupManager?.getMarkupView(activeViewKey);
    return formatRedlineView(view!);
  }

  public async removeRedlineItem(viewId: Uuid, item: RedlineItemData): Promise<void> {
    /**
     * This manager only removes the redline items because it is a UI service meant to correspond
     * to the UI capabilities. To add redline user should use the RedlineOperator.
     */

    if (!this._markupManager) {
      throw new Error('MarkupManager is not set');
    }

    const view = this._markupManager.getMarkupView(viewId);
    if (!view) {
      throw new Error(`Redline view with ID ${viewId} not found`);
    }

    const markupItem = view.getMarkup().find((m) => m.uniqueId === item.id);
    if (!markupItem) {
      throw new Error(`Redline item with ID ${item.id} not found in view ${viewId}`);
    }

    /*
      No need to check the return value of removeMarkupItem, as it will only return false if
      the item is not found in the view, which we already checked above.
    */
    view.removeMarkup(markupItem);
    if (view.getMarkup().length === 0) {
      // If the view is empty, remove it
      this.removeRedlineView(viewId);
    }
  }

  public removeRedlineView(uniqueId: Uuid): void {
    if (!this._markupManager) {
      throw new Error('MarkupManager is not set');
    }

    const view = this._markupManager.getMarkupView(uniqueId);
    if (!view) {
      throw new Error(`Redline view with ID ${uniqueId} not found`);
    }

    if (!this._markupManager.deleteMarkupView(uniqueId)) {
      throw new Error(`Failed to remove redline view with ID ${uniqueId}`);
    }
  }
}
