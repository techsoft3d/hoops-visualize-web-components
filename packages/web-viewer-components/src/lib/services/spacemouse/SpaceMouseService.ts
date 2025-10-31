import { Operators } from '@ts3d-hoops/web-viewer';
import { ISpaceMouseService } from './types';

export default class SpaceMouseService extends EventTarget implements ISpaceMouseService {
  public readonly serviceName = 'SpaceMouseService' as const;

  private _spaceMouseOperator?: Operators.SpaceMouseOperator;

  get spaceMouseOperator(): Operators.SpaceMouseOperator | undefined {
    return this._spaceMouseOperator;
  }

  set spaceMouseOperator(spaceMouseOperator: Operators.SpaceMouseOperator | undefined) {
    if (this._spaceMouseOperator === spaceMouseOperator) {
      return;
    }

    this._spaceMouseOperator = spaceMouseOperator;
  }

  public connect(): void {
    if (!this._spaceMouseOperator) {
      throw new Error('SpaceMouseOperator is not initialized');
    }

    this._spaceMouseOperator.connect();

    this.dispatchEvent(
      new CustomEvent('hoops-spacemouse-connected', {
        bubbles: true,
        composed: true,
      }),
    );
  }
}
