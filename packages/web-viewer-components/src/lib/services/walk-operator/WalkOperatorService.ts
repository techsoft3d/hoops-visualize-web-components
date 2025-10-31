import { CallbackMap, Operators, WalkMode } from '@ts3d-hoops/web-viewer';
import { isWalkOperatorServiceConfiguration, IWalkOperatorService, WalkModeName } from './types';
import { stringToWalkMode, walkModeToString } from './utils';

export class WalkOperatorService extends EventTarget implements IWalkOperatorService {
  public readonly serviceName = 'WalkOperatorService' as const;

  private _walkModeOperator?: Operators.Camera.CameraWalkModeOperator;
  private _mouseWalkOperator?: Operators.Camera.CameraWalkOperator;
  private _keyboardWalkOperator?: Operators.Camera.CameraKeyboardWalkOperator;

  private callbackMap: CallbackMap;

  public static readonly DefaultConfiguration = {
    walkMode: 'Mouse' as WalkModeName,
    mouseLookEnabled: true,
    collisionDetectionEnabled: false,
  };

  constructor(options?: {
    walkModeOperator?: Operators.Camera.CameraWalkModeOperator;
    mouseWalkOperator?: Operators.Camera.CameraWalkOperator;
    keyboardWalkOperator?: Operators.Camera.CameraKeyboardWalkOperator;
  }) {
    super();
    this._walkModeOperator = options?.walkModeOperator;
    this._mouseWalkOperator = options?.mouseWalkOperator ?? options?.walkModeOperator?.walkOperator;
    this._keyboardWalkOperator =
      options?.keyboardWalkOperator ?? options?.walkModeOperator?.keyboardWalkOperator;

    this.callbackMap = {
      firstModelLoaded: async () => {
        if (this._keyboardWalkOperator && this._keyboardWalkOperator.getWalkSpeed() <= 0) {
          await this._keyboardWalkOperator.resetDefaultWalkSpeeds();
          this.dispatchEvent(
            new CustomEvent('hoops-keyboard-walk-operator-reset', {
              bubbles: true,
              composed: true,
            }),
          );
        }

        if (this._mouseWalkOperator && this._mouseWalkOperator.getWalkSpeed() <= 0) {
          await this._mouseWalkOperator.resetDefaultWalkSpeeds();
          this.dispatchEvent(
            new CustomEvent('hoops-mouse-walk-operator-reset', {
              bubbles: true,
              composed: true,
            }),
          );
        }
      },
    };

    if (this._walkModeOperator) {
      this.bind();
    }
  }

  get walkModeOperator(): Operators.Camera.CameraWalkModeOperator | undefined {
    return this._walkModeOperator;
  }

