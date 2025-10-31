import { WebViewer } from '@ts3d-hoops/web-viewer';
import WebViewerComponent from '@ts3d-hoops/web-viewer-components/hoops-web-viewer';

export type RegisteredViewer = { hwv: WebViewer; elm: WebViewerComponent };
const viewerRegister = new Map<string, RegisteredViewer>();

/**
 * Register a viewer with a unique id
 * @param {string} id unique id
 * @param {RegisteredViewer} data viewer data
 */
export function registerViewer(id: string, data: RegisteredViewer) {
  viewerRegister.set(id, data);
}

/**
 * Get the registered viewer with the given id
 * @param {string} id unique id
 * @returns {RegisteredViewer | undefined} viewer data
 */
export function getRegisteredViewer(id: string): RegisteredViewer | undefined {
  return viewerRegister.get(id);
}
