import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { FloorplanService } from './FloorplanService';
import { FloorplanOrientation, Floorplan, Color } from '@ts3d-hoops/web-viewer';
import type { FloorplanServiceConfiguration } from './types';

// Mock the external dependencies
vi.mock('@ts3d-hoops/web-viewer', () => ({
  FloorplanOrientation: {
    NorthUp: 'NorthUp',
    AvatarUp: 'AvatarUp',
  },
  Floorplan: {
    FloorplanAutoActivation: {
      Bim: 'Bim',
      BimWalk: 'BimWalk',
      Never: 'Never',
    },
  },
  Color: {
    fromHexString: vi.fn(),
  },
}));

describe('FloorplanService', () => {
  let service: FloorplanService;
  let mockFloorplanManager: {
    isActive: Mock;
    activate: Mock;
    deactivate: Mock;
    getConfiguration: Mock;
    setTrackCameraEnabled: Mock;
    setFloorplanOrientation: Mock;
    setAutoActivate: Mock;
    setOverlayFeetPerPixel: Mock;
    setZoomLevel: Mock;
    setBackgroundOpacity: Mock;
    setBorderOpacity: Mock;
    setAvatarOpacity: Mock;
    setBackgroundColor: Mock;
    setBorderColor: Mock;
    setAvatarColor: Mock;
    setAvatarOutlineColor: Mock;
  };
  let mockConfiguration: {
    trackCameraEnabled: boolean;
    floorplanOrientation: FloorplanOrientation;
    autoActivate: Floorplan.FloorplanAutoActivation;
    overlayFeetPerPixel: number;
    zoomLevel: number;
    backgroundOpacity: number;
    borderOpacity: number;
    avatarOpacity: number;
    backgroundColor: { toHexString: Mock };
    borderColor: { toHexString: Mock };
    avatarColor: { toHexString: Mock };
    avatarOutlineColor: { toHexString: Mock };
  };
  let eventListener: Mock;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create mock configuration
    mockConfiguration = {
      trackCameraEnabled: false,
      floorplanOrientation: FloorplanOrientation.NorthUp,
      autoActivate: Floorplan.FloorplanAutoActivation.BimWalk,
      overlayFeetPerPixel: 0.1,
      zoomLevel: 1.0,
      backgroundOpacity: 0.25,
      borderOpacity: 1.0,
      avatarOpacity: 1.0,
      backgroundColor: {
        toHexString: vi.fn().mockReturnValue('#ffffff'),
      },
      borderColor: {
        toHexString: vi.fn().mockReturnValue('#000000'),
      },
      avatarColor: {
        toHexString: vi.fn().mockReturnValue('#ff00ff'),
      },
      avatarOutlineColor: {
        toHexString: vi.fn().mockReturnValue('#000000'),
      },
    };

    // Create mock floorplan manager
    mockFloorplanManager = {
      isActive: vi.fn().mockReturnValue(false),
      activate: vi.fn(),
      deactivate: vi.fn(),
      getConfiguration: vi.fn().mockReturnValue(mockConfiguration),
      setTrackCameraEnabled: vi.fn().mockResolvedValue(undefined),
      setFloorplanOrientation: vi.fn().mockResolvedValue(undefined),
      setAutoActivate: vi.fn().mockResolvedValue(undefined),
      setOverlayFeetPerPixel: vi.fn().mockResolvedValue(undefined),
      setZoomLevel: vi.fn().mockResolvedValue(undefined),
      setBackgroundOpacity: vi.fn().mockResolvedValue(undefined),
      setBorderOpacity: vi.fn().mockResolvedValue(undefined),
      setAvatarOpacity: vi.fn().mockResolvedValue(undefined),
      setBackgroundColor: vi.fn().mockResolvedValue(undefined),
      setBorderColor: vi.fn().mockResolvedValue(undefined),
      setAvatarColor: vi.fn().mockResolvedValue(undefined),
      setAvatarOutlineColor: vi.fn().mockResolvedValue(undefined),
    };

    // Mock Color.fromHexString
    (Color.fromHexString as Mock).mockImplementation((hex: string) => ({
      hex,
      toHexString: () => hex,
    }));

    service = new FloorplanService(mockFloorplanManager as any);
    eventListener = vi.fn();
  });

  describe('constructor', () => {
    it('should create service without floorplan manager', () => {
      const serviceWithoutManager = new FloorplanService();
      expect(serviceWithoutManager.serviceName).toBe('FloorplanService');
      expect(serviceWithoutManager.floorplanManager).toBeUndefined();
    });

    it('should create service with floorplan manager', () => {
      expect(service.serviceName).toBe('FloorplanService');
      expect(service.floorplanManager).toBe(mockFloorplanManager);
    });

    it('should have correct default configuration', () => {
      expect(FloorplanService.DefaultConfig).toEqual({
        floorplanActive: false,
        trackCamera: false,
        orientation: 'North Up',
        autoActivationMode: 'Bim + Walk',
        overlayFeetPerPixel: 0.1,
        overlayZoomLevel: 1.0,
        overlayBackgroundOpacity: 0.25,
        overlayBorderOpacity: 1.0,
        overlayAvatarOpacity: 1.0,
        floorplanBackgroundColor: '#ffffff',
        floorplanBorderColor: '#000000',
        floorplanAvatarColor: '#ff00ff',
        floorplanAvatarOutlineColor: '#000000',
      });
    });
  });

  describe('floorplanManager property', () => {
    it('should get floorplan manager', () => {
      expect(service.floorplanManager).toBe(mockFloorplanManager);
    });

    it('should set floorplan manager and dispatch event', () => {
      service.addEventListener('hoops-floorplan-manager-reset', eventListener);

      const newManager = { ...mockFloorplanManager };
      service.floorplanManager = newManager as any;

      expect(service.floorplanManager).toBe(newManager);
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-floorplan-manager-reset',
          bubbles: true,
          composed: true,
        }),
      );
    });

    it('should set floorplan manager to undefined and dispatch event', () => {
      service.addEventListener('hoops-floorplan-manager-reset', eventListener);

      service.floorplanManager = undefined;

      expect(service.floorplanManager).toBeUndefined();
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-floorplan-manager-reset',
          bubbles: true,
          composed: true,
        }),
      );
    });
  });

  describe('isActive / setActive', () => {
    it('should return false when floorplan manager is undefined', () => {
      const serviceWithoutManager = new FloorplanService();
      expect(serviceWithoutManager.isActive()).toBe(false);
    });

    it('should return active state from floorplan manager', () => {
      mockFloorplanManager.isActive.mockReturnValue(true);
      expect(service.isActive()).toBe(true);

      mockFloorplanManager.isActive.mockReturnValue(false);
      expect(service.isActive()).toBe(false);
    });

    it('should throw error when setting active without floorplan manager', async () => {
      const serviceWithoutManager = new FloorplanService();
      await expect(serviceWithoutManager.setActive(true)).rejects.toThrow(
        'FloorplanManager is not initialized',
      );
    });

    it('should activate floorplan and dispatch event', async () => {
      service.addEventListener('hoops-floorplan-activation-changed', eventListener);
      mockFloorplanManager.isActive.mockReturnValue(false);

      await service.setActive(true);

      expect(mockFloorplanManager.activate).toHaveBeenCalled();
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-floorplan-activation-changed',
          detail: { active: true },
          bubbles: true,
          composed: true,
        }),
      );
    });

    it('should deactivate floorplan and dispatch event', async () => {
      service.addEventListener('hoops-floorplan-activation-changed', eventListener);
      mockFloorplanManager.isActive.mockReturnValue(true);

      await service.setActive(false);

      expect(mockFloorplanManager.deactivate).toHaveBeenCalled();
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-floorplan-activation-changed',
          detail: { active: false },
          bubbles: true,
          composed: true,
        }),
      );
    });

    it('should not change state if already active', async () => {
      mockFloorplanManager.isActive.mockReturnValue(true);

      await service.setActive(true);

      expect(mockFloorplanManager.activate).not.toHaveBeenCalled();
      expect(mockFloorplanManager.deactivate).not.toHaveBeenCalled();
    });

    it('should not change state if already inactive', async () => {
      mockFloorplanManager.isActive.mockReturnValue(false);

      await service.setActive(false);

      expect(mockFloorplanManager.activate).not.toHaveBeenCalled();
      expect(mockFloorplanManager.deactivate).not.toHaveBeenCalled();
    });
  });

  describe('track camera', () => {
    it('should return false when floorplan manager is undefined', () => {
      const serviceWithoutManager = new FloorplanService();
      expect(serviceWithoutManager.isTrackCameraEnabled()).toBe(false);
    });

    it('should get track camera enabled state', () => {
      mockConfiguration.trackCameraEnabled = true;
      expect(service.isTrackCameraEnabled()).toBe(true);

      mockConfiguration.trackCameraEnabled = false;
      expect(service.isTrackCameraEnabled()).toBe(false);
    });

    it('should throw error when setting track camera without floorplan manager', async () => {
      const serviceWithoutManager = new FloorplanService();
      await expect(serviceWithoutManager.setTrackCameraEnabled(true)).rejects.toThrow(
        'FloorplanManager is not initialized',
      );
    });

    it('should set track camera enabled and dispatch event', async () => {
      service.addEventListener('hoops-floorplan-track-camera-changed', eventListener);
      mockConfiguration.trackCameraEnabled = false;

      await service.setTrackCameraEnabled(true);

      expect(mockFloorplanManager.setTrackCameraEnabled).toHaveBeenCalledWith(true);
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-floorplan-track-camera-changed',
          detail: { enabled: true },
          bubbles: true,
          composed: true,
        }),
      );
    });

    it('should not change state if track camera is already set to desired value', async () => {
      mockConfiguration.trackCameraEnabled = true;

      await service.setTrackCameraEnabled(true);

      expect(mockFloorplanManager.setTrackCameraEnabled).not.toHaveBeenCalled();
    });
  });

  describe('orientation', () => {
    it('should get orientation as North Up by default', () => {
      mockConfiguration.floorplanOrientation = FloorplanOrientation.NorthUp;
      expect(service.getOrientation()).toBe('North Up');
    });

    it('should get orientation as Avatar Up', () => {
      mockConfiguration.floorplanOrientation = FloorplanOrientation.AvatarUp;
      expect(service.getOrientation()).toBe('Avatar Up');
    });

    it('should default to North Up for unknown orientation', () => {
      mockConfiguration.floorplanOrientation = 'unknown' as any;
      expect(service.getOrientation()).toBe('North Up');
    });

    it('should throw error when setting orientation without floorplan manager', async () => {
      const serviceWithoutManager = new FloorplanService();
      await expect(serviceWithoutManager.setOrientation('North Up')).rejects.toThrow(
        'FloorplanManager is not initialized',
      );
    });

    it('should set North Up orientation and dispatch event', async () => {
      service.addEventListener('hoops-floorplan-orientation-changed', eventListener);

      await service.setOrientation('North Up');

      expect(mockFloorplanManager.setFloorplanOrientation).toHaveBeenCalledWith(
        FloorplanOrientation.NorthUp,
      );
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-floorplan-orientation-changed',
          detail: { orientation: 'North Up' },
          bubbles: true,
          composed: true,
        }),
      );
    });

    it('should set Avatar Up orientation and dispatch event', async () => {
      service.addEventListener('hoops-floorplan-orientation-changed', eventListener);

      await service.setOrientation('Avatar Up');

      expect(mockFloorplanManager.setFloorplanOrientation).toHaveBeenCalledWith(
        FloorplanOrientation.AvatarUp,
      );
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-floorplan-orientation-changed',
          detail: { orientation: 'Avatar Up' },
          bubbles: true,
          composed: true,
        }),
      );
    });

    it('should throw error for unknown orientation', async () => {
      await expect(service.setOrientation('Unknown' as 'North Up')).rejects.toThrow(
        'Unknown orientation: Unknown',
      );
    });
  });

  describe('auto activation mode', () => {
    it('should get auto activation mode as Bim', () => {
      mockConfiguration.autoActivate = Floorplan.FloorplanAutoActivation.Bim;
      expect(service.getAutoActivationMode()).toBe('Bim');
    });

    it('should get auto activation mode as Bim + Walk', () => {
      mockConfiguration.autoActivate = Floorplan.FloorplanAutoActivation.BimWalk;
      expect(service.getAutoActivationMode()).toBe('Bim + Walk');
    });

    it('should get auto activation mode as Never', () => {
      mockConfiguration.autoActivate = Floorplan.FloorplanAutoActivation.Never;
      expect(service.getAutoActivationMode()).toBe('Never');
    });

    it('should default to Bim for unknown mode', () => {
      mockConfiguration.autoActivate = 'unknown' as any;
      expect(service.getAutoActivationMode()).toBe('Bim');
    });

    it('should throw error when setting auto activation mode without floorplan manager', async () => {
      const serviceWithoutManager = new FloorplanService();
      await expect(serviceWithoutManager.setAutoActivationMode('Bim')).rejects.toThrow(
        'FloorplanManager is not initialized',
      );
    });

    it('should set Bim mode and dispatch event', async () => {
      service.addEventListener('hoops-floorplan-auto-activation-changed', eventListener);

      await service.setAutoActivationMode('Bim');

      expect(mockFloorplanManager.setAutoActivate).toHaveBeenCalledWith(
        Floorplan.FloorplanAutoActivation.Bim,
      );
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-floorplan-auto-activation-changed',
          detail: { mode: 'Bim' },
          bubbles: true,
          composed: true,
        }),
      );
    });

    it('should set Bim + Walk mode and dispatch event', async () => {
      service.addEventListener('hoops-floorplan-auto-activation-changed', eventListener);

      await service.setAutoActivationMode('Bim + Walk');

      expect(mockFloorplanManager.setAutoActivate).toHaveBeenCalledWith(
        Floorplan.FloorplanAutoActivation.BimWalk,
      );
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-floorplan-auto-activation-changed',
          detail: { mode: 'Bim + Walk' },
          bubbles: true,
          composed: true,
        }),
      );
    });

    it('should set Never mode and dispatch event', async () => {
      service.addEventListener('hoops-floorplan-auto-activation-changed', eventListener);

      await service.setAutoActivationMode('Never');

      expect(mockFloorplanManager.setAutoActivate).toHaveBeenCalledWith(
        Floorplan.FloorplanAutoActivation.Never,
      );
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-floorplan-auto-activation-changed',
          detail: { mode: 'Never' },
          bubbles: true,
          composed: true,
        }),
      );
    });

    it('should throw error for unknown auto activation mode', async () => {
      await expect(service.setAutoActivationMode('Unknown' as 'Bim')).rejects.toThrow(
        'Unknown auto activation mode: Unknown',
      );
    });
  });

  describe('overlay feet per pixel', () => {
    it('should return 0 when floorplan manager is undefined', () => {
      const serviceWithoutManager = new FloorplanService();
      expect(serviceWithoutManager.getOverlayFeetPerPixel()).toBe(0);
    });

    it('should get overlay feet per pixel', () => {
      mockConfiguration.overlayFeetPerPixel = 0.5;
      expect(service.getOverlayFeetPerPixel()).toBe(0.5);
    });

    it('should throw error when setting overlay feet per pixel without floorplan manager', async () => {
      const serviceWithoutManager = new FloorplanService();
      await expect(serviceWithoutManager.setOverlayFeetPerPixel(0.5)).rejects.toThrow(
        'FloorplanManager is not initialized',
      );
    });

    it('should set overlay feet per pixel and dispatch event', async () => {
      service.addEventListener('hoops-floorplan-overlay-feet-per-pixel-changed', eventListener);
      mockConfiguration.overlayFeetPerPixel = 0.1;

      await service.setOverlayFeetPerPixel(0.5);

      expect(mockFloorplanManager.setOverlayFeetPerPixel).toHaveBeenCalledWith(0.5);
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-floorplan-overlay-feet-per-pixel-changed',
          detail: { feetPerPixel: 0.5 },
          bubbles: true,
          composed: true,
        }),
      );
    });

    it('should not change if feet per pixel is already set to desired value', async () => {
      mockConfiguration.overlayFeetPerPixel = 0.5;

      await service.setOverlayFeetPerPixel(0.5);

      expect(mockFloorplanManager.setOverlayFeetPerPixel).not.toHaveBeenCalled();
    });
  });

  describe('overlay zoom level', () => {
    it('should return 1.0 when floorplan manager is undefined', () => {
      const serviceWithoutManager = new FloorplanService();
      expect(serviceWithoutManager.getOverlayZoomLevel()).toBe(1.0);
    });

    it('should get overlay zoom level', () => {
      mockConfiguration.zoomLevel = 2.0;
      expect(service.getOverlayZoomLevel()).toBe(2.0);
    });

    it('should throw error when setting overlay zoom level without floorplan manager', async () => {
      const serviceWithoutManager = new FloorplanService();
      await expect(serviceWithoutManager.setOverlayZoomLevel(2.0)).rejects.toThrow(
        'FloorplanManager is not initialized',
      );
    });

    it('should set overlay zoom level and dispatch event', async () => {
      service.addEventListener('hoops-floorplan-overlay-zoom-level-changed', eventListener);
      mockConfiguration.zoomLevel = 1.0;

      await service.setOverlayZoomLevel(2.0);

      expect(mockFloorplanManager.setZoomLevel).toHaveBeenCalledWith(2.0);
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-floorplan-overlay-zoom-level-changed',
          detail: { zoomLevel: 2.0 },
          bubbles: true,
          composed: true,
        }),
      );
    });

    it('should not change if zoom level is already set to desired value', async () => {
      mockConfiguration.zoomLevel = 2.0;

      await service.setOverlayZoomLevel(2.0);

      expect(mockFloorplanManager.setZoomLevel).not.toHaveBeenCalled();
    });
  });

  describe('overlay background opacity', () => {
    it('should return 1.0 when floorplan manager is undefined', () => {
      const serviceWithoutManager = new FloorplanService();
      expect(serviceWithoutManager.getOverlayBackgroundOpacity()).toBe(1.0);
    });

    it('should get overlay background opacity', () => {
      mockConfiguration.backgroundOpacity = 0.5;
      expect(service.getOverlayBackgroundOpacity()).toBe(0.5);
    });

    it('should throw error when setting overlay background opacity without floorplan manager', async () => {
      const serviceWithoutManager = new FloorplanService();
      await expect(serviceWithoutManager.setOverlayBackgroundOpacity(0.5)).rejects.toThrow(
        'FloorplanManager is not initialized',
      );
    });

    it('should set overlay background opacity and dispatch event', async () => {
      service.addEventListener('hoops-floorplan-overlay-background-opacity-changed', eventListener);
      mockConfiguration.backgroundOpacity = 0.25;

      await service.setOverlayBackgroundOpacity(0.5);

      expect(mockFloorplanManager.setBackgroundOpacity).toHaveBeenCalledWith(0.5);
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-floorplan-overlay-background-opacity-changed',
          detail: { opacity: 0.5 },
          bubbles: true,
          composed: true,
        }),
      );
    });

    it('should not change if background opacity is already set to desired value', async () => {
      mockConfiguration.backgroundOpacity = 0.5;

      await service.setOverlayBackgroundOpacity(0.5);

      expect(mockFloorplanManager.setBackgroundOpacity).not.toHaveBeenCalled();
    });
  });

  describe('overlay border opacity', () => {
    it('should return 1.0 when floorplan manager is undefined', () => {
      const serviceWithoutManager = new FloorplanService();
      expect(serviceWithoutManager.getOverlayBorderOpacity()).toBe(1.0);
    });

    it('should get overlay border opacity', () => {
      mockConfiguration.borderOpacity = 0.8;
      expect(service.getOverlayBorderOpacity()).toBe(0.8);
    });

    it('should throw error when setting overlay border opacity without floorplan manager', async () => {
      const serviceWithoutManager = new FloorplanService();
      await expect(serviceWithoutManager.setOverlayBorderOpacity(0.8)).rejects.toThrow(
        'FloorplanManager is not initialized',
      );
    });

    it('should set overlay border opacity and dispatch event', async () => {
      service.addEventListener('hoops-floorplan-overlay-border-opacity-changed', eventListener);
      mockConfiguration.borderOpacity = 1.0;

      await service.setOverlayBorderOpacity(0.8);

      expect(mockFloorplanManager.setBorderOpacity).toHaveBeenCalledWith(0.8);
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-floorplan-overlay-border-opacity-changed',
          detail: { opacity: 0.8 },
          bubbles: true,
          composed: true,
        }),
      );
    });

    it('should not change if border opacity is already set to desired value', async () => {
      mockConfiguration.borderOpacity = 0.8;

      await service.setOverlayBorderOpacity(0.8);

      expect(mockFloorplanManager.setBorderOpacity).not.toHaveBeenCalled();
    });
  });

  describe('overlay avatar opacity', () => {
    it('should return 1.0 when floorplan manager is undefined', () => {
      const serviceWithoutManager = new FloorplanService();
      expect(serviceWithoutManager.getOverlayAvatarOpacity()).toBe(1.0);
    });

    it('should get overlay avatar opacity', () => {
      mockConfiguration.avatarOpacity = 0.7;
      expect(service.getOverlayAvatarOpacity()).toBe(0.7);
    });

    it('should throw error when setting overlay avatar opacity without floorplan manager', async () => {
      const serviceWithoutManager = new FloorplanService();
      await expect(serviceWithoutManager.setOverlayAvatarOpacity(0.7)).rejects.toThrow(
        'FloorplanManager is not initialized',
      );
    });

    it('should set overlay avatar opacity and dispatch event', async () => {
      service.addEventListener('hoops-floorplan-overlay-avatar-opacity-changed', eventListener);
      mockConfiguration.avatarOpacity = 1.0;

      await service.setOverlayAvatarOpacity(0.7);

      expect(mockFloorplanManager.setAvatarOpacity).toHaveBeenCalledWith(0.7);
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-floorplan-overlay-avatar-opacity-changed',
          detail: { opacity: 0.7 },
          bubbles: true,
          composed: true,
        }),
      );
    });

    it('should not change if avatar opacity is already set to desired value', async () => {
      mockConfiguration.avatarOpacity = 0.7;

      await service.setOverlayAvatarOpacity(0.7);

      expect(mockFloorplanManager.setAvatarOpacity).not.toHaveBeenCalled();
    });
  });

  describe('floorplan background color', () => {
    it('should get floorplan background color', () => {
      expect(service.getFloorplanBackgroundColor()).toBe('#ffffff');
    });

    it('should return default color when floorplan manager is undefined', () => {
      const serviceWithoutManager = new FloorplanService();
      expect(serviceWithoutManager.getFloorplanBackgroundColor()).toBe('#ffffff');
    });

    it('should throw error when setting floorplan background color without floorplan manager', async () => {
      const serviceWithoutManager = new FloorplanService();
      await expect(serviceWithoutManager.setFloorplanBackgroundColor('#ff0000')).rejects.toThrow(
        'FloorplanManager is not initialized',
      );
    });

    it('should set floorplan background color and dispatch event', async () => {
      service.addEventListener('hoops-floorplan-background-color-changed', eventListener);
      const mockColor = { hex: '#ff0000', toHexString: () => '#ff0000' };
      (Color.fromHexString as Mock).mockReturnValue(mockColor);

      await service.setFloorplanBackgroundColor('#ff0000');

      expect(Color.fromHexString).toHaveBeenCalledWith('#ff0000');
      expect(mockFloorplanManager.setBackgroundColor).toHaveBeenCalledWith(mockColor);
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-floorplan-background-color-changed',
          detail: { color: '#ff0000' },
          bubbles: true,
          composed: true,
        }),
      );
    });
  });

  describe('floorplan border color', () => {
    it('should get floorplan border color', () => {
      expect(service.getFloorplanBorderColor()).toBe('#000000');
    });

    it('should return default color when floorplan manager is undefined', () => {
      const serviceWithoutManager = new FloorplanService();
      expect(serviceWithoutManager.getFloorplanBorderColor()).toBe('#ffffff');
    });

    it('should throw error when setting floorplan border color without floorplan manager', async () => {
      const serviceWithoutManager = new FloorplanService();
      await expect(serviceWithoutManager.setFloorplanBorderColor('#00ff00')).rejects.toThrow(
        'FloorplanManager is not initialized',
      );
    });

    it('should set floorplan border color and dispatch event', async () => {
      service.addEventListener('hoops-floorplan-border-color-changed', eventListener);
      const mockColor = { hex: '#00ff00', toHexString: () => '#00ff00' };
      (Color.fromHexString as Mock).mockReturnValue(mockColor);

      await service.setFloorplanBorderColor('#00ff00');

      expect(Color.fromHexString).toHaveBeenCalledWith('#00ff00');
      expect(mockFloorplanManager.setBorderColor).toHaveBeenCalledWith(mockColor);
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-floorplan-border-color-changed',
          detail: { color: '#00ff00' },
          bubbles: true,
          composed: true,
        }),
      );
    });
  });

  describe('floorplan avatar color', () => {
    it('should get floorplan avatar color', () => {
      expect(service.getFloorplanAvatarColor()).toBe('#ff00ff');
    });

    it('should return default color when floorplan manager is undefined', () => {
      const serviceWithoutManager = new FloorplanService();
      expect(serviceWithoutManager.getFloorplanAvatarColor()).toBe('#ffffff');
    });

    it('should throw error when setting floorplan avatar color without floorplan manager', async () => {
      const serviceWithoutManager = new FloorplanService();
      await expect(serviceWithoutManager.setFloorplanAvatarColor('#0000ff')).rejects.toThrow(
        'FloorplanManager is not initialized',
      );
    });

    it('should set floorplan avatar color and dispatch event', async () => {
      service.addEventListener('hoops-floorplan-avatar-color-changed', eventListener);
      const mockColor = { hex: '#0000ff', toHexString: () => '#0000ff' };
      (Color.fromHexString as Mock).mockReturnValue(mockColor);

      await service.setFloorplanAvatarColor('#0000ff');

      expect(Color.fromHexString).toHaveBeenCalledWith('#0000ff');
      expect(mockFloorplanManager.setAvatarColor).toHaveBeenCalledWith(mockColor);
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-floorplan-avatar-color-changed',
          detail: { color: '#0000ff' },
          bubbles: true,
          composed: true,
        }),
      );
    });
  });

  describe('floorplan avatar outline color', () => {
    it('should get floorplan avatar outline color', () => {
      expect(service.getFloorplanAvatarOutlineColor()).toBe('#000000');
    });

    it('should return default color when floorplan manager is undefined', () => {
      const serviceWithoutManager = new FloorplanService();
      expect(serviceWithoutManager.getFloorplanAvatarOutlineColor()).toBe('#ffffff');
    });

    it('should throw error when setting floorplan avatar outline color without floorplan manager', async () => {
      const serviceWithoutManager = new FloorplanService();
      await expect(serviceWithoutManager.setFloorplanAvatarOutlineColor('#ffff00')).rejects.toThrow(
        'FloorplanManager is not initialized',
      );
    });

    it('should set floorplan avatar outline color and dispatch event', async () => {
      service.addEventListener('hoops-floorplan-avatar-outline-color-changed', eventListener);
      const mockColor = { hex: '#ffff00', toHexString: () => '#ffff00' };
      (Color.fromHexString as Mock).mockReturnValue(mockColor);

      await service.setFloorplanAvatarOutlineColor('#ffff00');

      expect(Color.fromHexString).toHaveBeenCalledWith('#ffff00');
      expect(mockFloorplanManager.setAvatarOutlineColor).toHaveBeenCalledWith(mockColor);
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-floorplan-avatar-outline-color-changed',
          detail: { color: '#ffff00' },
          bubbles: true,
          composed: true,
        }),
      );
    });
  });

  describe('resetConfiguration', () => {
    it('should throw error when resetting configuration without floorplan manager', async () => {
      const serviceWithoutManager = new FloorplanService();
      await expect(serviceWithoutManager.resetConfiguration()).rejects.toThrow(
        'FloorplanManager is not initialized',
      );
    });

    it('should throw error for invalid configuration object', async () => {
      await expect(service.resetConfiguration({ invalid: true })).rejects.toThrow(
        'Invalid floorplan configuration object',
      );
    });

    it('should reset to default configuration', async () => {
      service.addEventListener('hoops-floorplan-manager-reset', eventListener);

      // Mock the service methods to avoid calling actual implementation
      const setTrackCameraSpy = vi.spyOn(service, 'setTrackCameraEnabled').mockResolvedValue();
      const setOrientationSpy = vi.spyOn(service, 'setOrientation').mockResolvedValue();
      const setAutoActivationSpy = vi.spyOn(service, 'setAutoActivationMode').mockResolvedValue();
      const setFeetPerPixelSpy = vi.spyOn(service, 'setOverlayFeetPerPixel').mockResolvedValue();
      const setZoomLevelSpy = vi.spyOn(service, 'setOverlayZoomLevel').mockResolvedValue();
      const setBackgroundOpacitySpy = vi
        .spyOn(service, 'setOverlayBackgroundOpacity')
        .mockResolvedValue();
      const setBorderOpacitySpy = vi.spyOn(service, 'setOverlayBorderOpacity').mockResolvedValue();
      const setAvatarOpacitySpy = vi.spyOn(service, 'setOverlayAvatarOpacity').mockResolvedValue();
      const setBackgroundColorSpy = vi
        .spyOn(service, 'setFloorplanBackgroundColor')
        .mockResolvedValue();
      const setBorderColorSpy = vi.spyOn(service, 'setFloorplanBorderColor').mockResolvedValue();
      const setAvatarColorSpy = vi.spyOn(service, 'setFloorplanAvatarColor').mockResolvedValue();
      const setAvatarOutlineColorSpy = vi
        .spyOn(service, 'setFloorplanAvatarOutlineColor')
        .mockResolvedValue();

      await service.resetConfiguration();

      expect(setTrackCameraSpy).toHaveBeenCalledWith(false);
      expect(setOrientationSpy).toHaveBeenCalledWith('North Up');
      expect(setAutoActivationSpy).toHaveBeenCalledWith('Bim + Walk');
      expect(setFeetPerPixelSpy).toHaveBeenCalledWith(0.1);
      expect(setZoomLevelSpy).toHaveBeenCalledWith(1.0);
      expect(setBackgroundOpacitySpy).toHaveBeenCalledWith(0.25);
      expect(setBorderOpacitySpy).toHaveBeenCalledWith(1.0);
      expect(setAvatarOpacitySpy).toHaveBeenCalledWith(1.0);
      expect(setBackgroundColorSpy).toHaveBeenCalledWith('#ffffff');
      expect(setBorderColorSpy).toHaveBeenCalledWith('#000000');
      expect(setAvatarColorSpy).toHaveBeenCalledWith('#ff00ff');
      expect(setAvatarOutlineColorSpy).toHaveBeenCalledWith('#000000');

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-floorplan-manager-reset',
          detail: {},
          bubbles: true,
          composed: true,
        }),
      );
    });

    it('should reset to custom configuration', async () => {
      const customConfig: FloorplanServiceConfiguration = {
        floorplanActive: true,
        trackCamera: true,
        orientation: 'Avatar Up',
        autoActivationMode: 'Never',
        overlayFeetPerPixel: 0.2,
        overlayZoomLevel: 2.0,
        overlayBackgroundOpacity: 0.5,
        overlayBorderOpacity: 0.8,
        overlayAvatarOpacity: 0.7,
        floorplanBackgroundColor: '#ff0000',
        floorplanBorderColor: '#00ff00',
        floorplanAvatarColor: '#0000ff',
        floorplanAvatarOutlineColor: '#ffff00',
      };

      const setTrackCameraSpy = vi.spyOn(service, 'setTrackCameraEnabled').mockResolvedValue();
      const setOrientationSpy = vi.spyOn(service, 'setOrientation').mockResolvedValue();

      await service.resetConfiguration(customConfig);

      expect(setTrackCameraSpy).toHaveBeenCalledWith(true);
      expect(setOrientationSpy).toHaveBeenCalledWith('Avatar Up');
    });
  });

  describe('reset', () => {
    it('should dispatch reset event', async () => {
      service.addEventListener('hoops-floorplan-manager-reset', eventListener);

      await service.reset();

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-floorplan-manager-reset',
          detail: {},
          bubbles: true,
          composed: true,
        }),
      );
    });
  });
});
