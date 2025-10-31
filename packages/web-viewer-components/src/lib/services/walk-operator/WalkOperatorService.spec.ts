import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WalkOperatorService } from './WalkOperatorService';
import { Operators, WalkMode } from '@ts3d-hoops/web-viewer';
import type { WalkModeName } from './types';

// Mocks for Operators
const mockMouseWalkOperator = () => ({
  getRotationSpeed: vi.fn(() => 0),
  getWalkSpeed: vi.fn(() => 0),
  getElevationSpeed: vi.fn(() => 0),
  getViewAngle: vi.fn(() => 0),
  getBimModeEnabled: vi.fn(() => false),
  resetDefaultWalkSpeeds: vi.fn(),
});

const mockKeyboardWalkOperator = () => ({
  getRotationSpeed: vi.fn(() => 0),
  getWalkSpeed: vi.fn(() => 0),
  getElevationSpeed: vi.fn(() => 0),
  getViewAngle: vi.fn(() => 0),
  getBimModeEnabled: vi.fn(() => false),
  getMouseLookEnabled: vi.fn(() => false),
  setMouseLookEnabled: vi.fn(),
  getMouseLookSpeed: vi.fn(() => 0),
  setMouseLookSpeed: vi.fn(),
  resetDefaultWalkSpeeds: vi.fn(),
});

const mockWalkModeOperator = () => ({
  getWalkMode: vi.fn(),
  setWalkMode: vi.fn(),
  setRotationSpeed: vi.fn(),
  setWalkSpeed: vi.fn(),
  setElevationSpeed: vi.fn(),
  setViewAngle: vi.fn(),
  setBimModeEnabled: vi.fn(),
  getRotationSpeed: vi.fn(),
  getWalkSpeed: vi.fn(),
  getElevationSpeed: vi.fn(),
  getViewAngle: vi.fn(),
  getBimModeEnabled: vi.fn(),
  viewer: {
    setCallbacks: vi.fn(),
    unsetCallbacks: vi.fn(),
  },

  walkOperator: mockMouseWalkOperator(),
  keyboardWalkOperator: mockKeyboardWalkOperator(),
});

vi.mock('./utils', () => ({
  stringToWalkMode: (mode: WalkModeName) => (mode === 'Mouse' ? WalkMode.Mouse : WalkMode.Keyboard),
  walkModeToString: (mode: WalkMode) => (mode === WalkMode.Mouse ? 'Mouse' : 'Keyboard'),
}));

