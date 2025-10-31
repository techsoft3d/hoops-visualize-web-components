import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { icons } from '@ts3d-hoops/ui-kit';

import WebViewerContextManager, { contextManagerContext } from '../context-manager';

@customElement('hoops-toolbar-home')
export class HoopsHomeButtonElement extends LitElement {
  @consume({ context: contextManagerContext })
  private contextManager?: WebViewerContextManager;

  private action() {
    if (this.contextManager) {
      this.contextManager.reset();
    }
  }

  protected override render(): unknown {
    return html`<hoops-icon-button size="sm" title="Home" @click=${this.action}
      >${icons.home}</hoops-icon-button
    >`;
  }
}

export default HoopsHomeButtonElement;
