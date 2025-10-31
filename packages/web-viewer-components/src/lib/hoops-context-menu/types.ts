import {
  CallbackMap,
  Color,
  ElementType,
  GenericType,
  LayerId,
  LayerName,
  NodeId,
  SheetManager,
  Operators,
  core,
  Selection,
} from '@ts3d-hoops/web-viewer';

/**
 * This interface is a subset of the WebViewer API, it is meant to allow mocking and
 * proxying the WebViewer without having to wrap the whole interface.
 *
 * @export
 * @interface IContextMenuWebViewer
 * @typedef {IContextMenuWebViewer}
 */
export interface IContextMenuWebViewer {
  view: core.IView;
  setCallbacks: (callbacks: CallbackMap) => void;
  sheetManager: SheetManager;
  noteTextManager: Operators.NoteTextManager;
  selectionManager: Selection.SelectionManager;
}

/**
 * This interface is a subset of the Model API, it is meant to allow mocking and
 * proxying the Model without having to wrap the whole interface.
 *
 * @export
 * @interface IContextMenuModel
 * @typedef {IContextMenuModel}
 */
export interface IContextMenuModel {
  getNodeChildren: (nodeId: number, includeOutOfHierarchy?: boolean) => NodeId[];
  getNodeParent: (nodeId: number) => number | null;
  isDrawing: () => boolean;
  setNodesFaceColor(nodeIds: NodeId[], color: Color): void;
  unsetNodesFaceColor(nodeIds: NodeId[]): void;
  getNodeColorMap(startNodeId: NodeId, elementType: ElementType): Promise<Map<NodeId, Color>>;
  getAbsoluteRootNode(): NodeId;
  setPmiColorOverride(enableOverride: boolean, rootId?: NodeId): Promise<void>;
  getPmiColorOverride(): boolean;
  setMeshLevel(nodeIds: NodeId[], meshLevel: number): Promise<void>;
  getNodesOpacity(leafNodes: NodeId[]): Promise<(number | null)[]>;
  getNodesEffectiveOpacity(nodes: NodeId[], element: ElementType): Promise<number[]>;
  setNodesOpacity(nodeIds: NodeId[], opacity: number): void;
  resetNodesOpacity(nodeIds: NodeId[]): void;
  setNodesVisibility(
    nodeIds: NodeId[],
    visibility: boolean,
    initiallyHiddenStayHidden?: boolean | null,
  ): void;
  hasEffectiveGenericType(nodeId: NodeId, genericType: GenericType): boolean;
  reset: () => Promise<void>;
  getLayerIdsFromName(name: LayerName): LayerId[] | null;
  getNodesFromLayer(layerId: LayerId, onlyTreeNodes?: boolean): NodeId[] | null;
  getNodeVisibility(nodeId: NodeId): boolean;
  getNodesByGenericType(genericType: GenericType): Set<NodeId> | null;
  resetNodesVisibility: () => Promise<void>;
}
