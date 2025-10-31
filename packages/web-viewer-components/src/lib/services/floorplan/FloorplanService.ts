import {
  type IFloorplanService,
  type OrientationName,
  type AutoActivationModeName,
  isFloorplanServiceConfiguration,
} from './types';
import { FloorplanOrientation, Floorplan, Color } from '@ts3d-hoops/web-viewer';

export class FloorplanService extends EventTarget implements IFloorplanService {
  public readonly serviceName = 'FloorplanService' as const;

  private _floorplanManager?: Floorplan.FloorplanManager;

  public static readonly DefaultConfig = {
    floorplanActive: false,
    trackCamera: false,
    orientation: 'North Up' as OrientationName,
    autoActivationMode: 'Bim + Walk' as AutoActivationModeName,
    overlayFeetPerPixel: 0.1,
    overlayZoomLevel: 1.0,
    overlayBackgroundOpacity: 0.25,
    overlayBorderOpacity: 1.0,
    overlayAvatarOpacity: 1.0,
    floorplanBackgroundColor: '#ffffff',
    floorplanBorderColor: '#000000',
    floorplanAvatarColor: '#ff00ff',
    floorplanAvatarOutlineColor: '#000000',
  };

  constructor(floorplanManager?: Floorplan.FloorplanManager) {
    super();
    this._floorplanManager = floorplanManager;
  }

  get floorplanManager(): Floorplan.FloorplanManager | undefined {
    return this._floorplanManager;
  }

