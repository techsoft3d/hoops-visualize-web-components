import { describe, expect, it, vi, beforeEach } from 'vitest';

import { Projection, OrbitFallbackMode } from '@ts3d-hoops/web-viewer';
import CameraService from './CameraService';

const mockView = () => ({
  getProjectionMode: vi.fn(),
  setProjectionMode: vi.fn(),
});

const mockOperator = () => ({
  getOrbitFallbackMode: vi.fn(),
  setOrbitFallbackMode: vi.fn(),
});

const mockOperatorManager = (operator: any) => ({
  getOperator: vi.fn(() => operator),
});

const createMockWebViewer = (
  projectionMode = Projection.Orthographic,
  orbitFallbackMode = OrbitFallbackMode.CameraTarget,
) => {
  const view = mockView();
  view.getProjectionMode.mockReturnValue(projectionMode);
  const operator = mockOperator();
  operator.getOrbitFallbackMode.mockReturnValue(orbitFallbackMode);
  return {
    view,
    operatorManager: mockOperatorManager(operator),
  };
};

describe('CameraService', () => {
  let service: CameraService;

  beforeEach(() => {
    service = new CameraService();
  });

  describe('default values or throw when no webViewer is set', () => {
    it('should return default projection mode', () => {
      expect(service.getProjectionMode()).toBe('Orthographic');
    });
    it('should return default orbit fallback mode', () => {
      expect(service.getOrbitFallbackMode()).toBe('Model Center');
    });
    it('should throw when trying to set projection mode without webViewer', () => {
      expect(() => service.setProjectionMode('Perspective')).toThrow('WebViewer is not set');
    });
    it('should throw when trying to set orbit fallback mode without webViewer', () => {
      expect(() => service.setOrbitFallbackMode('Model Center')).toThrow('WebViewer is not set');
    });
  });

  describe('get/set is delegated to the webViewer', () => {
    it('should delegate getProjectionMode to webViewer', () => {
      const mock = createMockWebViewer(Projection.Perspective);
      service.webViewer = mock as any;
      expect(service.getProjectionMode()).toBe('Perspective');
      expect(mock.view.getProjectionMode).toHaveBeenCalled();
    });
    it('should delegate setProjectionMode to webViewer', () => {
      const mock = createMockWebViewer(Projection.Orthographic);
      service.webViewer = mock as any;
      service.setProjectionMode('Perspective');
      expect(mock.view.setProjectionMode).toHaveBeenCalled();
    });
    it('should delegate getOrbitFallbackMode to webViewer', () => {
      const mock = createMockWebViewer(Projection.Orthographic, OrbitFallbackMode.CameraTarget);
      service.webViewer = mock as any;
      expect(service.getOrbitFallbackMode()).toBe('Camera Target');
      expect(mock.operatorManager.getOperator().getOrbitFallbackMode).toHaveBeenCalled();
    });
    it('should delegate setOrbitFallbackMode to webViewer', () => {
      const mock = createMockWebViewer(Projection.Perspective, OrbitFallbackMode.OrbitTarget);
      service.webViewer = mock as any;
      service.setOrbitFallbackMode('Model Center');
      expect(mock.operatorManager.getOperator().setOrbitFallbackMode).toHaveBeenCalled();
    });
  });

  describe('events are dispatched', () => {
    it('should dispatch hoops-projection-mode-changed event', () => {
      const mock = createMockWebViewer(Projection.Perspective);
      service.webViewer = mock as any;
      const listener = vi.fn();
      service.addEventListener('hoops-projection-mode-changed', listener);
      service.setProjectionMode('Orthographic');
      expect(listener).toHaveBeenCalled();
    });
    it('should dispatch hoops-orbit-fallback-mode-changed event', () => {
      const mock = createMockWebViewer(Projection.Perspective, OrbitFallbackMode.ModelCenter);
      service.webViewer = mock as any;
      const listener = vi.fn();
      service.addEventListener('hoops-orbit-fallback-mode-changed', listener);
      service.setOrbitFallbackMode('Camera Target');
      expect(listener).toHaveBeenCalled();
    });
    it('should dispatch hoops-camera-service-reset event on reset', () => {
      const listener = vi.fn();
      service.addEventListener('hoops-camera-service-reset', listener);
      service.reset();
      expect(listener).toHaveBeenCalled();
    });
    it('should dispatch hoops-camera-service-reset event when webViewer is set', () => {
      const listener = vi.fn();
      service.addEventListener('hoops-camera-service-reset', listener);
      service.webViewer = createMockWebViewer() as any;
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('resetConfiguration', () => {
    it('should throw if there is no webViewer', async () => {
      await expect(service.resetConfiguration()).rejects.toThrowError('WebViewer is not set');
    });

    it('should throw if the argument is not a valid config', async () => {
      const mock = createMockWebViewer(Projection.Perspective, OrbitFallbackMode.CameraTarget);
      service.webViewer = mock as any;

      await expect(service.resetConfiguration({})).rejects.toThrowError(
        'Invalid camera configuration object',
      );
      await expect(() =>
        service.resetConfiguration({
          projectionMode: 'Invalid' as any,
        }),
      ).rejects.toThrowError('Invalid camera configuration object');
      await expect(() =>
        service.resetConfiguration({
          orbitFallbackMode: 'Invalid' as any,
        }),
      ).rejects.toThrowError('Invalid camera configuration object');
      await expect(() =>
        service.resetConfiguration({
          projectionMode: 'Orthographic',
          orbitFallbackMode: 'Invalid' as any,
        }),
      ).rejects.toThrowError('Invalid camera configuration object');
    });

    it('should reset to default when no config is provided', async () => {
      const mock = createMockWebViewer(Projection.Perspective, OrbitFallbackMode.CameraTarget);
      service.webViewer = mock as any;

      await service.resetConfiguration();
      expect(mock.view.setProjectionMode).toHaveBeenCalledWith(Projection.Orthographic);
      expect(mock.operatorManager.getOperator().setOrbitFallbackMode).toHaveBeenCalledWith(
        OrbitFallbackMode.ModelCenter,
      );
    });

    it('should reset to the provided config', async () => {
      const mock = createMockWebViewer(Projection.Orthographic, OrbitFallbackMode.ModelCenter);
      service.webViewer = mock as any;

      await service.resetConfiguration({
        projectionMode: 'Perspective',
        orbitFallbackMode: 'Orbit Target',
      });
      expect(mock.view.setProjectionMode).toHaveBeenCalledWith(Projection.Perspective);
      expect(mock.operatorManager.getOperator().setOrbitFallbackMode).toHaveBeenCalledWith(
        OrbitFallbackMode.OrbitTarget,
      );
    });
  });
});
