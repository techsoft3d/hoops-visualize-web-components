import { SnapshotConfig, WebViewer } from '@ts3d-hoops/web-viewer';

/**
 * Take a snapshot of the current view and download it as a png file
 * @param {WebViewer} hwv web viewer instance
 */
export async function takeSnapshot(hwv: WebViewer): Promise<void> {
  const downloadLink = document.createElement('a') as HTMLAnchorElement;
  downloadLink.target = '_blank';
  downloadLink.download = 'hwv-screenshot.png';

  const snapshotConfig = new SnapshotConfig();
  const imageElement = await hwv.takeSnapshot(snapshotConfig);
  downloadLink.href = imageElement.src;
  downloadLink.click();
}
