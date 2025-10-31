import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '@ts3d-hoops/ui-kit';
import {
  getService,
  ICameraService,
  ICuttingService,
  IRenderOptionsService,
  ISelectionService,
  ProjectionValues,
  Projection,
  PointSizeUnitValues,
  IPmiService,
  ISheetService,
  PointSizeUnit,
} from '../services';
import { IMeasurementService } from '../services/measurement';
import { panelStyles } from './panel-styles';
import { classMap } from 'lit-html/directives/class-map.js';

@customElement('hoops-settings-graphics-section')
export class HoopsSettingsGraphicsSectionElement extends LitElement {
  static styles = [
    panelStyles,
    css`
      :host {
        display: block;
      }
    `,
  ];

  private cameraService!: ICameraService;
  private renderOptionsService!: IRenderOptionsService;
  private cuttingService!: ICuttingService;
  private selectionService!: ISelectionService;
  private measurementsService!: IMeasurementService;
  private pmiService!: IPmiService;
  private sheetService!: ISheetService;

  @property({ type: Number }) minimumFramerate = 0;
  @property({ type: Boolean }) eyeDomeLightingEnabled = false;

  private async updatePromisedData() {
    this.minimumFramerate = await this.renderOptionsService.getMinimumFramerate();
    this.eyeDomeLightingEnabled = await this.renderOptionsService.getEyeDomeLightingEnabled();
  }

  private updateCallback = async () => {
    await this.updatePromisedData();
    this.requestUpdate();
  };

  private cameraServiceEvents = [
    'hoops-camera-service-reset',
    'hoops-projection-mode-changed',
    'hoops-orbit-fallback-mode-changed',
  ] as const;

  private renderOptionsServiceEvents = [
    'hoops-render-options-service-reset',
    'hoops-minimum-framerate-changed',
    'hoops-hidden-line-opacity-changed',
    'hoops-show-backfaces-changed',
    'hoops-ambient-occlusion-enabled-changed',
    'hoops-ambient-occlusion-radius-changed',
    'hoops-anti-aliasing-enabled-changed',
    'hoops-bloom-enabled-changed',
    'hoops-bloom-intensity-changed',
    'hoops-bloom-threshold-changed',
    'hoops-silhouette-enabled-changed',
    'hoops-reflection-enabled-changed',
    'hoops-shadow-enabled-changed',
    'hoops-shadow-interactive-changed',
    'hoops-shadow-blur-samples-changed',
    'hoops-splat-rendering-enabled-changed',
    'hoops-splat-rendering-size-changed',
    'hoops-splat-rendering-point-size-unit-changed',
    'hoops-eye-dome-lighting-enabled-changed',
    'hoops-background-color-changed',
  ] as const;

  private cuttingServiceEvents = [
    'hoops-cutting-service-reset',
    'hoops-capping-geometry-visibility-changed',
    'hoops-capping-face-color-changed',
    'hoops-capping-line-color-changed',
  ] as const;

  private selectionServiceEvents = [
    'hoops-selection-service-reset',
    'hoops-enable-face-line-selection-changed',
    'hoops-honors-scene-visibility-changed',
    'hoops-body-color-changed',
    'hoops-face-and-line-color-changed',
  ] as const;

  private measurementsServiceEvents = ['hoops-measurement-color-changed'] as const;

  private pmiServiceEvents = [
    'hoops-pmi-service-reset',
    'hoops-pmi-color-changed',
    'hoops-pmi-color-override-changed',
  ] as const;

  private sheetServiceEvents = [
    'hoops-sheet-service-reset',
    'hoops-sheet-colors-changed',
    'hoops-background-sheet-enabled-changed',
  ] as const;

