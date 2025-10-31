import { IResettableConfigurationService, IService } from '../types';

export const WalkModeNames = ['Mouse', 'Keyboard'] as const;
export type WalkModeName = (typeof WalkModeNames)[number];

export function isWalkModeName(value: unknown): value is WalkModeName {
  return typeof value === 'string' && WalkModeNames.includes(value as WalkModeName);
}

export const WalkSpeedUnitNames = ['µm', 'mm', 'cm', 'm'];
export type WalkSpeedUnitName = (typeof WalkSpeedUnitNames)[number];

export function isWalkSpeedUnitName(value: unknown): value is WalkSpeedUnitName {
  return typeof value === 'string' && WalkSpeedUnitNames.includes(value as WalkSpeedUnitName);
}

// When service reset is called, reset function of operator will be called
// Then, if optional configuration params are provided, they will override the operator defaults
export type WalkOperatorServiceConfiguration = {
  walkMode: WalkModeName;
  rotationSpeed?: number;
  walkSpeed?: number;
  elevationSpeed?: number;
  fieldOfView?: number;
  mouseLookEnabled: boolean;
  mouseLookSpeed?: number;
  collisionDetectionEnabled: boolean;
};

export function isWalkOperatorServiceConfiguration(
  obj: unknown,
): obj is WalkOperatorServiceConfiguration {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const data = obj as WalkOperatorServiceConfiguration;
  return (
    isWalkModeName(data.walkMode) &&
    (typeof data.rotationSpeed === 'number' || data.rotationSpeed === undefined) &&
    (typeof data.walkSpeed === 'number' || data.walkSpeed === undefined) &&
    (typeof data.elevationSpeed === 'number' || data.elevationSpeed === undefined) &&
    (typeof data.fieldOfView === 'number' || data.fieldOfView === undefined) &&
    typeof data.mouseLookEnabled === 'boolean' &&
    (typeof data.mouseLookSpeed === 'number' || data.mouseLookSpeed === undefined) &&
    typeof data.collisionDetectionEnabled === 'boolean'
  );
}

export interface IWalkOperatorService extends IService, IResettableConfigurationService {
  getWalkMode(): WalkModeName;
  setWalkMode(mode: WalkModeName): Promise<void>;
  getRotationSpeed(): number;
  setRotationSpeed(speed: number): void;
  getWalkSpeed(): number;
  setWalkSpeed(speed: number): void;
  getElevationSpeed(): number;
  setElevationSpeed(speed: number): void;
  getFieldOfView(): number;
  setFieldOfView(fov: number): void;
  isMouseLookEnabled(): boolean;
  setMouseLookEnabled(enabled: boolean): void;
  getMouseLookSpeed(): number;
  setMouseLookSpeed(speed: number): void;
  isCollisionDetectionEnabled(): boolean;
  setCollisionDetectionEnabled(enabled: boolean): Promise<void>;

  reset(): void;
  resetConfiguration(obj?: object): Promise<void>;
}
