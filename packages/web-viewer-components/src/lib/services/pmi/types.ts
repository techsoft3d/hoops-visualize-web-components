import { NodeId } from '@ts3d-hoops/web-viewer';
import { IResettableConfigurationService, IService } from '../types';

export type PmiServiceConfiguration = {
  color: string;
  isColorOverride: boolean;
};

export function isPmiServiceConfiguration(obj: unknown): obj is PmiServiceConfiguration {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const value = obj as PmiServiceConfiguration;

  return typeof value.color === 'string' && typeof value.isColorOverride === 'boolean';
}

export interface IPmiService extends IService, IResettableConfigurationService {
  getPmiColor(): string;
  setPmiColor(color: string): void;

  getPmiColorOverride(): boolean;
  setPmiColorOverride(enableOverride: boolean, rootId?: NodeId): Promise<void>;

  resetConfiguration(obj?: object): Promise<void>;
}
