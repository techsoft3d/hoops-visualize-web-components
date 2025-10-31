import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { html } from 'lit';

import { renderTemplate, tick } from '../testing/utils';
import {
  ICameraService,
  ICuttingService,
  IPmiService,
  IRenderOptionsService,
  ISelectionService,
  ISheetService,
  registerService,
} from '../services';

import './hoops-settings-graphics-section';
import HoopsSettingsGraphicsSectionElement from './hoops-settings-graphics-section';
import { IMeasurementService } from '../services/measurement';

describe('hoops-settings-interface-section', () => {
  let eventTargetMock;
  let mockCameraService: ICameraService;
  let mockRenderOptionsService: IRenderOptionsService;
  let mockCuttingService: ICuttingService;
  let mockSelectionService: ISelectionService;
  let mockMeasurementsService: IMeasurementService;
  let mockPmiService: IPmiService;
  let mockSheetService: ISheetService;

  beforeAll(() => {
    eventTargetMock = {
      addEventListener: (
        _type: string,
        _listener: EventListenerOrEventListenerObject,
        _options?: boolean | AddEventListenerOptions,
      ) => undefined,
      removeEventListener: (
        _type: string,
        _listener: EventListenerOrEventListenerObject,
        _options?: boolean | EventListenerOptions,
      ) => undefined,
      dispatchEvent: (_event: Event) => true,
    };

    mockCameraService = {
      ...eventTargetMock,
      serviceName: 'CameraService',
      getProjectionMode: () => 'Orthographic',
      setProjectionMode: (_projectionMode: unknown) => undefined,
      getOrbitFallbackMode: () => 'Camera Target',
      setOrbitFallbackMode: (_fallbackMode: unknown) => undefined,
      reset: () => undefined,
    };
    mockRenderOptionsService = {
      ...eventTargetMock,
      serviceName: 'RenderOptionsService',
      getMinimumFramerate: () => Promise.resolve(0),
      setMinimumFramerate: (_value: unknown) => Promise.resolve(undefined),
      getHiddenLineOpacity: () => 1,
      setHiddenLineOpacity: (_opacity: unknown) => undefined,
      getShowBackfaces: () => false,
      setShowBackfaces: (_show: unknown) => Promise.resolve(undefined),
      getAmbientOcclusionEnabled: () => false,
      setAmbientOcclusionEnabled: (_enabled: unknown) => Promise.resolve(undefined),
      getAmbientOcclusionRadius: () => 0,
      setAmbientOcclusionRadius: (_radius: unknown) => Promise.resolve(undefined),
      getAntiAliasingEnabled: () => false,
      setAntiAliasingEnabled: (_enabled: unknown) => Promise.resolve(undefined),
      getBloomEnabled: () => false,
      setBloomEnabled: (_enabled: unknown) => undefined,
      getBloomIntensity: () => 0,
      setBloomIntensity: (_intensity: unknown) => undefined,
      getBloomThreshold: () => 0,
      setBloomThreshold: (_threshold: unknown) => undefined,
      getSilhouetteEnabled: () => false,
      setSilhouetteEnabled: (_enabled: unknown) => undefined,
      getReflectionEnabled: () => false,
      setReflectionEnabled: (_enabled: unknown) => undefined,
      getShadowEnabled: () => false,
      setShadowEnabled: (_enabled: unknown) => Promise.resolve(undefined),
      getShadowInteractive: () => false,
      setShadowInteractive: (_interactive: unknown) => undefined,
      getShadowBlurSamples: () => 0,
      setShadowBlurSamples: (_samples: unknown) => undefined,
      getSplatRenderingEnabled: () => false,
      setSplatRenderingEnabled: (_enabled: boolean) => Promise.resolve(undefined),
      getSplatRenderingSize: () => 0,
      setSplatRenderingSize: (_size: number) => Promise.resolve(undefined),
      getSplatRenderingPointSizeUnit: () => 'Screen Pixels',
      setSplatRenderingPointSizeUnit: (_unit: unknown) => Promise.resolve(undefined),
      getEyeDomeLightingEnabled: () => Promise.resolve(false),
      setEyeDomeLightingEnabled: (_enabled: boolean) => Promise.resolve(undefined),
      getBackgroundColor: () => ({ top: '#000000', bottom: '#000000' }),
      setBackgroundColor: (_color: unknown) => Promise.resolve(undefined),
    };
    mockCuttingService = {
      ...eventTargetMock,
      serviceName: 'CuttingService',
      getCappingGeometryVisibility: () => false,
      setCappingGeometryVisibility: (_visible: unknown) => Promise.resolve(undefined),
      getCappingFaceColor: () => '#000000',
      setCappingFaceColor: (_color: unknown) => Promise.resolve(undefined),
      getCappingLineColor: () => '#000000',
      setCappingLineColor: (_color: unknown) => Promise.resolve(undefined),
    };
    mockSelectionService = {
      ...eventTargetMock,
      serviceName: 'SelectionService',
      getEnableFaceLineSelection: () => false,
      setEnableFaceLineSelection: (_enable: unknown) => Promise.resolve(undefined),
      getHonorsSceneVisibility: () => false,
      setHonorsSceneVisibility: (_honors: unknown) => undefined,
      getBodyColor: () => '#000000',
      setBodyColor: (_color: unknown) => Promise.resolve(undefined),
      getFaceAndLineColor: () => '#000000',
      setFaceAndLineColor: (_color: unknown) => Promise.resolve(undefined),
    };
    mockMeasurementsService = {
      ...eventTargetMock,
      serviceName: 'MeasurementService',
      measurements: [],
      removeMeasurement: (_measurement: unknown) => undefined,
      getMeasurementColor: () => '#000000',
      setMeasurementColor: (_color: unknown) => undefined,
    };
    mockPmiService = {
      ...eventTargetMock,
      serviceName: 'PmiService',
      getPmiColor: () => '#000000',
      setPmiColor: (_color: unknown) => undefined,
      getPmiColorOverride: () => false,
      setPmiColorOverride: (_enable: unknown, _rootId: unknown) => Promise.resolve(undefined),
    };
    mockSheetService = {
      ...eventTargetMock,
      serviceName: 'SheetService',
      getSheetBackgroundColor: () => '#000000',
      getSheetColor: () => '#000000',
      getSheetShadowColor: () => '#000000',
      setSheetColors: (_bg: unknown, _sheet: unknown, _shadow: unknown) =>
        Promise.resolve(undefined),
      getBackgroundSheetEnabled: () => false,
      setBackgroundSheetEnabled: (_enabled: unknown) => Promise.resolve(undefined),
    };

    registerService(mockCameraService);
    registerService(mockRenderOptionsService);
    registerService(mockCuttingService);
    registerService(mockSelectionService);
    registerService(mockMeasurementsService);
    registerService(mockPmiService);
    registerService(mockSheetService);
  });

  let elm: HoopsSettingsGraphicsSectionElement;
  beforeEach(async () => {
    vi.clearAllMocks();
    await renderTemplate(html`<hoops-settings-graphics-section></hoops-settings-graphics-section>`);
    elm = document.querySelector(
      'hoops-settings-graphics-section',
    ) as HoopsSettingsGraphicsSectionElement;
    await elm.updateComplete;
  });

  it('should render the graphics section', async () => {
    expect(elm.shadowRoot!.querySelectorAll('fieldset').length).toBe(5);
    expect(elm.shadowRoot!.querySelectorAll('legend').length).toBe(5);
    expect(elm.shadowRoot!.querySelectorAll('hoops-switch').length).toBe(16);
    expect(elm.shadowRoot!.querySelectorAll('select').length).toBe(2);
    expect(elm.shadowRoot!.querySelectorAll('input[type="number"]').length).toBe(7);
    expect(elm.shadowRoot!.querySelectorAll('input[type="color"]').length).toBe(11);
  });

  it('should set and update the Projection Mode select', async () => {
    const select = elm.shadowRoot!.querySelector('#projection-mode') as HTMLSelectElement;
    expect(select.value).toBe(mockCameraService.getProjectionMode());
    const spy = vi.spyOn(mockCameraService, 'setProjectionMode');
    select.value = 'Perspective';
    select.dispatchEvent(new Event('change'));
    expect(spy).toHaveBeenCalledWith('Perspective');
  });

  it('should set and update the Framerate input', async () => {
    const input = elm.shadowRoot!.querySelector('#framerate') as HTMLInputElement;
    expect(Number(input.value)).toBe(await mockRenderOptionsService.getMinimumFramerate());
    const spy = vi.spyOn(mockRenderOptionsService, 'setMinimumFramerate');
    input.value = '42';
    input.dispatchEvent(new Event('input'));
    expect(spy).toHaveBeenCalledWith(42);
  });

  it('should set and update the Show Backfaces switch', async () => {
    const sw = elm.shadowRoot!.querySelector('#show-backfaces') as HTMLElement;
    expect(sw.hasAttribute('checked')).toBe(mockRenderOptionsService.getShowBackfaces());
    const spy = vi.spyOn(mockRenderOptionsService, 'setShowBackfaces');
    sw.dispatchEvent(new Event('change'));
    expect(spy).toHaveBeenCalled();
  });

  it('should set and update the Hidden Line Opacity input', async () => {
    const input = elm.shadowRoot!.querySelector('#hidden-line-opacity') as HTMLInputElement;
    expect(Number(input.value)).toBe(mockRenderOptionsService.getHiddenLineOpacity());
    const spy = vi.spyOn(mockRenderOptionsService, 'setHiddenLineOpacity');
    input.value = '0.5';
    input.dispatchEvent(new Event('input'));
    expect(spy).toHaveBeenCalledWith(0.5);
  });

  it('should set and update the Show Capping Geometry switch', async () => {
    const sw = elm.shadowRoot!.querySelector('#show-capping-geometry') as HTMLElement;
    expect(sw.hasAttribute('checked')).toBe(mockCuttingService.getCappingGeometryVisibility());
    const spy = vi.spyOn(mockCuttingService, 'setCappingGeometryVisibility');
    sw.dispatchEvent(new Event('change'));
    expect(spy).toHaveBeenCalled();
  });

  it('should set and update the Enable Face / Line Selection switch', async () => {
    const sw = elm.shadowRoot!.querySelector('#enable-face-line-selection') as HTMLElement;
    expect(sw.hasAttribute('checked')).toBe(mockSelectionService.getEnableFaceLineSelection());
    const spy = vi.spyOn(mockSelectionService, 'setEnableFaceLineSelection');
    sw.dispatchEvent(new Event('change'));
    expect(spy).toHaveBeenCalled();
  });

  it('should set and update the Selection Honors Scene Visibility switch', async () => {
    const sw = elm.shadowRoot!.querySelector('#selection-honors-scene-visibility') as HTMLElement;
    expect(sw.hasAttribute('checked')).toBe(mockSelectionService.getHonorsSceneVisibility());
    const spy = vi.spyOn(mockSelectionService, 'setHonorsSceneVisibility');
    sw.dispatchEvent(new Event('change'));
    expect(spy).toHaveBeenCalled();
  });

  it('should set and update the Rotate Around Camera Center switch', async () => {
    const sw = elm.shadowRoot!.querySelector('#rotate-around-camera-center') as HTMLElement;
    // This field is a bit more complex, but we check the checked state and call
    expect(sw.hasAttribute('checked')).toBe(
      mockCameraService.getOrbitFallbackMode?.() === 'Camera Target',
    );
    const spy = vi.spyOn(mockCameraService, 'setOrbitFallbackMode');
    sw.dispatchEvent(new Event('change'));
    expect(spy).toHaveBeenCalled();
  });

  it('should set and update the Enable Ambient Occlusion switch', async () => {
    const sw = elm.shadowRoot!.querySelector('#enable-ambient-occlusion') as HTMLElement;
    expect(sw.hasAttribute('checked')).toBe(mockRenderOptionsService.getAmbientOcclusionEnabled());
    const spy = vi.spyOn(mockRenderOptionsService, 'setAmbientOcclusionEnabled');
    sw.dispatchEvent(new Event('change'));
    expect(spy).toHaveBeenCalled();
  });

  it('should set and update the AO Radius input', async () => {
    const input = elm.shadowRoot!.querySelector('#ao-radius') as HTMLInputElement;
    expect(Number(input.value)).toBe(mockRenderOptionsService.getAmbientOcclusionRadius());
    const spy = vi.spyOn(mockRenderOptionsService, 'setAmbientOcclusionRadius');
    input.value = '1.23';
    input.dispatchEvent(new Event('input'));
    expect(spy).toHaveBeenCalledWith(1.23);
  });

  it('should set and update the Enable Anti-Aliasing switch', async () => {
    const sw = elm.shadowRoot!.querySelector('#enable-antialiasing') as HTMLElement;
    expect(sw.hasAttribute('checked')).toBe(mockRenderOptionsService.getAntiAliasingEnabled());
    const spy = vi.spyOn(mockRenderOptionsService, 'setAntiAliasingEnabled');
    sw.dispatchEvent(new Event('change'));
    expect(spy).toHaveBeenCalled();
  });

  it('should set and update the Enable Bloom switch', async () => {
    const sw = elm.shadowRoot!.querySelector('#enable-bloom') as HTMLElement;
    expect(sw.hasAttribute('checked')).toBe(mockRenderOptionsService.getBloomEnabled());
    const spy = vi.spyOn(mockRenderOptionsService, 'setBloomEnabled');
    sw.dispatchEvent(new Event('change'));
    expect(spy).toHaveBeenCalled();
  });

  it('should set and update the Bloom Intensity input', async () => {
    const input = elm.shadowRoot!.querySelector('#intensity-scale') as HTMLInputElement;
    expect(Number(input.value)).toBe(mockRenderOptionsService.getBloomIntensity());
    const spy = vi.spyOn(mockRenderOptionsService, 'setBloomIntensity');
    input.value = '2';
    input.dispatchEvent(new Event('input'));
    expect(spy).toHaveBeenCalledWith(2);
  });

  it('should set and update the Bloom Threshold input', async () => {
    const input = elm.shadowRoot!.querySelector('#threshold') as HTMLInputElement;
    expect(Number(input.value)).toBe(mockRenderOptionsService.getBloomThreshold());
    const spy = vi.spyOn(mockRenderOptionsService, 'setBloomThreshold');
    input.value = '0.7';
    input.dispatchEvent(new Event('input'));
    expect(spy).toHaveBeenCalledWith(0.7);
  });

  it('should set and update the Silhouette Edges switch', async () => {
    const sw = elm.shadowRoot!.querySelector('#silhouette-edges') as HTMLElement;
    expect(sw.hasAttribute('checked')).toBe(mockRenderOptionsService.getSilhouetteEnabled());
    const spy = vi.spyOn(mockRenderOptionsService, 'setSilhouetteEnabled');
    sw.dispatchEvent(new Event('change'));
    expect(spy).toHaveBeenCalled();
  });

  it('should set and update the Reflection Planes switch', async () => {
    const sw = elm.shadowRoot!.querySelector('#reflection-planes') as HTMLElement;
    expect(sw.hasAttribute('checked')).toBe(mockRenderOptionsService.getReflectionEnabled());
    const spy = vi.spyOn(mockRenderOptionsService, 'setReflectionEnabled');
    sw.dispatchEvent(new Event('change'));
    expect(spy).toHaveBeenCalled();
  });

  it('should set and update the Enable Shadows switch', async () => {
    const sw = elm.shadowRoot!.querySelector('#enable-shadows') as HTMLElement;
    expect(sw.hasAttribute('checked')).toBe(mockRenderOptionsService.getShadowEnabled());
    const spy = vi.spyOn(mockRenderOptionsService, 'setShadowEnabled');
    sw.dispatchEvent(new Event('change'));
    expect(spy).toHaveBeenCalled();
  });

  it('should set and update the Shadow Interactive switch', async () => {
    const sw = elm.shadowRoot!.querySelector('#interactive') as HTMLElement;
    expect(sw.hasAttribute('checked')).toBe(mockRenderOptionsService.getShadowInteractive());
    const spy = vi.spyOn(mockRenderOptionsService, 'setShadowInteractive');
    sw.dispatchEvent(new Event('change'));
    expect(spy).toHaveBeenCalled();
  });

  it('should set and update the Shadow Blur Samples input', async () => {
    const input = elm.shadowRoot!.querySelector('#blur-samples') as HTMLInputElement;
    expect(Number(input.value)).toBe(mockRenderOptionsService.getShadowBlurSamples());
    const spy = vi.spyOn(mockRenderOptionsService, 'setShadowBlurSamples');
    input.value = '5';
    input.dispatchEvent(new Event('input'));
    expect(spy).toHaveBeenCalledWith(5);
  });

  it('should set and update the Enable Splats switch', async () => {
    const sw = elm.shadowRoot!.querySelector('#enable-splats') as HTMLElement;
    expect(sw.hasAttribute('checked')).toBe(mockRenderOptionsService.getSplatRenderingEnabled());
    const spy = vi.spyOn(mockRenderOptionsService, 'setSplatRenderingEnabled');
    sw.dispatchEvent(new Event('change'));
    expect(spy).toHaveBeenCalled();
  });

  it('should set and update the Splats Size input', async () => {
    const input = elm.shadowRoot!.querySelector('#splats-size') as HTMLInputElement;
    expect(Number(input.value)).toBe(mockRenderOptionsService.getSplatRenderingSize());
    const spy = vi.spyOn(mockRenderOptionsService, 'setSplatRenderingSize');
    input.value = '1.5';
    input.dispatchEvent(new Event('input'));
    expect(spy).toHaveBeenCalledWith(1.5);
  });

  it('should set and update the Splats Mode select', async () => {
    const select = elm.shadowRoot!.querySelector('#splats-mode') as HTMLSelectElement;
    const spy = vi.spyOn(mockRenderOptionsService, 'setSplatRenderingPointSizeUnit');
    select.value = 'Screen Pixels';
    select.dispatchEvent(new Event('change'));
    expect(spy).toHaveBeenCalledWith('Screen Pixels');
  });

  it('should set and update the Enable Eye-Dome Lighting switch', async () => {
    const sw = elm.shadowRoot!.querySelector('#enable-eye-dome-lighting') as HTMLElement;
    expect(sw.hasAttribute('checked')).toBe(
      await mockRenderOptionsService.getEyeDomeLightingEnabled(),
    );
    const spy = vi.spyOn(mockRenderOptionsService, 'setEyeDomeLightingEnabled');
    sw.dispatchEvent(new Event('change'));
    expect(spy).toHaveBeenCalled();
  });

  it('should set and update the Background Color Top input', async () => {
    const input = elm.shadowRoot!.querySelector('#background-color-top') as HTMLInputElement;
    expect(input.value).toBe(mockRenderOptionsService.getBackgroundColor().top);
    const spy = vi.spyOn(mockRenderOptionsService, 'setBackgroundColor');
    input.value = '#123456';
    input.dispatchEvent(new InputEvent('change'));
    expect(spy).toHaveBeenCalledWith({
      top: '#123456',
      bottom: mockRenderOptionsService.getBackgroundColor().bottom,
    });
  });

  it('should set and update the Background Color Bottom input', async () => {
    const input = elm.shadowRoot!.querySelector('#background-color-bottom') as HTMLInputElement;
    expect(input.value).toBe(mockRenderOptionsService.getBackgroundColor().bottom);
    const spy = vi.spyOn(mockRenderOptionsService, 'setBackgroundColor');
    input.value = '#654321';
    input.dispatchEvent(new InputEvent('change'));
    expect(spy).toHaveBeenCalledWith({
      top: mockRenderOptionsService.getBackgroundColor().top,
      bottom: '#654321',
    });
  });

  it('should set and update the Capping Face Color input', async () => {
    const input = elm.shadowRoot!.querySelector('#capping-geometry-face') as HTMLInputElement;
    expect(input.value).toBe(mockCuttingService.getCappingFaceColor() ?? '#000000');
    const spy = vi.spyOn(mockCuttingService, 'setCappingFaceColor');
    input.value = '#abcdef';
    input.dispatchEvent(new InputEvent('change'));
    expect(spy).toHaveBeenCalledWith('#abcdef');
  });

  it('should set and update the Capping Line Color input', async () => {
    const input = elm.shadowRoot!.querySelector('#capping-geometry-line') as HTMLInputElement;
    expect(input.value).toBe(mockCuttingService.getCappingLineColor() ?? '#000000');
    const spy = vi.spyOn(mockCuttingService, 'setCappingLineColor');
    input.value = '#fedcba';
    input.dispatchEvent(new InputEvent('change'));
    expect(spy).toHaveBeenCalledWith('#fedcba');
  });

  it('should set and update the Selection Body Color input', async () => {
    const input = elm.shadowRoot!.querySelector('#selection-color-body') as HTMLInputElement;
    expect(input.value).toBe(mockSelectionService.getBodyColor());
    const spy = vi.spyOn(mockSelectionService, 'setBodyColor');
    input.value = '#111111';
    input.dispatchEvent(new InputEvent('change'));
    expect(spy).toHaveBeenCalledWith('#111111');
  });

  it('should set and update the Selection Faces and Lines Color input', async () => {
    const input = elm.shadowRoot!.querySelector('#selection-color-faces-lines') as HTMLInputElement;
    expect(input.value).toBe(mockSelectionService.getFaceAndLineColor());
    const spy = vi.spyOn(mockSelectionService, 'setFaceAndLineColor');
    input.value = '#222222';
    input.dispatchEvent(new InputEvent('change'));
    expect(spy).toHaveBeenCalledWith('#222222');
  });

  it('should set and update the Measurement Color input', async () => {
    const input = elm.shadowRoot!.querySelector('#measurement-color') as HTMLInputElement;
    expect(input.value).toBe(mockMeasurementsService.getMeasurementColor());
    const spy = vi.spyOn(mockMeasurementsService, 'setMeasurementColor');
    input.value = '#333333';
    input.dispatchEvent(new InputEvent('change'));
    expect(spy).toHaveBeenCalledWith('#333333');
  });

  it('should set and update the PMI Override Color input', async () => {
    const input = elm.shadowRoot!.querySelector('#pmi-override-color') as HTMLInputElement;
    expect(input.value).toBe(mockPmiService.getPmiColor());
    const spy = vi.spyOn(mockPmiService, 'setPmiColor');
    input.value = '#444444';
    input.dispatchEvent(new InputEvent('change'));
    expect(spy).toHaveBeenCalledWith('#444444');
  });

  it('should set and update the Drawing Background Color input', async () => {
    const input = elm.shadowRoot!.querySelector('#drawing-background-color') as HTMLInputElement;
    expect(input.value).toBe(mockSheetService.getSheetBackgroundColor());
    const spy = vi.spyOn(mockSheetService, 'setSheetColors');
    input.value = '#555555';
    input.dispatchEvent(new InputEvent('change'));
    expect(spy).toHaveBeenCalledWith(
      '#555555',
      mockSheetService.getSheetColor(),
      mockSheetService.getSheetShadowColor(),
    );
  });

  it('should set and update the Drawing Sheet Color input', async () => {
    const input = elm.shadowRoot!.querySelector('#drawing-sheet-color') as HTMLInputElement;
    expect(input.value).toBe(mockSheetService.getSheetColor());
    const spy = vi.spyOn(mockSheetService, 'setSheetColors');
    input.value = '#666666';
    input.dispatchEvent(new InputEvent('change'));
    expect(spy).toHaveBeenCalledWith(
      mockSheetService.getSheetBackgroundColor(),
      '#666666',
      mockSheetService.getSheetShadowColor(),
    );
  });

  it('should set and update the Drawing Sheet Shadow Color input', async () => {
    const input = elm.shadowRoot!.querySelector('#drawing-sheet-shadow-color') as HTMLInputElement;
    expect(input.value).toBe(mockSheetService.getSheetShadowColor());
    const spy = vi.spyOn(mockSheetService, 'setSheetColors');
    input.value = '#777777';
    input.dispatchEvent(new InputEvent('change'));
    expect(spy).toHaveBeenCalledWith(
      mockSheetService.getSheetBackgroundColor(),
      mockSheetService.getSheetColor(),
      '#777777',
    );
  });

  it('should set and update the Show Sheet Background switch', async () => {
    const sw = elm.shadowRoot!.querySelector('#show-sheet-background') as HTMLElement;
    expect(sw.hasAttribute('checked')).toBe(mockSheetService.getBackgroundSheetEnabled());
    const spy = vi.spyOn(mockSheetService, 'setBackgroundSheetEnabled');
    sw.dispatchEvent(new Event('change'));
    expect(spy).toHaveBeenCalled();
  });

  it('should set and update the PMI Override Enable switch', async () => {
    const sw = elm.shadowRoot!.querySelector('#pmi-override-enable') as HTMLElement;
    expect(sw.hasAttribute('checked')).toBe(mockPmiService.getPmiColorOverride());
    const spy = vi.spyOn(mockPmiService, 'setPmiColorOverride');
    sw.dispatchEvent(new Event('change'));
    expect(spy).toHaveBeenCalled();
  });
});
