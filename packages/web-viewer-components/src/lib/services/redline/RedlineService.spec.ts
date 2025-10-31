import RedlineService from './RedlineService';
import { MarkupManager, Markup } from '@ts3d-hoops/web-viewer';
import { formatRedlineView } from './utils';
import { vi, describe, expect, it, beforeEach } from 'vitest';

vi.mock('./utils', () => ({
  formatRedlineItem: vi.fn((item) => ({ ...item, formatted: true })),
  formatRedlineView: vi.fn((view) => ({ ...view, formatted: true })),
}));

const mockMarkupItem = { uniqueId: 'item-1' } as unknown as Markup.MarkupItem;
const mockMarkupView = {
  getMarkup: vi.fn(() => [mockMarkupItem]),
  getUniqueId: vi.fn(() => 'view-1'),
  removeMarkup: vi.fn(() => {
    return true;
  }),
} as any;

const mockMarkupManager = {
  getMarkupViewKeys: vi.fn(() => ['view-1']),
  getMarkupView: vi.fn((key) => (key === 'view-1' ? mockMarkupView : undefined)),
  viewer: {
    setCallbacks: vi.fn(),
    unsetCallbacks: vi.fn(),
    view: {},
  },
  getActiveMarkupView: vi.fn(() => mockMarkupView),
  activateMarkupViewWithPromise: vi.fn(() => Promise.resolve(true)),
  selectMarkup: vi.fn(),
} as unknown as MarkupManager;

