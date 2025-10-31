import { IPoint3, core, Point3 } from '@ts3d-hoops/web-viewer';
import { IExplodeService } from './types';

export default class ExplodeService extends EventTarget implements IExplodeService {
  public readonly serviceName = 'ExplodeService' as const;

  private _webviewer?: core.IWebViewer;

  public get webViewer(): core.IWebViewer | undefined {
    return this._webviewer;
  }

  public set webViewer(value: core.IWebViewer | undefined) {
    if (this._webviewer === value) {
      return;
    }

    this._webviewer = value;
    this.reset();
  }

  /**
   * Resets the explode service, clearing any active operations.
   */
  public reset(): void {
    this.dispatchEvent(
      new CustomEvent('hoops-explode-service-reset', { bubbles: true, composed: true }),
    );
  }

  /**
   * Starts an explode operation. This will cancel any currently active explode operation.
   * @param nodeIds an array of node Ids for the parts that should be exploded. If this parameter is omitted or is an empty array, the entire model will be considered for explosion.
   * @param explosionVector the vector to use for the center of the explosion.
   * @returns a promise that resolves when this operation is complete.
   */
  public async start(nodeIds?: number[], explosionVector?: IPoint3): Promise<void> {
    if (!this._webviewer) {
      return Promise.reject(new Error('Webviewer not set'));
    }

    await this._webviewer.explodeManager.start(
      nodeIds,
      explosionVector
        ? new Point3(explosionVector.x, explosionVector.y, explosionVector.z)
        : undefined,
    );

    this.dispatchEvent(
      new CustomEvent('hoops-explode-started', {
        bubbles: true,
        composed: true,
        detail: { nodeIds, explosionVector },
      }),
    );
  }

  /**
   * Sets the explosion magnitude if there is an active explosion operation.
   * A value of 1.0 indicates that the distance between a part's exploded center, and exploded center will be double.
   * @param magnitude the magnitude for the explosion.
   * @returns a promise that resolves when this operation is complete.
   */
  public async setMagnitude(magnitude: number): Promise<void> {
    if (!this._webviewer) {
      return Promise.reject(new Error('Webviewer not set'));
    }

    await this._webviewer.explodeManager.setMagnitude(magnitude);

    this.dispatchEvent(
      new CustomEvent('hoops-explode-magnitude-changed', {
        bubbles: true,
        composed: true,
        detail: magnitude,
      }),
    );
  }

  /**
   * Terminates any active explode operation.
   * @returns a promise that resolves when this operation is complete.
   */
  public async stop(): Promise<void> {
    if (!this._webviewer) {
      return Promise.reject(new Error('Webviewer not set'));
    }

    await this._webviewer.explodeManager.stop();

    this.dispatchEvent(
      new CustomEvent('hoops-explode-stopped', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Gets the current explode magnitude. This will always return 0 when there is no active explode operation.
   * @returns the current explode magnitude.
   */
  public getMagnitude(): number {
    if (!this._webviewer) {
      return 0;
    }

    return this._webviewer.explodeManager.getMagnitude();
  }

  /**
   * Indicates whether there is a currently active explode operation.
   * @returns boolean value indicating if there is an active explode operation.
   */
  public getActive(): boolean {
    if (!this._webviewer) {
      return false;
    }

    return this._webviewer.explodeManager.getActive();
  }
}
