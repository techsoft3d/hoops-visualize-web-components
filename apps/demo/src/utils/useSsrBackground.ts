import { useEffect, useRef } from 'react';
import { Color, WebViewer } from '@ts3d-hoops/web-viewer';
import { getService } from '@ts3d-hoops/web-viewer-components/services';
import { IRenderOptionsService } from '@ts3d-hoops/web-viewer-components/services/render-options/types';

function getManagedBackground(): { top: Color; bottom: Color } {
  const hex = getComputedStyle(document.body).getPropertyValue('--hoops-background').trim();
  const color = Color.fromHexString(hex);
  return { top: color, bottom: color };
}

/**
 * Manages the 3D viewer background color in SSR mode.
 *
 * SSR mode does not support transparent backgrounds, so we set a solid color
 * matching the current theme. The user can override via the settings panel,
 * in which case we stop managing the background. Resetting settings to default
 * re-enables managed mode.
 *
 * @param isSsr - Whether the viewer is running in SSR mode
 * @param webViewer - The WebViewer instance, or null if not yet ready
 * @param isSceneReady - Whether the viewer scene is ready (background can only be set after this)
 */
export function useSsrBackground(
  isSsr: boolean,
  webViewer: WebViewer | null,
  isSceneReady: boolean,
): void {
  const isManaged = useRef(true);

  useEffect(() => {
    if (!isSsr || !webViewer || !isSceneReady) {
      return;
    }

    // Apply initial managed background
    const { top, bottom } = getManagedBackground();
    webViewer.view.setBackgroundColor(top, bottom);

    // RenderOptionsService is a plain EventTarget (not a DOM element), so its events
    // don't bubble to document. We must listen on the service instance directly.
    const renderOptionsService = getService<IRenderOptionsService>('RenderOptionsService');

    const onBackgroundChanged = (e: Event) => {
      const { top: t, bottom: b } = (e as CustomEvent<{ top?: string; bottom?: string }>).detail;
      if (!t && !b) {
        // Transparent reset (e.g. "Reset to Default") — re-enter managed mode
        isManaged.current = true;
        const { top: newTop, bottom: newBottom } = getManagedBackground();
        webViewer.view.setBackgroundColor(newTop, newBottom);
      } else {
        // User explicitly set a color — exit managed mode
        isManaged.current = false;
      }
    };

    renderOptionsService.addEventListener('hoops-background-color-changed', onBackgroundChanged);

    // Re-apply background when the theme (body class) changes
    const observer = new MutationObserver(() => {
      if (isManaged.current) {
        const { top: newTop, bottom: newBottom } = getManagedBackground();
        webViewer.view.setBackgroundColor(newTop, newBottom);
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => {
      renderOptionsService.removeEventListener(
        'hoops-background-color-changed',
        onBackgroundChanged,
      );
      observer.disconnect();
    };
  }, [isSsr, webViewer, isSceneReady]);
}
