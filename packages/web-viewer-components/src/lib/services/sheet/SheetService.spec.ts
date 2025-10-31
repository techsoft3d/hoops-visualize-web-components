import SheetService from './SheetService';
import { Color, SheetManager } from '@ts3d-hoops/web-viewer';
import { vi, describe, expect, it, beforeEach, Mock } from 'vitest';

describe('SheetService', () => {
  let service: SheetService;
  let mockSheetManager: {
    getSheetBackgroundColor: Mock;
    getSheetColor: Mock;
    getSheetShadowColor: Mock;
    setSheetColors: Mock;
    getBackgroundSheetEnabled: Mock;
    setBackgroundSheetEnabled: Mock;
  };

  beforeEach(() => {
    service = new SheetService();
    mockSheetManager = {
      getSheetBackgroundColor: vi.fn(() => ({ toHexString: () => '#111111' })),
      getSheetColor: vi.fn(() => ({ toHexString: () => '#222222' })),
      getSheetShadowColor: vi.fn(() => ({ toHexString: () => '#333333' })),
      setSheetColors: vi.fn(() => Promise.resolve()),
      getBackgroundSheetEnabled: vi.fn(() => true),
      setBackgroundSheetEnabled: vi.fn(() => Promise.resolve()),
    };
  });

  describe('default values when no sheetManager is set', () => {
    it('should return undefined for sheetManager', () => {
      expect(service.sheetManager).toBeUndefined();
    });
    it('should return default color for getSheetBackgroundColor', () => {
      expect(service.getSheetBackgroundColor()).toBe('#b4b4b4');
    });
    it('should return default color for getSheetColor', () => {
      expect(service.getSheetColor()).toBe('#ffffff');
    });
    it('should return default color for getSheetShadowColor', () => {
      expect(service.getSheetShadowColor()).toBe('#4b4b4b');
    });
    it('should return false for getBackgroundSheetEnabled', () => {
      expect(service.getBackgroundSheetEnabled()).toBe(false);
    });
    it('should throw when setSheetColors is called', async () => {
      await expect(service.setSheetColors('#1', '#2', '#3')).rejects.toThrow(
        'SheetManager is not set',
      );
    });
    it('should throw when setBackgroundSheetEnabled is called', async () => {
      await expect(service.setBackgroundSheetEnabled(true)).rejects.toThrow(
        'SheetManager is not set',
      );
    });
  });

  describe('delegation to sheetManager', () => {
    beforeEach(() => {
      service.sheetManager = mockSheetManager as unknown as SheetManager;
    });
    it('should delegate getSheetBackgroundColor to sheetManager', () => {
      expect(service.getSheetBackgroundColor()).toBe('#111111');
      expect(mockSheetManager.getSheetBackgroundColor).toHaveBeenCalled();
    });
    it('should delegate getSheetColor to sheetManager', () => {
      expect(service.getSheetColor()).toBe('#222222');
      expect(mockSheetManager.getSheetColor).toHaveBeenCalled();
    });
    it('should delegate getSheetShadowColor to sheetManager', () => {
      expect(service.getSheetShadowColor()).toBe('#333333');
      expect(mockSheetManager.getSheetShadowColor).toHaveBeenCalled();
    });
    it('should delegate setSheetColors to sheetManager', async () => {
      await service.setSheetColors('#123456', '#7890ab', '#cdef01');
      expect(mockSheetManager.setSheetColors).toHaveBeenCalledWith(
        Color.fromHexString('#123456'),
        Color.fromHexString('#7890ab'),
        Color.fromHexString('#cdef01'),
      );
    });
    it('should delegate getBackgroundSheetEnabled to sheetManager', () => {
      expect(service.getBackgroundSheetEnabled()).toBe(true);
      expect(mockSheetManager.getBackgroundSheetEnabled).toHaveBeenCalled();
    });
    it('should delegate setBackgroundSheetEnabled to sheetManager', async () => {
      await service.setBackgroundSheetEnabled(false);
      expect(mockSheetManager.setBackgroundSheetEnabled).toHaveBeenCalledWith(false);
    });
  });

  describe('event dispatching', () => {
    it('should dispatch hoops-sheet-service-reset when sheetManager is set', () => {
      const listener = vi.fn();
      service.addEventListener('hoops-sheet-service-reset', listener);
      service.sheetManager = mockSheetManager as unknown as SheetManager;
      expect(listener).toHaveBeenCalled();
    });
    it('should dispatch hoops-sheet-colors-changed when setSheetColors is called', async () => {
      service.sheetManager = mockSheetManager as unknown as SheetManager;
      const listener = vi.fn();
      service.addEventListener('hoops-sheet-colors-changed', listener);
      await service.setSheetColors('#123456', '#7890ab', '#cdef01');
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: {
            backgroundColor: '#123456',
            sheetColor: '#7890ab',
            sheetShadowColor: '#cdef01',
          },
        }),
      );
    });
    it('should dispatch hoops-background-sheet-enabled-changed when setBackgroundSheetEnabled is called', async () => {
      service.sheetManager = mockSheetManager as unknown as SheetManager;
      const listener = vi.fn();
      service.addEventListener('hoops-background-sheet-enabled-changed', listener);
      await service.setBackgroundSheetEnabled(true);
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ detail: true }));
    });
  });

  describe('resetConfiguration', () => {
    it('should throw error when sheetManager is not set', async () => {
      await expect(service.resetConfiguration()).rejects.toThrow('SheetManager is not set');
    });

    it('should throw error for invalid configuration object', async () => {
      service.sheetManager = mockSheetManager as unknown as SheetManager;
      const invalidConfig = { invalidProperty: 'invalid' };
      await expect(service.resetConfiguration(invalidConfig)).rejects.toThrow(
        'Invalid configuration object',
      );
    });

    it('should reset to default configuration when no config is provided', async () => {
      service.sheetManager = mockSheetManager as unknown as SheetManager;
      const dispatchSpy = vi.spyOn(service, 'dispatchEvent');

      await service.resetConfiguration();

      // Verify default values are used
      expect(mockSheetManager.setSheetColors).toHaveBeenCalledWith(
        Color.fromHexString('#b4b4b4'), // backgroundColor
        Color.fromHexString('#ffffff'), // sheetColor
        Color.fromHexString('#4b4b4b'), // sheetShadowColor
      );
      expect(mockSheetManager.setBackgroundSheetEnabled).toHaveBeenCalledWith(false);

      // Verify events are dispatched
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-sheet-colors-changed',
          detail: {
            backgroundColor: '#b4b4b4',
            sheetColor: '#ffffff',
            sheetShadowColor: '#4b4b4b',
          },
        }),
      );
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-background-sheet-enabled-changed',
          detail: false,
        }),
      );
    });

    it('should reset to provided configuration', async () => {
      service.sheetManager = mockSheetManager as unknown as SheetManager;
      const customConfig = {
        backgroundColor: '#111111',
        sheetColor: '#222222',
        sheetShadowColor: '#333333',
        backgroundSheetEnabled: true,
      };

      await service.resetConfiguration(customConfig);

      // Verify custom values are used
      expect(mockSheetManager.setSheetColors).toHaveBeenCalledWith(
        Color.fromHexString('#111111'),
        Color.fromHexString('#222222'),
        Color.fromHexString('#333333'),
      );
      expect(mockSheetManager.setBackgroundSheetEnabled).toHaveBeenCalledWith(true);
    });

    it('should have correct default configuration values', () => {
      expect(SheetService.DefaultConfiguration).toEqual({
        backgroundColor: '#b4b4b4',
        sheetColor: '#ffffff',
        sheetShadowColor: '#4b4b4b',
        backgroundSheetEnabled: false,
      });
    });

    it('should call setSheetColors and setBackgroundSheetEnabled in sequence', async () => {
      service.sheetManager = mockSheetManager as unknown as SheetManager;
      const callOrder: string[] = [];

      mockSheetManager.setSheetColors.mockImplementation(async () => {
        callOrder.push('setSheetColors');
      });
      mockSheetManager.setBackgroundSheetEnabled.mockImplementation(async () => {
        callOrder.push('setBackgroundSheetEnabled');
      });

      await service.resetConfiguration();

      expect(callOrder).toEqual(['setSheetColors', 'setBackgroundSheetEnabled']);
      expect(mockSheetManager.setSheetColors).toHaveBeenCalledTimes(1);
      expect(mockSheetManager.setBackgroundSheetEnabled).toHaveBeenCalledTimes(1);
    });

    it('should handle partial configuration objects correctly', async () => {
      service.sheetManager = mockSheetManager as unknown as SheetManager;

      // Test with valid but minimal config
      const partialConfig = {
        backgroundColor: '#b4b4b4',
        sheetColor: '#ffffff',
        sheetShadowColor: '#4b4b4b',
        backgroundSheetEnabled: false,
      };

      await service.resetConfiguration(partialConfig);

      expect(mockSheetManager.setSheetColors).toHaveBeenCalledWith(
        Color.fromHexString('#b4b4b4'),
        Color.fromHexString('#ffffff'),
        Color.fromHexString('#4b4b4b'),
      );
      expect(mockSheetManager.setBackgroundSheetEnabled).toHaveBeenCalledWith(false);
    });
  });
});
