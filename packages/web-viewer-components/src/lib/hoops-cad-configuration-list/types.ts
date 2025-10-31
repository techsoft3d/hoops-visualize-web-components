import { IdStringMap } from '@ts3d-hoops/web-viewer';

export interface CadConfigurationData {
  cadConfigurationId: number;
  cadConfigurationName: string;
}

/**
 * This interface is a subset of the Model API, it is meant to allow mocking and
 * proxying the Model without having to wrap the whole interface.
 *
 * @export
 * @interface IModel
 * @typedef {IModel}
 */
export interface IModel {
  getCadConfigurations: () => IdStringMap;
}
