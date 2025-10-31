import {
  Projection as WebViewerProjection,
  OrbitFallbackMode as WebViewerOrbitFallbackMode,
} from '@ts3d-hoops/web-viewer';
import {
  Projection as ServiceProjection,
  OrbitFallbackMode as ServiceOrbitFallbackMode,
} from './types';

export function toServiceProjectionMode(projection: WebViewerProjection): ServiceProjection {
  switch (projection) {
    case WebViewerProjection.Perspective:
      return 'Perspective';
    case WebViewerProjection.Orthographic:
      return 'Orthographic';
    default:
      throw new Error(`Unknown projection mode: ${projection}`);
  }
}

export function toWebViewerProjectionMode(projection: ServiceProjection): WebViewerProjection {
  switch (projection) {
    case 'Perspective':
      return WebViewerProjection.Perspective;
    case 'Orthographic':
      return WebViewerProjection.Orthographic;
    default:
      throw new Error(`Unknown projection mode: ${projection}`);
  }
}

export function toServiceOrbitFallbackMode(
  mode: WebViewerOrbitFallbackMode,
): ServiceOrbitFallbackMode {
  switch (mode) {
    case WebViewerOrbitFallbackMode.CameraTarget:
      return 'Camera Target';
    case WebViewerOrbitFallbackMode.ModelCenter:
      return 'Model Center';
    case WebViewerOrbitFallbackMode.OrbitTarget:
      return 'Orbit Target';
    default:
      throw new Error(`Unknown orbit fallback mode: ${mode}`);
  }
}

export function toWebViewerOrbitFallbackMode(
  mode: ServiceOrbitFallbackMode,
): WebViewerOrbitFallbackMode {
  switch (mode) {
    case 'Camera Target':
      return WebViewerOrbitFallbackMode.CameraTarget;
    case 'Model Center':
      return WebViewerOrbitFallbackMode.ModelCenter;
    case 'Orbit Target':
      return WebViewerOrbitFallbackMode.OrbitTarget;
    default:
      throw new Error(`Unknown orbit fallback mode: ${mode}`);
  }
}
