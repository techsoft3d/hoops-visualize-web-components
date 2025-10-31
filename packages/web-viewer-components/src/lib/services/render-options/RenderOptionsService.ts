import {
  IRenderOptionsService,
  isRenderOptionsServiceConfiguration,
  PointSizeUnit,
  RenderOptionsServiceConfiguration,
  VerticalGradient,
} from './types';
import {
  AntiAliasingMode,
  CallbackMap,
  core,
  PointSizeUnit as WebViewerPointSizeUnit,
  Color,
  DrawMode,
} from '@ts3d-hoops/web-viewer';
import { toWebViewerPointSizeUnit } from './utils';

export default class RenderOptionsService extends EventTarget implements IRenderOptionsService {
  public readonly serviceName = 'RenderOptionsService' as const;

  private _webviewer?: core.IWebViewer;

  private _callbackMap: CallbackMap;
  private _webViewerReady = false;

  private _splatRenderingEnabled = false;
  private _splatRenderingSize = 0.003;
  private _splatRenderingPointSizeUnit: PointSizeUnit = 'Screen Pixels';

  public static readonly DefaultConfig: RenderOptionsServiceConfiguration = {
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
  };

  constructor() {
    super();

    this.sceneReady = this.sceneReady.bind(this);

    this._callbackMap = {
      sceneReady: this.sceneReady,
      firstModelLoaded: () => {
        this.updateSplatRenderingEnabled();
        this.dispatchEvent(
          new CustomEvent('hoops-render-options-service-reset', { bubbles: true, composed: true }),
        );
      },
      modelSwitched: () => {
        this.updateSplatRenderingEnabled();
        this.dispatchEvent(
          new CustomEvent('hoops-render-options-service-reset', { bubbles: true, composed: true }),
        );
      },
    };
  }

  private bind() {
    if (!this._webviewer) {
      throw new Error('MarkupManager is not set');
    }

    this._webviewer.setCallbacks(this._callbackMap);
  }

  private unbind() {
    if (!this._webviewer) {
      throw new Error('WebViewer not set');
    }
    this._webviewer.unsetCallbacks(this._callbackMap);
  }

  public get webViewer(): core.IWebViewer | undefined {
    return this._webviewer;
  }

  public set webViewer(value: core.IWebViewer | undefined) {
    if (this._webviewer === value) {
      return;
    }

    if (this._webviewer) {
      this.unbind();
    }

    this._webviewer = value;
    this._webViewerReady = false;

    if (!this._webviewer) {
      return;
    }

    this.bind();
    if (this._webviewer.getSceneReady()) {
      this.sceneReady();
    }
  }

  private sceneReady() {
    this._webViewerReady = true;
    this.dispatchEvent(
      new CustomEvent('hoops-render-options-service-reset', { bubbles: true, composed: true }),
    );
  }

  // --- Minimum Framerate ---
  public getMinimumFramerate(): Promise<number> {
    if (!this._webViewerReady) {
      return Promise.resolve(0);
    }
    return this._webviewer!.getMinimumFramerate();
  }

  public async setMinimumFramerate(value: number): Promise<void> {
    if (!this._webViewerReady) {
      throw new Error('WebViewer not ready');
    }
    await this._webviewer!.setMinimumFramerate(value);
    this.dispatchEvent(
      new CustomEvent('hoops-minimum-framerate-changed', {
        bubbles: true,
        composed: true,
        detail: value,
      }),
    );
  }

  // --- Hidden Line Opacity ---
  public getHiddenLineOpacity(): number {
    if (!this._webViewerReady) {
      return 0;
    }
    return this._webviewer!.view.getHiddenLineSettings().getObscuredLineOpacity();
  }

  public setHiddenLineOpacity(opacity: number): void {
    if (!this._webViewerReady) {
      throw new Error('WebViewer not ready');
    }
    const view = this._webviewer!.view;
    view.getHiddenLineSettings().setObscuredLineOpacity(opacity);
    if (view.getDrawMode() === DrawMode.HiddenLine) {
      view.setDrawMode(DrawMode.HiddenLine);
    }
    this.dispatchEvent(
      new CustomEvent('hoops-hidden-line-opacity-changed', {
        bubbles: true,
        composed: true,
        detail: opacity,
      }),
    );
  }

  // --- Show Backfaces ---
  public getShowBackfaces(): boolean {
    if (!this._webViewerReady) {
      return false;
    }
    return this._webviewer!.view.getBackfacesVisible();
  }

