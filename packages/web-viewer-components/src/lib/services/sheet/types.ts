import { IResettableConfigurationService, IService } from '../types';

export type SheetServiceConfiguration = {
  backgroundColor: string;
  sheetColor: string;
  sheetShadowColor: string;
  backgroundSheetEnabled: boolean;
};

export function isSheetServiceConfiguration(obj: unknown): obj is SheetServiceConfiguration {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const sheetData = obj as SheetServiceConfiguration;
  return (
    typeof sheetData.backgroundColor === 'string' &&
    typeof sheetData.sheetColor === 'string' &&
    typeof sheetData.sheetShadowColor === 'string' &&
    typeof sheetData.backgroundSheetEnabled === 'boolean'
  );
}

export interface ISheetService extends IService, IResettableConfigurationService {
  getSheetBackgroundColor(): string;
  getSheetColor(): string;
  getSheetShadowColor(): string;
  setSheetColors(
    backgroundColor: string,
    sheetColor: string,
    sheetShadowColor: string,
  ): Promise<void>;
  getBackgroundSheetEnabled(): boolean;
  setBackgroundSheetEnabled(enabled: boolean): Promise<void>;
  resetConfiguration(obj?: object): Promise<void>;
}
