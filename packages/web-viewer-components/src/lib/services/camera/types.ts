import { IResettableConfigurationService, IService } from '../types';

export const ProjectionValues = ['Perspective', 'Orthographic'] as const;
export type Projection = (typeof ProjectionValues)[number];

export const OrbitFallbackModeValues = ['Camera Target', 'Model Center', 'Orbit Target'] as const;
export type OrbitFallbackMode = (typeof OrbitFallbackModeValues)[number];

export type CameraServiceConfiguration = {
  projectionMode: Projection;
  orbitFallbackMode: OrbitFallbackMode;
};

export function isProjection(value: unknown): value is Projection {
  return ProjectionValues.includes(value as Projection);
}

export function isOrbitFallbackMode(value: unknown): value is OrbitFallbackMode {
  return OrbitFallbackModeValues.includes(value as OrbitFallbackMode);
}

export function isCameraServiceConfiguration(obj: unknown): obj is CameraServiceConfiguration {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const value = obj as CameraServiceConfiguration;
  return isProjection(value.projectionMode) && isOrbitFallbackMode(value.orbitFallbackMode);
}

export interface ICameraService extends IService, IResettableConfigurationService {
  getProjectionMode(): Projection;
  setProjectionMode(projectionMode: Projection): void;
  getOrbitFallbackMode(): OrbitFallbackMode;
  setOrbitFallbackMode(fallbackMode: OrbitFallbackMode): void;
  resetConfiguration(obj?: object): Promise<void>;
  reset(): void;
}
