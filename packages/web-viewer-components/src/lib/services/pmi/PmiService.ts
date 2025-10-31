import { CallbackMap, Color, core, NodeId } from '@ts3d-hoops/web-viewer';
import { IPmiService, isPmiServiceConfiguration } from './types';

export default class PmiService extends EventTarget implements IPmiService {
  public readonly serviceName = 'PmiService' as const;

  private _viewer?: core.IWebViewer = undefined;
  private callbackMap: CallbackMap = {};

  public static readonly DefaultConfig = {
    color: '#000000',
    isColorOverride: true,
  };

  private unbind() {
    if (!this._viewer) {
      return;
    }
    this._viewer.unsetCallbacks(this.callbackMap);
  }

  private bind() {
    if (!this._viewer) {
      return;
    }

    this._viewer.setCallbacks(this.callbackMap);
  }

  public async resetConfiguration(obj?: object): Promise<void> {
    const config = obj ?? PmiService.DefaultConfig;

    if (!isPmiServiceConfiguration(config)) {
      throw new Error('Invalid configuration object');
    }

    this.setPmiColor(config.color);
    await this.setPmiColorOverride(config.isColorOverride);
  }

  private reset(): void {
    this.dispatchEvent(
      new CustomEvent('hoops-pmi-service-reset', { bubbles: true, composed: true }),
    );
  }

  constructor() {
    super();
    this.callbackMap = {
      firstModelLoaded: () => {
        this.reset();
      },
      subtreeLoaded: () => {
        this.reset();
      },
      modelSwitched: () => {
        this.reset();
      },
    };
  }

  get viewer(): core.IWebViewer | undefined {
    return this._viewer;
  }

  set viewer(viewer: core.IWebViewer | undefined) {
    if (this._viewer === viewer) {
      return;
    }
    this.unbind();
    this._viewer = viewer;
    this.bind();
    this.reset();
  }

  getPmiColor(): string {
    if (!this.viewer) {
      return PmiService.DefaultConfig.color;
    }
    return this.viewer.model.getPmiColor().toHexString();
  }

  setPmiColor(color: string): void {
    if (!this.viewer) {
      throw new Error('Viewer is not set');
    }
    if (color === this.getPmiColor()) {
      return;
    }
    this.viewer.model.setPmiColor(Color.fromHexString(color));
    this.dispatchEvent(
      new CustomEvent('hoops-pmi-color-changed', { detail: color, bubbles: true, composed: true }),
    );
  }

  getPmiColorOverride(): boolean {
    if (!this.viewer) {
      return PmiService.DefaultConfig.isColorOverride;
    }
    return this.viewer.model.getPmiColorOverride();
  }

  async setPmiColorOverride(enableOverride: boolean, rootId?: NodeId): Promise<void> {
    if (!this.viewer) {
      throw new Error('Viewer is not set');
    }
    await this.viewer.model.setPmiColorOverride(enableOverride, rootId);
    this.dispatchEvent(
      new CustomEvent('hoops-pmi-color-override-changed', {
        detail: { enableOverride, rootId },
        bubbles: true,
        composed: true,
      }),
    );
  }
}
