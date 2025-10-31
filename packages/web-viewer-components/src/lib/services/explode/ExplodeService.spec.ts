import ExplodeService from './ExplodeService';
import { core, NodeId, IPoint3 } from '@ts3d-hoops/web-viewer';
import { vi, describe, expect, it, beforeEach } from 'vitest';

const mockExplodeManager = {
  start: vi.fn(() => Promise.resolve()),
  setMagnitude: vi.fn(() => Promise.resolve()),
  stop: vi.fn(() => Promise.resolve()),
  getMagnitude: vi.fn(() => 0),
  getActive: vi.fn(() => false),
};

const mockWebViewer = {
  explodeManager: mockExplodeManager,
} as unknown as core.IWebViewer;

describe('ExplodeService', () => {
  let service: ExplodeService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ExplodeService();
  });

  it('should initialize with correct service name', () => {
    expect(service.serviceName).toBe('ExplodeService');
  });

  it('should set and get webViewer correctly', () => {
    expect(service.webViewer).toBeUndefined();

    service.webViewer = mockWebViewer;
    expect(service.webViewer).toBe(mockWebViewer);
  });

  it('should dispatch reset event when webViewer changes', () => {
    const eventSpy = vi.fn();
    service.addEventListener('hoops-explode-service-reset', eventSpy);

    service.webViewer = mockWebViewer;
    expect(eventSpy).toHaveBeenCalledOnce();
  });

  it('should not dispatch reset event when setting same webViewer', () => {
    const eventSpy = vi.fn();
    service.webViewer = mockWebViewer;
    service.addEventListener('hoops-explode-service-reset', eventSpy);

    service.webViewer = mockWebViewer;
    expect(eventSpy).not.toHaveBeenCalled();
  });

  describe('start', () => {
    it('should reject when webViewer is not set', async () => {
      await expect(service.start()).rejects.toThrow('Webviewer not set');
    });

    it('should call explodeManager.start and dispatch event', async () => {
      service.webViewer = mockWebViewer;
      const eventSpy = vi.fn();
      service.addEventListener('hoops-explode-started', eventSpy);

      const nodeIds: NodeId[] = [1, 2, 3];
      const explosionVector: IPoint3 = { x: 1, y: 0, z: 0 };

      await service.start(nodeIds, explosionVector);

      expect(mockExplodeManager.start).toHaveBeenCalledWith(nodeIds, explosionVector);
      expect(eventSpy).toHaveBeenCalledOnce();
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-explode-started',
          detail: { nodeIds, explosionVector },
        }),
      );
    });

    it('should call explodeManager.start without parameters', async () => {
      service.webViewer = mockWebViewer;

      await service.start();

      expect(mockExplodeManager.start).toHaveBeenCalledWith(undefined, undefined);
    });
  });

  describe('setMagnitude', () => {
    it('should reject when webViewer is not set', async () => {
      await expect(service.setMagnitude(1.5)).rejects.toThrow('Webviewer not set');
    });

    it('should call explodeManager.setMagnitude and dispatch event', async () => {
      service.webViewer = mockWebViewer;
      const eventSpy = vi.fn();
      service.addEventListener('hoops-explode-magnitude-changed', eventSpy);

      const magnitude = 1.5;

      await service.setMagnitude(magnitude);

      expect(mockExplodeManager.setMagnitude).toHaveBeenCalledWith(magnitude);
      expect(eventSpy).toHaveBeenCalledOnce();
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-explode-magnitude-changed',
          detail: magnitude,
        }),
      );
    });
  });

  describe('stop', () => {
    it('should reject when webViewer is not set', async () => {
      await expect(service.stop()).rejects.toThrow('Webviewer not set');
    });

    it('should call explodeManager.stop and dispatch event', async () => {
      service.webViewer = mockWebViewer;
      const eventSpy = vi.fn();
      service.addEventListener('hoops-explode-stopped', eventSpy);

      await service.stop();

      expect(mockExplodeManager.stop).toHaveBeenCalled();
      expect(eventSpy).toHaveBeenCalledOnce();
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-explode-stopped',
        }),
      );
    });
  });

  describe('getMagnitude', () => {
    it('should return 0 when webViewer is not set', () => {
      expect(service.getMagnitude()).toBe(0);
    });

    it('should call explodeManager.getMagnitude and return value', () => {
      service.webViewer = mockWebViewer;
      mockExplodeManager.getMagnitude.mockReturnValue(2.5);

      const result = service.getMagnitude();

      expect(mockExplodeManager.getMagnitude).toHaveBeenCalled();
      expect(result).toBe(2.5);
    });
  });

  describe('getActive', () => {
    it('should return false when webViewer is not set', () => {
      expect(service.getActive()).toBe(false);
    });

    it('should call explodeManager.getActive and return value', () => {
      service.webViewer = mockWebViewer;
      mockExplodeManager.getActive.mockReturnValue(true);

      const result = service.getActive();

      expect(mockExplodeManager.getActive).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});
