/**
 * The following types are used to define the structure of services in the web viewer components.
 * They include a list of service names, a type for service names, and an interface for services.
 * The `ServiceRegistry` type maps service names to their respective service instances.
 * This allows for easy registration, retrieval, and management of services within the application.
 *
 * The `ServiceNames` constant defines the available service names, which can be extended as needed.
 * The `ServiceName` type is a union of the defined service names and allows for string literals,
 * providing flexibility in service naming while ensuring type safety.
 *
 * This concept is named loose completion in typescript, you can learn more about it here:
 * https://www.totaltypescript.com/tips/create-autocomplete-helper-which-allows-for-arbitrary-values
 */
export const ServiceNames = [
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
] as const; // Add other service names as needed

export type ServiceName = (typeof ServiceNames)[number] | (string & {}); // Extend with other service names as needed (the `string & {}` trick allows for string literals while still being a valid type and supporting auto completion)

export interface IService extends EventTarget {
  serviceName: ServiceName;
}

export function isService(obj: unknown): obj is IService {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'serviceName' in obj &&
    typeof (obj as IService).serviceName === 'string'
  );
}

export interface IResettableConfigurationService {
  resetConfiguration(obj?: object): Promise<void>;
}

export function isResettableConfigurationService(
  obj: unknown,
): obj is IResettableConfigurationService {
  return (
    isService(obj) &&
    'resetConfiguration' in obj &&
    typeof (obj as IResettableConfigurationService).resetConfiguration === 'function'
  );
}

export type ServiceRegistry = { [K in ServiceName]?: IService };
