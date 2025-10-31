import {
  IFloorplanService,
  OrientationName,
  AutoActivationModeName,
} from '../lib/services/floorplan/types';

export class FloorplanServiceMock extends EventTarget implements IFloorplanService {
  public readonly serviceName = 'FloorplanService' as const;

  active: boolean;
  trackCamera: boolean;
  orientation: OrientationName;
  autoActivation: AutoActivationModeName;
  feetPerPixel: number;
  zoomLevel: number;
  backgroundOpacity: number;
  borderOpacity: number;
  avatarOpacity: number;
  backgroundColor: string;
  borderColor: string;
  avatarColor: string;
  avatarOutlineColor: string;

  public fn: (...args: any[]) => any;

  public isActive: () => boolean;
  public setActive: (active: boolean) => Promise<void>;

  public isTrackCameraEnabled: () => boolean;
  public setTrackCameraEnabled: (enabled: boolean) => Promise<void>;

  public getOrientation: () => OrientationName;
  public setOrientation: (orientation: OrientationName) => Promise<void>;

  public getAutoActivationMode: () => AutoActivationModeName;
  public setAutoActivationMode: (mode: AutoActivationModeName) => Promise<void>;

  public getOverlayFeetPerPixel: () => number;
  public setOverlayFeetPerPixel: (feetPerPixel: number) => Promise<void>;

  public getOverlayZoomLevel: () => number;
  public setOverlayZoomLevel: (zoomLevel: number) => Promise<void>;

  public getOverlayBackgroundOpacity: () => number;
  public setOverlayBackgroundOpacity: (opacity: number) => Promise<void>;

  public getOverlayBorderOpacity: () => number;
  public setOverlayBorderOpacity: (opacity: number) => Promise<void>;

  public getOverlayAvatarOpacity: () => number;
  public setOverlayAvatarOpacity: (opacity: number) => Promise<void>;

  public getFloorplanBackgroundColor: () => string;
  public setFloorplanBackgroundColor: (color: string) => Promise<void>;

  public getFloorplanBorderColor: () => string;
  public setFloorplanBorderColor: (color: string) => Promise<void>;

  public getFloorplanAvatarColor: () => string;
  public setFloorplanAvatarColor: (color: string) => Promise<void>;

  public getFloorplanAvatarOutlineColor: () => string;
  public setFloorplanAvatarOutlineColor: (color: string) => Promise<void>;

  public reset: () => Promise<void>;
  public resetConfiguration: (obj?: object) => Promise<void>;

