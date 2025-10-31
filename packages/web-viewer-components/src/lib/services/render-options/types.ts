import { IResettableConfigurationService, IService } from '../types';

export const PointSizeUnitValues = [
  'Screen Pixels',
  'CSS Pixels',
  'World',
  'Proportion Of Screen Width',
  'Proportion Of Screen Height',
  'Proportion Of Bounding Diagonal',
] as const;
export type PointSizeUnit = (typeof PointSizeUnitValues)[number];

export function isPointSizeUnit(obj: unknown): obj is PointSizeUnit {
  return PointSizeUnitValues.includes(obj as PointSizeUnit);
}

//! rgb colors as hexadecimal strings
//! undefined if transparent
export interface VerticalGradient {
  top?: string;
  bottom?: string;
}

export function isVerticalGradient(obj: unknown): obj is VerticalGradient {
  return (
    !!obj &&
    typeof obj === 'object' &&
    (typeof (obj as VerticalGradient).top === 'string' ||
      (obj as VerticalGradient).top === undefined) &&
    (typeof (obj as VerticalGradient).bottom === 'string' ||
      (obj as VerticalGradient).bottom === undefined)
  );
}

export type RenderOptionsServiceConfiguration = {
  minimumFramerate: number;

  hiddenLineOpacity: number;

  showBackfaces: boolean;

  ambientOcclusionEnabled: boolean;
  ambientOcclusionRadius: number;

  antiAliasingEnabled: boolean;

  bloomEnabled: boolean;
  bloomIntensity: number;
  bloomThreshold: number;

  silhouetteEnabled: boolean;

  reflectionEnabled: boolean;

  shadowEnabled: boolean;
  shadowInteractive: boolean;
  shadowBlurSamples: number;

  splatRenderingEnabled: boolean;
  splatRenderingSize: number;
  splatRenderingPointSizeUnit: PointSizeUnit;

  eyeDomeLightingEnabled: boolean;

  backgroundColor: VerticalGradient;
};

export function isRenderOptionsServiceConfiguration(
  obj: unknown,
): obj is RenderOptionsServiceConfiguration {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const value = obj as RenderOptionsServiceConfiguration;

  return (
    typeof value.minimumFramerate === 'number' &&
    typeof value.hiddenLineOpacity === 'number' &&
    typeof value.showBackfaces === 'boolean' &&
    typeof value.ambientOcclusionEnabled === 'boolean' &&
    typeof value.ambientOcclusionRadius === 'number' &&
    typeof value.antiAliasingEnabled === 'boolean' &&
    typeof value.bloomEnabled === 'boolean' &&
    typeof value.bloomIntensity === 'number' &&
    typeof value.bloomThreshold === 'number' &&
    typeof value.silhouetteEnabled === 'boolean' &&
    typeof value.reflectionEnabled === 'boolean' &&
    typeof value.shadowEnabled === 'boolean' &&
    typeof value.shadowInteractive === 'boolean' &&
    typeof value.shadowBlurSamples === 'number' &&
    typeof value.splatRenderingEnabled === 'boolean' &&
    typeof value.splatRenderingSize === 'number' &&
    isPointSizeUnit(value.splatRenderingPointSizeUnit) &&
    typeof value.eyeDomeLightingEnabled === 'boolean' &&
    isVerticalGradient(value.backgroundColor)
  );
}

export interface IRenderOptionsService extends IService, IResettableConfigurationService {
  getMinimumFramerate(): Promise<number>;
  setMinimumFramerate(value: number): Promise<void>;

  getHiddenLineOpacity(): number;
  setHiddenLineOpacity(opacity: number): void;

  getShowBackfaces(): boolean;
  setShowBackfaces(show: boolean): Promise<void>;

  getAmbientOcclusionEnabled(): boolean;
  setAmbientOcclusionEnabled(enabled: boolean): Promise<void>;
  getAmbientOcclusionRadius(): number;
  setAmbientOcclusionRadius(radius: number): Promise<void>;

  getAntiAliasingEnabled(): boolean;
  setAntiAliasingEnabled(enabled: boolean): Promise<void>;

  getBloomEnabled(): boolean;
  setBloomEnabled(enabled: boolean): void;
  getBloomIntensity(): number;
  setBloomIntensity(intensity: number): void;
  getBloomThreshold(): number;
  setBloomThreshold(threshold: number): void;

  getSilhouetteEnabled(): boolean;
  setSilhouetteEnabled(enabled: boolean): void;

  getReflectionEnabled(): boolean;
  setReflectionEnabled(enabled: boolean): void;

  getShadowEnabled(): boolean;
  setShadowEnabled(enabled: boolean): void;
  getShadowInteractive(): boolean;
  setShadowInteractive(interactive: boolean): void;
  getShadowBlurSamples(): number;
  setShadowBlurSamples(samples: number): void;

  /*
    Splat rendering is a specific setup for point size.
    When splat rendering is disabled the default values of (1, ScreenPixels) are used for point size.
    When splat rendering is turned on, we will use a default of splatRenderingSize and splatRenderingPointSizeUnit
    (default at .003 and ProportionOfBoundingDiagonal).
  */
  getSplatRenderingEnabled(): boolean;
  setSplatRenderingEnabled(enabled: boolean): Promise<void>;
  getSplatRenderingSize(): number;
  setSplatRenderingSize(size: number): Promise<void>;
  getSplatRenderingPointSizeUnit(): PointSizeUnit;
  setSplatRenderingPointSizeUnit(unit: PointSizeUnit): Promise<void>;

  getEyeDomeLightingEnabled(): Promise<boolean>;
  setEyeDomeLightingEnabled(enabled: boolean): Promise<void>;

  getBackgroundColor(): VerticalGradient;
  setBackgroundColor(color: VerticalGradient): Promise<void>;
  resetConfiguration(obj?: object): Promise<void>;
}
