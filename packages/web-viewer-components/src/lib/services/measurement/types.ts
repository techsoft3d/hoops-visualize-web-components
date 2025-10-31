import { Operators } from '@ts3d-hoops/web-viewer';
import { IResettableConfigurationService, IService } from '../types';

type MeasureMarkup = Operators.Markup.Measure.MeasureMarkup;

export type MeasurementServiceConfiguration = {
  color: string;
};

export function isMeasurementServiceConfiguration(
  obj: unknown,
): obj is MeasurementServiceConfiguration {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const value = obj as MeasurementServiceConfiguration;
  return typeof value.color === 'string';
}

export interface IMeasurementService extends IService, IResettableConfigurationService {
  measurements: MeasureMarkup[];
  removeMeasurement(measurement: MeasureMarkup): void;
  getMeasurementColor(): string;
  setMeasurementColor(color: string): void;
  resetConfiguration(obj?: object): Promise<void>;
}
