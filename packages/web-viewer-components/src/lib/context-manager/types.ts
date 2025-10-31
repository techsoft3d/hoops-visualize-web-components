import { DrawMode, OperatorId } from '@ts3d-hoops/web-viewer';

export interface WebViewerState {
  drawMode: DrawMode;
  topCameraOperator: OperatorId;
  toolOperator: OperatorId;
}

// By convention, the camera operator is a position 0
export const CameraOperatorPosition = 0 as const;
export const ActiveToolOperatorPosition = 1 as const;

export const redlineModes = [
  OperatorId.RedlineCircle,
  OperatorId.RedlineText,
  OperatorId.RedlineRectangle,
  OperatorId.RedlinePolyline,
] as const;

export interface MarkupData {
  id: string;
  icon: unknown;
  title: string;
  type: string;
}
