import { beforeEach, describe, expect, it, vi } from 'vitest';
import { core } from '@ts3d-hoops/web-viewer';
import { ViewService } from './ViewService';
import type { ViewServiceConfiguration } from './types';

describe('ViewService', () => {
  let service: ViewService;
  let mockView: core.IView;
  let mockAxisTriad: {
    getEnabled: ReturnType<typeof vi.fn>;
    enable: ReturnType<typeof vi.fn>;
    disable: ReturnType<typeof vi.fn>;
  };
  let mockNavCube: {
    getEnabled: ReturnType<typeof vi.fn>;
    enable: ReturnType<typeof vi.fn>;
    disable: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockAxisTriad = {
      getEnabled: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
    };

    mockNavCube = {
      getEnabled: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
    };

    mockView = {
      axisTriad: mockAxisTriad,
      navCube: mockNavCube,
    } as unknown as core.IView;

    service = new ViewService(mockView);
  });

  describe('constructor', () => {
    it('should initialize with provided view', () => {
      expect(service.view).toBe(mockView);
    });

    it('should initialize without view', () => {
      const serviceWithoutView = new ViewService();
      expect(serviceWithoutView.view).toBeUndefined();
    });

    it('should have correct service name', () => {
      expect(service.serviceName).toBe('ViewService');
    });

    it('should extend EventTarget', () => {
      expect(service).toBeInstanceOf(EventTarget);
    });
  });

  describe('DefaultConfiguration', () => {
    it('should have correct default values', () => {
      expect(ViewService.DefaultConfiguration).toEqual({
        axisTriadVisible: true,
        navCubeVisible: true,
      });
    });
  });

  describe('view property', () => {
    it('should get current view', () => {
      expect(service.view).toBe(mockView);
    });

    it('should set new view and dispatch event', () => {
      const eventSpy = vi.fn();
      service.addEventListener('hoops-view-reset', eventSpy);

      const newMockView = {
        axisTriad: mockAxisTriad,
        navCube: mockNavCube,
      } as unknown as core.IView;

      service.view = newMockView;

      expect(service.view).toBe(newMockView);
      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-view-reset',
          bubbles: true,
          composed: true,
        }),
      );
    });

    it('should not dispatch event when setting same view', () => {
      const eventSpy = vi.fn();
      service.addEventListener('hoops-view-reset', eventSpy);

      service.view = mockView;

      expect(eventSpy).not.toHaveBeenCalled();
    });

    it('should set view to undefined', () => {
      const eventSpy = vi.fn();
      service.addEventListener('hoops-view-reset', eventSpy);

      service.view = undefined;

      expect(service.view).toBeUndefined();
      expect(eventSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('isAxisTriadVisible', () => {
    it('should return axis triad enabled state when view is available', () => {
      mockAxisTriad.getEnabled.mockReturnValue(true);
      expect(service.isAxisTriadVisible()).toBe(true);

      mockAxisTriad.getEnabled.mockReturnValue(false);
      expect(service.isAxisTriadVisible()).toBe(false);
    });

    it('should return false when view is not available', () => {
      service = new ViewService();
      expect(service.isAxisTriadVisible()).toBe(true);
    });
  });

  describe('setAxisTriadVisible', () => {
    it('should throw error when view is not initialized', () => {
      service = new ViewService();
      expect(() => service.setAxisTriadVisible(true)).toThrow(
        'ViewService: View is not initialized.',
      );
    });

    it('should enable axis triad and dispatch event when setting to visible', () => {
      const eventSpy = vi.fn();
      service.addEventListener('hoops-view-axis-triad-visibility-changed', eventSpy);
      mockAxisTriad.getEnabled.mockReturnValue(false);

      service.setAxisTriadVisible(true);

      expect(mockAxisTriad.enable).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-view-axis-triad-visibility-changed',
          detail: { visible: true },
          bubbles: true,
          composed: true,
        }),
      );
    });

    it('should disable axis triad and dispatch event when setting to invisible', () => {
      const eventSpy = vi.fn();
      service.addEventListener('hoops-view-axis-triad-visibility-changed', eventSpy);
      mockAxisTriad.getEnabled.mockReturnValue(true);

      service.setAxisTriadVisible(false);

      expect(mockAxisTriad.disable).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-view-axis-triad-visibility-changed',
          detail: { visible: false },
          bubbles: true,
          composed: true,
        }),
      );
    });

    it('should not dispatch event when visibility state is unchanged', () => {
      const eventSpy = vi.fn();
      service.addEventListener('hoops-view-axis-triad-visibility-changed', eventSpy);
      mockAxisTriad.getEnabled.mockReturnValue(true);

      service.setAxisTriadVisible(true);

      expect(mockAxisTriad.enable).not.toHaveBeenCalled();
      expect(mockAxisTriad.disable).not.toHaveBeenCalled();
      expect(eventSpy).not.toHaveBeenCalled();
    });
  });

  describe('isNavCubeVisible', () => {
    it('should return nav cube enabled state when view is available', () => {
      mockNavCube.getEnabled.mockReturnValue(true);
      expect(service.isNavCubeVisible()).toBe(true);

      mockNavCube.getEnabled.mockReturnValue(false);
      expect(service.isNavCubeVisible()).toBe(false);
    });

    it('should return false when view is not available', () => {
      service = new ViewService();
      expect(service.isNavCubeVisible()).toBe(true);
    });
  });

  describe('setNavCubeVisible', () => {
    it('should throw error when view is not initialized', () => {
      service = new ViewService();
      expect(() => service.setNavCubeVisible(true)).toThrow(
        'ViewService: View is not initialized.',
      );
    });

    it('should enable nav cube and dispatch event when setting to visible', () => {
      const eventSpy = vi.fn();
      service.addEventListener('hoops-view-nav-cube-visibility-changed', eventSpy);
      mockNavCube.getEnabled.mockReturnValue(false);

      service.setNavCubeVisible(true);

      expect(mockNavCube.enable).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-view-nav-cube-visibility-changed',
          detail: { visible: true },
          bubbles: true,
          composed: true,
        }),
      );
    });

    it('should disable nav cube and dispatch event when setting to invisible', () => {
      const eventSpy = vi.fn();
      service.addEventListener('hoops-view-nav-cube-visibility-changed', eventSpy);
      mockNavCube.getEnabled.mockReturnValue(true);

      service.setNavCubeVisible(false);

      expect(mockNavCube.disable).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-view-nav-cube-visibility-changed',
          detail: { visible: false },
          bubbles: true,
          composed: true,
        }),
      );
    });

    it('should not dispatch event when visibility state is unchanged', () => {
      const eventSpy = vi.fn();
      service.addEventListener('hoops-view-nav-cube-visibility-changed', eventSpy);
      mockNavCube.getEnabled.mockReturnValue(true);

      service.setNavCubeVisible(true);

      expect(mockNavCube.enable).not.toHaveBeenCalled();
      expect(mockNavCube.disable).not.toHaveBeenCalled();
      expect(eventSpy).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should dispatch reset event', () => {
      const eventSpy = vi.fn();
      service.addEventListener('hoops-view-service-reset', eventSpy);

      service.reset();

      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-view-service-reset',
        }),
      );
    });
  });

  describe('resetConfiguration', () => {
    beforeEach(() => {
      mockAxisTriad.getEnabled.mockReturnValue(false);
      mockNavCube.getEnabled.mockReturnValue(false);
    });

    it('should use default configuration when no object is provided', async () => {
      const setAxisTriadVisibleSpy = vi.spyOn(service, 'setAxisTriadVisible');
      const setNavCubeVisibleSpy = vi.spyOn(service, 'setNavCubeVisible');

      await service.resetConfiguration();

      expect(setAxisTriadVisibleSpy).toHaveBeenCalledWith(true);
      expect(setNavCubeVisibleSpy).toHaveBeenCalledWith(true);
    });

    it('should apply provided valid configuration', async () => {
      const setAxisTriadVisibleSpy = vi.spyOn(service, 'setAxisTriadVisible');
      const setNavCubeVisibleSpy = vi.spyOn(service, 'setNavCubeVisible');

      const config: ViewServiceConfiguration = {
        axisTriadVisible: false,
        navCubeVisible: true,
      };

      await service.resetConfiguration(config);

      expect(setAxisTriadVisibleSpy).toHaveBeenCalledWith(false);
      expect(setNavCubeVisibleSpy).toHaveBeenCalledWith(true);
    });

    it('should throw error for invalid configuration object', async () => {
      const invalidConfigs = [
        'string',
        123,
        [],
        { axisTriadVisible: 'invalid' },
        { navCubeVisible: 'invalid' },
        { axisTriadVisible: true },
        { navCubeVisible: true },
        { extraProperty: true },
        {},
      ];

      for (const config of invalidConfigs) {
        await expect(service.resetConfiguration(config as any)).rejects.toThrow(
          'Invalid configuration object',
        );
      }
    });

    it('should handle configuration with both properties as false', async () => {
      const setAxisTriadVisibleSpy = vi.spyOn(service, 'setAxisTriadVisible');
      const setNavCubeVisibleSpy = vi.spyOn(service, 'setNavCubeVisible');

      const config: ViewServiceConfiguration = {
        axisTriadVisible: false,
        navCubeVisible: false,
      };

      await service.resetConfiguration(config);

      expect(setAxisTriadVisibleSpy).toHaveBeenCalledWith(false);
      expect(setNavCubeVisibleSpy).toHaveBeenCalledWith(false);
    });

    it('should handle configuration with both properties as true', async () => {
      const setAxisTriadVisibleSpy = vi.spyOn(service, 'setAxisTriadVisible');
      const setNavCubeVisibleSpy = vi.spyOn(service, 'setNavCubeVisible');

      const config: ViewServiceConfiguration = {
        axisTriadVisible: true,
        navCubeVisible: true,
      };

      await service.resetConfiguration(config);

      expect(setAxisTriadVisibleSpy).toHaveBeenCalledWith(true);
      expect(setNavCubeVisibleSpy).toHaveBeenCalledWith(true);
    });
  });

  describe('error handling', () => {
    it('should handle null view when checking axis triad visibility', () => {
      service = new ViewService(null as unknown as core.IView);
      expect(service.isAxisTriadVisible()).toBe(true);
    });

    it('should handle null view when checking nav cube visibility', () => {
      service = new ViewService(null as unknown as core.IView);
      expect(service.isNavCubeVisible()).toBe(true);
    });

    it('should handle undefined view when setting axis triad visibility', () => {
      service = new ViewService(undefined);
      expect(() => service.setAxisTriadVisible(true)).toThrow(
        'ViewService: View is not initialized.',
      );
    });

    it('should handle undefined view when setting nav cube visibility', () => {
      service = new ViewService(undefined);
      expect(() => service.setNavCubeVisible(true)).toThrow(
        'ViewService: View is not initialized.',
      );
    });
  });

  describe('event dispatching', () => {
    it('should dispatch events with correct properties', () => {
      let events: CustomEvent[] = [];
      const eventListener = (event: Event) => {
        events.push(event as CustomEvent);
      };

      service.addEventListener('hoops-view-reset', eventListener);
      service.addEventListener('hoops-view-axis-triad-visibility-changed', eventListener);
      service.addEventListener('hoops-view-nav-cube-visibility-changed', eventListener);
      service.addEventListener('hoops-view-service-reset', eventListener);

      // Test view reset event
      service.view = {} as core.IView;
      expect(events[0].type).toBe('hoops-view-reset');
      expect(events[0].bubbles).toBe(true);
      expect(events[0].composed).toBe(true);

      // Reset events array
      events.length = 0;

      // Mock different states for visibility change events
      service.view = mockView;
      mockAxisTriad.getEnabled.mockReturnValue(false);
      mockNavCube.getEnabled.mockReturnValue(false);

      events = [];
      // Test axis triad visibility event
      service.setAxisTriadVisible(true);
      expect(events[0].type).toBe('hoops-view-axis-triad-visibility-changed');
      expect(events[0].detail).toEqual({ visible: true });
      expect(events[0].bubbles).toBe(true);
      expect(events[0].composed).toBe(true);

      // Test nav cube visibility event
      service.setNavCubeVisible(true);
      expect(events[1].type).toBe('hoops-view-nav-cube-visibility-changed');
      expect(events[1].detail).toEqual({ visible: true });
      expect(events[1].bubbles).toBe(true);
      expect(events[1].composed).toBe(true);

      // Test reset event
      events = [];
      service.reset();
      expect(events[0].type).toBe('hoops-view-service-reset');
    });
  });

  describe('service interface compliance', () => {
    it('should implement IViewService interface methods', () => {
      expect(typeof service.isAxisTriadVisible).toBe('function');
      expect(typeof service.setAxisTriadVisible).toBe('function');
      expect(typeof service.isNavCubeVisible).toBe('function');
      expect(typeof service.setNavCubeVisible).toBe('function');
      expect(typeof service.reset).toBe('function');
      expect(typeof service.resetConfiguration).toBe('function');
      expect(service.serviceName).toBe('ViewService');
    });

    it('should have proper method signatures', () => {
      expect(service.isAxisTriadVisible()).toBe(true);
      expect(service.isNavCubeVisible()).toBe(true);
      expect(() => service.reset()).not.toThrow();
      expect(service.resetConfiguration()).toBeInstanceOf(Promise);
    });
  });
});
