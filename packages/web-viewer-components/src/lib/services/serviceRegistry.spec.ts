import { IService, ServiceName, ServiceNames } from './types';

import {
  serviceRegistry,
  registerService,
  unregisterService,
  getService,
  tryGetService,
  getAllServices,
  hasService,
  clearServices,
} from './serviceRegistry';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('serviceRegistry', () => {
  const mockService = {
    serviceName: 'MockService',
    doSomething: vi.fn(),
  } as unknown as IService;

  const anotherService = {
    serviceName: 'AnotherService' as ServiceName,
    doSomethingElse: vi.fn(),
  } as unknown as IService;

  beforeEach(() => {
    clearServices();
  });

  it('should initialize with an empty registry', () => {
    expect(Object.keys(serviceRegistry)).toHaveLength(0);
  });

  it('should have default service names', () => {
    expect(ServiceNames).toEqual([
      'CameraService',
      'CuttingService',
      'ExplodeService',
      'SheetService',
      'IFCRelationshipsService',
      'MeasurementService',
      'NoteTextService',
      'PmiService',
      'RedlineService',
      'RenderOptionsService',
      'SelectionService',
      'SpaceMouseService',
      'ViewService',
      'FloorplanService',
      'WalkOperatorService',
    ]);
  });

  it('should register a service', () => {
    registerService(mockService);
    expect(serviceRegistry[mockService.serviceName]).toBe(mockService);
  });

  it('should overwrite an existing service with the same name', () => {
    registerService(mockService);
    const newService = { ...mockService, doSomething: vi.fn() };
    registerService(newService);
    expect(serviceRegistry[mockService.serviceName]).toBe(newService);
  });

  it('should throw if registering a service without serviceName', () => {
    expect(() => registerService({} as unknown as IService)).toThrow(
      'Service must have a serviceName property.',
    );
  });

  it('should unregister a registered service', () => {
    registerService(mockService);
    unregisterService(mockService.serviceName);
    expect(serviceRegistry[mockService.serviceName]).toBeUndefined();
  });

  it('should throw when unregistering a non-existent service', () => {
    expect(() => unregisterService('NonExistentService' as ServiceName)).toThrow(
      'Service with name NonExistentService is not registered.',
    );
  });

  it('should throw when unregistering with undefined serviceName', () => {
    expect(() => unregisterService(undefined as unknown as ServiceName)).toThrow(
      'Service with name undefined is not registered.',
    );
  });

  it('should get a registered service', () => {
    registerService(mockService);
    const service = getService<typeof mockService>(mockService.serviceName);
    expect(service).toBe(mockService);
  });

  it('should return undefined for a non-existent service', () => {
    expect(tryGetService('NonExistentService' as ServiceName)).toBeUndefined();
  });

  it('should get all registered services', () => {
    registerService(mockService);
    registerService(anotherService);
    const all = getAllServices();
    expect(all).toEqual({
      [mockService.serviceName]: mockService,
      [anotherService.serviceName]: anotherService,
    });
  });

  it('should check if a service exists', () => {
    registerService(mockService);
    expect(hasService(mockService.serviceName)).toBe(true);
    expect(hasService('NonExistentService' as ServiceName)).toBe(false);
  });

  it('should clear all services', () => {
    registerService(mockService);
    registerService(anotherService);
    clearServices();
    expect(Object.keys(serviceRegistry)).toHaveLength(0);
  });

  it('should throw when getting a non-existent service', () => {
    expect(() => getService('NonExistentService' as ServiceName)).toThrow(
      'Service with name NonExistentService is not registered.',
    );
  });
});