  set walkModeOperator(value: Operators.Camera.CameraWalkModeOperator | undefined) {
    if (this._walkModeOperator === value) {
      return; // No change, do nothing
    }

    if (this._walkModeOperator) {
      this.unbind();
    }

    this._walkModeOperator = value;
    this.mouseWalkOperator = value?.walkOperator;
    this.keyboardWalkOperator = value?.keyboardWalkOperator;

    this.bind();
    this.dispatchEvent(
      new CustomEvent('hoops-walk-mode-operator-reset', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  get mouseWalkOperator(): Operators.Camera.CameraWalkOperator | undefined {
    return this._mouseWalkOperator;
  }

  set mouseWalkOperator(value: Operators.Camera.CameraWalkOperator | undefined) {
    if (this._mouseWalkOperator === value) {
      return; // No change, do nothing
    }

    this._mouseWalkOperator = value;
    this.dispatchEvent(
      new CustomEvent('hoops-mouse-walk-operator-reset', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  get keyboardWalkOperator(): Operators.Camera.CameraKeyboardWalkOperator | undefined {
    return this._keyboardWalkOperator;
  }

  set keyboardWalkOperator(value: Operators.Camera.CameraKeyboardWalkOperator | undefined) {
    if (this._keyboardWalkOperator === value) {
      return; // No change, do nothing
    }

    this._keyboardWalkOperator = value;
    this.dispatchEvent(
      new CustomEvent('hoops-keyboard-walk-operator-reset', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  getWalkMode(): WalkModeName {
    return walkModeToString(this._walkModeOperator?.getWalkMode() ?? WalkMode.Mouse);
  }

  async setWalkMode(mode: WalkModeName): Promise<void> {
    if (!this._walkModeOperator) {
      throw new Error('WalkModeOperator is not initialized');
    }

    await this._walkModeOperator.setWalkMode(stringToWalkMode(mode));
    this.dispatchEvent(
      new CustomEvent('hoops-operators-walk-mode-changed', {
        detail: { mode },
        bubbles: true,
        composed: true,
      }),
    );
  }

  getRotationSpeed(): number {
    if (!this._walkModeOperator || !this._keyboardWalkOperator || !this._mouseWalkOperator) {
      return 0;
    }

    const op =
      this._walkModeOperator.getWalkMode() === WalkMode.Mouse
        ? this._mouseWalkOperator
        : this._keyboardWalkOperator;

    return op.getRotationSpeed();
  }

  setRotationSpeed(value: number) {
    if (!this._walkModeOperator) {
      throw new Error('Walk Operators are not initialized');
    }

    this._walkModeOperator.setRotationSpeed(value);
    this.dispatchEvent(
      new CustomEvent('hoops-operators-walk-rotation-speed-changed', {
        detail: { speed: value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  getWalkSpeed(): number {
    if (!this._walkModeOperator || !this._keyboardWalkOperator || !this._mouseWalkOperator) {
      return 0;
    }

    const op =
      this._walkModeOperator.getWalkMode() === WalkMode.Mouse
        ? this._mouseWalkOperator
        : this._keyboardWalkOperator;

    return op.getWalkSpeed();
  }

  setWalkSpeed(value: number) {
    if (!this._walkModeOperator) {
      throw new Error('Walk Operators are not initialized');
    }

    this._walkModeOperator.setWalkSpeed(value);
    this.dispatchEvent(
      new CustomEvent('hoops-operators-walk-speed-changed', {
        detail: { speed: value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  getElevationSpeed(): number {
    if (!this._walkModeOperator || !this._keyboardWalkOperator || !this._mouseWalkOperator) {
      return 0;
    }

    const op =
      this._walkModeOperator.getWalkMode() === WalkMode.Mouse
        ? this._mouseWalkOperator
        : this._keyboardWalkOperator;

    return op.getElevationSpeed();
  }

  setElevationSpeed(value: number) {
    if (!this._walkModeOperator) {
      throw new Error('Walk Operators are not initialized');
    }

    this._walkModeOperator.setElevationSpeed(value);
    this.dispatchEvent(
      new CustomEvent('hoops-operators-elevation-speed-changed', {
        detail: { speed: value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  getFieldOfView(): number {
    if (!this._walkModeOperator || !this._keyboardWalkOperator || !this._mouseWalkOperator) {
      return 0;
    }

    const op =
      this._walkModeOperator.getWalkMode() === WalkMode.Mouse
        ? this._mouseWalkOperator
        : this._keyboardWalkOperator;

    return op.getViewAngle();
  }

  setFieldOfView(value: number) {
    if (!this._walkModeOperator) {
      throw new Error('Walk Operators are not initialized');
    }

    this._walkModeOperator.setViewAngle(value);
    this.dispatchEvent(
      new CustomEvent('hoops-operators-field-of-view-changed', {
        detail: { fov: value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  isMouseLookEnabled(): boolean {
    return this._keyboardWalkOperator?.getMouseLookEnabled() ?? false;
  }

  setMouseLookEnabled(enabled: boolean) {
    if (!this._keyboardWalkOperator) {
      throw new Error('Walk Operators are not initialized');
    }

    this._keyboardWalkOperator.setMouseLookEnabled(enabled);
    this.dispatchEvent(
      new CustomEvent('hoops-operators-mouse-look-enabled-changed', {
        detail: { enabled },
        bubbles: true,
        composed: true,
      }),
    );
  }

  getMouseLookSpeed(): number {
    return this._keyboardWalkOperator?.getMouseLookSpeed() ?? 0;
  }

  setMouseLookSpeed(speed: number): void {
    if (!this._keyboardWalkOperator) {
      throw new Error('Walk Operators are not initialized');
    }

    this._keyboardWalkOperator.setMouseLookSpeed(speed);
    this.dispatchEvent(
      new CustomEvent('hoops-operators-mouse-look-speed-changed', {
        detail: { speed },
        bubbles: true,
        composed: true,
      }),
    );
  }

  isCollisionDetectionEnabled(): boolean {
    if (!this._walkModeOperator || !this._keyboardWalkOperator || !this._mouseWalkOperator) {
      return false;
    }
    const op =
      this._walkModeOperator.getWalkMode() === WalkMode.Mouse
        ? this._mouseWalkOperator
        : this._keyboardWalkOperator;

    return op.getBimModeEnabled();
  }

  async setCollisionDetectionEnabled(enabled: boolean) {
    if (!this._walkModeOperator) {
      throw new Error('Walk Operators are not initialized');
    }

    await this._walkModeOperator.setBimModeEnabled(enabled);
    this.dispatchEvent(
      new CustomEvent('hoops-operators-collision-detection-changed', {
        detail: { enabled },
        bubbles: true,
        composed: true,
      }),
    );
  }

  reset(): void {
    if (!this._walkModeOperator || !this._mouseWalkOperator || !this._keyboardWalkOperator) {
      throw new Error('Walk Operators are not initialized');
    }

    this._mouseWalkOperator.resetDefaultWalkSpeeds();
    this._keyboardWalkOperator.resetDefaultWalkSpeeds();

    this.dispatchEvent(
      new CustomEvent('hoops-walk-mode-operator-reset', {
        bubbles: true,
        composed: true,
      }),
    );
    this.dispatchEvent(
      new CustomEvent('hoops-mouse-walk-operator-reset', {
        bubbles: true,
        composed: true,
      }),
    );
    this.dispatchEvent(
      new CustomEvent('hoops-keyboard-walk-operator-reset', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  async resetConfiguration(obj?: object): Promise<void> {
    if (!this._walkModeOperator || !this._mouseWalkOperator || !this._keyboardWalkOperator) {
      throw new Error('Walk Operators are not initialized');
    }

    const config = obj ?? WalkOperatorService.DefaultConfiguration;
    if (!isWalkOperatorServiceConfiguration(config)) {
      throw new Error('Invalid configuration object');
    }

    await this._mouseWalkOperator.resetDefaultWalkSpeeds();
    await this._keyboardWalkOperator.resetDefaultWalkSpeeds();

    await this.setWalkMode(config.walkMode);
    if (config.rotationSpeed !== undefined) {
      this.setRotationSpeed(config.rotationSpeed);
    }
    if (config.walkSpeed !== undefined) {
      this.setWalkSpeed(config.walkSpeed);
    }
    if (config.elevationSpeed !== undefined) {
      this.setElevationSpeed(config.elevationSpeed);
    }
    if (config.fieldOfView !== undefined) {
      this.setFieldOfView(config.fieldOfView);
    }
    this.setMouseLookEnabled(config.mouseLookEnabled);
    if (config.mouseLookSpeed !== undefined) {
      this.setMouseLookSpeed(config.mouseLookSpeed);
    }
    this.setCollisionDetectionEnabled(config.collisionDetectionEnabled);
  }

  private bind() {
    if (!this._walkModeOperator || !this._mouseWalkOperator || !this._keyboardWalkOperator) {
      throw new Error('Walk Operators are not initialized');
    }

    this._walkModeOperator.viewer.setCallbacks(this.callbackMap);
  }

  private unbind() {
    if (!this._walkModeOperator || !this._mouseWalkOperator || !this._keyboardWalkOperator) {
      throw new Error('Walk Operators are not initialized');
    }

    this._walkModeOperator.viewer.unsetCallbacks(this.callbackMap);
  }
}

export default WalkOperatorService;
