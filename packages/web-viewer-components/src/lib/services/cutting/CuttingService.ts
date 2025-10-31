import { Color, core } from '@ts3d-hoops/web-viewer';
import {
  CuttingServiceConfiguration,
  ICuttingService,
  isCuttingServiceConfiguration,
} from './types';

export default class CuttingService extends EventTarget implements ICuttingService {
  public readonly serviceName = 'CuttingService' as const;

  private _cuttingManager?: core.ICuttingManager;

  public static readonly DefaultConfig: CuttingServiceConfiguration = {
    cappingGeometryVisibility: true,
    cappingFaceColor: '#808080',
    cappingLineColor: '#808080',
  };

  public get cuttingManager(): core.ICuttingManager | undefined {
    return this._cuttingManager;
  }

  public set cuttingManager(cuttingManager: core.ICuttingManager | undefined) {
    this._cuttingManager = cuttingManager;
    this.dispatchEvent(
      new CustomEvent('hoops-cutting-service-reset', { bubbles: true, composed: true }),
    );
  }

  public getCappingGeometryVisibility(): boolean {
    if (!this._cuttingManager) {
      return CuttingService.DefaultConfig.cappingGeometryVisibility;
    }
    return this._cuttingManager.getCappingGeometryVisibility();
  }

  public async setCappingGeometryVisibility(cappingGeometryVisibility: boolean): Promise<void> {
    if (!this._cuttingManager) {
      throw new Error('Cutting manager not set');
    }
    await this._cuttingManager.setCappingGeometryVisibility(cappingGeometryVisibility);
    this.dispatchEvent(
      new CustomEvent('hoops-capping-geometry-visibility-changed', {
        bubbles: true,
        composed: true,
        detail: cappingGeometryVisibility,
      }),
    );
  }

  public getCappingFaceColor(): string | undefined {
    if (!this._cuttingManager) {
      return CuttingService.DefaultConfig.cappingFaceColor;
    }
    const faceColor = this._cuttingManager.getCappingFaceColor();
    return faceColor?.toHexString();
  }

  public async setCappingFaceColor(color?: string): Promise<void> {
    if (!this._cuttingManager) {
      throw new Error('Cutting manager not set');
    }
    await this._cuttingManager.setCappingFaceColor(color ? Color.fromHexString(color) : null);
    this.dispatchEvent(
      new CustomEvent('hoops-capping-face-color-changed', {
        bubbles: true,
        composed: true,
        detail: color,
      }),
    );
  }

  public getCappingLineColor(): string | undefined {
    if (!this._cuttingManager) {
      return CuttingService.DefaultConfig.cappingLineColor;
    }
    const lineColor = this._cuttingManager.getCappingLineColor();
    return lineColor?.toHexString();
  }

  public async setCappingLineColor(color?: string): Promise<void> {
    if (!this._cuttingManager) {
      throw new Error('Cutting manager not set');
    }
    await this._cuttingManager.setCappingLineColor(color ? Color.fromHexString(color) : null);
    this.dispatchEvent(
      new CustomEvent('hoops-capping-line-color-changed', {
        bubbles: true,
        composed: true,
        detail: color,
      }),
    );
  }

  public async resetConfiguration(obj?: object): Promise<void> {
    if (!this._cuttingManager) {
      throw new Error('Cutting manager not set');
    }

    const config = obj ?? CuttingService.DefaultConfig;

    if (!isCuttingServiceConfiguration(config)) {
      throw new Error('Invalid cutting configuration object');
    }

    this.setCappingGeometryVisibility(config.cappingGeometryVisibility);
    this.setCappingFaceColor(config.cappingFaceColor);
    this.setCappingLineColor(config.cappingLineColor);
  }
}