  public async setShowBackfaces(show: boolean): Promise<void> {
    if (!this._webViewerReady) {
      throw new Error('WebViewer not ready');
    }
    await this._webviewer!.view.setBackfacesVisible(show);
    this.dispatchEvent(
      new CustomEvent('hoops-show-backfaces-changed', {
        bubbles: true,
        composed: true,
        detail: show,
      }),
    );
  }

  // --- Ambient Occlusion Enabled ---
  public getAmbientOcclusionEnabled(): boolean {
    if (!this._webViewerReady) {
      return false;
    }
    return this._webviewer!.view.getAmbientOcclusionEnabled();
  }

  public async setAmbientOcclusionEnabled(enabled: boolean): Promise<void> {
    if (!this._webViewerReady) {
      throw new Error('WebViewer not ready');
    }
    await this._webviewer!.view.setAmbientOcclusionEnabled(enabled);
    this.dispatchEvent(
      new CustomEvent('hoops-ambient-occlusion-enabled-changed', {
        bubbles: true,
        composed: true,
        detail: enabled,
      }),
    );
  }

  // --- Ambient Occlusion Radius ---
  public getAmbientOcclusionRadius(): number {
    if (!this._webViewerReady) {
      return 0;
    }
    return this._webviewer!.view.getAmbientOcclusionRadius();
  }

  public async setAmbientOcclusionRadius(radius: number): Promise<void> {
    if (!this._webViewerReady) {
      throw new Error('WebViewer not ready');
    }
    await this._webviewer!.view.setAmbientOcclusionRadius(radius);
    this.dispatchEvent(
      new CustomEvent('hoops-ambient-occlusion-radius-changed', {
        bubbles: true,
        composed: true,
        detail: radius,
      }),
    );
  }

  // --- Anti Aliasing Enabled ---
  public getAntiAliasingEnabled(): boolean {
    if (!this._webViewerReady) {
      return false;
    }
    return this._webviewer!.view.getAntiAliasingMode() === AntiAliasingMode.SMAA;
  }

  public async setAntiAliasingEnabled(enabled: boolean): Promise<void> {
    if (!this._webViewerReady) {
      throw new Error('WebViewer not ready');
    }
    await this._webviewer!.view.setAntiAliasingMode(
      enabled ? AntiAliasingMode.SMAA : AntiAliasingMode.None,
    );
    this.dispatchEvent(
      new CustomEvent('hoops-anti-aliasing-enabled-changed', {
        bubbles: true,
        composed: true,
        detail: enabled,
      }),
    );
  }

  // --- Bloom Enabled ---
  public getBloomEnabled(): boolean {
    if (!this._webViewerReady) {
      return false;
    }
    return this._webviewer!.view.getBloomEnabled();
  }

  public setBloomEnabled(enabled: boolean): void {
    if (!this._webViewerReady) {
      throw new Error('WebViewer not ready');
    }
    this._webviewer!.view.setBloomEnabled(enabled);
    this.dispatchEvent(
      new CustomEvent('hoops-bloom-enabled-changed', {
        bubbles: true,
        composed: true,
        detail: enabled,
      }),
    );
  }

  // --- Bloom Intensity ---
  public getBloomIntensity(): number {
    if (!this._webViewerReady) {
      return 0;
    }
    return this._webviewer!.view.getBloomIntensityScale();
  }

  public setBloomIntensity(intensity: number): void {
    if (!this._webViewerReady) {
      throw new Error('WebViewer not ready');
    }
    this._webviewer!.view.setBloomIntensityScale(intensity);
    this.dispatchEvent(
      new CustomEvent('hoops-bloom-intensity-changed', {
        bubbles: true,
        composed: true,
        detail: intensity,
      }),
    );
  }

  // --- Bloom Threshold ---
  public getBloomThreshold(): number {
    if (!this._webViewerReady) {
      return 0;
    }
    return this._webviewer!.view.getBloomThreshold();
  }

  public setBloomThreshold(threshold: number): void {
    if (!this._webViewerReady) {
      throw new Error('WebViewer not ready');
    }
    this._webviewer!.view.setBloomThreshold(threshold);
    this.dispatchEvent(
      new CustomEvent('hoops-bloom-threshold-changed', {
        bubbles: true,
        composed: true,
        detail: threshold,
      }),
    );
  }

  // --- Silhouette Enabled ---
  public getSilhouetteEnabled(): boolean {
    if (!this._webViewerReady) {
      return false;
    }
    return this._webviewer!.view.getSilhouetteEnabled();
  }

