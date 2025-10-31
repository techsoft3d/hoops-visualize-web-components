import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';

import '@ts3d-hoops/ui-kit';
import { calculateWalkSpeedUnitFactor, getService, getWalkSpeedUnitName } from '../services';
import { IWalkOperatorService, WalkModeName } from '../services/walk-operator/types';
import { panelStyles } from './panel-styles';
import { ISpaceMouseService } from '../services';

@customElement('hoops-settings-controls-section')
export class HoopsSettingsControlsSectionElement extends LitElement {
  static override styles = [
    panelStyles,
    css`
      :host {
        display: block;
      }

      h3 {
        margin-top: 0;
      }
    `,
  ];

  private walkOperatorService!: IWalkOperatorService;
  private spaceMouseService!: ISpaceMouseService;

  private updateCallback = () => this.requestUpdate();

  private walkSpeedUnitFactor = -1;

  private updateUnitFactor = () => {
    const walkSpeed = this.walkOperatorService.getWalkSpeed();
    this.walkSpeedUnitFactor = calculateWalkSpeedUnitFactor(walkSpeed);
  };

  connectedCallback(): void {
    super.connectedCallback();
    this.walkOperatorService = getService<IWalkOperatorService>('WalkOperatorService');
    [
      'hoops-walk-mode-operator-reset',
      'hoops-mouse-walk-operator-reset',
      'hoops-keyboard-walk-operator-reset',
      'hoops-operators-walk-mode-changed',
      'hoops-operators-walk-rotation-speed-changed',
      'hoops-operators-walk-speed-changed',
      'hoops-operators-elevation-speed-changed',
      'hoops-operators-field-of-view-changed',
      'hoops-operators-mouse-look-enabled-changed',
      'hoops-operators-collision-detection-changed',
    ].map((event) => this.walkOperatorService.addEventListener(event, this.updateCallback));

    this.updateUnitFactor();

    this.spaceMouseService = getService<ISpaceMouseService>('SpaceMouseService');
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.walkOperatorService) {
      [
        'hoops-walk-mode-operator-reset',
        'hoops-mouse-walk-operator-reset',
        'hoops-keyboard-walk-operator-reset',
        'hoops-operators-walk-mode-changed',
        'hoops-operators-walk-rotation-speed-changed',
        'hoops-operators-walk-speed-changed',
        'hoops-operators-elevation-speed-changed',
        'hoops-operators-field-of-view-changed',
        'hoops-operators-mouse-look-enabled-changed',
        'hoops-operators-collision-detection-changed',
      ].map((event) => {
        this.walkOperatorService.removeEventListener(event, this.updateCallback);
      });
    }
  }

  protected override render() {
    const walkMode = this.walkOperatorService.getWalkMode();
    const isInKeyboardMode = walkMode === 'Keyboard';
    if (this.walkSpeedUnitFactor < 1) {
      this.updateUnitFactor();
    }
    const walkSpeedUnitName = getWalkSpeedUnitName(this.walkSpeedUnitFactor);

    return html`<div class="settings-root">
      <fieldset>
        <legend>Walk Mode</legend>
        <div class="settings-group">
          <div class="setting-row">
            <div class="setting-label" title="Walk Mode">Walk Mode:</div>
            <select
              class="hoops-select"
              id="walk-move-select"
              .value=${walkMode}
              @change=${(e: Event) => {
                const select = e.target as HTMLSelectElement;
                this.walkOperatorService.setWalkMode(select.value as WalkModeName);
              }}
            >
              <option value="Mouse" ?selected=${walkMode === 'Mouse'}>Mouse</option>
              <option value="Keyboard" ?selected=${walkMode === 'Keyboard'}>Keyboard</option>
            </select>
          </div>
          <div
            class=${classMap({ 'navigation-group': true, disabled: !isInKeyboardMode })}
            title=${ifDefined(isInKeyboardMode ? undefined : 'Keyboard mode is not enabled')}
            ?hidden=${!isInKeyboardMode}
          >
            <h3>Navigation Keys</h3>
            <div class="settings-group">
              <div class="setting-row">
                <div class="setting-label">Move:</div>
                <div>W / A / S / D</div>
              </div>
              <div class="setting-row">
                <div class="setting-label">Rotate:</div>
                <div>Q / E</div>
              </div>
              <div class="setting-row">
                <div class="setting-label">Up / Down:</div>
                <div>X / C</div>
              </div>
              <div class="setting-row">
                <div class="setting-label">Tilt:</div>
                <div>R / F</div>
              </div>
              <div class="setting-row">
                <div class="setting-label">Toggle Collision Detection:</div>
                <div>V</div>
              </div>
            </div>
            <hoops-separator direction="horizontal"></hoops-separator>
          </div>
          <div class="setting-row">
            <div class="setting-label" title="Rotation (Deg/s)">Rotation (Deg/s):</div>
            <input
              type="number"
              min="0"
              step="1"
              .value=${this.walkOperatorService.getRotationSpeed()}
              @change=${(e: Event) => {
                const input = e.target as HTMLInputElement;
                this.walkOperatorService.setRotationSpeed(parseInt(input.value, 10));
              }}
            />
          </div>
          <div class="setting-row">
            <div class="setting-label" title=${`Walk Speed (${walkSpeedUnitName}/s)`}>
              Walk Speed (${walkSpeedUnitName}/s):
            </div>
            <input
              type="number"
              min="0.1"
              step="0.1"
              .value=${(this.walkOperatorService.getWalkSpeed() / this.walkSpeedUnitFactor).toFixed(
                1,
              )}
              @change=${(e: Event) => {
                const input = e.target as HTMLInputElement;
                this.walkOperatorService.setWalkSpeed(
                  (Math.trunc(parseFloat(input.value) * 10) / 10) * this.walkSpeedUnitFactor,
                );
              }}
            />
          </div>
          <div class="setting-row">
            <div class="setting-label" title=${`Elevation Speed (${walkSpeedUnitName}/s)`}>
              Elevation Speed (${walkSpeedUnitName}/s):
            </div>
            <input
              type="number"
              min="0.01"
              step="0.01"
              .value=${(
                this.walkOperatorService.getElevationSpeed() / this.walkSpeedUnitFactor
              ).toFixed(1)}
              @change=${(e: Event) => {
                const input = e.target as HTMLInputElement;
                this.walkOperatorService.setElevationSpeed(
                  (Math.trunc(parseFloat(input.value) * 10) / 10) * this.walkSpeedUnitFactor,
                );
              }}
            />
          </div>
          <div class="setting-row">
            <div class="setting-label" title="Field of View (Deg)">Field of View (Deg):</div>
            <input
              type="number"
              min="1"
              step="1"
              .value=${this.walkOperatorService.getFieldOfView()}
              @change=${(e: Event) => {
                const input = e.target as HTMLInputElement;
                this.walkOperatorService.setFieldOfView(parseInt(input.value, 10));
              }}
            />
          </div>
          <div class="setting-row">
            <div
              class=${classMap({ 'setting-label': true, disabled: !isInKeyboardMode })}
              data-testid="enable-mouse-look-row"
              style="display: flex; align-items: center; gap: 0.75rem"
              data-testid="enable-mouse-look"
            >
              <span class="setting-label" title="Enable Mouse Look">Enable Mouse Look:</span>
              <hoops-switch
                label="Enable Mouse Look"
                ?checked=${this.walkOperatorService.isMouseLookEnabled()}
                @change=${(e: Event) => {
                  const input = e.target as HTMLInputElement;
                  this.walkOperatorService.setMouseLookEnabled(input.checked);
                }}
                ?disabled=${!isInKeyboardMode}
              ></hoops-switch>
            </div>
            <div
              class=${classMap({ 'setting-label': true, disabled: !isInKeyboardMode })}
              data-testid="speed-row"
              style="display: flex; align-items: center; gap: 0.75rem"
            >
              <span class="setting-label" title="Speed">Speed:</span>
              <input
                ?disabled=${!isInKeyboardMode || !this.walkOperatorService.isMouseLookEnabled()}
                type="number"
                min="1"
                step="1"
                .value=${this.walkOperatorService.getMouseLookSpeed()}
                @change=${(e: Event) => {
                  const input = e.target as HTMLInputElement;
                  this.walkOperatorService.setMouseLookSpeed(parseInt(input.value, 10));
                }}
              />
            </div>
          </div>
          <div class="setting-row">
            <div class="setting-label" title="Enable Collision Detection">
              Enable Collision Detection:
            </div>
            <hoops-switch
              label="Enable Collision Detection"
              ?checked=${this.walkOperatorService.isCollisionDetectionEnabled()}
              @change=${(e: Event) => {
                const input = e.target as HTMLInputElement;
                this.walkOperatorService.setCollisionDetectionEnabled(input.checked);
              }}
            ></hoops-switch>
          </div>
        </div>
      </fieldset>
      <fieldset>
        <legend>Space Mouse</legend>
        <div class="setting-row" style="height: 2rem;">
          <div class="setting-label">Connect space mouse:</div>
          <hoops-button
            title="Connect space mouse"
            @click=${() => {
              this.spaceMouseService.connect();
            }}
          >
            Connect
          </hoops-button>
        </div>
      </fieldset>
    </div>`;
  }
}
