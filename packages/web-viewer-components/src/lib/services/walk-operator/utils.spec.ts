import { describe, it, expect } from 'vitest';

import { stringToWalkMode, walkModeToString } from './utils';
import { WalkMode } from '@ts3d-hoops/web-viewer';

describe('Walk Mode Utilities', () => {
  it('should convert WalkMode to string correctly', () => {
    expect(walkModeToString(WalkMode.Mouse)).toBe('Mouse');
    expect(walkModeToString(WalkMode.Keyboard)).toBe('Keyboard');
    expect(walkModeToString('Unknown' as any)).toBe('Mouse'); // Default case
  });

  it('should convert string to WalkMode correctly', () => {
    expect(stringToWalkMode('Mouse')).toBe(WalkMode.Mouse);
    expect(stringToWalkMode('Keyboard')).toBe(WalkMode.Keyboard);
    expect(stringToWalkMode('Unknown' as any)).toBe(WalkMode.Mouse); // Default case
  });
});
