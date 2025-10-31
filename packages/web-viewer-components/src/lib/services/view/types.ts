import { IResettableConfigurationService, IService } from '../types';

export type ViewServiceConfiguration = {
  axisTriadVisible: boolean;
  navCubeVisible: boolean;
};

export function isViewServiceConfiguration(obj: unknown): obj is ViewServiceConfiguration {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const viewData = obj as ViewServiceConfiguration;
  return (
    typeof viewData.axisTriadVisible === 'boolean' && typeof viewData.navCubeVisible === 'boolean'
  );
}

export interface IViewService extends IService, IResettableConfigurationService {
  isAxisTriadVisible(): boolean;
  setAxisTriadVisible(visible: boolean): void;
  isNavCubeVisible(): boolean;
  setNavCubeVisible(visible: boolean): void;
  reset(): void;
}
