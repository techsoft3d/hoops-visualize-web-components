import { core, OperatorId } from '@ts3d-hoops/web-viewer';
import {
  CameraServiceConfiguration,
  ICameraService,
  isCameraServiceConfiguration,
  OrbitFallbackMode,
  Projection,
} from './types';
import {
  toServiceProjectionMode,
  toWebViewerProjectionMode,
  toServiceOrbitFallbackMode,
  toWebViewerOrbitFallbackMode,
} from './utils';

export default class CameraService extends EventTarget implements ICameraService {
  public readonly serviceName = 'CameraService' as const;

  private _webViewer?: core.IWebViewer;

  public static readonly DefaultConfig: CameraServiceConfiguration = {
    projectionMode: 'Orthographic',
    orbitFallbackMode: 'Model Center',
  };

  get webViewer(): core.IWebViewer | undefined {
    return this._webViewer;
  }

  set webViewer(webViewer: core.IWebViewer | undefined) {
    if (this._webViewer === webViewer) {
      return;
    }

    this._webViewer = webViewer;

    this.reset();
  }

  public getProjectionMode(): Projection {
    if (!this._webViewer) {
      return CameraService.DefaultConfig.projectionMode;
    }

    return toServiceProjectionMode(this._webViewer.view.getProjectionMode());
  }

  public setProjectionMode(projectionMode: Projection): void {
    if (!this._webViewer) {
      throw new Error('WebViewer is not set');
    }

    if (projectionMode === this.getProjectionMode()) {
      return;
    }

    this._webViewer.view.setProjectionMode(toWebViewerProjectionMode(projectionMode));
    this.dispatchEvent(
      new CustomEvent('hoops-projection-mode-changed', {
        detail: projectionMode,
        bubbles: true,
        composed: true,
      }),
    );
  }

  public getOrbitFallbackMode(): OrbitFallbackMode {
    if (!this._webViewer) {
      return CameraService.DefaultConfig.orbitFallbackMode;
    }

    const orbitOperator = this._webViewer.operatorManager.getOperator(OperatorId.Orbit);
    return toServiceOrbitFallbackMode(orbitOperator.getOrbitFallbackMode());
  }

  public setOrbitFallbackMode(fallbackMode: OrbitFallbackMode): void {
    if (!this._webViewer) {
      throw new Error('WebViewer is not set');
    }

    if (fallbackMode === this.getOrbitFallbackMode()) {
      return;
    }

    const orbitOperator = this._webViewer.operatorManager.getOperator(OperatorId.Orbit);
    orbitOperator.setOrbitFallbackMode(toWebViewerOrbitFallbackMode(fallbackMode));
    this.dispatchEvent(
      new CustomEvent('hoops-orbit-fallback-mode-changed', {
        detail: fallbackMode,
        bubbles: true,
        composed: true,
      }),
    );
  }

  async resetConfiguration(obj?: object): Promise<void> {
    if (!this._webViewer) {
      throw new Error('WebViewer is not set');
    }

    const config = obj ?? CameraService.DefaultConfig;

    if (!isCameraServiceConfiguration(config)) {
      throw new Error('Invalid camera configuration object');
    }

    this.setProjectionMode(config.projectionMode);
    this.setOrbitFallbackMode(config.orbitFallbackMode);
  }

  async reset(): Promise<void> {
    this.dispatchEvent(
      new CustomEvent('hoops-camera-service-reset', { bubbles: true, composed: true }),
    );
  }
}