  connectedCallback(): void {
    super.connectedCallback();

    this.cameraService = getService<ICameraService>('CameraService');
    this.cameraServiceEvents.map((event) =>
      this.cameraService.addEventListener(event, this.updateCallback),
    );

    this.renderOptionsService = getService<IRenderOptionsService>('RenderOptionsService');
    this.renderOptionsServiceEvents.map((event) =>
      this.renderOptionsService.addEventListener(event, this.updateCallback),
    );

    this.cuttingService = getService<ICuttingService>('CuttingService');
    this.cuttingServiceEvents.map((event) =>
      this.cuttingService.addEventListener(event, this.updateCallback),
    );

    this.selectionService = getService<ISelectionService>('SelectionService');
    this.selectionServiceEvents.map((event) =>
      this.selectionService.addEventListener(event, this.updateCallback),
    );

    this.measurementsService = getService<IMeasurementService>('MeasurementService');
    this.measurementsServiceEvents.map((event) =>
      this.measurementsService.addEventListener(event, this.updateCallback),
    );

    this.pmiService = getService<IPmiService>('PmiService');
    this.pmiServiceEvents.map((event) =>
      this.pmiService.addEventListener(event, this.updateCallback),
    );

    this.sheetService = getService<ISheetService>('SheetService');
    this.sheetServiceEvents.map((event) =>
      this.sheetService.addEventListener(event, this.updateCallback),
    );

    this.updateCallback();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    if (this.cameraService) {
      this.cameraServiceEvents.map((event) => {
        this.cameraService.removeEventListener(event, this.updateCallback);
      });
    }

    if (this.renderOptionsService) {
      this.renderOptionsServiceEvents.map((event) => {
        this.renderOptionsService.removeEventListener(event, this.updateCallback);
      });
    }

    if (this.cuttingService) {
      this.cuttingServiceEvents.map((event) =>
        this.cuttingService.removeEventListener(event, this.updateCallback),
      );
    }

    if (this.selectionService) {
      this.selectionServiceEvents.map((event) =>
        this.selectionService.removeEventListener(event, this.updateCallback),
      );
    }

    if (this.measurementsService) {
      this.measurementsServiceEvents.map((event) =>
        this.measurementsService.removeEventListener(event, this.updateCallback),
      );
    }

    if (this.pmiService) {
      this.pmiServiceEvents.map((event) =>
        this.pmiService.removeEventListener(event, this.updateCallback),
      );
    }

    if (this.sheetService) {
      this.sheetServiceEvents.map((event) =>
        this.sheetService.removeEventListener(event, this.updateCallback),
      );
    }
  }

