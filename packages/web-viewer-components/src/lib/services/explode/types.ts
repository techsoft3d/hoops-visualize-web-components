import { IPoint3 } from '@ts3d-hoops/web-viewer';
import { IService } from '../types';

/**
 * @interface IExplodeService
 * @extends IService
 *
 * @brief Service interface for managing explode feature of the web viewer.
 *
 * Provides methods to interface with the explode manager for controlling part explosion effects.
 */
export interface IExplodeService extends IService {
  reset(): void;
  start(nodeIds?: number[], explosionVector?: IPoint3): Promise<void>;
  setMagnitude(magnitude: number): Promise<void>;
  stop(): Promise<void>;
  getMagnitude(): number;
  getActive(): boolean;
}