  public setSilhouetteEnabled(enabled: boolean): void {
    if (!this._webViewerReady) {
      throw new Error('WebViewer not ready');
    }
    this._webviewer!.view.setSilhouetteEnabled(enabled);
    this.dispatchEvent(
      new CustomEvent('hoops-silhouette-enabled-changed', {
        bubbles: true,
        composed: true,
        detail: enabled,
      }),
    );
  }

  // --- Reflection Enabled ---
  public getReflectionEnabled(): boolean {
    if (!this._webViewerReady) {
      return false;
    }
    return this._webviewer!.view.getSimpleReflectionEnabled();
  }

  public setReflectionEnabled(enabled: boolean): void {
    if (!this._webViewerReady) {
      throw new Error('WebViewer not ready');
    }
    this._webviewer!.view.setSimpleReflectionEnabled(enabled);
    this.dispatchEvent(
      new CustomEvent('hoops-reflection-enabled-changed', {
        bubbles: true,
        composed: true,
        detail: enabled,
      }),
    );
  }

  // --- Shadow Enabled ---
  public getShadowEnabled(): boolean {
    if (!this._webViewerReady) {
      return false;
    }
    return this._webviewer!.view.getSimpleShadowEnabled();
  }

  public async setShadowEnabled(enabled: boolean): Promise<void> {
    if (!this._webViewerReady) {
      throw new Error('WebViewer not ready');
    }
    this._webviewer!.view.setSimpleShadowEnabled(enabled);
    this.dispatchEvent(
      new CustomEvent('hoops-shadow-enabled-changed', {
        bubbles: true,
        composed: true,
        detail: enabled,
      }),
    );
  }

  // --- Shadow Interactive ---
  public getShadowInteractive(): boolean {
    if (!this._webViewerReady) {
      return false;
    }
    return this._webviewer!.view.getSimpleShadowInteractiveUpdateEnabled();
  }

  public setShadowInteractive(interactive: boolean): void {
    if (!this._webViewerReady) {
      throw new Error('WebViewer not ready');
    }
    this._webviewer!.view.setSimpleShadowInteractiveUpdateEnabled(interactive);
    this.dispatchEvent(
      new CustomEvent('hoops-shadow-interactive-changed', {
        bubbles: true,
        composed: true,
        detail: interactive,
      }),
    );
  }

  // --- Shadow Blur Samples ---
  public getShadowBlurSamples(): number {
    if (!this._webViewerReady) {
      return 0;
    }
    return this._webviewer!.view.getSimpleShadowBlurSamples();
  }

  public setShadowBlurSamples(samples: number): void {
    if (!this._webViewerReady) {
      throw new Error('WebViewer not ready');
    }
    this._webviewer!.view.setSimpleShadowBlurSamples(samples);
    this.dispatchEvent(
      new CustomEvent('hoops-shadow-blur-samples-changed', {
        bubbles: true,
        composed: true,
        detail: samples,
      }),
    );
  }

  /*
    Splat rendering is a specific setup for point size.
    When splat rendering is disabled the default values of (1, ScreenPixels) are used for point size.
    When splat rendering is turned on, we will use a default of splatRenderingSize and splatRenderingPointSizeUnit
    (default at .003 and ProportionOfBoundingDiagonal).
  */
  public getSplatRenderingEnabled(): boolean {
    return this._splatRenderingEnabled;
  }

  public async setSplatRenderingEnabled(enabled: boolean): Promise<void> {
    if (!this._webViewerReady) {
      throw new Error('WebViewer not ready');
    }
    this._splatRenderingEnabled = enabled;
    if (enabled) {
      await this._webviewer!.view.setPointSize(
        this._splatRenderingSize,
        toWebViewerPointSizeUnit(this._splatRenderingPointSizeUnit),
      );
    } else {
      await this._webviewer!.view.setPointSize(1, WebViewerPointSizeUnit.ScreenPixels);
    }

    this.dispatchEvent(
      new CustomEvent('hoops-splat-rendering-enabled-changed', {
        bubbles: true,
        composed: true,
        detail: enabled,
      }),
    );
  }

  public getSplatRenderingSize(): number {
    return this._splatRenderingSize;
  }

  public async setSplatRenderingSize(size: number): Promise<void> {
    if (!this._webViewerReady) {
      throw new Error('WebViewer not ready');
    }
    this._splatRenderingSize = size;
    if (this._splatRenderingEnabled) {
      await this._webviewer!.view.setPointSize(
        this._splatRenderingSize,
        toWebViewerPointSizeUnit(this._splatRenderingPointSizeUnit),
      );
    }

    this.dispatchEvent(
      new CustomEvent('hoops-splat-rendering-size-changed', {
        bubbles: true,
        composed: true,
        detail: size,
      }),
    );
  }

