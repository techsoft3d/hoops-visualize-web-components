import { html, HTMLTemplateResult, nothing } from 'lit';
import { ListContext } from '@ts3d-hoops/ui-kit/list';
import { downIcon, rightIcon } from '@ts3d-hoops/ui-kit/icons';

import './hoops-layer-tree-element';
import { ILayersContainer, LayerTreeElementFactory } from './types';
import { LayerTreeElement } from './hoops-layer-tree-element';
import { NodeId, NodeType, FileType } from '@ts3d-hoops/web-viewer';

/**
 * Create a `layer-tree-element` to render in the layer list. If layerId is not set
 * or is NaN then nothing is displayed.
 *
 * @export
 * @param {ILayersContainer} layer The model that contains the layers
 * @param {number} layerId The id of the layer to render
 * @param {boolean} selected whether the layer is selected or not
 * @param {boolean[]} selectedNodes which nodes in the layer sublist are selected
 * @returns {(HTMLTemplateResult | typeof nothing)} The HTML fragment to display
 */
export function defaultLayerElementFactory(
  listContext: ListContext,
  layersContainer: ILayersContainer,
  layerId: number,
  selected?: boolean,
  selectedNodes?: number[],
): HTMLTemplateResult | typeof nothing {
  const element = document.createElement('hoops-layer-tree-element') as LayerTreeElement;
  element.layerId = layerId;
  element.layerName = listContext.elementsData?.get(layerId) ?? `Unnamed layer ${layerId}`;
  // COM-4546, temp fix until we decide the fate of layer "No Layer"
  if (element.layerName === 'No layer') {
    return nothing;
  }
  element.selected = selected ?? false;
  element.selectedNodes = selectedNodes ?? [];
  const layerNodes = layersContainer.getNodesFromLayerName(element.layerName);
  const nodeIdToName = new Map<number, string>();
  const nodesChildren = new Map<number, number[]>();
  if (!layerNodes || layerNodes?.length <= 0) {
    return nothing;
  }
  layerNodes?.forEach((nodeId) => {
    nodeId = getAdjustedNodeId(layersContainer, nodeId);
    nodeIdToName.set(nodeId, layersContainer.getNodeName(nodeId) ?? 'Unknown node');
  });
  element.layerNodes = nodeIdToName;
  // Second iteration to determine the nodes' children that are part of the layers
  for (const nodeId of element.layerNodes.keys()) {
    const nodeChildren = layersContainer.getNodeChildren(nodeId);
    if (nodeChildren && nodeChildren.length > 0) {
      const nodeChildrenPartOfLayer = nodeChildren.filter((nodeChild) =>
        nodeIdToName.has(nodeChild),
      );
      if (nodeChildrenPartOfLayer.length > 0) {
        nodesChildren.set(nodeId, nodeChildrenPartOfLayer);
      }
    }
  }
  element.nodesChildren = nodesChildren;
  return html` ${element} `;
}

/**
 * Don't add BodyInstance nodes for BIM models.
 *
 * Drawing files (both 2D and 3D) should use the BodyInstance nodes,
 * as each BodyInstance might be in a different layer.
 *
 * isDrawing will be false for 3D DWG files, so also check that the file
 * is not a DWG file before substituting the BodyInstance for the parent.
 *
 * @param layersContainer - The container that provides access to layer-related operations, which should be a Model object.
 * @param nodeId - The ID of the node to be adjusted.
 * @returns The adjusted node ID. If the model is not a drawing, the file type is not DWG,
 *          and the node type is a BodyInstance, the function returns the parent node ID
 *          if it exists; otherwise, it returns the original node ID.
 */
export function getAdjustedNodeId(layersContainer: ILayersContainer, nodeId: number): number {
  const fileType = layersContainer.getModelFileTypeFromNode(nodeId);
  const nodeType = layersContainer.getNodeType(nodeId);
  const isDrawing = layersContainer.isDrawing();

  if (!isDrawing && fileType !== FileType.Dwg && nodeType === NodeType.BodyInstance) {
    const parentId = layersContainer.getNodeParent(nodeId);
    if (parentId !== null) {
      nodeId = parentId;
    }
  }
  return nodeId;
}

/**
 * This class serves as a proxy to the Model class. I is used by the LayerTree
 * to communicate with the Model.
 *
 * @export
 * @class LayerAdapter
 * @typedef {LayerAdapter}
 * @implements {ListContext}
 */
export default class LayerAdapter implements ListContext {
  /**
   * The object that contains layers, for the webviewer this will be our Model object
   *
   * @type {?ILayersContainer}
   */
  layersContainer?: ILayersContainer;

  /**
   * A map that holds the node names associated to their id's
   * @type {Map<NodeId, string>}
   */
  nodeIdsToNodeNames: Map<NodeId, string> = new Map();

  /**
   * A map that holds the layer names and the collection of
   * node ids that belong to the layer
   * @type {Map<string, Set<NodeId>>}
   */
  layerNamesToNodeIds: Map<string, Set<NodeId>> = new Map();

  /**
   * A function that creates a HTML fragment for a given layer.
   *
   * @type {LayerTreeElementFactory}
   */
  layerFactory: LayerTreeElementFactory = defaultLayerElementFactory;

  /**
   * This structure hold custom data for the layers inside the context to make it
   * reactive.
   *
   * You can use this variable to record property for your custom layer list elements
   *
   * The data are recorded as a literal object using the layer ids as keys and
   * anything as value.
   *
   * @type {Record<number, unknown>}
   */
  layersData: Record<number, unknown> = {};

  elementsData: Map<number, string> = new Map<number, string>();

  /**
   * The icon drawn when a layer is expanded.
   *
   * @type {HTMLTemplateResult}
   */
  expandedIcon = html`${downIcon}`;

  /**
   * The icon drawn when a layer is collapsed.
   *
   * @type {HTMLTemplateResult}
   */
  collapsedIcon = html`${rightIcon}`;

  /**
   * Layer list is not sorted by layer id
   */
  sortedByValue = false;

  /**
   * Return the HTML Fragment for a node.
   * @param id The id of the node to render.
   * @param selected Whether the node is selected or not.
   * @returns The HTML fragment to render for the node.
   */
  getContent(
    _: ListContext,
    id: number,
    selected?: boolean,
    selectedNodes?: number[],
  ): HTMLTemplateResult | typeof nothing {
    if (!this.layersContainer) {
      return nothing;
    }
    return this.layerFactory(
      this,
      this.layersContainer,
      id,
      selected ?? false,
      selectedNodes ?? [],
    );
  }
}
