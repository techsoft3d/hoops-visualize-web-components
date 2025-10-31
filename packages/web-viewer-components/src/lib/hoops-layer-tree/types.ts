import { ListContext } from '@ts3d-hoops/ui-kit/list';
import { HTMLTemplateResult, nothing } from 'lit';
import { FileType, LayerId, LayerName, NodeId, NodeType } from '@ts3d-hoops/web-viewer';

/**
 * This interface is a subset of the Layer API, it is meant to allow mocking and
 * proxying the Layer without having to wrap the whole interface.
 *
 * @export
 * @interface ILayersContainer
 * @typedef {ILayersContainer}
 */
export interface ILayersContainer {
  getLayers: () => Map<LayerId, LayerName>;
  getLayerName(layerId: LayerId): LayerName | null;
  getNodesFromLayerName: (layerName: LayerName, onlyTreeNodes?: boolean) => NodeId[] | null;
  getNodeName: (nodeId: number) => string | null;
  getNodeType: (nodeId: number) => NodeType | null;
  getModelFileTypeFromNode: (nodeId: number) => FileType | null;
  getNodeParent: (nodeId: number) => number | null;
  getNodeChildren: (nodeId: number) => number[] | null;
  isDrawing: () => boolean;
}

/**
 * The signature of the callback used by LayerAdapter to create layer for the
 * `hoops-layer-tree`
 *
 * @export
 * @typedef {LayerTreeElementFactory}
 */
export type LayerTreeElementFactory = (
  listContext: ListContext,
  layersContainer: ILayersContainer,
  layerId: number,
  selected?: boolean,
  selectedNodes?: number[],
) => HTMLTemplateResult | typeof nothing;