describe('WalkOperatorService', () => {
  let walkModeOperator: ReturnType<typeof mockWalkModeOperator>;
  let mouseWalkOperator: ReturnType<typeof mockMouseWalkOperator>;
  let keyboardWalkOperator: ReturnType<typeof mockKeyboardWalkOperator>;
  let service: WalkOperatorService;

  beforeEach(() => {
    walkModeOperator = mockWalkModeOperator();
    mouseWalkOperator = mockMouseWalkOperator();
    keyboardWalkOperator = mockKeyboardWalkOperator();
    service = new WalkOperatorService({
      walkModeOperator: walkModeOperator as unknown as Operators.Camera.CameraWalkModeOperator,
      mouseWalkOperator: mouseWalkOperator as unknown as Operators.Camera.CameraWalkOperator,
      keyboardWalkOperator:
        keyboardWalkOperator as unknown as Operators.Camera.CameraKeyboardWalkOperator,
    });
  });

  it('should have serviceName', () => {
    expect(service.serviceName).toBe('WalkOperatorService');
  });

  it('should get/set walkModeOperator and dispatch event', () => {
    const newOp = mockWalkModeOperator();
    const spy = vi.fn();
    service.addEventListener('hoops-walk-mode-operator-reset', spy);
    service.walkModeOperator = newOp as any;
    expect(service.walkModeOperator).toBe(newOp);
    expect(spy).toHaveBeenCalled();
  });

  it('should get/set mouseWalkOperator and dispatch event', () => {
    const newOp = mockMouseWalkOperator();
    const spy = vi.fn();
    service.addEventListener('hoops-mouse-walk-operator-reset', spy);
    service.mouseWalkOperator = newOp as any;
    expect(service.mouseWalkOperator).toBe(newOp);
    expect(spy).toHaveBeenCalled();
  });

  it('should get/set keyboardWalkOperator and dispatch event', () => {
    const newOp = mockKeyboardWalkOperator();
    const spy = vi.fn();
    service.addEventListener('hoops-keyboard-walk-operator-reset', spy);
    service.keyboardWalkOperator = newOp as any;
    expect(service.keyboardWalkOperator).toBe(newOp);
    expect(spy).toHaveBeenCalled();
  });

  it('getWalkMode returns correct string', () => {
    walkModeOperator.getWalkMode.mockReturnValue(WalkMode.Mouse);
    expect(service.getWalkMode()).toBe('Mouse');
    walkModeOperator.getWalkMode.mockReturnValue(WalkMode.Keyboard);
    expect(service.getWalkMode()).toBe('Keyboard');
    // fallback to Mouse if undefined
    service = new WalkOperatorService();
    expect(service.getWalkMode()).toBe('Mouse');
  });

  it('setWalkMode calls setWalkMode and dispatches event', async () => {
    const spy = vi.fn();
    service.addEventListener('hoops-operators-walk-mode-changed', spy);
    await service.setWalkMode('Keyboard');
    expect(walkModeOperator.setWalkMode).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
  });

  it('getRotationSpeed returns 0 if any operator missing', () => {
    service = new WalkOperatorService();
    expect(service.getRotationSpeed()).toBe(0);
    service = new WalkOperatorService({
      walkModeOperator: walkModeOperator as unknown as Operators.Camera.CameraWalkModeOperator,
    });
    expect(service.getRotationSpeed()).toBe(0);
    service = new WalkOperatorService({
      walkModeOperator: walkModeOperator as unknown as Operators.Camera.CameraWalkModeOperator,
      mouseWalkOperator: mouseWalkOperator as unknown as Operators.Camera.CameraWalkOperator,
    });
    expect(service.getRotationSpeed()).toBe(0);
  });

  it('getRotationSpeed returns from correct operator', () => {
    walkModeOperator.getWalkMode.mockReturnValue(WalkMode.Mouse);
    mouseWalkOperator.getRotationSpeed.mockReturnValue(5);
    expect(service.getRotationSpeed()).toBe(5);
    walkModeOperator.getWalkMode.mockReturnValue(WalkMode.Keyboard);
    keyboardWalkOperator.getRotationSpeed.mockReturnValue(7);
    expect(service.getRotationSpeed()).toBe(7);
  });

  it('setRotationSpeed sets and dispatches', () => {
    const spy = vi.fn();
    service.addEventListener('hoops-operators-walk-rotation-speed-changed', spy);
    service.setRotationSpeed(10);
    expect(walkModeOperator.setRotationSpeed).toHaveBeenCalledWith(10);
    expect(spy).toHaveBeenCalled();
    // No operator: nothing happens
    service = new WalkOperatorService();
    expect(() => service.setRotationSpeed(1)).toThrowError('Walk Operators are not initialized');
  });

  it('getWalkSpeed returns 0 if any operator missing', () => {
    service = new WalkOperatorService();
    expect(service.getWalkSpeed()).toBe(0);
  });

  it('getWalkSpeed returns from correct operator', () => {
    walkModeOperator.getWalkMode.mockReturnValue(WalkMode.Mouse);
    mouseWalkOperator.getWalkSpeed.mockReturnValue(2);
    expect(service.getWalkSpeed()).toBe(2);
    walkModeOperator.getWalkMode.mockReturnValue(WalkMode.Keyboard);
    keyboardWalkOperator.getWalkSpeed.mockReturnValue(3);
    expect(service.getWalkSpeed()).toBe(3);
  });

  it('setWalkSpeed sets and dispatches', () => {
    const spy = vi.fn();
    service.addEventListener('hoops-operators-walk-speed-changed', spy);
    service.setWalkSpeed(11);
    expect(walkModeOperator.setWalkSpeed).toHaveBeenCalledWith(11);
    expect(spy).toHaveBeenCalled();
    service = new WalkOperatorService();
    expect(() => service.setWalkSpeed(1)).toThrowError('Walk Operators are not initialized');
  });

  it('getElevationSpeed returns 0 if any operator missing', () => {
    service = new WalkOperatorService();
    expect(service.getElevationSpeed()).toBe(0);
  });

  it('getElevationSpeed returns from correct operator', () => {
    walkModeOperator.getWalkMode.mockReturnValue(WalkMode.Mouse);
    mouseWalkOperator.getElevationSpeed.mockReturnValue(4);
    expect(service.getElevationSpeed()).toBe(4);
    walkModeOperator.getWalkMode.mockReturnValue(WalkMode.Keyboard);
    keyboardWalkOperator.getElevationSpeed.mockReturnValue(5);
    expect(service.getElevationSpeed()).toBe(5);
  });

  it('setElevationSpeed sets and dispatches', () => {
    const spy = vi.fn();
    service.addEventListener('hoops-operators-elevation-speed-changed', spy);
    service.setElevationSpeed(12);
    expect(walkModeOperator.setElevationSpeed).toHaveBeenCalledWith(12);
    expect(spy).toHaveBeenCalled();
    service = new WalkOperatorService();
    expect(() => service.setElevationSpeed(1)).toThrowError('Walk Operators are not initialized');
  });

  it('getFieldOfView returns 0 if any operator missing', () => {
    service = new WalkOperatorService();
    expect(service.getFieldOfView()).toBe(0);
  });

  it('getFieldOfView returns from correct operator', () => {
    walkModeOperator.getWalkMode.mockReturnValue(WalkMode.Mouse);
    mouseWalkOperator.getViewAngle.mockReturnValue(60);
    expect(service.getFieldOfView()).toBe(60);
    walkModeOperator.getWalkMode.mockReturnValue(WalkMode.Keyboard);
    keyboardWalkOperator.getViewAngle.mockReturnValue(75);
    expect(service.getFieldOfView()).toBe(75);
  });

  it('setFieldOfView sets and dispatches', () => {
    const spy = vi.fn();
    service.addEventListener('hoops-operators-field-of-view-changed', spy);
    service.setFieldOfView(90);
    expect(walkModeOperator.setViewAngle).toHaveBeenCalledWith(90);
    expect(spy).toHaveBeenCalled();
    service = new WalkOperatorService();
    expect(() => service.setFieldOfView(1)).toThrowError('Walk Operators are not initialized');
  });

  it('isMouseLookEnabled returns correct value', () => {
    keyboardWalkOperator.getMouseLookEnabled.mockReturnValue(true);
    expect(service.isMouseLookEnabled()).toBe(true);
    keyboardWalkOperator.getMouseLookEnabled.mockReturnValue(false);
    expect(service.isMouseLookEnabled()).toBe(false);
    service = new WalkOperatorService();
    expect(service.isMouseLookEnabled()).toBe(false);
  });

  it('setMouseLookEnabled sets and dispatches', () => {
    const spy = vi.fn();
    service.addEventListener('hoops-operators-mouse-look-enabled-changed', spy);
    service.setMouseLookEnabled(true);
    expect(keyboardWalkOperator.setMouseLookEnabled).toHaveBeenCalledWith(true);
    expect(spy).toHaveBeenCalled();
    service = new WalkOperatorService();
    expect(() => service.setMouseLookEnabled(false)).toThrowError(
      'Walk Operators are not initialized',
    );
  });

  it('isCollisionDetectionEnabled returns correct value', () => {
    walkModeOperator.getWalkMode.mockReturnValue(WalkMode.Mouse);
    mouseWalkOperator.getBimModeEnabled.mockReturnValue(true);
    expect(service.isCollisionDetectionEnabled()).toBe(true);
    mouseWalkOperator.getBimModeEnabled.mockReturnValue(false);
    expect(service.isCollisionDetectionEnabled()).toBe(false);
    walkModeOperator.getWalkMode.mockReturnValue(WalkMode.Keyboard);
    keyboardWalkOperator.getBimModeEnabled.mockReturnValue(true);
    expect(service.isCollisionDetectionEnabled()).toBe(true);
    service = new WalkOperatorService();
    expect(service.isCollisionDetectionEnabled()).toBe(false);
  });

  it('setCollisionDetectionEnabled sets and dispatches', async () => {
    const spy = vi.fn();
    service.addEventListener('hoops-operators-collision-detection-changed', spy);
    await service.setCollisionDetectionEnabled(true);
    expect(walkModeOperator.setBimModeEnabled).toHaveBeenCalledWith(true);
    expect(spy).toHaveBeenCalled();
    service = new WalkOperatorService();
    await expect(() => service.setCollisionDetectionEnabled(false)).rejects.toThrowError(
      'Walk Operators are not initialized',
    );
  });

  describe('resetConfiguration', () => {
    it('should throw error when walk operators are not initialized', async () => {
      service = new WalkOperatorService();
      await expect(service.resetConfiguration()).rejects.toThrow(
        'Walk Operators are not initialized',
      );
    });

    it('should throw error for invalid configuration object', async () => {
      const invalidConfigs = [
        'string',
        123,
        [],
        { walkMode: 'InvalidMode' }, // invalid walk mode
        { walkMode: 'Mouse', rotationSpeed: 'invalid' }, // invalid rotationSpeed type
        { walkMode: 'Mouse', rotationSpeed: 40, walkSpeed: 'invalid' }, // invalid walkSpeed type
        { walkMode: 'Mouse', rotationSpeed: 40, walkSpeed: 3.2, walkSpeedUnit: 'invalid' }, // invalid walkSpeedUnit
        {
          walkMode: 'Mouse',
          rotationSpeed: 40,
          walkSpeed: 3.2,
          walkSpeedUnit: 'm',
          elevationSpeed: 'invalid',
        }, // invalid elevationSpeed
        {
          walkMode: 'Mouse',
          rotationSpeed: 40,
          walkSpeed: 3.2,
          walkSpeedUnit: 'm',
          elevationSpeed: 4.8,
          fieldOfView: 'invalid',
        }, // invalid fieldOfView
        {
          walkMode: 'Mouse',
          rotationSpeed: 40,
          walkSpeed: 3.2,
          walkSpeedUnit: 'm',
          elevationSpeed: 4.8,
          fieldOfView: 90,
          mouseLookEnabled: 'invalid',
        }, // invalid mouseLookEnabled
        {
          walkMode: 'Mouse',
          rotationSpeed: 40,
          walkSpeed: 3.2,
          walkSpeedUnit: 'm',
          elevationSpeed: 4.8,
          fieldOfView: 90,
          mouseLookEnabled: false,
          mouseLookSpeed: 'invalid',
        }, // invalid mouseLookSpeed
        {
          walkMode: 'Mouse',
          rotationSpeed: 40,
          walkSpeed: 3.2,
          walkSpeedUnit: 'm',
          elevationSpeed: 4.8,
          fieldOfView: 90,
          mouseLookEnabled: false,
          mouseLookSpeed: 300,
          collisionDetectionEnabled: 'invalid',
        }, // invalid collisionDetectionEnabled
        {}, // missing all required properties
        { walkMode: 'Mouse' }, // missing other required properties
        { rotationSpeed: 40 }, // missing other required properties
      ];

      for (const config of invalidConfigs) {
        await expect(service.resetConfiguration(config)).rejects.toThrow(
          'Invalid configuration object',
        );
      }
    });

    it('should use default configuration when no object is provided', async () => {
      const setWalkModeSpy = vi.spyOn(service, 'setWalkMode');
      const setRotationSpeedSpy = vi.spyOn(service, 'setRotationSpeed');
      const setWalkSpeedSpy = vi.spyOn(service, 'setWalkSpeed');
      const setElevationSpeedSpy = vi.spyOn(service, 'setElevationSpeed');
      const setFieldOfViewSpy = vi.spyOn(service, 'setFieldOfView');
      const setMouseLookEnabledSpy = vi.spyOn(service, 'setMouseLookEnabled');
      const setMouseLookSpeedSpy = vi.spyOn(service, 'setMouseLookSpeed');
      const setCollisionDetectionEnabledSpy = vi
        .spyOn(service, 'setCollisionDetectionEnabled')
        .mockResolvedValue();

      await service.resetConfiguration();

      expect(setWalkModeSpy).toHaveBeenCalledWith('Mouse');
      expect(setRotationSpeedSpy).not.toHaveBeenCalled();
      expect(setWalkSpeedSpy).not.toHaveBeenCalled();
      expect(setElevationSpeedSpy).not.toHaveBeenCalled();
      expect(setFieldOfViewSpy).not.toHaveBeenCalled();
      expect(setMouseLookEnabledSpy).toHaveBeenCalledWith(true);
      expect(setMouseLookSpeedSpy).not.toHaveBeenCalled();
      expect(setCollisionDetectionEnabledSpy).toHaveBeenCalledWith(false);
    });

    it('should apply provided valid configuration', async () => {
      const setWalkModeSpy = vi.spyOn(service, 'setWalkMode');
      const setRotationSpeedSpy = vi.spyOn(service, 'setRotationSpeed');
      const setWalkSpeedSpy = vi.spyOn(service, 'setWalkSpeed');
      const setElevationSpeedSpy = vi.spyOn(service, 'setElevationSpeed');
      const setFieldOfViewSpy = vi.spyOn(service, 'setFieldOfView');
      const setMouseLookEnabledSpy = vi.spyOn(service, 'setMouseLookEnabled');
      const setMouseLookSpeedSpy = vi.spyOn(service, 'setMouseLookSpeed');
      const setCollisionDetectionEnabledSpy = vi
        .spyOn(service, 'setCollisionDetectionEnabled')
        .mockResolvedValue();

      const customConfig = {
        walkMode: 'Keyboard' as const,
        rotationSpeed: 50,
        walkSpeed: 5.0,
        walkSpeedUnit: 'm' as const,
        elevationSpeed: 6.0,
        fieldOfView: 120,
        mouseLookEnabled: true,
        mouseLookSpeed: 400,
        collisionDetectionEnabled: true,
      };

      await service.resetConfiguration(customConfig);

      expect(setWalkModeSpy).toHaveBeenCalledWith('Keyboard');
      expect(setRotationSpeedSpy).toHaveBeenCalledWith(50);
      expect(setWalkSpeedSpy).toHaveBeenCalledWith(5.0);
      expect(setElevationSpeedSpy).toHaveBeenCalledWith(6.0);
      expect(setFieldOfViewSpy).toHaveBeenCalledWith(120);
      expect(setMouseLookEnabledSpy).toHaveBeenCalledWith(true);
      expect(setMouseLookSpeedSpy).toHaveBeenCalledWith(400);
      expect(setCollisionDetectionEnabledSpy).toHaveBeenCalledWith(true);
    });

    it('should have correct default configuration values', () => {
      expect(WalkOperatorService.DefaultConfiguration).toEqual({
        walkMode: 'Mouse',
        mouseLookEnabled: true,
        collisionDetectionEnabled: false,
      });
    });

    it('should call all setter methods in correct sequence', async () => {
      const callOrder: string[] = [];

      vi.spyOn(service, 'setWalkMode').mockImplementation(async () => {
        callOrder.push('setWalkMode');
      });
      vi.spyOn(service, 'setRotationSpeed').mockImplementation(() => {
        callOrder.push('setRotationSpeed');
      });
      vi.spyOn(service, 'setWalkSpeed').mockImplementation(() => {
        callOrder.push('setWalkSpeed');
      });
      vi.spyOn(service, 'setElevationSpeed').mockImplementation(() => {
        callOrder.push('setElevationSpeed');
      });
      vi.spyOn(service, 'setFieldOfView').mockImplementation(() => {
        callOrder.push('setFieldOfView');
      });
      vi.spyOn(service, 'setMouseLookEnabled').mockImplementation(() => {
        callOrder.push('setMouseLookEnabled');
        return Promise.resolve();
      });
      vi.spyOn(service, 'setMouseLookSpeed').mockImplementation(() => {
        callOrder.push('setMouseLookSpeed');
        return Promise.resolve();
      });
      vi.spyOn(service, 'setCollisionDetectionEnabled').mockImplementation(() => {
        callOrder.push('setCollisionDetectionEnabled');
        return Promise.resolve();
      });

      await service.resetConfiguration();

      expect(callOrder).toEqual([
        'setWalkMode',
        'setMouseLookEnabled',
        'setCollisionDetectionEnabled',
      ]);
    });

    it('should handle partial configuration objects correctly', async () => {
      const setWalkModeSpy = vi.spyOn(service, 'setWalkMode');
      const setRotationSpeedSpy = vi.spyOn(service, 'setRotationSpeed');

      // Test with valid but complete config (all required properties)
      const validConfig = {
        walkMode: 'Mouse' as const,
        rotationSpeed: 40,
        walkSpeed: 3.2,
        walkSpeedUnit: 'm' as const,
        elevationSpeed: 4.8,
        fieldOfView: 90,
        mouseLookEnabled: false,
        mouseLookSpeed: 300,
        collisionDetectionEnabled: false,
      };

      await service.resetConfiguration(validConfig);

      expect(setWalkModeSpy).toHaveBeenCalledWith('Mouse');
      expect(setRotationSpeedSpy).toHaveBeenCalledWith(40);
    });

    it('should reject configuration with missing required properties', async () => {
      const incompleteConfigs = [
        { walkMode: 'Mouse' }, // missing all other properties
        { rotationSpeed: 40 }, // missing all other properties
        {
          walkMode: 'Mouse',
          rotationSpeed: 40,
          // missing walkSpeed, walkSpeedUnit, elevationSpeed, fieldOfView, mouseLookEnabled, mouseLookSpeed, collisionDetectionEnabled
        },
        {
          walkMode: 'Mouse',
          rotationSpeed: 40,
          walkSpeed: 3.2,
          walkSpeedUnit: 'm',
          elevationSpeed: 4.8,
          fieldOfView: 90,
          mouseLookEnabled: false,
          mouseLookSpeed: 300,
          // missing collisionDetectionEnabled
        },
      ];

      for (const config of incompleteConfigs) {
        await expect(service.resetConfiguration(config)).rejects.toThrow(
          'Invalid configuration object',
        );
      }
    });
  });
});
