import { vi, describe, expect, it, beforeEach, Mock } from 'vitest';

import PmiService from './PmiService';
import { Color, NodeId } from '@ts3d-hoops/web-viewer';

describe('PmiService', () => {
  let service: PmiService;
  let mockModel: {
    getPmiColor: Mock;
    setPmiColor: Mock;
    getPmiColorOverride: Mock;
    setPmiColorOverride: Mock;
  };
  let mockViewer: {
    model: typeof mockModel;
    setCallbacks: Mock;
    unsetCallbacks: Mock;
  };

  beforeEach(() => {
    service = new PmiService();
    mockModel = {
      getPmiColor: vi.fn(() => ({ toHexString: () => '#123456' })),
      setPmiColor: vi.fn(),
      getPmiColorOverride: vi.fn(() => true),
      setPmiColorOverride: vi.fn(() => Promise.resolve()),
    };
    mockViewer = {
      model: mockModel,
      setCallbacks: vi.fn(),
      unsetCallbacks: vi.fn(),
    };
  });

  describe('default values when no viewer is set', () => {
    it('should return undefined for viewer', () => {
      expect(service.viewer).toBeUndefined();
    });
    it('should return default color', () => {
      expect(service.getPmiColor()).toBe('#000000');
    });
    it('should return false for getPmiColorOverride', () => {
      expect(service.getPmiColorOverride()).toBe(true);
    });
    it('should throw when setPmiColor is called', () => {
      expect(() => service.setPmiColor('#ffffff')).toThrow('Viewer is not set');
    });
    it('should throw when setPmiColorOverride is called', async () => {
      await expect(service.setPmiColorOverride(true)).rejects.toThrow('Viewer is not set');
    });
  });

  describe('delegation to model', () => {
    beforeEach(() => {
      service.viewer = mockViewer as any;
    });
    it('should delegate getPmiColor to model', () => {
      expect(service.getPmiColor()).toBe('#123456');
      expect(mockModel.getPmiColor).toHaveBeenCalled();
    });
    it('should delegate setPmiColor to model', () => {
      service.setPmiColor('#abcdef');
      expect(mockModel.setPmiColor).toHaveBeenCalledWith(Color.fromHexString('#abcdef'));
    });
    it('should delegate getPmiColorOverride to model', () => {
      expect(service.getPmiColorOverride()).toBe(true);
      expect(mockModel.getPmiColorOverride).toHaveBeenCalled();
    });
    it('should delegate setPmiColorOverride to model', async () => {
      await service.setPmiColorOverride(false, 42 as NodeId);
      expect(mockModel.setPmiColorOverride).toHaveBeenCalledWith(false, 42);
    });
  });

  describe('event dispatching', () => {
    it('should dispatch hoops-pmi-service-reset when model is set', () => {
      const listener = vi.fn();
      service.addEventListener('hoops-pmi-service-reset', listener);
      service.viewer = mockViewer as any;
      expect(listener).toHaveBeenCalled();
    });
    it('should dispatch hoops-pmi-color-changed when setPmiColor changes color', () => {
      service.viewer = mockViewer as any;
      vi.spyOn(service, 'getPmiColor').mockReturnValue('#000000');
      const listener = vi.fn();
      service.addEventListener('hoops-pmi-color-changed', listener);
      service.setPmiColor('#abcdef');
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: '#abcdef' }));
    });
    it('should not dispatch hoops-pmi-color-changed if color is unchanged', () => {
      service.viewer = mockViewer as any;
      vi.spyOn(service, 'getPmiColor').mockReturnValue('#abcdef');
      const listener = vi.fn();
      service.addEventListener('hoops-pmi-color-changed', listener);
      service.setPmiColor('#abcdef');
      expect(listener).not.toHaveBeenCalled();
    });
    it('should dispatch hoops-pmi-color-override-changed when setPmiColorOverride is called', async () => {
      service.viewer = mockViewer as any;
      const listener = vi.fn();
      service.addEventListener('hoops-pmi-color-override-changed', listener);
      await service.setPmiColorOverride(true, 99 as NodeId);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ detail: { enableOverride: true, rootId: 99 } }),
      );
    });
  });

  describe('resetConfiguration', () => {
    it('should throw error for invalid configuration object', async () => {
      await expect(service.resetConfiguration({ invalid: true })).rejects.toThrow(
        'Invalid configuration object',
      );

      await expect(
        service.resetConfiguration({
          color: 123,
        }),
      ).rejects.toThrow('Invalid configuration object');

      await expect(
        service.resetConfiguration({
          color: '#ffffff',
          isColorOverride: 'invalid',
        }),
      ).rejects.toThrow('Invalid configuration object');
    });

    it('should reset to default configuration when no config is provided', async () => {
      service.viewer = mockViewer as any;

      const setPmiColorSpy = vi.spyOn(service, 'setPmiColor');
      const setPmiColorOverrideSpy = vi.spyOn(service, 'setPmiColorOverride').mockResolvedValue();

      await service.resetConfiguration();

      expect(setPmiColorSpy).toHaveBeenCalledWith('#000000');
      expect(setPmiColorOverrideSpy).toHaveBeenCalledWith(true);
    });

    it('should reset to provided configuration', async () => {
      service.viewer = mockViewer as any;

      const setPmiColorSpy = vi.spyOn(service, 'setPmiColor');
      const setPmiColorOverrideSpy = vi.spyOn(service, 'setPmiColorOverride').mockResolvedValue();

      const customConfig = {
        color: '#ff00ff',
        isColorOverride: false,
      };

      await service.resetConfiguration(customConfig);

      expect(setPmiColorSpy).toHaveBeenCalledWith('#ff00ff');
      expect(setPmiColorOverrideSpy).toHaveBeenCalledWith(false);
    });

    it('should have correct default configuration values', () => {
      expect(PmiService.DefaultConfig).toEqual({
        color: '#000000',
        isColorOverride: true,
      });
    });
  });

  describe('callback registration', () => {
    it('should set and unset callbacks when viewer is changed', () => {
      // Initial viewer set
      service.viewer = mockViewer as any;
      expect(mockViewer.setCallbacks).toHaveBeenCalled();

      // Change to a new viewer
      const newMockViewer = {
        model: mockModel,
        setCallbacks: vi.fn(),
        unsetCallbacks: vi.fn(),
      };

      service.viewer = newMockViewer as any;
      expect(mockViewer.unsetCallbacks).toHaveBeenCalled();
      expect(newMockViewer.setCallbacks).toHaveBeenCalled();

      // Set to undefined
      service.viewer = undefined;
      expect(newMockViewer.unsetCallbacks).toHaveBeenCalled();
    });

    it('should not change callbacks if same viewer is set', () => {
      service.viewer = mockViewer as any;
      vi.clearAllMocks();

      service.viewer = mockViewer as any; // Same viewer
      expect(mockViewer.unsetCallbacks).not.toHaveBeenCalled();
      expect(mockViewer.setCallbacks).not.toHaveBeenCalled();
    });
  });
});
