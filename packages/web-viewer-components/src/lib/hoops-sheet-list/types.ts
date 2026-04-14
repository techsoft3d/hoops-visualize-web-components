/**
 * Subset of the Model API used by the sheet list. Allows mocking and proxying
 * without wrapping the entire Model interface.
 */
export interface IModel {
  getSheetIds: () => number[];
  getNodeName: (nodeId: number) => string | null;
  isDrawing: () => boolean;
}
