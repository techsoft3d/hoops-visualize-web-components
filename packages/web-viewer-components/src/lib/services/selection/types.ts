import { IResettableConfigurationService, IService } from '../types';

export type SelectionServiceConfiguration = {
  faceLineSelectionEnabled: boolean;
  honorsSceneVisibility: boolean;
  bodyColor: string;
  faceAndLineColor: string;
};

export function isSelectionServiceConfiguration(
  obj: unknown,
): obj is SelectionServiceConfiguration {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const value = obj as SelectionServiceConfiguration;
  return (
    typeof value.faceLineSelectionEnabled === 'boolean' &&
    typeof value.honorsSceneVisibility === 'boolean' &&
    typeof value.bodyColor === 'string' &&
    typeof value.faceAndLineColor === 'string'
  );
}

/**
 * @interface ISelectionService
 * @extends IService
 *
 * @brief Service interface for managing selection feature of the web viewer.
 *
 * Provides methods to interface the selection manager.
 */
export interface ISelectionService extends IService, IResettableConfigurationService {
  getEnableFaceLineSelection(): boolean;
  setEnableFaceLineSelection(enableFaceLineSelection: boolean): Promise<void>;
  getHonorsSceneVisibility(): boolean;
  setHonorsSceneVisibility(honorsSceneVisibility: boolean): void;
  getBodyColor(): string;
  setBodyColor(color: string): Promise<void>;
  getFaceAndLineColor(): string;
  setFaceAndLineColor(color: string): Promise<void>;

  resetConfiguration(obj?: object): Promise<void>;
}
