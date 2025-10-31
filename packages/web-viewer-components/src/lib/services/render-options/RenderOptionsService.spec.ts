import { describe, it, expect, beforeEach, vi } from 'vitest';
import RenderOptionsService from './RenderOptionsService';
import {
  AntiAliasingMode,
  Color,
  DrawMode,
  PointSizeUnit,
  VerticalGradient,
} from '@ts3d-hoops/web-viewer';

function createMockWebViewer(overrides = {}) {
  const hiddenLineSettings = {
    getObscuredLineOpacity: vi.fn(() => 0.5),
    setObscuredLineOpacity: vi.fn(),
  };
  const view = {
    getHiddenLineSettings: vi.fn(() => hiddenLineSettings),
    getBackfacesVisible: vi.fn(() => true),
    setBackfacesVisible: vi.fn(),
    getAmbientOcclusionEnabled: vi.fn(() => true),
    setAmbientOcclusionEnabled: vi.fn(),
    getAmbientOcclusionRadius: vi.fn(() => 2),
    setAmbientOcclusionRadius: vi.fn(),
    getAntiAliasingMode: vi.fn(() => AntiAliasingMode.SMAA),
    setAntiAliasingMode: vi.fn(),
    getBloomEnabled: vi.fn(() => true),
    setBloomEnabled: vi.fn(),
    getBloomIntensityScale: vi.fn(() => 0.7),
    setBloomIntensityScale: vi.fn(),
    getBloomThreshold: vi.fn(() => 0.8),
    setBloomThreshold: vi.fn(),
    getSilhouetteEnabled: vi.fn(() => true),
    setSilhouetteEnabled: vi.fn(),
    getSimpleReflectionEnabled: vi.fn(() => true),
    setSimpleReflectionEnabled: vi.fn(),
    getSimpleShadowEnabled: vi.fn(() => true),
    setSimpleShadowEnabled: vi.fn(),
    getSimpleShadowInteractiveUpdateEnabled: vi.fn(() => true),
    setSimpleShadowInteractiveUpdateEnabled: vi.fn(),
    getSimpleShadowBlurSamples: vi.fn(() => 4),
    setSimpleShadowBlurSamples: vi.fn(),
    setPointSize: vi.fn(),
    getEyeDomeLightingEnabled: vi.fn(() => true),
    setEyeDomeLightingEnabled: vi.fn(),
    getBackgroundColor: vi.fn(() => new VerticalGradient(new Color(1, 2, 3), new Color(4, 5, 6))),
    setBackgroundColor: vi.fn(),
    getDrawMode: vi.fn(() => DrawMode.HiddenLine),
    setDrawMode: vi.fn(),
  };
  return {
    setCallbacks: vi.fn(),
    unsetCallbacks: vi.fn(),
    getSceneReady: vi.fn(() => true),
    getMinimumFramerate: vi.fn(() => Promise.resolve(42)),
    setMinimumFramerate: vi.fn(() => Promise.resolve()),
    view,
    ...overrides,
  };
}

