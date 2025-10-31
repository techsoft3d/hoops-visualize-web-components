import { IService, ServiceName, ServiceRegistry } from './types';

/**
 * Service Registry for managing services in the application.
 * This registry allows for registering, unregistering, and retrieving services by their names.
 * It also provides utility functions to check for service existence and clear all services.
 */
export const serviceRegistry: ServiceRegistry = {};

/**
 * Registers a service in the service registry.
 * If a service with the same name already exists, it will be overwritten.
 *
 * @param {IService} service - The service to register.
 * @throws {Error} If the service does not have a serviceName property.
 */
export function registerService(service: IService): void {
  if (!service || !service.serviceName) {
    throw new Error('Service must have a serviceName property.');
  }

  const currentService = serviceRegistry[service.serviceName];
  if (currentService == service) {
    return;
  }

  if (currentService) {
    console.info(`Service with name ${service.serviceName} is already registered. Overwriting.`);
  }

  serviceRegistry[service.serviceName] = service;
}

/**
 * Unregisters a service from the service registry.
 * If the service does not exist, an error is thrown.
 *
 * @param {ServiceName} serviceName - The name of the service to unregister.
 * @throws {Error} If the service with the given name is not registered.
 */
export function unregisterService(serviceName: ServiceName): void {
  if (!serviceName || !serviceRegistry[serviceName]) {
    throw new Error(`Service with name ${serviceName} is not registered.`);
  }
  delete serviceRegistry[serviceName];
  console.info(`Service with name ${serviceName} has been unregistered.`);
}

/**
 * Retrieves a service from the service registry by its name.
 *
 * @param serviceName - The name of the service to retrieve.
 * @returns {T | undefined} - The service if found, otherwise undefined.
 * @template T - The type of the service to retrieve, extending from IService.
 */
export function tryGetService<T extends IService>(serviceName: ServiceName): T | undefined {
  return serviceRegistry[serviceName] as T | undefined;
}

/**
 * Retrieves a service from the service registry by its name, throw if the service is not registered.
 *
 * @param serviceName - The name of the service to retrieve.
 * @returns T - The service if found, otherwise undefined.
 * @template T - The type of the service to retrieve, extending from IService.
 */
export function getService<T extends IService>(serviceName: ServiceName): T {
  if (!serviceRegistry[serviceName]) {
    throw new Error(`Service with name ${serviceName} is not registered.`);
  }
  return serviceRegistry[serviceName] as T;
}

/**
 * Retrieves all registered services.
 *
 * @returns {ServiceRegistry} - An object containing all registered services.
 */
export function getAllServices(): ServiceRegistry {
  return { ...serviceRegistry };
}

/**
 * Checks if a service is registered in the service registry.
 *
 * @param {ServiceName} serviceName - The name of the service to check.
 * @returns {boolean} - True if the service is registered, false otherwise.
 */
export function hasService(serviceName: ServiceName): boolean {
  return !!serviceRegistry[serviceName];
}

/**
 * Clears all services from the service registry.
 * This will remove all registered services and reset the registry.
 */
export function clearServices(): void {
  Object.keys(serviceRegistry).forEach((key) => {
    delete serviceRegistry[key];
  });
  console.info('All services have been cleared.');
}