  constructor(fn: (...args: any[]) => any) {
    super();
    this.fn = fn;

    this.active = false;
    this.trackCamera = false;
    this.orientation = 'North Up';
    this.autoActivation = 'Bim';
    this.feetPerPixel = 1;
    this.zoomLevel = 1;
    this.backgroundOpacity = 1;
    this.borderOpacity = 1;
    this.avatarOpacity = 1;
    this.backgroundColor = '#ffffff';
    this.borderColor = '#000000';
    this.avatarColor = '#0000ff';
    this.avatarOutlineColor = '#ffffff';

    // Example state for mock
    this.isActive = fn(() => this.active);
    this.setActive = fn(async (value: boolean) => {
      this.active = value;
      this.dispatchEvent(
        new CustomEvent('hoops-floorplan-activation-changed', { detail: { active: this.active } }),
      );
    });

    this.isTrackCameraEnabled = fn(() => this.trackCamera);
    this.setTrackCameraEnabled = fn(async (enabled: boolean) => {
      this.trackCamera = enabled;
      this.dispatchEvent(
        new CustomEvent('hoops-floorplan-track-camera-changed', { detail: { enabled } }),
      );
    });

    this.getOrientation = fn(() => this.orientation);
    this.setOrientation = fn(async (o: OrientationName) => {
      this.orientation = o;
      this.dispatchEvent(
        new CustomEvent('hoops-floorplan-orientation-changed', { detail: { orientation: o } }),
      );
    });

    this.getAutoActivationMode = fn(() => this.autoActivation);
    this.setAutoActivationMode = fn(async (mode: AutoActivationModeName) => {
      this.autoActivation = mode;
      this.dispatchEvent(
        new CustomEvent('hoops-floorplan-auto-activation-changed', { detail: { mode } }),
      );
    });

    this.getOverlayFeetPerPixel = fn(() => this.feetPerPixel);
    this.setOverlayFeetPerPixel = fn(async (v: number) => {
      this.feetPerPixel = v;
      this.dispatchEvent(
        new CustomEvent('hoops-floorplan-overlay-feet-per-pixel-changed', {
          detail: { feetPerPixel: this.feetPerPixel },
        }),
      );
    });

    this.getOverlayZoomLevel = fn(() => this.zoomLevel);
    this.setOverlayZoomLevel = fn(async (v: number) => {
      this.zoomLevel = v;
      this.dispatchEvent(
        new CustomEvent('hoops-floorplan-overlay-zoom-level-changed', { detail: { zoomLevel: v } }),
      );
    });

    this.getOverlayBackgroundOpacity = fn(() => this.backgroundOpacity);
    this.setOverlayBackgroundOpacity = fn(async (v: number) => {
      this.backgroundOpacity = v;
      this.dispatchEvent(
        new CustomEvent('hoops-floorplan-overlay-background-opacity-changed', {
          detail: { opacity: v },
        }),
      );
    });

    this.getOverlayBorderOpacity = fn(() => this.borderOpacity);
    this.setOverlayBorderOpacity = fn(async (v: number) => {
      this.borderOpacity = v;
      this.dispatchEvent(
        new CustomEvent('hoops-floorplan-overlay-border-opacity-changed', {
          detail: { opacity: v },
        }),
      );
    });

    this.getOverlayAvatarOpacity = fn(() => this.avatarOpacity);
    this.setOverlayAvatarOpacity = fn(async (v: number) => {
      this.avatarOpacity = v;
      this.dispatchEvent(
        new CustomEvent('hoops-floorplan-overlay-avatar-opacity-changed', {
          detail: { opacity: v },
        }),
      );
    });

    this.getFloorplanBackgroundColor = fn(() => this.backgroundColor);
    this.setFloorplanBackgroundColor = fn(async (color: string) => {
      this.backgroundColor = color;
      this.dispatchEvent(
        new CustomEvent('hoops-floorplan-background-color-changed', { detail: { color } }),
      );
    });

    this.getFloorplanBorderColor = fn(() => this.borderColor);
    this.setFloorplanBorderColor = fn(async (color: string) => {
      this.borderColor = color;
      this.dispatchEvent(
        new CustomEvent('hoops-floorplan-border-color-changed', { detail: { color } }),
      );
    });

    this.getFloorplanAvatarColor = fn(() => this.avatarColor);
    this.setFloorplanAvatarColor = fn(async (color: string) => {
      this.avatarColor = color;
      this.dispatchEvent(
        new CustomEvent('hoops-floorplan-avatar-color-changed', { detail: { color } }),
      );
    });

    this.getFloorplanAvatarOutlineColor = fn(() => this.avatarOutlineColor);
    this.setFloorplanAvatarOutlineColor = fn(async (color: string) => {
      this.avatarOutlineColor = color;
      this.dispatchEvent(
        new CustomEvent('hoops-floorplan-avatar-outline-color-changed', { detail: { color } }),
      );
    });

    this.reset = fn(async () => {
      this.active = false;
      this.trackCamera = false;
      this.orientation = 'North Up';
      this.autoActivation = 'Bim';
      this.feetPerPixel = 1;
      this.zoomLevel = 1;
      this.backgroundOpacity = 1;
      this.borderOpacity = 1;
      this.avatarOpacity = 1;
      this.backgroundColor = '#ffffff';
      this.borderColor = '#000000';
      this.avatarColor = '#0000ff';
      this.avatarOutlineColor = '#ffffff';
      this.dispatchEvent(new CustomEvent('hoops-floorplan-reset', {}));
    });

    this.resetConfiguration = fn();
  }
}

export default FloorplanServiceMock;