  render() {
    return html`
      <div class="settings-root">
        <fieldset>
          <legend>General</legend>
          <div class="settings-group">
            <div class="setting-row">
              <label for="projection-mode" class="setting-label" title="Projection Mode"
                >Projection Mode:</label
              >
              <select
                id="projection-mode"
                name="projection-mode"
                .value=${this.cameraService.getProjectionMode()}
                @change=${(event: Event) => {
                  const target = event.target as HTMLSelectElement;
                  this.cameraService.setProjectionMode(target.value as Projection);
                }}
              >
                ${ProjectionValues.map((value) => {
                  return html`<option
                    value=${value}
                    ?selected=${value === this.cameraService.getProjectionMode()}
                  >
                    ${value}
                  </option>`;
                })}
              </select>
            </div>
            <div class="setting-row">
              <label for="framerate" class="setting-label" title="Framerate (fps)"
                >Framerate (fps):</label
              >
              <input
                id="framerate"
                name="framerate"
                type="number"
                min="0"
                step="1"
                .value=${this.minimumFramerate}
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = parseInt(target.value);
                  if (!isNaN(value)) {
                    this.renderOptionsService.setMinimumFramerate(value);
                  }
                }}
              />
            </div>
            <div class="setting-row">
              <label
                for="hidden-line-opacity"
                class="setting-label"
                title="Hidden Line Opacity (0-1)"
              >
                Hidden Line Opacity (0-1):
              </label>
              <input
                id="hidden-line-opacity"
                name="hidden-line-opacity"
                type="number"
                min="0"
                max="1"
                step="0.1"
                .value=${this.renderOptionsService.getHiddenLineOpacity()}
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = parseFloat(target.value);
                  if (!isNaN(value)) {
                    this.renderOptionsService.setHiddenLineOpacity(value);
                  }
                }}
              />
            </div>
            <div class="setting-row">
              <label for="show-backfaces" class="setting-label" title="Show Backfaces"
                >Show Backfaces:</label
              >
              <hoops-switch
                id="show-backfaces"
                name="show-backfaces"
                ?checked=${this.renderOptionsService.getShowBackfaces()}
                @change=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  this.renderOptionsService.setShowBackfaces(target.checked);
                }}
              ></hoops-switch>
            </div>
            <div class="setting-row">
              <label
                for="show-capping-geometry"
                class="setting-label"
                title="Show Capping Geometry"
              >
                Show Capping Geometry:
              </label>
              <hoops-switch
                id="show-capping-geometry"
                name="show-capping-geometry"
                ?checked=${this.cuttingService.getCappingGeometryVisibility()}
                @change=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  this.cuttingService.setCappingGeometryVisibility(target.checked);
                }}
              ></hoops-switch>
            </div>
            <div class="setting-row">
              <label
                for="enable-face-line-selection"
                class="setting-label"
                title="Enable Face / Line Selection"
              >
                Enable Face / Line Selection:
              </label>
              <hoops-switch
                id="enable-face-line-selection"
                name="enable-face-line-selection"
                ?checked=${this.selectionService.getEnableFaceLineSelection()}
                @change=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  this.selectionService.setEnableFaceLineSelection(target.checked);
                }}
              ></hoops-switch>
            </div>
            <div class="setting-row">
              <label
                for="selection-honors-scene-visibility"
                class="setting-label"
                title="Selection Honors Scene Visibility"
              >
                Selection Honors Scene Visibility:
              </label>
              <hoops-switch
                id="selection-honors-scene-visibility"
                name="selection-honors-scene-visibility"
                ?checked=${this.selectionService.getHonorsSceneVisibility()}
                @change=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  this.selectionService.setHonorsSceneVisibility(target.checked);
                }}
              ></hoops-switch>
            </div>
            <div class="setting-row">
              <label
                for="rotate-around-camera-center"
                class="setting-label"
                title="Rotate Around Camera Center"
              >
                Rotate Around Camera Center:
              </label>
              <hoops-switch
                id="rotate-around-camera-center"
                name="rotate-around-camera-center"
                ?checked=${this.cameraService.getOrbitFallbackMode() === 'Camera Target'}
                @change=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  this.cameraService.setOrbitFallbackMode(
                    target.checked ? 'Camera Target' : 'Model Center',
                  );
                }}
              ></hoops-switch>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>Effects</legend>
          <div class="settings-group">
            <div class="setting-row">
              <label
                for="enable-ambient-occlusion"
                class="setting-label"
                title="Enable Ambient Occlusion"
              >
                Enable Ambient Occlusion:
              </label>
              <hoops-switch
                id="enable-ambient-occlusion"
                name="enable-ambient-occlusion"
                ?checked=${this.renderOptionsService.getAmbientOcclusionEnabled()}
                @change=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  this.renderOptionsService.setAmbientOcclusionEnabled(target.checked);
                }}
              ></hoops-switch>
            </div>
            <div class="settings-subgroup">
              <div class="setting-row">
                <label
                  for="ao-radius"
                  class=${classMap({
                    'setting-label': true,
                    disabled: !this.renderOptionsService.getAmbientOcclusionEnabled(),
                  })}
                  title="Radius"
                >
                  Radius:
                </label>
                <input
                  id="ao-radius"
                  name="ao-radius"
                  type="number"
                  step="0.01"
                  ?disabled=${!this.renderOptionsService.getAmbientOcclusionEnabled()}
                  .value=${this.renderOptionsService.getAmbientOcclusionRadius()}
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = parseFloat(target.value);
                    if (!isNaN(value)) {
                      this.renderOptionsService.setAmbientOcclusionRadius(value);
                    }
                  }}
                />
              </div>
            </div>
            <div class="setting-row">
              <label for="enable-antialiasing" class="setting-label" title="Enable Anti-Aliasing">
                Enable Anti-Aliasing:
              </label>
              <hoops-switch
                id="enable-antialiasing"
                name="enable-antialiasing"
                ?checked=${this.renderOptionsService.getAntiAliasingEnabled()}
                @change=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  this.renderOptionsService.setAntiAliasingEnabled(target.checked);
                }}
              ></hoops-switch>
            </div>
            <div class="setting-row">
              <label for="enable-bloom" class="setting-label" title="Enable Bloom">
                Enable Bloom:
              </label>
              <hoops-switch
                id="enable-bloom"
                name="enable-bloom"
                ?checked=${this.renderOptionsService.getBloomEnabled()}
                @change=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  this.renderOptionsService.setBloomEnabled(target.checked);
                }}
              ></hoops-switch>
            </div>
            <div class="settings-subgroup">
              <div class="setting-row">
                <label
                  for="intensity-scale"
                  class=${classMap({
                    'setting-label': true,
                    disabled: !this.renderOptionsService.getBloomEnabled(),
                  })}
                  title="Intensity Scale"
                >
                  Intensity Scale:
                </label>
                <input
                  id="intensity-scale"
                  ?disabled="${!this.renderOptionsService.getBloomEnabled()}"
                  name="intensity-scale"
                  type="number"
                  step="1"
                  .value=${this.renderOptionsService.getBloomIntensity()}
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = parseInt(target.value);
                    if (!isNaN(value)) {
                      this.renderOptionsService.setBloomIntensity(value);
                    }
                  }}
                />
              </div>
              <div class="setting-row">
                <label
                  for="threshold"
                  class=${classMap({
                    'setting-label': true,
                    disabled: !this.renderOptionsService.getBloomEnabled(),
                  })}
                  title="Threshold"
                >
                  Threshold:
                </label>
                <input
                  id="threshold"
                  ?disabled="${!this.renderOptionsService.getBloomEnabled()}"
                  name="threshold"
                  type="number"
                  step="0.1"
                  .value=${this.renderOptionsService.getBloomThreshold()}
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = parseFloat(target.value);
                    if (!isNaN(value)) {
                      this.renderOptionsService.setBloomThreshold(value);
                    }
                  }}
                />
              </div>
            </div>
            <div class="setting-row">
              <label for="silhouette-edges" class="setting-label" title="Silhouette Edges">
                Silhouette Edges:
              </label>
              <hoops-switch
                id="silhouette-edges"
                name="silhouette-edges"
                ?checked=${this.renderOptionsService.getSilhouetteEnabled()}
                @change=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  this.renderOptionsService.setSilhouetteEnabled(target.checked);
                }}
              ></hoops-switch>
            </div>
            <div class="setting-row">
              <label for="reflection-planes" class="setting-label" title="Reflection Planes">
                Reflection Planes:
              </label>
              <hoops-switch
                id="reflection-planes"
                name="reflection-planes"
                ?checked=${this.renderOptionsService.getReflectionEnabled()}
                @change=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  this.renderOptionsService.setReflectionEnabled(target.checked);
                }}
              ></hoops-switch>
            </div>
            <div class="setting-row">
              <label for="enable-shadows" class="setting-label" title="Enable Shadows">
                Enable Shadows:
              </label>
              <hoops-switch
                id="enable-shadows"
                name="enable-shadows"
                ?checked=${this.renderOptionsService.getShadowEnabled()}
                @change=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  this.renderOptionsService.setShadowEnabled(target.checked);
                }}
              ></hoops-switch>
            </div>
            <div class="settings-subgroup">
              <div class="setting-row">
                <label
                  for="interactive"
                  class=${classMap({
                    'setting-label': true,
                    disabled: !this.renderOptionsService.getShadowEnabled(),
                  })}
                  title="Interactive"
                >
                  Interactive:
                </label>
                <hoops-switch
                  id="interactive"
                  name="interactive"
                  ?disabled="${!this.renderOptionsService.getShadowEnabled()}"
                  ?checked=${this.renderOptionsService.getShadowInteractive()}
                  @change=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    this.renderOptionsService.setShadowInteractive(target.checked);
                  }}
                ></hoops-switch>
              </div>
              <div class="setting-row">
                <label
                  for="blur-samples"
                  class=${classMap({
                    'setting-label': true,
                    disabled: !this.renderOptionsService.getShadowEnabled(),
                  })}
                  title="Blur Samples"
                >
                  Blur Samples:
                </label>
                <input
                  id="blur-samples"
                  name="blur-samples"
                  type="number"
                  step="1"
                  ?disabled="${!this.renderOptionsService.getShadowEnabled()}"
                  .value=${this.renderOptionsService.getShadowBlurSamples()}
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = parseInt(target.value);
                    if (!isNaN(value)) {
                      this.renderOptionsService.setShadowBlurSamples(value);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>Point Cloud</legend>
          <div class="settings-group">
            <div class="setting-row">
              <label for="enable-splats" class="setting-label" title="Enable Splats">
                Enable Splats:
              </label>
              <hoops-switch
                id="enable-splats"
                name="enable-splats"
                ?checked=${this.renderOptionsService.getSplatRenderingEnabled()}
                @change=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  this.renderOptionsService.setSplatRenderingEnabled(target.checked);
                }}
              ></hoops-switch>
            </div>
            <div class="settings-subgroup">
              <div class="setting-row">
                <label
                  for="splats-size"
                  class=${classMap({
                    'setting-label': true,
                    disabled: !this.renderOptionsService.getSplatRenderingEnabled(),
                  })}
                  title="Size"
                >
                  Size:
                </label>
                <input
                  id="splats-size"
                  name="splats-size"
                  type="number"
                  step="0.001"
                  ?disabled="${!this.renderOptionsService.getSplatRenderingEnabled()}"
                  .value=${this.renderOptionsService.getSplatRenderingSize()}
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = parseFloat(target.value);
                    if (!isNaN(value)) {
                      this.renderOptionsService.setSplatRenderingSize(value);
                    }
                  }}
                />
              </div>
              <div
                class="setting-row"
                style="flex-direction: column; height: fit-content; align-items: start;"
              >
                <label
                  for="splats-mode"
                  class=${classMap({
                    'setting-label': true,
                    disabled: !this.renderOptionsService.getSplatRenderingEnabled(),
                  })}
                  title="Mode"
                >
                  Mode:
                </label>
                <select
                  id="splats-mode"
                  name="splats-mode"
                  style="align-self: end;"
                  ?disabled="${!this.renderOptionsService.getSplatRenderingEnabled()}"
                  .value=${this.renderOptionsService.getSplatRenderingPointSizeUnit()}
                  @change=${(event: Event) => {
                    const target = event.target as HTMLSelectElement;
                    const value = target.value as PointSizeUnit;
                    this.renderOptionsService.setSplatRenderingPointSizeUnit(value);
                  }}
                >
                  ${PointSizeUnitValues.map((value) => {
                    return html`<option
                      value=${value}
                      ?sselected=${value ===
                      this.renderOptionsService.getSplatRenderingPointSizeUnit()}
                    >
                      ${value}
                    </option>`;
                  })}
                </select>
              </div>
            </div>
            <div class="setting-row">
              <label
                for="enable-eye-dome-lighting"
                class="setting-label"
                title="Enable Eye-Dome Lighting"
              >
                Enable Eye-Dome Lighting:
              </label>
              <hoops-switch
                id="enable-eye-dome-lighting"
                name="enable-eye-dome-lighting"
                ?checked=${this.eyeDomeLightingEnabled}
                @change=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  this.renderOptionsService.setEyeDomeLightingEnabled(target.checked);
                }}
              ></hoops-switch>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>Color</legend>
          <div class="settings-group">
            <label>Background</label>
            <div class="settings-subgroup">
              <div class="setting-row">
                <label for="background-color-top" class="setting-label" title="Top"> Top: </label>
                <div class="setting-row-group">
                  <span class="color"
                    >${this.renderOptionsService.getBackgroundColor().top ?? '#transparent'}</span
                  >
                  <input
                    id="background-color-top"
                    name="background-color-top"
                    type="color"
                    .value=${this.renderOptionsService.getBackgroundColor().top ?? '#000000'}
                    @change=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const value = target.value;
                      const colors = this.renderOptionsService.getBackgroundColor();
                      this.renderOptionsService.setBackgroundColor({
                        top: value,
                        bottom: colors.bottom,
                      });
                    }}
                  />
                </div>
              </div>
              <div class="setting-row">
                <label for="background-color-bottom" class="setting-label" title="Bottom">
                  Bottom:
                </label>
                <div class="setting-row-group">
                  <span class="color"
                    >${this.renderOptionsService.getBackgroundColor().bottom ??
                    '#transparent'}</span
                  >
                  <input
                    id="background-color-bottom"
                    name="background-color-bottom"
                    type="color"
                    .value=${this.renderOptionsService.getBackgroundColor().bottom ?? '#000000'}
                    @change=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const value = target.value;
                      const colors = this.renderOptionsService.getBackgroundColor();
                      this.renderOptionsService.setBackgroundColor({
                        top: colors.top,
                        bottom: value,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            <label>Capping Geometry</label>
            <div class="settings-subgroup">
              <div class="setting-row">
                <label for="capping-geometry-face" class="setting-label" title="Face">Face:</label>
                <div class="setting-row-group">
                  <span class="color"
                    >${this.cuttingService.getCappingFaceColor() ?? '#no-color'}</span
                  >
                  <input
                    id="capping-geometry-face"
                    name="capping-geometry-face"
                    type="color"
                    .value=${this.cuttingService.getCappingFaceColor() ?? '#000000'}
                    @change=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const value = target.value;
                      this.cuttingService.setCappingFaceColor(value);
                    }}
                  />
                </div>
              </div>
              <div class="setting-row">
                <label for="capping-geometry-line" class="setting-label" title="Line">Line:</label>
                <div class="setting-row-group">
                  <span class="color"
                    >${this.cuttingService.getCappingLineColor() ?? '#no-color'}</span
                  >
                  <input
                    id="capping-geometry-line"
                    name="capping-geometry-line"
                    type="color"
                    .value=${this.cuttingService.getCappingLineColor() ?? '#000000'}
                    @change=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const value = target.value;
                      this.cuttingService.setCappingLineColor(value);
                    }}
                  />
                </div>
              </div>
            </div>
            <label>Selection</label>
            <div class="settings-subgroup">
              <div class="setting-row">
                <label for="selection-color-body" class="setting-label" title="Body">Body:</label>
                <div class="setting-row-group">
                  <span class="color">${this.selectionService.getBodyColor()}</span>
                  <input
                    id="selection-color-body"
                    name="selection-color-body"
                    type="color"
                    .value=${this.selectionService.getBodyColor()}
                    @change=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const value = target.value;
                      this.selectionService.setBodyColor(value);
                    }}
                  />
                </div>
              </div>
              <div class="setting-row">
                <label
                  for="selection-color-faces-lines"
                  class="setting-label"
                  title="Faces and Lines"
                >
                  Faces and Lines:
                </label>
                <div class="setting-row-group">
                  <span class="color">${this.selectionService.getFaceAndLineColor()}</span>
                  <input
                    id="selection-color-faces-lines"
                    name="selection-color-faces-lines"
                    type="color"
                    .value=${this.selectionService.getFaceAndLineColor()}
                    @change=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const value = target.value;
                      this.selectionService.setFaceAndLineColor(value);
                    }}
                  />
                </div>
              </div>
            </div>
            <div class="setting-row">
              <label for="measurement-color" class="setting-label" title="Measurement">
                Measurement:
              </label>
              <div class="setting-row-group">
                <span class="color">${this.measurementsService.getMeasurementColor()}</span>
                <input
                  id="measurement-color"
                  name="measurement-color"
                  type="color"
                  .value=${this.measurementsService.getMeasurementColor()}
                  @change=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = target.value;
                    this.measurementsService.setMeasurementColor(value);
                  }}
                />
              </div>
            </div>
            <div class="setting-row">
              <label for="pmi-override-color" class="setting-label" title="PMI Override">
                PMI Override:
              </label>
              <div class="setting-row-group">
                <hoops-switch
                  id="pmi-override-enable"
                  name="pmi-override-enable"
                  ?checked=${this.pmiService.getPmiColorOverride()}
                  @change=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    this.pmiService.setPmiColorOverride(target.checked);
                  }}
                ></hoops-switch>
                <span class=${!this.pmiService.getPmiColorOverride() ? 'color disabled' : 'color'}
                  >${this.pmiService.getPmiColor()}</span
                >
                <input
                  id="pmi-override-color"
                  name="pmi-override-color"
                  type="color"
                  ?disabled=${!this.pmiService.getPmiColorOverride()}
                  .value=${this.pmiService.getPmiColor()}
                  @change=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = target.value;
                    this.pmiService.setPmiColor(value);
                    if (this.pmiService.getPmiColorOverride()) {
                      this.pmiService.setPmiColorOverride(true);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>Drawing</legend>
          <div class="settings-group">
            <label>Drawing Colors</label>
            <div class="settings-subgroup">
              <div class="setting-row">
                <label for="drawing-background-color" class="setting-label" title="Background">
                  Background:
                </label>
                <div class="setting-row-group">
                  <span class="color">${this.sheetService.getSheetBackgroundColor()}</span>
                  <input
                    id="drawing-background-color"
                    name="drawing-background-color"
                    type="color"
                    .value=${this.sheetService.getSheetBackgroundColor()}
                    @change=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const value = target.value;
                      this.sheetService.setSheetColors(
                        value,
                        this.sheetService.getSheetColor(),
                        this.sheetService.getSheetShadowColor(),
                      );
                    }}
                  />
                </div>
              </div>
              <div class="setting-row">
                <label for="drawing-sheet-color" class="setting-label" title="Sheet">
                  Sheet:
                </label>
                <div class="setting-row-group">
                  <span class="color">${this.sheetService.getSheetColor()}</span>
                  <input
                    id="drawing-sheet-color"
                    name="drawing-sheet-color"
                    type="color"
                    .value=${this.sheetService.getSheetColor()}
                    @change=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const value = target.value;
                      this.sheetService.setSheetColors(
                        this.sheetService.getSheetBackgroundColor(),
                        value,
                        this.sheetService.getSheetShadowColor(),
                      );
                    }}
                  />
                </div>
              </div>
              <div class="setting-row">
                <label for="drawing-sheet-shadow-color" class="setting-label" title="Sheet Shadow">
                  Sheet Shadow:
                </label>
                <div class="setting-row-group">
                  <span class="color">${this.sheetService.getSheetShadowColor()}</span>
                  <input
                    id="drawing-sheet-shadow-color"
                    name="drawing-sheet-shadow-color"
                    type="color"
                    .value=${this.sheetService.getSheetShadowColor()}
                    @change=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const value = target.value;
                      this.sheetService.setSheetColors(
                        this.sheetService.getSheetBackgroundColor(),
                        this.sheetService.getSheetColor(),
                        value,
                      );
                    }}
                  />
                </div>
              </div>
            </div>
            <div class="setting-row">
              <label
                for="show-sheet-background"
                class="setting-label"
                title="Show Sheet Background"
              >
                Show Sheet Background:
              </label>
              <hoops-switch
                id="show-sheet-background"
                name="show-sheet-background"
                ?checked=${this.sheetService.getBackgroundSheetEnabled()}
                @change=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  this.sheetService.setBackgroundSheetEnabled(target.checked);
                }}
              ></hoops-switch>
            </div>
          </div>
        </fieldset>
      </div>
    `;
  }
}

export default HoopsSettingsGraphicsSectionElement;
