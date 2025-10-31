import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { icons } from '@ts3d-hoops/ui-kit';
import { WebViewer } from '@ts3d-hoops/web-viewer';
import { getService, IExplodeService } from '../services';

@customElement('hoops-toolbar-explode')
export class HoopsExplodeButtonElement extends LitElement {
  /**
   * Represents the position where the dropdown is located relative to the button.
   * Possible values are "bottom", "top", "right", or "left".
   * Default value is "right".
   */
  @property()
  dropDownPosition: 'bottom' | 'top' | 'right' | 'left' = 'right';

  @property({ type: Object })
  webViewer: WebViewer | null = null;

  private explodeService!: IExplodeService;

  handleServiceUpdate = (): void => this.requestUpdate();

  connectedCallback(): void {
    super.connectedCallback();
    this.explodeService = getService<IExplodeService>('ExplodeService');
    this.explodeService.addEventListener('hoops-explode-service-reset', this.handleServiceUpdate);
    this.explodeService.addEventListener(
      'hoops-explode-magnitude-changed',
      this.handleServiceUpdate,
    );
  }

  disconnectedCallback(): void {
    if (this.explodeService) {
      this.explodeService.removeEventListener(
        'hoops-explode-service-reset',
        this.handleServiceUpdate,
      );
      this.explodeService.removeEventListener(
        'hoops-explode-magnitude-changed',
        this.handleServiceUpdate,
      );
    }
  }

  /**
   * Handles explode value changes from the slider
   * @param e Input event from the range slider
   */
  async handleExplodeChange(e: Event): Promise<void> {
    if (!this.webViewer) {
      return;
    }

    if (!this.explodeService.getActive()) {
      const modelBounding = await this.webViewer.model.getModelBounding(true, true);

      const explodeCenter = modelBounding.center();
      const explodeNodes = undefined;

      await this.explodeService.start(explodeNodes, explodeCenter);
    }

    const inputValue = (e.target as HTMLInputElement).value;
    const magnitude = parseFloat(inputValue);
    this.explodeService.setMagnitude(magnitude);
  }

  protected override render(): unknown {
    return html` <hoops-dropdown position=${this.dropDownPosition} preventCloseOnClickInside>
      <hoops-icon-button size="sm" title="Explode">${icons.explode}</hoops-icon-button>
      <div class="dropdown-content" slot="dropdown-popup">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value="${this.explodeService.getMagnitude()}"
          @input=${this.handleExplodeChange}
        />
      </div>
    </hoops-dropdown>`;
  }
}

export default HoopsExplodeButtonElement;
