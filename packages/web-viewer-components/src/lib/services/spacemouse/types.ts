import { IService } from '../types';

export interface ISpaceMouseService extends IService {
  /**
   * Connect to the space mouse. To be successful, the canvas where the mouse is
   * to be used must have focus.
   *
   * Note: If this is called but the 3d connexion software is not running,
   * a connection error will be shown in the console.
   */
  connect(): void;
}
