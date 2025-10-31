import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

import './hoops-settings-graphics-section';
import './hoops-settings-controls-section';
import './hoops-settings-interface-section';
import { getAllServices, isResettableConfigurationService } from '../services';

@customElement('hoops-settings-panel')
export class HoopsSettingsPanelElement extends LitElement {
  static styles = css`
    :host {
      height: 100%;
      overflow: auto;
    }
    .title {
      font-size: 1.2rem;
      font-weight: normal;
      margin: 0.5rem 0;
    }

    .configuration-section {
      margin-top: 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
      padding-bottom: 1rem;
    }

    hoops-button {
      border: 1px solid var(--hoops-neutral-foreground);
    }
  `;

  private resetToDefault() {
    Object.values(getAllServices()).forEach((service) => {
      if (!isResettableConfigurationService(service)) {
        return;
      }

      service.resetConfiguration();
    });
  }

  render() {
    return html`<div>
      <h2 class="title">Settings</h2>
      <hoops-accordion>
        <div slot="header">Graphics</div>
        <div slot="content">
          <hoops-settings-graphics-section></hoops-settings-graphics-section>
        </div>
      </hoops-accordion>
      <hoops-accordion>
        <div slot="header">Interface</div>
        <div slot="content">
          <hoops-settings-interface-section></hoops-settings-interface-section>
        </div>
      </hoops-accordion>
      <hoops-accordion>
        <div slot="header">Controls</div>
        <div slot="content">
          <hoops-settings-controls-section></hoops-settings-controls-section>
        </div>
      </hoops-accordion>
      <div class="configuration-section">
        <hoops-button @click=${this.resetToDefault}>Reset to Default</hoops-button>
      </div>
    </div>`;
  }
}

export default HoopsSettingsPanelElement;
