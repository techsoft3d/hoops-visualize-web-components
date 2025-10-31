import { IWalkOperatorService, WalkModeName } from '../lib/services/walk-operator/types';

export class WalkOperatorServiceMock extends EventTarget implements IWalkOperatorService {
  public readonly serviceName = 'WalkOperatorService' as const;

  public fn: (...args: any[]) => any;

  private walkMode = 'Mouse' as WalkModeName;
  private rotationSpeed = 40;
  private walkSpeed = 1;
  private elevationSpeed = 1;
  private fieldOfView = 90;
  private mouseLookEnabled = false;
  private collisionDetectionEnabled = false;
  private mouseLookSpeed = 1;

  public getWalkMode: () => WalkModeName;
  public setWalkMode: (mode: WalkModeName) => Promise<void>;
  public getRotationSpeed: () => number;
  public setRotationSpeed: (speed: number) => void;
  public getWalkSpeed: () => number;
  public setWalkSpeed: (speed: number) => void;
  public getElevationSpeed: () => number;
  public setElevationSpeed: (speed: number) => void;
  public getFieldOfView: () => number;
  public setFieldOfView: (fov: number) => void;
  public isMouseLookEnabled: () => boolean;
  public setMouseLookEnabled: (enabled: boolean) => void;
  public isCollisionDetectionEnabled: () => boolean;
  public setCollisionDetectionEnabled: (enabled: boolean) => Promise<void>;
  public getMouseLookSpeed: () => number;
  public setMouseLookSpeed: (speed: number) => void;
  public reset: () => void;
  public resetConfiguration: (obj?: object) => Promise<void>;

  constructor(fn: (...args: any[]) => any) {
    super();
    this.fn = fn;

    this.getWalkMode = fn(() => {
      return this.walkMode;
    });

    this.setWalkMode = fn((value: WalkModeName) => {
      this.walkMode = value; // Default value, can be set to 'Keyboard' as needed
      this.dispatchEvent(
        new CustomEvent('hoops-operators-walk-mode-changed', {
          detail: { mode: this.walkMode },
          bubbles: true,
          composed: true,
        }),
      );
    });

    this.getRotationSpeed = fn(() => {
      return this.rotationSpeed;
    });

    this.setRotationSpeed = fn((value: number) => {
      this.rotationSpeed = value;
      this.dispatchEvent(
        new CustomEvent('hoops-operators-walk-rotation-speed-changed', {
          detail: { speed: this.rotationSpeed },
          bubbles: true,
          composed: true,
        }),
      );
    });

    this.getWalkSpeed = fn(() => {
      return this.walkSpeed;
    });

    this.setWalkSpeed = fn((value: number) => {
      this.walkSpeed = value;
      this.dispatchEvent(
        new CustomEvent('hoops-operators-walk-speed-changed', {
          detail: { speed: this.walkSpeed },
          bubbles: true,
          composed: true,
        }),
      );
    });

    this.getElevationSpeed = fn(() => {
      return this.elevationSpeed;
    });

    this.setElevationSpeed = fn((value: number) => {
      this.elevationSpeed = value;
      this.dispatchEvent(
        new CustomEvent('hoops-operators-walk-elevation-speed-changed', {
          detail: { speed: this.elevationSpeed },
          bubbles: true,
          composed: true,
        }),
      );
    });

    this.getFieldOfView = fn(() => {
      return this.fieldOfView;
    });

    this.setFieldOfView = fn((value: number) => {
      this.fieldOfView = value;
      this.dispatchEvent(
        new CustomEvent('hoops-operators-walk-field-of-view-changed', {
          detail: { fov: this.fieldOfView },
          bubbles: true,
          composed: true,
        }),
      );
    });

    this.isMouseLookEnabled = fn(() => {
      return this.mouseLookEnabled;
    });

    this.setMouseLookEnabled = fn((value: boolean) => {
      this.mouseLookEnabled = value;
      this.dispatchEvent(
        new CustomEvent('hoops-operators-walk-mouse-look-enabled-changed', {
          detail: { enabled: this.mouseLookEnabled },
          bubbles: true,
          composed: true,
        }),
      );
    });

    this.isCollisionDetectionEnabled = fn(() => {
      return this.collisionDetectionEnabled;
    });

    this.setCollisionDetectionEnabled = fn((value: boolean) => {
      this.collisionDetectionEnabled = value;
      this.dispatchEvent(
        new CustomEvent('hoops-operators-walk-collision-detection-enabled-changed', {
          detail: { enabled: this.collisionDetectionEnabled },
          bubbles: true,
          composed: true,
        }),
      );
    });

    this.reset = fn(() => {
      this.walkMode = 'Mouse';
      this.rotationSpeed = 40;
      this.walkSpeed = 1;
      this.elevationSpeed = 1;
      this.fieldOfView = 90;
      this.mouseLookEnabled = false;
      this.collisionDetectionEnabled = false;

      this.dispatchEvent(
        new CustomEvent('hoops-walk-mode-operator-reset', { bubbles: true, composed: true }),
      );
      this.dispatchEvent(
        new CustomEvent('hoops-mouse-walk-operator-reset', { bubbles: true, composed: true }),
      );
      this.dispatchEvent(
        new CustomEvent('hoops-keyboard-walk-operator-reset', { bubbles: true, composed: true }),
      );
    });

    this.getMouseLookSpeed = fn(() => {
      return this.mouseLookSpeed;
    });

    this.setMouseLookSpeed = fn((speed: number) => {
      this.mouseLookSpeed = speed;
      this.dispatchEvent(
        new CustomEvent('hoops-operators-mouse-look-speed-changed', {
          detail: { speed: this.mouseLookSpeed },
          bubbles: true,
          composed: true,
        }),
      );
    });

    this.resetConfiguration = fn();
  }
}

export default WalkOperatorServiceMock;
