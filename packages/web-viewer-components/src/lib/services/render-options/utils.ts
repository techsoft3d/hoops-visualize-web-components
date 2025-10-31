import { PointSizeUnit as WebViewerPointSizeUnit } from '@ts3d-hoops/web-viewer';
import { PointSizeUnit as ServicePointSizeUnit } from './types';

export function toWebViewerPointSizeUnit(unit: ServicePointSizeUnit): WebViewerPointSizeUnit {
  switch (unit) {
    case 'Screen Pixels':
      return WebViewerPointSizeUnit.ScreenPixels;
    case 'CSS Pixels':
      return WebViewerPointSizeUnit.CSSPixels;
    case 'World':
      return WebViewerPointSizeUnit.World;
    case 'Proportion Of Screen Width':
      return WebViewerPointSizeUnit.ProportionOfScreenWidth;
    case 'Proportion Of Screen Height':
      return WebViewerPointSizeUnit.ProportionOfScreenHeight;
    case 'Proportion Of Bounding Diagonal':
      return WebViewerPointSizeUnit.ProportionOfBoundingDiagonal;
    default:
      throw new Error(`Unknown service point size unit: ${unit}`);
  }
}