describe('RenderOptionsService', () => {
  let service: RenderOptionsService;
  let mockWebViewer: ReturnType<typeof createMockWebViewer>;

  beforeEach(() => {
    service = new RenderOptionsService();
    mockWebViewer = createMockWebViewer();
  });

  describe('bind/unbind', () => {
    it('should call setCallbacks on bind', () => {
      service.webViewer = mockWebViewer as any;
      expect(mockWebViewer.setCallbacks).toHaveBeenCalled();
    });
    it('should call unsetCallbacks on unbind', () => {
      service.webViewer = mockWebViewer as any;
      service.webViewer = undefined;
      expect(mockWebViewer.unsetCallbacks).toHaveBeenCalled();
    });
  });

  describe('get/set methods (webviewer not set)', () => {
    it('getMinimumFramerate returns 0', async () => {
      expect(await service.getMinimumFramerate()).toBe(0);
    });
    it('getHiddenLineOpacity returns 0', () => {
      expect(service.getHiddenLineOpacity()).toBe(0);
    });
    it('getShowBackfaces returns false', () => {
      expect(service.getShowBackfaces()).toBe(false);
    });
    it('getAmbientOcclusionEnabled returns false', () => {
      expect(service.getAmbientOcclusionEnabled()).toBe(false);
    });
    it('getAmbientOcclusionRadius returns 0', () => {
      expect(service.getAmbientOcclusionRadius()).toBe(0);
    });
    it('getAntiAliasingEnabled returns false', () => {
      expect(service.getAntiAliasingEnabled()).toBe(false);
    });
    it('getBloomEnabled returns false', () => {
      expect(service.getBloomEnabled()).toBe(false);
    });
    it('getBloomIntensity returns 0', () => {
      expect(service.getBloomIntensity()).toBe(0);
    });
    it('getBloomThreshold returns 0', () => {
      expect(service.getBloomThreshold()).toBe(0);
    });
    it('getSilhouetteEnabled returns false', () => {
      expect(service.getSilhouetteEnabled()).toBe(false);
    });
    it('getReflectionEnabled returns false', () => {
      expect(service.getReflectionEnabled()).toBe(false);
    });
    it('getShadowEnabled returns false', () => {
      expect(service.getShadowEnabled()).toBe(false);
    });
    it('getShadowInteractive returns false', () => {
      expect(service.getShadowInteractive()).toBe(false);
    });
    it('getShadowBlurSamples returns 0', () => {
      expect(service.getShadowBlurSamples()).toBe(0);
    });
    it('getSplatRenderingEnabled returns false by default', () => {
      expect(service.getSplatRenderingEnabled()).toBe(false);
    });
    it('getSplatRenderingSize returns default', () => {
      expect(service.getSplatRenderingSize()).toBe(0.003);
    });
    it('getSplatRenderingPointSizeUnit returns default', () => {
      expect(service.getSplatRenderingPointSizeUnit()).toBe('Screen Pixels');
    });
    it('getBackgroundColor returns default VerticalGradient', () => {
      const color = service.getBackgroundColor();
      expect(color).toEqual({});
    });
  });

  describe('get/set methods (webviewer set)', () => {
    beforeEach(() => {
      service.webViewer = mockWebViewer as any;
    });
    it('getMinimumFramerate returns value from webviewer', async () => {
      expect(await service.getMinimumFramerate()).toBe(42);
    });
    it('setMinimumFramerate calls webviewer and emits event', async () => {
      const handler = vi.fn();
      service.addEventListener('hoops-minimum-framerate-changed', handler);
      await service.setMinimumFramerate(10);
      expect(mockWebViewer.setMinimumFramerate).toHaveBeenCalledWith(10);
      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].detail).toBe(10);
    });
    it('getHiddenLineOpacity returns value from webviewer', () => {
      expect(service.getHiddenLineOpacity()).toBe(0.5);
    });
    it('setHiddenLineOpacity calls webviewer and emits event', () => {
      const handler = vi.fn();
      service.addEventListener('hoops-hidden-line-opacity-changed', handler);
      service.setHiddenLineOpacity(0.7);
      expect(
        mockWebViewer.view.getHiddenLineSettings().setObscuredLineOpacity,
      ).toHaveBeenCalledWith(0.7);
      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].detail).toBe(0.7);
    });
    it('getShowBackfaces returns value from webviewer', () => {
      expect(service.getShowBackfaces()).toBe(true);
    });
    it('setShowBackfaces calls webviewer and emits event', async () => {
      const handler = vi.fn();
      service.addEventListener('hoops-show-backfaces-changed', handler);
      await service.setShowBackfaces(false);
      expect(mockWebViewer.view.setBackfacesVisible).toHaveBeenCalledWith(false);
      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].detail).toBe(false);
    });
    it('getAmbientOcclusionEnabled returns value from webviewer', () => {
      expect(service.getAmbientOcclusionEnabled()).toBe(true);
    });
    it('setAmbientOcclusionEnabled calls webviewer and emits event', async () => {
      const handler = vi.fn();
      service.addEventListener('hoops-ambient-occlusion-enabled-changed', handler);
      await service.setAmbientOcclusionEnabled(false);
      expect(mockWebViewer.view.setAmbientOcclusionEnabled).toHaveBeenCalledWith(false);
      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].detail).toBe(false);
    });
    it('getAmbientOcclusionRadius returns value from webviewer', () => {
      expect(service.getAmbientOcclusionRadius()).toBe(2);
    });
    it('setAmbientOcclusionRadius calls webviewer and emits event', async () => {
      const handler = vi.fn();
      service.addEventListener('hoops-ambient-occlusion-radius-changed', handler);
      await service.setAmbientOcclusionRadius(3);
      expect(mockWebViewer.view.setAmbientOcclusionRadius).toHaveBeenCalledWith(3);
      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].detail).toBe(3);
    });
    it('getAntiAliasingEnabled returns value from webviewer', () => {
      expect(service.getAntiAliasingEnabled()).toBe(true);
    });
    it('setAntiAliasingEnabled calls webviewer and emits event', async () => {
      const handler = vi.fn();
      service.addEventListener('hoops-anti-aliasing-enabled-changed', handler);
      await service.setAntiAliasingEnabled(false);
      expect(mockWebViewer.view.setAntiAliasingMode).toHaveBeenCalledWith(AntiAliasingMode.None);
      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].detail).toBe(false);
    });
    it('getBloomEnabled returns value from webviewer', () => {
      expect(service.getBloomEnabled()).toBe(true);
    });
    it('setBloomEnabled calls webviewer and emits event', () => {
      const handler = vi.fn();
      service.addEventListener('hoops-bloom-enabled-changed', handler);
      service.setBloomEnabled(false);
      expect(mockWebViewer.view.setBloomEnabled).toHaveBeenCalledWith(false);
      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].detail).toBe(false);
    });
    it('getBloomIntensity returns value from webviewer', () => {
      expect(service.getBloomIntensity()).toBe(0.7);
    });
    it('setBloomIntensity calls webviewer and emits event', () => {
      const handler = vi.fn();
      service.addEventListener('hoops-bloom-intensity-changed', handler);
      service.setBloomIntensity(0.9);
      expect(mockWebViewer.view.setBloomIntensityScale).toHaveBeenCalledWith(0.9);
      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].detail).toBe(0.9);
    });
    it('getBloomThreshold returns value from webviewer', () => {
      expect(service.getBloomThreshold()).toBe(0.8);
    });
    it('setBloomThreshold calls webviewer and emits event', () => {
      const handler = vi.fn();
      service.addEventListener('hoops-bloom-threshold-changed', handler);
      service.setBloomThreshold(0.6);
      expect(mockWebViewer.view.setBloomThreshold).toHaveBeenCalledWith(0.6);
      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].detail).toBe(0.6);
    });
    it('getSilhouetteEnabled returns value from webviewer', () => {
      expect(service.getSilhouetteEnabled()).toBe(true);
    });
    it('setSilhouetteEnabled calls webviewer and emits event', () => {
      const handler = vi.fn();
      service.addEventListener('hoops-silhouette-enabled-changed', handler);
      service.setSilhouetteEnabled(false);
      expect(mockWebViewer.view.setSilhouetteEnabled).toHaveBeenCalledWith(false);
      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].detail).toBe(false);
    });
    it('getReflectionEnabled returns value from webviewer', () => {
      expect(service.getReflectionEnabled()).toBe(true);
    });
    it('setReflectionEnabled calls webviewer and emits event', () => {
      const handler = vi.fn();
      service.addEventListener('hoops-reflection-enabled-changed', handler);
      service.setReflectionEnabled(false);
      expect(mockWebViewer.view.setSimpleReflectionEnabled).toHaveBeenCalledWith(false);
      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].detail).toBe(false);
    });
    it('getShadowEnabled returns value from webviewer', () => {
      expect(service.getShadowEnabled()).toBe(true);
    });
    it('setShadowEnabled calls webviewer and emits event', async () => {
      const handler = vi.fn();
      service.addEventListener('hoops-shadow-enabled-changed', handler);
      await service.setShadowEnabled(false);
      expect(mockWebViewer.view.setSimpleShadowEnabled).toHaveBeenCalledWith(false);
      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].detail).toBe(false);
    });
    it('getShadowInteractive returns value from webviewer', () => {
      expect(service.getShadowInteractive()).toBe(true);
    });
    it('setShadowInteractive calls webviewer and emits event', () => {
      const handler = vi.fn();
      service.addEventListener('hoops-shadow-interactive-changed', handler);
      service.setShadowInteractive(false);
      expect(mockWebViewer.view.setSimpleShadowInteractiveUpdateEnabled).toHaveBeenCalledWith(
        false,
      );
      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].detail).toBe(false);
    });
    it('getShadowBlurSamples returns value from webviewer', () => {
      expect(service.getShadowBlurSamples()).toBe(4);
    });
    it('setShadowBlurSamples calls webviewer and emits event', () => {
      const handler = vi.fn();
      service.addEventListener('hoops-shadow-blur-samples-changed', handler);
      service.setShadowBlurSamples(8);
      expect(mockWebViewer.view.setSimpleShadowBlurSamples).toHaveBeenCalledWith(8);
      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].detail).toBe(8);
    });
    it('setSplatRenderingEnabled calls setPointSize and emits event', async () => {
      const handler = vi.fn();
      service.addEventListener('hoops-splat-rendering-enabled-changed', handler);
      await service.setSplatRenderingEnabled(true);
      expect(mockWebViewer.view.setPointSize).toHaveBeenCalledWith(
        0.003,
        PointSizeUnit.ScreenPixels,
      );
      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].detail).toBe(true);
      await service.setSplatRenderingEnabled(false);
      expect(mockWebViewer.view.setPointSize).toHaveBeenCalledWith(1, PointSizeUnit.ScreenPixels);
      // The event is emitted again for false
      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler.mock.calls[1][0].detail).toBe(false);
    });
    it('setSplatRenderingSize calls setPointSize and emits event if enabled', async () => {
      await service.setSplatRenderingEnabled(true);
      const handler = vi.fn();
      service.addEventListener('hoops-splat-rendering-size-changed', handler);
      await service.setSplatRenderingSize(0.1);
      expect(mockWebViewer.view.setPointSize).toHaveBeenCalledWith(0.1, PointSizeUnit.ScreenPixels);
      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].detail).toBe(0.1);
    });
    it('setSplatRenderingPointSizeUnit calls setPointSize and emits event if enabled', async () => {
      await service.setSplatRenderingEnabled(true);
      const handler = vi.fn();
      service.addEventListener('hoops-splat-rendering-point-size-unit-changed', handler);
      await service.setSplatRenderingPointSizeUnit('Screen Pixels');
      expect(mockWebViewer.view.setPointSize).toHaveBeenCalledWith(
        0.003,
        PointSizeUnit.ScreenPixels,
      );
      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].detail).toBe('Screen Pixels');
    });
    it('getEyeDomeLightingEnabled returns value from webviewer', async () => {
      expect(await service.getEyeDomeLightingEnabled()).toBe(true);
    });
    it('setEyeDomeLightingEnabled calls webviewer and emits event', async () => {
      const handler = vi.fn();
      service.addEventListener('hoops-eye-dome-lighting-enabled-changed', handler);
      await service.setEyeDomeLightingEnabled(false);
      expect(mockWebViewer.view.setEyeDomeLightingEnabled).toHaveBeenCalledWith(false);
      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].detail).toBe(false);
    });
    it('setBackgroundColor calls webviewer and emits event', async () => {
      const handler = vi.fn();
      service.addEventListener('hoops-background-color-changed', handler);
      const color = new VerticalGradient(
        Color.fromHexString('#010203'),
        Color.fromHexString('#040506'),
      );
      await service.setBackgroundColor({ top: '#010203', bottom: '#040506' });
      expect(mockWebViewer.view.setBackgroundColor).toHaveBeenCalledWith(color.top, color.bottom);
      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].detail).toStrictEqual({ top: '#010203', bottom: '#040506' });
    });
  });

  describe('set methods (webviewer not set) should throw', () => {
    it('setMinimumFramerate throws', async () => {
      await expect(service.setMinimumFramerate(10)).rejects.toThrow('WebViewer not ready');
    });
    it('setHiddenLineOpacity throws', () => {
      expect(() => service.setHiddenLineOpacity(0.5)).toThrow('WebViewer not ready');
    });
    it('setShowBackfaces throws', async () => {
      await expect(service.setShowBackfaces(true)).rejects.toThrow('WebViewer not ready');
    });
    it('setAmbientOcclusionEnabled throws', async () => {
      await expect(service.setAmbientOcclusionEnabled(true)).rejects.toThrow('WebViewer not ready');
    });
    it('setAmbientOcclusionRadius throws', async () => {
      await expect(service.setAmbientOcclusionRadius(1)).rejects.toThrow('WebViewer not ready');
    });
    it('setAntiAliasingEnabled throws', async () => {
      await expect(service.setAntiAliasingEnabled(true)).rejects.toThrow('WebViewer not ready');
    });
    it('setBloomEnabled throws', () => {
      expect(() => service.setBloomEnabled(true)).toThrow('WebViewer not ready');
    });
    it('setBloomIntensity throws', () => {
      expect(() => service.setBloomIntensity(1)).toThrow('WebViewer not ready');
    });
    it('setBloomThreshold throws', () => {
      expect(() => service.setBloomThreshold(1)).toThrow('WebViewer not ready');
    });
    it('setSilhouetteEnabled throws', () => {
      expect(() => service.setSilhouetteEnabled(true)).toThrow('WebViewer not ready');
    });
    it('setReflectionEnabled throws', () => {
      expect(() => service.setReflectionEnabled(true)).toThrow('WebViewer not ready');
    });
    it('setShadowEnabled throws', async () => {
      await expect(service.setShadowEnabled(true)).rejects.toThrow('WebViewer not ready');
    });
    it('setShadowInteractive throws', () => {
      expect(() => service.setShadowInteractive(true)).toThrow('WebViewer not ready');
    });
    it('setShadowBlurSamples throws', () => {
      expect(() => service.setShadowBlurSamples(1)).toThrow('WebViewer not ready');
    });
    it('setSplatRenderingEnabled throws', async () => {
      await expect(service.setSplatRenderingEnabled(true)).rejects.toThrow('WebViewer not ready');
    });
    it('setSplatRenderingSize throws', async () => {
      await expect(service.setSplatRenderingSize(1)).rejects.toThrow('WebViewer not ready');
    });
    it('setSplatRenderingPointSizeUnit throws', async () => {
      await expect(service.setSplatRenderingPointSizeUnit('Screen Pixels')).rejects.toThrow(
        'WebViewer not ready',
      );
    });
    it('setEyeDomeLightingEnabled throws', async () => {
      await expect(service.setEyeDomeLightingEnabled(true)).rejects.toThrow('WebViewer not ready');
    });
    it('setBackgroundColor throws', async () => {
      await expect(
        service.setBackgroundColor({ top: '#010203', bottom: '#040506' }),
      ).rejects.toThrow('WebViewer not ready');
    });
  });

  describe('resetConfiguration', () => {
    it('should throw error for invalid configuration object', async () => {
      service.webViewer = mockWebViewer as any;

      await expect(service.resetConfiguration({ invalid: true })).rejects.toThrow(
        'Invalid configuration object',
      );

      await expect(
        service.resetConfiguration({
          minimumFramerate: 'not a number',
        }),
      ).rejects.toThrow('Invalid configuration object');

      await expect(
        service.resetConfiguration({
          minimumFramerate: 10,
          hiddenLineOpacity: 'not a number',
        }),
      ).rejects.toThrow('Invalid configuration object');

      await expect(
        service.resetConfiguration({
          minimumFramerate: 10,
          hiddenLineOpacity: 0.5,
          showBackfaces: 'not a boolean',
        }),
      ).rejects.toThrow('Invalid configuration object');
    });

    it('should throw error when webViewer is not ready', async () => {
      await expect(service.resetConfiguration()).rejects.toThrow('WebViewer not ready');
    });

    it('should reset to default configuration when no config is provided', async () => {
      service.webViewer = mockWebViewer as any;

      // Mock all the service setter methods to avoid actual implementation calls
      const setMinimumFramerateSpy = vi.spyOn(service, 'setMinimumFramerate').mockResolvedValue();
      const setHiddenLineOpacitySpy = vi.spyOn(service, 'setHiddenLineOpacity').mockReturnValue();
      const setShowBackfacesSpy = vi.spyOn(service, 'setShowBackfaces').mockResolvedValue();
      const setAmbientOcclusionEnabledSpy = vi
        .spyOn(service, 'setAmbientOcclusionEnabled')
        .mockResolvedValue();
      const setAmbientOcclusionRadiusSpy = vi
        .spyOn(service, 'setAmbientOcclusionRadius')
        .mockResolvedValue();
      const setAntiAliasingEnabledSpy = vi
        .spyOn(service, 'setAntiAliasingEnabled')
        .mockResolvedValue();
      const setBloomEnabledSpy = vi.spyOn(service, 'setBloomEnabled').mockReturnValue();
      const setBloomIntensitySpy = vi.spyOn(service, 'setBloomIntensity').mockReturnValue();
      const setBloomThresholdSpy = vi.spyOn(service, 'setBloomThreshold').mockReturnValue();
      const setSilhouetteEnabledSpy = vi.spyOn(service, 'setSilhouetteEnabled').mockReturnValue();
      const setReflectionEnabledSpy = vi.spyOn(service, 'setReflectionEnabled').mockReturnValue();
      const setShadowEnabledSpy = vi.spyOn(service, 'setShadowEnabled').mockResolvedValue();
      const setShadowInteractiveSpy = vi.spyOn(service, 'setShadowInteractive').mockReturnValue();
      const setShadowBlurSamplesSpy = vi.spyOn(service, 'setShadowBlurSamples').mockReturnValue();
      const setSplatRenderingEnabledSpy = vi
        .spyOn(service, 'setSplatRenderingEnabled')
        .mockResolvedValue();
      const setSplatRenderingSizeSpy = vi
        .spyOn(service, 'setSplatRenderingSize')
        .mockResolvedValue();
      const setSplatRenderingPointSizeUnitSpy = vi
        .spyOn(service, 'setSplatRenderingPointSizeUnit')
        .mockResolvedValue();
      const setEyeDomeLightingEnabledSpy = vi
        .spyOn(service, 'setEyeDomeLightingEnabled')
        .mockResolvedValue();
      const setBackgroundColorSpy = vi.spyOn(service, 'setBackgroundColor').mockResolvedValue();

      await service.resetConfiguration();

      // Verify all default values are applied in the correct order
      expect(setMinimumFramerateSpy).toHaveBeenCalledWith(13);
      expect(setHiddenLineOpacitySpy).toHaveBeenCalledWith(0.2);
      expect(setShowBackfacesSpy).toHaveBeenCalledWith(false);
      expect(setAmbientOcclusionEnabledSpy).toHaveBeenCalledWith(false);
      expect(setAmbientOcclusionRadiusSpy).toHaveBeenCalledWith(0.03);
      expect(setAntiAliasingEnabledSpy).toHaveBeenCalledWith(true);
      expect(setBloomEnabledSpy).toHaveBeenCalledWith(false);
      expect(setBloomIntensitySpy).toHaveBeenCalledWith(1.0);
      expect(setBloomThresholdSpy).toHaveBeenCalledWith(0.65);
      expect(setSilhouetteEnabledSpy).toHaveBeenCalledWith(false);
      expect(setReflectionEnabledSpy).toHaveBeenCalledWith(false);
      expect(setShadowEnabledSpy).toHaveBeenCalledWith(false);
      expect(setShadowInteractiveSpy).toHaveBeenCalledWith(true);
      expect(setShadowBlurSamplesSpy).toHaveBeenCalledWith(5);
      // Note: splat rendering size and unit are set before enabled in the implementation
      expect(setSplatRenderingSizeSpy).toHaveBeenCalledWith(0.003);
      expect(setSplatRenderingPointSizeUnitSpy).toHaveBeenCalledWith('Screen Pixels');
      expect(setSplatRenderingEnabledSpy).toHaveBeenCalledWith(true);
      expect(setEyeDomeLightingEnabledSpy).toHaveBeenCalledWith(false);
      expect(setBackgroundColorSpy).toHaveBeenCalledWith({});
    });

    it('should reset to provided configuration', async () => {
      service.webViewer = mockWebViewer as any;

      const setMinimumFramerateSpy = vi.spyOn(service, 'setMinimumFramerate').mockResolvedValue();
      const setHiddenLineOpacitySpy = vi.spyOn(service, 'setHiddenLineOpacity').mockReturnValue();
      const setShowBackfacesSpy = vi.spyOn(service, 'setShowBackfaces').mockResolvedValue();
      const setAmbientOcclusionEnabledSpy = vi
        .spyOn(service, 'setAmbientOcclusionEnabled')
        .mockResolvedValue();
      const setAmbientOcclusionRadiusSpy = vi
        .spyOn(service, 'setAmbientOcclusionRadius')
        .mockResolvedValue();
      const setAntiAliasingEnabledSpy = vi
        .spyOn(service, 'setAntiAliasingEnabled')
        .mockResolvedValue();
      const setBloomEnabledSpy = vi.spyOn(service, 'setBloomEnabled').mockReturnValue();
      const setBloomIntensitySpy = vi.spyOn(service, 'setBloomIntensity').mockReturnValue();
      const setBloomThresholdSpy = vi.spyOn(service, 'setBloomThreshold').mockReturnValue();
      const setSilhouetteEnabledSpy = vi.spyOn(service, 'setSilhouetteEnabled').mockReturnValue();
      const setReflectionEnabledSpy = vi.spyOn(service, 'setReflectionEnabled').mockReturnValue();
      const setShadowEnabledSpy = vi.spyOn(service, 'setShadowEnabled').mockResolvedValue();
      const setShadowInteractiveSpy = vi.spyOn(service, 'setShadowInteractive').mockReturnValue();
      const setShadowBlurSamplesSpy = vi.spyOn(service, 'setShadowBlurSamples').mockReturnValue();
      const setSplatRenderingEnabledSpy = vi
        .spyOn(service, 'setSplatRenderingEnabled')
        .mockResolvedValue();
      const setSplatRenderingSizeSpy = vi
        .spyOn(service, 'setSplatRenderingSize')
        .mockResolvedValue();
      const setSplatRenderingPointSizeUnitSpy = vi
        .spyOn(service, 'setSplatRenderingPointSizeUnit')
        .mockResolvedValue();
      const setEyeDomeLightingEnabledSpy = vi
        .spyOn(service, 'setEyeDomeLightingEnabled')
        .mockResolvedValue();
      const setBackgroundColorSpy = vi.spyOn(service, 'setBackgroundColor').mockResolvedValue();

      const customConfig = {
        minimumFramerate: 30,
        hiddenLineOpacity: 0.8,
        showBackfaces: true,
        ambientOcclusionEnabled: true,
        ambientOcclusionRadius: 0.1,
        antiAliasingEnabled: false,
        bloomEnabled: true,
        bloomIntensity: 2.0,
        bloomThreshold: 0.9,
        silhouetteEnabled: true,
        reflectionEnabled: true,
        shadowEnabled: true,
        shadowInteractive: false,
        shadowBlurSamples: 10,
        splatRenderingEnabled: false,
        splatRenderingSize: 0.01,
        splatRenderingPointSizeUnit: 'World' as const,
        eyeDomeLightingEnabled: true,
        backgroundColor: { top: '#ff0000', bottom: '#00ff00' },
      };

      await service.resetConfiguration(customConfig);

      expect(setMinimumFramerateSpy).toHaveBeenCalledWith(30);
      expect(setHiddenLineOpacitySpy).toHaveBeenCalledWith(0.8);
      expect(setShowBackfacesSpy).toHaveBeenCalledWith(true);
      expect(setAmbientOcclusionEnabledSpy).toHaveBeenCalledWith(true);
      expect(setAmbientOcclusionRadiusSpy).toHaveBeenCalledWith(0.1);
      expect(setAntiAliasingEnabledSpy).toHaveBeenCalledWith(false);
      expect(setBloomEnabledSpy).toHaveBeenCalledWith(true);
      expect(setBloomIntensitySpy).toHaveBeenCalledWith(2.0);
      expect(setBloomThresholdSpy).toHaveBeenCalledWith(0.9);
      expect(setSilhouetteEnabledSpy).toHaveBeenCalledWith(true);
      expect(setReflectionEnabledSpy).toHaveBeenCalledWith(true);
      expect(setShadowEnabledSpy).toHaveBeenCalledWith(true);
      expect(setShadowInteractiveSpy).toHaveBeenCalledWith(false);
      expect(setShadowBlurSamplesSpy).toHaveBeenCalledWith(10);
      expect(setSplatRenderingSizeSpy).toHaveBeenCalledWith(0.01);
      expect(setSplatRenderingPointSizeUnitSpy).toHaveBeenCalledWith('World');
      expect(setSplatRenderingEnabledSpy).toHaveBeenCalledWith(false);
      expect(setEyeDomeLightingEnabledSpy).toHaveBeenCalledWith(true);
      expect(setBackgroundColorSpy).toHaveBeenCalledWith({ top: '#ff0000', bottom: '#00ff00' });
    });

    it('should have correct default configuration values', () => {
      expect(RenderOptionsService.DefaultConfig).toEqual({
        minimumFramerate: 13,
        hiddenLineOpacity: 0.2,
        showBackfaces: false,
        ambientOcclusionEnabled: false,
        ambientOcclusionRadius: 0.03,
        antiAliasingEnabled: true,
        bloomEnabled: false,
        bloomIntensity: 1.0,
        bloomThreshold: 0.65,
        silhouetteEnabled: false,
        reflectionEnabled: false,
        shadowEnabled: false,
        shadowInteractive: true,
        shadowBlurSamples: 5,
        splatRenderingEnabled: true,
        splatRenderingSize: 0.003,
        splatRenderingPointSizeUnit: 'Screen Pixels',
        eyeDomeLightingEnabled: false,
        backgroundColor: {},
      });
    });

    it('should validate point size unit correctly', async () => {
      service.webViewer = mockWebViewer as any;

      await expect(
        service.resetConfiguration({
          minimumFramerate: 13,
          hiddenLineOpacity: 0.2,
          showBackfaces: false,
          ambientOcclusionEnabled: false,
          ambientOcclusionRadius: 0.03,
          antiAliasingEnabled: true,
          bloomEnabled: false,
          bloomIntensity: 1.0,
          bloomThreshold: 0.65,
          silhouetteEnabled: false,
          reflectionEnabled: false,
          shadowEnabled: false,
          shadowInteractive: true,
          shadowBlurSamples: 5,
          splatRenderingEnabled: true,
          splatRenderingSize: 0.003,
          splatRenderingPointSizeUnit: 'Invalid Unit',
          eyeDomeLightingEnabled: false,
          backgroundColor: {},
        }),
      ).rejects.toThrow('Invalid configuration object');
    });

    it('should validate background color correctly', async () => {
      service.webViewer = mockWebViewer as any;

      await expect(
        service.resetConfiguration({
          minimumFramerate: 13,
          hiddenLineOpacity: 0.2,
          showBackfaces: false,
          ambientOcclusionEnabled: false,
          ambientOcclusionRadius: 0.03,
          antiAliasingEnabled: true,
          bloomEnabled: false,
          bloomIntensity: 1.0,
          bloomThreshold: 0.65,
          silhouetteEnabled: false,
          reflectionEnabled: false,
          shadowEnabled: false,
          shadowInteractive: true,
          shadowBlurSamples: 5,
          splatRenderingEnabled: true,
          splatRenderingSize: 0.003,
          splatRenderingPointSizeUnit: 'Screen Pixels',
          eyeDomeLightingEnabled: false,
          backgroundColor: 'not an object',
        }),
      ).rejects.toThrow('Invalid configuration object');
    });
  });
});
