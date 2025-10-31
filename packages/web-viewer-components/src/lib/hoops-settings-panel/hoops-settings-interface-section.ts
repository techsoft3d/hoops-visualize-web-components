import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { classMap } from 'lit-html/directives/class-map.js';

import '@ts3d-hoops/ui-kit';
import { IViewService } from '../services/view/types';
import { getService } from '../services';
import {
  AutoActivationModeName,
  AutoActivationModeNames,
  IFloorplanService,
  OrientationName,
  OrientationNames,
} from '../services/floorplan';
import { panelStyles } from './panel-styles';

@customElement('hoops-settings-interface-section')
export class HoopsSettingsInterfaceSectionElement extends LitElement {
  static styles = [
    panelStyles,
    css`
      :host {
        display: block;
      }
    `,
  ];

  private viewService!: IViewService;

  private floorplanService!: IFloorplanService;

  private updateCallback = () => this.requestUpdate();

  connectedCallback(): void {
    super.connectedCallback();
    this.viewService = getService<IViewService>('ViewService');
    this.floorplanService = getService<IFloorplanService>('FloorplanService');
    [
      'hoops-view-axis-triad-visibility-changed',
      'hoops-view-nav-cube-visibility-changed',
      'hoops-view-reset',
    ].map((event) => this.viewService.addEventListener(event, this.updateCallback));

    [
      'hoops-floorplan-activation-changed',
      'hoops-floorplan-track-camera-changed',
      'hoops-floorplan-orientation-changed',
      'hoops-floorplan-auto-activation-changed',
      'hoops-floorplan-overlay-feet-per-pixel-changed',
      'hoops-floorplan-overlay-zoom-level-changed',
      'hoops-floorplan-overlay-background-opacity-changed',
      'hoops-floorplan-overlay-border-opacity-changed',
      'hoops-floorplan-overlay-avatar-opacity-changed',
      'hoops-floorplan-background-color-changed',
      'hoops-floorplan-border-color-changed',
      'hoops-floorplan-avatar-color-changed',
      'hoops-floorplan-avatar-outline-color-changed',
      'hoops-floorplan-manager-reset',
    ].map((event) => this.floorplanService.addEventListener(event, this.updateCallback));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.viewService) {
      [
        'hoops-view-axis-triad-visibility-changed',
        'hoops-view-nav-cube-visibility-changed',
        'hoops-view-reset',
      ].map((event) => {
        this.viewService.removeEventListener(event, this.updateCallback);
      });
    }

