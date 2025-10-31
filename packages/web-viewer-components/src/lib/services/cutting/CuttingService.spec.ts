import { describe, it, expect, vi, beforeEach } from 'vitest';
import CuttingService from './CuttingService';
import { Color, core } from '@ts3d-hoops/web-viewer';
import { CuttingServiceConfiguration } from './types';

describe('CuttingService', () => {
  let service: CuttingService;
  let mockCuttingManager: ReturnType<typeof createMockCuttingManager>;

  const faceColor = Color.fromHexString('#78797a');
  const lineColor = Color.fromHexString('#aaeeff');

  function createMockCuttingManager(config?: CuttingServiceConfiguration) {
    return {
      getCappingGeometryVisibility: vi
        .fn()
        .mockReturnValue(config?.cappingGeometryVisibility ?? true),
      setCappingGeometryVisibility: vi.fn().mockResolvedValue(undefined),
      getCappingFaceColor: vi
        .fn()
        .mockReturnValue(
          config?.cappingFaceColor ? Color.fromHexString(config.cappingFaceColor) : faceColor,
        ),
      setCappingFaceColor: vi.fn().mockResolvedValue(undefined),
      getCappingLineColor: vi
        .fn()
        .mockReturnValue(
          config?.cappingLineColor ? Color.fromHexString(config.cappingLineColor) : lineColor,
        ),
      setCappingLineColor: vi.fn().mockResolvedValue(undefined),
    } as unknown as core.ICuttingManager;
  }

  beforeEach(() => {
    service = new CuttingService();
    mockCuttingManager = createMockCuttingManager();
  });

  describe('getCappingGeometryVisibility', () => {
    it('returns false if cuttingManager is not set', () => {
      expect(service.getCappingGeometryVisibility()).toBe(true);
    });
    it('returns value from cuttingManager if set', () => {
      service.cuttingManager = mockCuttingManager;
      expect(service.getCappingGeometryVisibility()).toBe(true);
      expect(mockCuttingManager.getCappingGeometryVisibility).toHaveBeenCalled();
    });
  });

  describe('setCappingGeometryVisibility', () => {
    it('throws if cuttingManager is not set', async () => {
      await expect(service.setCappingGeometryVisibility(true)).rejects.toThrow(
        'Cutting manager not set',
      );
    });
    it('calls setCappingGeometryVisibility on cuttingManager and dispatches event', async () => {
      service.cuttingManager = mockCuttingManager;
      const eventSpy = vi.fn();
      service.addEventListener('hoops-capping-geometry-visibility-changed', eventSpy);
      await service.setCappingGeometryVisibility(false);
      expect(mockCuttingManager.setCappingGeometryVisibility).toHaveBeenCalledWith(false);
      expect(eventSpy).toHaveBeenCalled();
      expect(eventSpy.mock.calls[0][0].detail).toBe(false);
    });
  });

  describe('getCappingFaceColor', () => {
    it('returns undefined if cuttingManager is not set', () => {
      expect(service.getCappingFaceColor()).toBe('#808080');
    });
    it('returns value from cuttingManager if set', () => {
      service.cuttingManager = mockCuttingManager;
      expect(service.getCappingFaceColor()).toEqual('#78797a');
      expect(mockCuttingManager.getCappingFaceColor).toHaveBeenCalled();
    });
  });

  describe('setCappingFaceColor', () => {
    it('throws if cuttingManager is not set', async () => {
      await expect(service.setCappingFaceColor('#112233')).rejects.toThrow(
        'Cutting manager not set',
      );
    });
    it('calls setCappingFaceColor on cuttingManager and dispatches event', async () => {
      service.cuttingManager = mockCuttingManager;
      const eventSpy = vi.fn();
      service.addEventListener('hoops-capping-face-color-changed', eventSpy);
      await service.setCappingFaceColor('#aa2277');
      expect(mockCuttingManager.setCappingFaceColor).toHaveBeenCalledWith(
        Color.fromHexString('#aa2277'),
      );
      expect(eventSpy).toHaveBeenCalled();
      expect(eventSpy.mock.calls[0][0].detail).toEqual('#aa2277');
    });
  });

  describe('getCappingLineColor', () => {
    it('returns undefined if cuttingManager is not set', () => {
      expect(service.getCappingLineColor()).toBe('#808080');
    });
    it('returns value from cuttingManager if set', () => {
      service.cuttingManager = mockCuttingManager;
      expect(service.getCappingLineColor()).toEqual('#aaeeff');
      expect(mockCuttingManager.getCappingLineColor).toHaveBeenCalled();
    });
  });

  describe('setCappingLineColor', () => {
    it('throws if cuttingManager is not set', async () => {
      await expect(service.setCappingLineColor('#112233')).rejects.toThrow(
        'Cutting manager not set',
      );
    });
    it('calls setCappingLineColor on cuttingManager and dispatches event', async () => {
      service.cuttingManager = mockCuttingManager;
      const eventSpy = vi.fn();
      service.addEventListener('hoops-capping-line-color-changed', eventSpy);
      await service.setCappingLineColor('#ff77aa');
      expect(mockCuttingManager.setCappingLineColor).toHaveBeenCalledWith(
        Color.fromHexString('#ff77aa'),
      );
      expect(eventSpy).toHaveBeenCalled();
      expect(eventSpy.mock.calls[0][0].detail).toEqual('#ff77aa');
    });
  });

  describe('cuttingManager setter', () => {
    it('dispatches hoops-cutting-service-reset event', () => {
      const eventSpy = vi.fn();
      service.addEventListener('hoops-cutting-service-reset', eventSpy);
      service.cuttingManager = mockCuttingManager;
      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe('resetConfiguration', () => {
    it('should throw if there is no cuttingManager', async () => {
      await expect(service.resetConfiguration()).rejects.toThrowError('Cutting manager not set');
    });

    it('should throw if the argument is not a valid config', async () => {
      service.cuttingManager = mockCuttingManager;
      await expect(service.resetConfiguration({})).rejects.toThrowError(
        'Invalid cutting configuration object',
      );
      await expect(() =>
        service.resetConfiguration({
          cappingGeometryVisibility: 'Invalid' as any,
        }),
      ).rejects.toThrowError('Invalid cutting configuration object');
      await expect(() =>
        service.resetConfiguration({
          cappingFaceColor: 123 as any,
        }),
      ).rejects.toThrowError('Invalid cutting configuration object');
      await expect(() =>
        service.resetConfiguration({
          cappingFaceColor: '#112233',
          cappingLineColor: 456 as any,
        }),
      ).rejects.toThrowError('Invalid cutting configuration object');
    });

    it('should reset to default when no config is provided', async () => {
      const mock = createMockCuttingManager();
      service.cuttingManager = mock as any;

      await service.resetConfiguration();
      expect(mock.setCappingGeometryVisibility).toHaveBeenCalledWith(true);
      expect(mock.setCappingFaceColor).toHaveBeenCalledWith(Color.fromHexString('#808080'));
      expect(mock.setCappingLineColor).toHaveBeenCalledWith(Color.fromHexString('#808080'));
    });

    it('should reset to the provided config', async () => {
      const mock = createMockCuttingManager({
        cappingGeometryVisibility: false,
        cappingFaceColor: '#112233',
        cappingLineColor: '#334455',
      });
      service.cuttingManager = mock as any;

      await service.resetConfiguration({
        cappingGeometryVisibility: true,
        cappingFaceColor: '#223344',
        cappingLineColor: '#445566',
      });
      expect(mock.setCappingGeometryVisibility).toHaveBeenCalledWith(true);
      expect(mock.setCappingFaceColor).toHaveBeenCalledWith(Color.fromHexString('#223344'));
      expect(mock.setCappingLineColor).toHaveBeenCalledWith(Color.fromHexString('#445566'));
    });
  });
});
