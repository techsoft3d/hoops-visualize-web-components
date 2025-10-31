import { IResettableConfigurationService, IService } from '../types';

export type CuttingServiceConfiguration = {
  cappingGeometryVisibility: boolean;
  cappingFaceColor?: string;
  cappingLineColor?: string;
};

export function isCuttingServiceConfiguration(obj: unknown): obj is CuttingServiceConfiguration {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const value = obj as CuttingServiceConfiguration;
  return (
    typeof value.cappingGeometryVisibility === 'boolean' &&
    (typeof value.cappingFaceColor === 'string' || typeof value.cappingFaceColor === 'undefined') &&
    (typeof value.cappingLineColor === 'string' || typeof value.cappingLineColor === 'undefined')
  );
}

/**
 * @interface ICuttingService
 * @extends IService
 *
 * @brief Service interface for managing cutting feature of the web viewer.
 *
 * Provides methods to interface the cutting manager for controlling cutting sections,
 * planes and capping geometry settings.
 */
export interface ICuttingService extends IService, IResettableConfigurationService {
  getCappingGeometryVisibility(): boolean;
  setCappingGeometryVisibility(cappingGeometryVisibility: boolean): Promise<void>;

  //! undefined for no face
  getCappingFaceColor(): string | undefined;
  setCappingFaceColor(color?: string): Promise<void>;

  //! undefined for no line
  getCappingLineColor(): string | undefined;
  setCappingLineColor(color?: string): Promise<void>;

  resetConfiguration(obj?: object): Promise<void>;
}