    if (this.floorplanService) {
      [
        'hoops-floorplan-activation-changed',
        'hoops-floorplan-track-camera-changed',
        'hoops-floorplan-orientation-changed',
        'hoops-floorplan-auto-activation-changed',
        'hoops-floorplan-overlay-feet-per-pixel-changed',
        'hoops-floorplan-overlay-zoom-level-changed',
        'hoops-floorplan-overlay-background-opacity-changed',
        'hoops-floorplan-overlay-border-opacity-changed',
        'hoops-floorplan-overlay-avatar-opacity-changed',
        'hoops-floorplan-background-color-changed',
        'hoops-floorplan-border-color-changed',
        'hoops-floorplan-avatar-color-changed',
        'hoops-floorplan-avatar-outline-color-changed',
        'hoops-floorplan-manager-reset',
      ].map((event) => {
        this.floorplanService.removeEventListener(event, this.updateCallback);
      });
    }
  }

  protected render(): unknown {
    const floorplanActive = this.floorplanService.isActive();
    const orientation = this.floorplanService.getOrientation();
    const autoActivationMode = this.floorplanService.getAutoActivationMode();
    const trackCameraEnabled = this.floorplanService.isTrackCameraEnabled();

    const trackCameraDependantLabelClass = { disabled: !trackCameraEnabled };

    return html`<div class="settings-root">
      <fieldset>
        <legend>Axis</legend>
        <div class="settings-group">
          <div class="setting-row">
            <div class="setting-label">Show Axis Triad:</div>
            <hoops-switch
              id="show-axis-triad"
              label="Show Axis Triad"
              ?checked=${this.viewService.isAxisTriadVisible()}
              @change=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                this.viewService.setAxisTriadVisible(target.checked);
              }}
            ></hoops-switch>
          </div>
          <div class="setting-row">
            <div class="setting-label">Show Nav Cube:</div>
            <hoops-switch
              id="show-nav-cube"
              label="Show Nav Cube"
              ?checked=${this.viewService.isNavCubeVisible()}
              @change=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                this.viewService.setNavCubeVisible(target.checked);
              }}
            ></hoops-switch>
          </div>
        </div>
      </fieldset>
      <fieldset>
        <legend>Floorplan</legend>
        <div class="settings-group">
          <div class="setting-row">
            <div class="setting-label">Activate FloorPlan:</div>
            <hoops-switch
              id="activate-floorplan"
              label="Activate Floorplan"
              ?checked=${floorplanActive}
              @change=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                this.floorplanService.setActive(target.checked);
              }}
            ></hoops-switch>
          </div>
          <div class="setting-row">
            <div class="setting-label">Track Camera:</div>
            <hoops-switch
              id="track-camera"
              label="Track Camera"
              ?checked=${trackCameraEnabled}
              @change=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                this.floorplanService.setTrackCameraEnabled(target.checked);
              }}
            ></hoops-switch>
          </div>
          <div class="setting-row">
            <div class="setting-label">Orientation:</div>
            <select
              name="orientation"
              id="orientation"
              .value=${orientation}
              @change=${(event: Event) => {
                const select = event.target as HTMLSelectElement;
                const value = select.value as OrientationName;
                this.floorplanService.setOrientation(value);
              }}
            >
              ${OrientationNames.map((value) => {
                return html`<option value=${value} ?selected=${orientation === value}>
                  ${value}
                </option>`;
              })}
            </select>
          </div>
          <div class="setting-row">
            <div class="setting-label">Auto Activation:</div>
            <select
              name="auto-activation"
              id="auto-activation"
              .value=${autoActivationMode}
              @change=${(event: Event) => {
                const select = event.target as HTMLSelectElement;
                const value = select.value as AutoActivationModeName;
                this.floorplanService.setAutoActivationMode(value);
              }}
            >
              ${AutoActivationModeNames.map((value) => {
                return html`<option value=${value} ?selected=${autoActivationMode === value}>
                  ${value}
                </option>`;
              })}
            </select>
          </div>
          <div class="setting-row">
            <div class="setting-label ${classMap(trackCameraDependantLabelClass)}">
              Overlay Feet per Pixel:
            </div>
            <input
              type="number"
              id="overlay-feet-per-pixel"
              .value=${this.floorplanService.getOverlayFeetPerPixel()}
              step="0.1"
              ?disabled=${!trackCameraEnabled}
              @input=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                let value = parseFloat(target.value);
                if (!isNaN(value)) {
                  value = Math.trunc(value * 10) / 10;
                  this.floorplanService.setOverlayFeetPerPixel(value);
                } else {
                  console.warn('Invalid input for Overlay Feet per Pixel');
                }
              }}
            />
          </div>
          <div class="setting-row">
            <div class="setting-label ${classMap(trackCameraDependantLabelClass)}">
              Overlay Zoom Level:
            </div>
            <input
              type="number"
              id="overlay-zoom-level"
              .value=${this.floorplanService.getOverlayZoomLevel()}
              step="1"
              ?disabled=${!trackCameraEnabled}
              @input=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                const value = parseInt(target.value, 10);
                if (!isNaN(value)) {
                  this.floorplanService.setOverlayZoomLevel(value);
                } else {
                  console.warn('Invalid input for Overlay Zoom Level');
                }
              }}
            />
          </div>
          <div class="setting-row">
            <div class="setting-label">Overlay Background Opacity:</div>
            <input
              type="number"
              id="overlay-background-opacity"
              .value=${this.floorplanService.getOverlayBackgroundOpacity()}
              step="0.01"
              min="0"
              max="1"
              @input=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                let value = parseFloat(target.value);
                if (!isNaN(value)) {
                  value = Math.trunc(value * 100) / 100;
                  this.floorplanService.setOverlayBackgroundOpacity(value);
                } else {
                  console.warn('Invalid input for Overlay Background Opacity');
                }
              }}
            />
          </div>
          <div class="setting-row">
            <div class="setting-label">Overlay Border Opacity:</div>
            <input
              type="number"
              id="overlay-border-opacity"
              .value=${this.floorplanService.getOverlayBorderOpacity()}
              step="0.01"
              min="0"
              max="1"
              @input=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                let value = parseFloat(target.value);
                if (!isNaN(value)) {
                  value = Math.trunc(value * 100) / 100;
                  this.floorplanService.setOverlayBorderOpacity(value);
                } else {
                  console.warn('Invalid input for Overlay Border Opacity');
                }
              }}
            />
          </div>
          <div class="setting-row">
            <div class="setting-label">Overlay Avatar Opacity:</div>
            <input
              type="number"
              id="overlay-avatar-opacity"
              .value=${this.floorplanService.getOverlayAvatarOpacity()}
              step="0.01"
              min="0"
              max="1"
              @input=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                let value = parseFloat(target.value);
                if (!isNaN(value)) {
                  value = Math.trunc(value * 100) / 100;
                  this.floorplanService.setOverlayAvatarOpacity(value);
                } else {
                  console.warn('Invalid input for Overlay Avatar Opacity');
                }
              }}
            />
          </div>
          <div class="setting-row">
            <div class="setting-label">Background Color:</div>
            <label>
              ${this.floorplanService.getFloorplanBackgroundColor()}
              <input
                type="color"
                id="floorplan-background-color"
                .value=${this.floorplanService.getFloorplanBackgroundColor()}
                @change=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = target.value;
                  this.floorplanService.setFloorplanBackgroundColor(value);
                }}
              />
            </label>
          </div>
          <div class="setting-row">
            <div class="setting-label">Border Color:</div>
            <label>
              ${this.floorplanService.getFloorplanBorderColor()}
              <input
                type="color"
                id="floorplan-border-color"
                .value=${this.floorplanService.getFloorplanBorderColor()}
                @change=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = target.value;
                  this.floorplanService.setFloorplanBorderColor(value);
                }}
              />
            </label>
          </div>
          <div class="setting-row">
            <div class="setting-label">Avatar Color:</div>
            <label>
              ${this.floorplanService.getFloorplanAvatarColor()}
              <input
                type="color"
                id="floorplan-avatar-color"
                .value=${this.floorplanService.getFloorplanAvatarColor()}
                @change=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = target.value;
                  this.floorplanService.setFloorplanAvatarColor(value);
                }}
              />
            </label>
          </div>
          <div class="setting-row">
            <div class="setting-label">Avatar Outline Color:</div>
            <label>
              ${this.floorplanService.getFloorplanAvatarOutlineColor()}
              <input
                type="color"
                id="floorplan-avatar-outline-color"
                .value=${this.floorplanService.getFloorplanAvatarOutlineColor()}
                @change=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = target.value;
                  this.floorplanService.setFloorplanAvatarOutlineColor(value);
                }}
              />
            </label>
          </div>
        </div>
      </fieldset>
    </div>`;
  }
}

export default HoopsSettingsInterfaceSectionElement;
