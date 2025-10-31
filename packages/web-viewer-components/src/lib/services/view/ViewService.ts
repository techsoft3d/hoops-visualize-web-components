import { core } from '@ts3d-hoops/web-viewer';
import { isViewServiceConfiguration, type IViewService } from './types';

export class ViewService extends EventTarget implements IViewService {
  public readonly serviceName = 'ViewService' as const;

  private _view?: core.IView;

  public static readonly DefaultConfiguration = {
    axisTriadVisible: true,
    navCubeVisible: true,
  };

  constructor(view?: core.IView) {
    super();
    this._view = view;
  }

  get view(): core.IView | undefined {
    return this._view;
  }

  set view(view: core.IView | undefined) {
    if (this._view === view) {
      return;
    }

    this._view = view;

    this.dispatchEvent(
      new CustomEvent('hoops-view-reset', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  isAxisTriadVisible(): boolean {
    return this._view?.axisTriad.getEnabled() ?? ViewService.DefaultConfiguration.axisTriadVisible;
  }

  setAxisTriadVisible(visible: boolean): void {
    if (!this._view) {
      throw new Error('ViewService: View is not initialized.');
    }

    if (this._view.axisTriad.getEnabled() !== visible) {
      if (visible) {
        this._view.axisTriad.enable();
      } else {
        this._view.axisTriad.disable();
      }

      this.dispatchEvent(
        new CustomEvent('hoops-view-axis-triad-visibility-changed', {
          detail: { visible },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  isNavCubeVisible(): boolean {
    return this._view?.navCube.getEnabled() ?? ViewService.DefaultConfiguration.navCubeVisible;
  }

  setNavCubeVisible(visible: boolean): void {
    if (!this._view) {
      throw new Error('ViewService: View is not initialized.');
    }

    if (this._view.navCube.getEnabled() !== visible) {
      if (visible) {
        this._view.navCube.enable();
      } else {
        this._view.navCube.disable();
      }

      this.dispatchEvent(
        new CustomEvent('hoops-view-nav-cube-visibility-changed', {
          detail: { visible },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  reset(): void {
    this.dispatchEvent(new CustomEvent('hoops-view-service-reset'));
  }

  async resetConfiguration(obj?: object): Promise<void> {
    const config = obj ?? ViewService.DefaultConfiguration;
    if (!isViewServiceConfiguration(config)) {
      throw new Error('Invalid configuration object');
    }

    this.setAxisTriadVisible(config.axisTriadVisible);
    this.setNavCubeVisible(config.navCubeVisible);
  }
}

export default ViewService;