  public getSplatRenderingPointSizeUnit(): PointSizeUnit {
    return this._splatRenderingPointSizeUnit;
  }

  public async setSplatRenderingPointSizeUnit(unit: PointSizeUnit): Promise<void> {
    if (!this._webViewerReady) {
      throw new Error('WebViewer not ready');
    }
    this._splatRenderingPointSizeUnit = unit;
    if (this._splatRenderingEnabled) {
      await this._webviewer!.view.setPointSize(
        this._splatRenderingSize,
        toWebViewerPointSizeUnit(this._splatRenderingPointSizeUnit),
      );
    }
    this.dispatchEvent(
      new CustomEvent('hoops-splat-rendering-point-size-unit-changed', {
        bubbles: true,
        composed: true,
        detail: unit,
      }),
    );
  }

  private updateSplatRenderingEnabled() {
    if (!this._webViewerReady) {
      return;
    }
    this._splatRenderingEnabled =
      this.getSplatRenderingSize() !== 1 ||
      this.getSplatRenderingPointSizeUnit() !== 'Screen Pixels';
  }

  // --- Eye Dome Lighting Enabled ---
  public async getEyeDomeLightingEnabled(): Promise<boolean> {
    if (!this._webViewerReady) {
      return false;
    }
    return this._webviewer!.view.getEyeDomeLightingEnabled();
  }

  public async setEyeDomeLightingEnabled(enabled: boolean): Promise<void> {
    if (!this._webViewerReady) {
      throw new Error('WebViewer not ready');
    }
    await this._webviewer!.view.setEyeDomeLightingEnabled(enabled);
    this.dispatchEvent(
      new CustomEvent('hoops-eye-dome-lighting-enabled-changed', {
        bubbles: true,
        composed: true,
        detail: enabled,
      }),
    );
  }

  // --- Background Color ---
  public getBackgroundColor(): VerticalGradient {
    if (!this._webViewerReady) {
      return {};
    }
    const background = this._webviewer!.view.getBackgroundColor();
    return {
      top: background.top?.toHexString(),
      bottom: background.bottom?.toHexString(),
    };
  }

  public async setBackgroundColor(color: VerticalGradient): Promise<void> {
    if (!this._webViewerReady) {
      throw new Error('WebViewer not ready');
    }
    await this._webviewer!.view.setBackgroundColor(
      color.top ? Color.fromHexString(color.top) : null,
      color.bottom ? Color.fromHexString(color.bottom) : null,
    );
    this.dispatchEvent(
      new CustomEvent('hoops-background-color-changed', {
        bubbles: true,
        composed: true,
        detail: color,
      }),
    );
  }

  public async resetConfiguration(obj?: object): Promise<void> {
    const config = obj ?? { ...RenderOptionsService.DefaultConfig };

    if (!isRenderOptionsServiceConfiguration(config)) {
      throw new Error('Invalid configuration object');
    }

    await this.setMinimumFramerate(config.minimumFramerate);
    this.setHiddenLineOpacity(config.hiddenLineOpacity);
    await this.setShowBackfaces(config.showBackfaces);
    await this.setAmbientOcclusionEnabled(config.ambientOcclusionEnabled);
    await this.setAmbientOcclusionRadius(config.ambientOcclusionRadius);
    await this.setAntiAliasingEnabled(config.antiAliasingEnabled);
    this.setBloomEnabled(config.bloomEnabled);
    this.setBloomIntensity(config.bloomIntensity);
    this.setBloomThreshold(config.bloomThreshold);
    this.setSilhouetteEnabled(config.silhouetteEnabled);
    this.setReflectionEnabled(config.reflectionEnabled);
    await this.setShadowEnabled(config.shadowEnabled);
    this.setShadowInteractive(config.shadowInteractive);
    this.setShadowBlurSamples(config.shadowBlurSamples);
    await this.setSplatRenderingSize(config.splatRenderingSize);
    await this.setSplatRenderingPointSizeUnit(config.splatRenderingPointSizeUnit);
    await this.setSplatRenderingEnabled(config.splatRenderingEnabled);
    await this.setEyeDomeLightingEnabled(config.eyeDomeLightingEnabled);
    await this.setBackgroundColor(config.backgroundColor);
  }
}
