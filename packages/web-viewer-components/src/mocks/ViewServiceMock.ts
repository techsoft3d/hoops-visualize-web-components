import { IViewService } from '../lib/services/view/types';

export class ViewServiceMock extends EventTarget implements IViewService {
  public readonly serviceName = 'ViewService' as const;

  private axisTriadEnabled: boolean;
  private navCubeEnabled: boolean;

  public fn: (...args: any[]) => any;

  public isAxisTriadVisible: () => boolean;
  public setAxisTriadVisible: (visible: boolean) => void;
  public isNavCubeVisible: () => boolean;
  public setNavCubeVisible: (visible: boolean) => void;
  public reset: () => void;
  public resetConfiguration: (obj?: object) => Promise<void>;

  constructor(fn: (...args: any[]) => any) {
    super();
    this.fn = fn;

    this.axisTriadEnabled = false;
    this.navCubeEnabled = false;

    this.isAxisTriadVisible = fn((): boolean => {
      return this.axisTriadEnabled;
    });

    this.setAxisTriadVisible = fn((visible: boolean): void => {
      this.axisTriadEnabled = visible;
      this.dispatchEvent(
        new CustomEvent('hoops-view-axis-triad-visibility-changed', {
          detail: { visible },
        }),
      );
    });

    this.isNavCubeVisible = fn((): boolean => {
      return this.navCubeEnabled;
    });

    this.setNavCubeVisible = fn((visible: boolean): void => {
      this.navCubeEnabled = visible;
      this.dispatchEvent(
        new CustomEvent('hoops-view-nav-cube-visibility-changed', {
          detail: { visible },
        }),
      );
    });

    this.reset = fn((): void => {
      this.axisTriadEnabled = false;
      this.navCubeEnabled = false;
      this.dispatchEvent(new CustomEvent('hoops-view-reset'));
    });

    this.resetConfiguration = fn();
  }
}

export default ViewServiceMock;