  set floorplanManager(manager: Floorplan.FloorplanManager | undefined) {
    this._floorplanManager = manager;
    this.dispatchEvent(
      new CustomEvent('hoops-floorplan-manager-reset', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  isActive(): boolean {
    return this._floorplanManager?.isActive() ?? false;
  }

  async setActive(active: boolean): Promise<void> {
    if (!this._floorplanManager) {
      throw new Error('FloorplanManager is not initialized');
    }

    if (this.isActive() === active) {
      return;
    }

    if (active) {
      await this._floorplanManager.activate();
    } else {
      await this._floorplanManager.deactivate();
    }

    this.dispatchEvent(
      new CustomEvent('hoops-floorplan-activation-changed', {
        detail: { active },
        bubbles: true,
        composed: true,
      }),
    );
  }

  isTrackCameraEnabled(): boolean {
    return this._floorplanManager?.getConfiguration().trackCameraEnabled ?? false;
  }

  async setTrackCameraEnabled(enabled: boolean): Promise<void> {
    if (!this._floorplanManager) {
      throw new Error('FloorplanManager is not initialized');
    }

    if (this.isTrackCameraEnabled() === enabled) {
      return;
    }

    await this._floorplanManager.setTrackCameraEnabled(enabled);
    this.dispatchEvent(
      new CustomEvent('hoops-floorplan-track-camera-changed', {
        detail: { enabled },
        bubbles: true,
        composed: true,
      }),
    );
  }

  getOrientation(): OrientationName {
    const orientation = this._floorplanManager?.getConfiguration().floorplanOrientation;
    switch (orientation) {
      case FloorplanOrientation.NorthUp:
        return 'North Up';
      case FloorplanOrientation.AvatarUp:
        return 'Avatar Up';
      default:
        return 'North Up';
    }
  }

  async setOrientation(orientation: OrientationName): Promise<void> {
    if (!this._floorplanManager) {
      throw new Error('FloorplanManager is not initialized');
    }

    let floorplanOrientation: FloorplanOrientation;
    switch (orientation) {
      case 'North Up':
        floorplanOrientation = FloorplanOrientation.NorthUp;
        break;
      case 'Avatar Up':
        floorplanOrientation = FloorplanOrientation.AvatarUp;
        break;
      default:
        throw new Error(`Unknown orientation: ${orientation}`);
    }

    await this._floorplanManager.setFloorplanOrientation(floorplanOrientation);
    this.dispatchEvent(
      new CustomEvent('hoops-floorplan-orientation-changed', {
        detail: { orientation },
        bubbles: true,
        composed: true,
      }),
    );
  }

  getAutoActivationMode(): AutoActivationModeName {
    const mode = this._floorplanManager?.getConfiguration().autoActivate;
    switch (mode) {
      case Floorplan.FloorplanAutoActivation.Bim:
        return 'Bim';
      case Floorplan.FloorplanAutoActivation.BimWalk:
        return 'Bim + Walk';
      case Floorplan.FloorplanAutoActivation.Never:
        return 'Never';
      default:
        return 'Bim';
    }
  }

  async setAutoActivationMode(mode: AutoActivationModeName): Promise<void> {
    if (!this._floorplanManager) {
      throw new Error('FloorplanManager is not initialized');
    }

    let autoActivationMode: Floorplan.FloorplanAutoActivation;
    switch (mode) {
      case 'Bim':
        autoActivationMode = Floorplan.FloorplanAutoActivation.Bim;
        break;
      case 'Bim + Walk':
        autoActivationMode = Floorplan.FloorplanAutoActivation.BimWalk;
        break;
      case 'Never':
        autoActivationMode = Floorplan.FloorplanAutoActivation.Never;
        break;
      default:
        throw new Error(`Unknown auto activation mode: ${mode}`);
    }

    await this._floorplanManager.setAutoActivate(autoActivationMode);
    this.dispatchEvent(
      new CustomEvent('hoops-floorplan-auto-activation-changed', {
        detail: { mode },
        bubbles: true,
        composed: true,
      }),
    );
  }

  getOverlayFeetPerPixel(): number {
    return this._floorplanManager?.getConfiguration().overlayFeetPerPixel ?? 0;
  }

  async setOverlayFeetPerPixel(feetPerPixel: number): Promise<void> {
    if (!this._floorplanManager) {
      throw new Error('FloorplanManager is not initialized');
    }

    if (this.getOverlayFeetPerPixel() === feetPerPixel) {
      return;
    }

    await this._floorplanManager.setOverlayFeetPerPixel(feetPerPixel);
    this.dispatchEvent(
      new CustomEvent('hoops-floorplan-overlay-feet-per-pixel-changed', {
        detail: { feetPerPixel },
        bubbles: true,
        composed: true,
      }),
    );
  }

  getOverlayZoomLevel(): number {
    return this._floorplanManager?.getConfiguration().zoomLevel ?? 1.0;
  }

  async setOverlayZoomLevel(zoomLevel: number): Promise<void> {
    if (!this._floorplanManager) {
      throw new Error('FloorplanManager is not initialized');
    }

    if (this.getOverlayZoomLevel() === zoomLevel) {
      return;
    }

    await this._floorplanManager.setZoomLevel(zoomLevel);
    this.dispatchEvent(
      new CustomEvent('hoops-floorplan-overlay-zoom-level-changed', {
        detail: { zoomLevel },
        bubbles: true,
        composed: true,
      }),
    );
  }

  getOverlayBackgroundOpacity(): number {
    return this._floorplanManager?.getConfiguration().backgroundOpacity ?? 1.0;
  }

  async setOverlayBackgroundOpacity(opacity: number): Promise<void> {
    if (!this._floorplanManager) {
      throw new Error('FloorplanManager is not initialized');
    }

    if (this.getOverlayBackgroundOpacity() === opacity) {
      return;
    }

    await this._floorplanManager.setBackgroundOpacity(opacity);
    this.dispatchEvent(
      new CustomEvent('hoops-floorplan-overlay-background-opacity-changed', {
        detail: { opacity },
        bubbles: true,
        composed: true,
      }),
    );
  }

  getOverlayBorderOpacity(): number {
    return this._floorplanManager?.getConfiguration().borderOpacity ?? 1.0;
  }

  async setOverlayBorderOpacity(opacity: number): Promise<void> {
    if (!this._floorplanManager) {
      throw new Error('FloorplanManager is not initialized');
    }

    if (this.getOverlayBorderOpacity() === opacity) {
      return;
    }

    await this._floorplanManager.setBorderOpacity(opacity);
    this.dispatchEvent(
      new CustomEvent('hoops-floorplan-overlay-border-opacity-changed', {
        detail: { opacity },
        bubbles: true,
        composed: true,
      }),
    );
  }

  getOverlayAvatarOpacity(): number {
    return this._floorplanManager?.getConfiguration().avatarOpacity ?? 1.0;
  }

  async setOverlayAvatarOpacity(opacity: number): Promise<void> {
    if (!this._floorplanManager) {
      throw new Error('FloorplanManager is not initialized');
    }

    if (this.getOverlayAvatarOpacity() === opacity) {
      return;
    }

    await this._floorplanManager.setAvatarOpacity(opacity);
    this.dispatchEvent(
      new CustomEvent('hoops-floorplan-overlay-avatar-opacity-changed', {
        detail: { opacity },
        bubbles: true,
        composed: true,
      }),
    );
  }

  getFloorplanBackgroundColor(): string {
    return this._floorplanManager?.getConfiguration().backgroundColor.toHexString() || '#ffffff';
  }

  async setFloorplanBackgroundColor(color: string): Promise<void> {
    if (!this._floorplanManager) {
      throw new Error('FloorplanManager is not initialized');
    }

    await this._floorplanManager.setBackgroundColor(Color.fromHexString(color));
    this.dispatchEvent(
      new CustomEvent('hoops-floorplan-background-color-changed', {
        detail: { color },
        bubbles: true,
        composed: true,
      }),
    );
  }

  getFloorplanBorderColor(): string {
    return this._floorplanManager?.getConfiguration().borderColor.toHexString() || '#ffffff';
  }

  async setFloorplanBorderColor(color: string): Promise<void> {
    if (!this._floorplanManager) {
      throw new Error('FloorplanManager is not initialized');
    }

    await this._floorplanManager.setBorderColor(Color.fromHexString(color));
    this.dispatchEvent(
      new CustomEvent('hoops-floorplan-border-color-changed', {
        detail: { color },
        bubbles: true,
        composed: true,
      }),
    );
  }

  getFloorplanAvatarColor(): string {
    return this._floorplanManager?.getConfiguration().avatarColor.toHexString() || '#ffffff';
  }

  async setFloorplanAvatarColor(color: string): Promise<void> {
    if (!this._floorplanManager) {
      throw new Error('FloorplanManager is not initialized');
    }

    await this._floorplanManager.setAvatarColor(Color.fromHexString(color));
    this.dispatchEvent(
      new CustomEvent('hoops-floorplan-avatar-color-changed', {
        detail: { color },
        bubbles: true,
        composed: true,
      }),
    );
  }

  getFloorplanAvatarOutlineColor(): string {
    return this._floorplanManager?.getConfiguration().avatarOutlineColor.toHexString() || '#ffffff';
  }

  async setFloorplanAvatarOutlineColor(color: string): Promise<void> {
    if (!this._floorplanManager) {
      throw new Error('FloorplanManager is not initialized');
    }

    await this._floorplanManager.setAvatarOutlineColor(Color.fromHexString(color));
    this.dispatchEvent(
      new CustomEvent('hoops-floorplan-avatar-outline-color-changed', {
        detail: { color },
        bubbles: true,
        composed: true,
      }),
    );
  }

  async resetConfiguration(obj?: object): Promise<void> {
    const config = obj ?? FloorplanService.DefaultConfig;

    if (!isFloorplanServiceConfiguration(config)) {
      throw new Error('Invalid floorplan configuration object');
    }

    if (!this._floorplanManager) {
      throw new Error('FloorplanManager is not initialized');
    }

    await this.setActive(config.floorplanActive);
    await this.setTrackCameraEnabled(config.trackCamera);
    await this.setOrientation(config.orientation);
    await this.setAutoActivationMode(config.autoActivationMode);
    await this.setOverlayFeetPerPixel(config.overlayFeetPerPixel);
    await this.setOverlayZoomLevel(config.overlayZoomLevel);
    await this.setOverlayBackgroundOpacity(config.overlayBackgroundOpacity);
    await this.setOverlayBorderOpacity(config.overlayBorderOpacity);
    await this.setOverlayAvatarOpacity(config.overlayAvatarOpacity);
    await this.setFloorplanBackgroundColor(config.floorplanBackgroundColor);
    await this.setFloorplanBorderColor(config.floorplanBorderColor);
    await this.setFloorplanAvatarColor(config.floorplanAvatarColor);
    await this.setFloorplanAvatarOutlineColor(config.floorplanAvatarOutlineColor);

    this.dispatchEvent(
      new CustomEvent('hoops-floorplan-manager-reset', {
        detail: {},
        bubbles: true,
        composed: true,
      }),
    );
  }

  async reset(): Promise<void> {
    this.dispatchEvent(
      new CustomEvent('hoops-floorplan-manager-reset', {
        detail: {},
        bubbles: true,
        composed: true,
      }),
    );
  }
}

export default FloorplanService;