describe('RedlineService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with markupManager and bind callbacks', () => {
    const service = new RedlineService(mockMarkupManager);
    expect(mockMarkupManager.viewer.setCallbacks).toHaveBeenCalled();
    expect(service.markupManager).toBe(mockMarkupManager);
  });

  it('should throw if MarkupManager is not set for redlineCreated', () => {
    const service = new RedlineService();
    expect(() => (service as any).redlineCreated(mockMarkupItem)).toThrow(
      'MarkupManager is not set',
    );
  });

  it('should dispatch hoops-redline-created event on redlineCreated', () => {
    const service = new RedlineService(mockMarkupManager);
    const listener = vi.fn();
    service.addEventListener('hoops-redline-created', listener);

    (service as any).redlineCreated(mockMarkupItem);

    expect(listener).toHaveBeenCalled();
    const event = listener.mock.calls[0][0];
    expect(event.detail.markupViewId).toBe('view-1');
    expect(event.detail.markup).toEqual(
      expect.objectContaining({ uniqueId: 'item-1', formatted: true }),
    );
  });

  it('should warn if markup view not found in redlineCreated', () => {
    const service = new RedlineService({
      ...mockMarkupManager,
      getMarkupViewKeys: vi.fn(() => []),
    } as any);
    const warnSpy = vi.spyOn(console, 'warn');
    (service as any).redlineCreated(mockMarkupItem);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('should throw if MarkupManager is not set for redlineDeleted', () => {
    const service = new RedlineService();
    expect(() => (service as any).redlineDeleted(mockMarkupItem)).toThrow(
      'MarkupManager is not set',
    );
  });

  it('should dispatch hoops-redline-deleted event on redlineDeleted', () => {
    const service = new RedlineService(mockMarkupManager);
    const listener = vi.fn();
    service.addEventListener('hoops-redline-deleted', listener);

    (service as any).redlineDeleted(mockMarkupItem);

    expect(listener).toHaveBeenCalled();
    const event = listener.mock.calls[0][0];
    expect(event.detail.markupViewId).toBe('view-1');
    expect(event.detail.markup).toEqual(
      expect.objectContaining({ uniqueId: 'item-1', formatted: true }),
    );
  });

  it('should not dispatch event if markup view not found in redlineDeleted', () => {
    const service = new RedlineService({
      ...mockMarkupManager,
      getMarkupViewKeys: vi.fn(() => []),
    } as any);
    const listener = vi.fn();
    service.addEventListener('hoops-redline-deleted', listener);

    (service as any).redlineDeleted(mockMarkupItem);

    expect(listener).not.toHaveBeenCalled();
  });

  it('should unbind and bind when markupManager is changed', () => {
    const service = new RedlineService(mockMarkupManager);
    const newManager = {
      ...mockMarkupManager,
      viewer: {
        ...mockMarkupManager.viewer,
        setCallbacks: vi.fn(),
        unsetCallbacks: vi.fn(),
      },
    } as any;
    service.markupManager = newManager;
    expect(mockMarkupManager.viewer.unsetCallbacks).toHaveBeenCalled();
    expect(newManager.viewer.setCallbacks).toHaveBeenCalled();
  });

  it('should not bind or unbind if markupManager is the same', () => {
    const service = new RedlineService(mockMarkupManager);
    const initialSetCallbacks = mockMarkupManager.viewer.setCallbacks;
    service.markupManager = mockMarkupManager;
    expect(mockMarkupManager.viewer.unsetCallbacks).not.toHaveBeenCalled();
    expect(mockMarkupManager.viewer.setCallbacks).toBe(initialSetCallbacks);
  });

  it('should dispatch hoops-redline-service-reset when markupManager is set', () => {
    const service = new RedlineService();
    const listener = vi.fn();
    service.addEventListener('hoops-redline-service-reset', listener);
    service.markupManager = mockMarkupManager;
    expect(listener).toHaveBeenCalled();
  });

  it('getRedlineViewKeys returns markup view keys', () => {
    const service = new RedlineService(mockMarkupManager);
    expect(service.getRedlineViewKeys()).toEqual(['view-1']);
  });

  it('getRedlineViews returns formatted views', () => {
    const service = new RedlineService(mockMarkupManager);
    expect(service.getRedlineViews()).toEqual([expect.objectContaining({ formatted: true })]);
    expect(formatRedlineView).toHaveBeenCalled();
  });

  it('getRedlineView returns formatted view for given id', () => {
    const service = new RedlineService(mockMarkupManager);
    expect(service.getRedlineView('view-1')).toEqual(expect.objectContaining({ formatted: true }));
  });

  it('getRedlineView returns undefined for missing id', () => {
    const service = new RedlineService(mockMarkupManager);
    expect(service.getRedlineView('missing')).toBeUndefined();
  });

  it('getActiveViewKey returns active view unique id', () => {
    const service = new RedlineService(mockMarkupManager);
    expect(service.getActiveViewKey()).toBe('view-1');
  });

  it('getActiveViewKey returns undefined if no markupManager', () => {
    const service = new RedlineService();
    expect(service.getActiveViewKey()).toBeUndefined();
  });

  it('setActiveView activates view and dispatches event', async () => {
    const service = new RedlineService(mockMarkupManager);
    const listener = vi.fn();
    service.addEventListener('hoops-markup-view-activated', listener);
    const result = await service.setActiveView('view-1');
    expect(result).toBe(true);
    expect(listener).toHaveBeenCalled();
    expect(listener.mock.calls[0][0].detail.markupViewId).toBe('view-1');
  });

  it('setActiveView throws if markupManager is not set', async () => {
    const service = new RedlineService();
    await expect(service.setActiveView('view-1')).rejects.toThrow('MarkupManager is not set');
  });

  it('getActiveView returns formatted active view', () => {
    const service = new RedlineService(mockMarkupManager);
    expect(service.getActiveView()).toEqual(expect.objectContaining({ formatted: true }));
  });

  it('getActiveView returns undefined if no active view', () => {
    const service = new RedlineService({
      ...mockMarkupManager,
      getActiveMarkupView: vi.fn(() => undefined),
    } as any);
    expect(service.getActiveView()).toBeUndefined();
  });

  it('should manage errors when markupManager is not set', () => {
    const service = new RedlineService();
    expect(() => service['bind']()).toThrow('MarkupManager is not set');
    expect(() => service['unbind']()).toThrow('MarkupManager is not set');

    expect(service.getRedlineView('view-1')).toBeUndefined();
    expect(service.getRedlineViewKeys()).toEqual([]);
    expect(service.getRedlineViews()).toEqual([]);
  });

  it('should remove redline item', async () => {
    const service = new RedlineService(mockMarkupManager);

    await service.removeRedlineItem('view-1', { id: 'item-1', type: 'test' });

    expect(mockMarkupView.removeMarkup).toHaveBeenCalledWith({ uniqueId: 'item-1' });
  });

  it('should throw if trying to remove redline item if view not found', async () => {
    const service = new RedlineService({
      ...mockMarkupManager,
      getMarkupView: vi.fn(() => undefined),
    } as any);
    const listener = vi.fn();
    service.addEventListener('hoops-redline-item-removed', listener);

    await expect(
      service.removeRedlineItem('view-1', { id: 'item-1', type: 'test' }),
    ).rejects.toThrow('Redline view with ID view-1 not found');
    expect(listener).not.toHaveBeenCalled();
  });

  it('should throw if trying to remove redline item without markupManager', async () => {
    const service = new RedlineService();
    await expect(
      service.removeRedlineItem('view-1', { id: 'item-1', type: 'test' }),
    ).rejects.toThrow('MarkupManager is not set');
  });
});
