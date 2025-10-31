import { WalkMode } from '@ts3d-hoops/web-viewer';
import { WalkModeName, WalkSpeedUnitName } from './types';

export function walkModeToString(mode: WalkMode): WalkModeName {
  switch (mode) {
    case WalkMode.Mouse:
      return 'Mouse';
    case WalkMode.Keyboard:
      return 'Keyboard';
    default:
      return 'Mouse'; // Default to Mouse if an unknown mode is provided
  }
}

export function stringToWalkMode(mode: WalkModeName): WalkMode {
  switch (mode) {
    case 'Mouse':
      return WalkMode.Mouse;
    case 'Keyboard':
      return WalkMode.Keyboard;
    default:
      return WalkMode.Mouse; // Default to Mouse if an unknown mode is provided
  }
}

export function getWalkSpeedUnitName(factor: number): WalkSpeedUnitName {
  switch (true) {
    case factor < 1:
      return 'µm';
    case factor < 10:
      return 'mm';
    case factor < 1000:
      return 'cm';
    default:
      return 'm';
  }
}

export function getWalkSpeedUnitFactor(unit: WalkSpeedUnitName): number {
  switch (unit) {
    case 'µm':
      return 0.001;
    case 'mm':
      return 1;
    case 'cm':
      return 10;
    case 'm':
      return 1000;
    default:
      return -1;
  }
}

export function calculateWalkSpeedUnitFactor(speed: number): number {
  if (speed < 0) {
    return -1;
  }

  return Math.pow(10, Math.floor(Math.log10(speed)));
}
