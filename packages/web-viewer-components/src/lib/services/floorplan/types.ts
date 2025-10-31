import { IResettableConfigurationService, IService } from '../types';

export const OrientationNames = ['North Up', 'Avatar Up'] as const;
export type OrientationName = (typeof OrientationNames)[number];

export function isOrientationName(value: unknown): value is OrientationName {
  return OrientationNames.includes(value as OrientationName);
}

export const AutoActivationModeNames = ['Bim', 'Bim + Walk', 'Never'] as const;
export type AutoActivationModeName = (typeof AutoActivationModeNames)[number];

export function isAutoActivationModeName(value: unknown): value is AutoActivationModeName {
  return AutoActivationModeNames.includes(value as AutoActivationModeName);
}

export type FloorplanServiceConfiguration = {
  floorplanActive: boolean;
  trackCamera: boolean;
  orientation: OrientationName;
  autoActivationMode: AutoActivationModeName;
  overlayFeetPerPixel: number;
  overlayZoomLevel: number;
  overlayBackgroundOpacity: number;
  overlayBorderOpacity: number;
  overlayAvatarOpacity: number;
  floorplanBackgroundColor: string;
  floorplanBorderColor: string;
  floorplanAvatarColor: string;
  floorplanAvatarOutlineColor: string;
};

export function isFloorplanServiceConfiguration(
  obj: unknown,
): obj is FloorplanServiceConfiguration {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const value = obj as FloorplanServiceConfiguration;

  return (
    !!obj &&
    typeof obj === 'object' &&
    typeof value.floorplanActive === 'boolean' &&
    typeof value.trackCamera === 'boolean' &&
    isOrientationName(value.orientation) &&
    isAutoActivationModeName(value.autoActivationMode) &&
    typeof value.overlayFeetPerPixel === 'number' &&
    typeof value.overlayZoomLevel === 'number' &&
    typeof value.overlayBackgroundOpacity === 'number' &&
    typeof value.overlayBorderOpacity === 'number' &&
    typeof value.overlayAvatarOpacity === 'number' &&
    typeof value.floorplanBackgroundColor === 'string' &&
    typeof value.floorplanBorderColor === 'string' &&
    typeof value.floorplanAvatarColor === 'string' &&
    typeof value.floorplanAvatarOutlineColor === 'string'
  );
}

export interface IFloorplanService extends IService, IResettableConfigurationService {
  isActive(): boolean;
  setActive(active: boolean): Promise<void>;

  isTrackCameraEnabled(): boolean;
  setTrackCameraEnabled(enabled: boolean): Promise<void>;

  getOrientation(): OrientationName;
  setOrientation(orientation: OrientationName): Promise<void>;

  getAutoActivationMode(): AutoActivationModeName;
  setAutoActivationMode(mode: AutoActivationModeName): Promise<void>;

  getOverlayFeetPerPixel(): number;
  setOverlayFeetPerPixel(feetPerPixel: number): Promise<void>;

  getOverlayZoomLevel(): number;
  setOverlayZoomLevel(zoomLevel: number): Promise<void>;

  getOverlayBackgroundOpacity(): number;
  setOverlayBackgroundOpacity(opacity: number): Promise<void>;

  getOverlayBorderOpacity(): number;
  setOverlayBorderOpacity(opacity: number): Promise<void>;

  getOverlayAvatarOpacity(): number;
  setOverlayAvatarOpacity(opacity: number): Promise<void>;

  getFloorplanBackgroundColor(): string;
  setFloorplanBackgroundColor(color: string): Promise<void>;

  getFloorplanBorderColor(): string;
  setFloorplanBorderColor(color: string): Promise<void>;

  getFloorplanAvatarColor(): string;
  setFloorplanAvatarColor(color: string): Promise<void>;

  getFloorplanAvatarOutlineColor(): string;
  setFloorplanAvatarOutlineColor(color: string): Promise<void>;

  resetConfiguration(obj?: object): Promise<void>;
  reset(): Promise<void>;
}
