import { html, HTMLTemplateResult, nothing } from 'lit';
import { TreeContext } from '@ts3d-hoops/ui-kit/tree';
import { downIcon, rightIcon } from '@ts3d-hoops/ui-kit/icons';

import './hoops-types-tree-node';
import { IModel, TypesTreeNodeFactory } from './types';
import { Model } from '@ts3d-hoops/web-viewer';
import type { BranchVisibility } from '../hoops-model-tree/types';
import { branchVisibilityFromComBranchVisibility } from '../hoops-model-tree/types';

/**
 * Create a `type-tree-node` to render in the types tree. If nodeId is not set
 * or is NaN then nothing is displayed.
 *
 * @export
 * @param {IModel} model The model that contains the node
 * @param {number} nodeId The id of the node to render
 * @param {?boolean} [selected] whether the node is selected or not
 * @returns {(HTMLTemplateResult | typeof nothing)} The HTML fragment to display
 */
export function defaultNodeFactory(
  treeContext: TreeContext,
  model: IModel,
  nodeId: number,
  selected?: boolean,
  nodeData?: unknown,
): HTMLTemplateResult | typeof nothing {
  let visibility: BranchVisibility = 'Shown';
  const typesAdapter = treeContext as TypesTreeAdapter;

  // Always use existing data from nodesData if it exists, otherwise create new data
  const existingData = typesAdapter.nodesData[nodeId] as any;
  const data: any = nodeData ??
    existingData ?? {
      visibility: 'Shown',
    };

  if (!nodeData && !existingData) {
    typesAdapter.nodesData[nodeId] = data;
  }

  const modelNodeId = () => {
    if (Object.prototype.hasOwnProperty.call(data, 'modelNodeId')) {
      return data.modelNodeId;
    }
    return Number.NaN;
  };

  const modelNodes = () => {
    if (
      Number.isNaN(modelNodeId()) &&
      typeof data.nodeName === 'string' &&
      model.getGenericTypeIdMap().has(data.nodeName)
    ) {
      return Array.from(model.getGenericTypeIdMap().get(data.nodeName) ?? new Set<number>());
    }
    return [];
  };

  // Determine visibility
  if ('getBranchVisibility' in model && Object.prototype.hasOwnProperty.call(data, 'modelNodeId')) {
    // For individual model nodes, get visibility from the model
    const hwvModel = model as Model;
    visibility = branchVisibilityFromComBranchVisibility(
      hwvModel.getBranchVisibility(data.modelNodeId),
    );
  } else if (Object.prototype.hasOwnProperty.call(data, 'visibility')) {
    // For type nodes, use the visibility from the data
    visibility = data.visibility;
  }

  return html`<hoops-types-tree-node
    nodeId=${nodeId}
    visibility=${visibility}
    modelNodeId=${modelNodeId()}
    .modelNodes=${modelNodes()}
    nodeName=${typesAdapter.getNodeName(nodeId) ?? 'N/A'}
    ?selected=${selected}
  >
  </hoops-types-tree-node>`;
}

/**
 * This class serves as a proxy to the Model class. It is used by the TypesTree
 * to communicate with the Model.
 *
 * @export
 * @class TypesTreeAdapter
 * @typedef {TypesTreeAdapter}
 * @implements {TreeContext}
 */
export class TypesTreeAdapter implements TreeContext {
  /**
   * The Model where the node will be queried.
   *
   * @type {?IModel}
   */
  model?: IModel;

  /**
   * A function that creates a HTML fragment for a given node.
   *
   * @type {TypesTreeNodeFactory}
   */
  nodeFactory: TypesTreeNodeFactory = defaultNodeFactory;

  /**
   * This structure hold custom data for the nodes inside the context to make it
   * reactive.
   *
   * You can use this variable to record property for your custom types tree
   * nodes.
   *
   * The data are recorded as a literal object using the node ids as keys and
   * anything as value.
   *
   * @type {Record<number, unknown>}
   */
  nodesData: Record<number, unknown> = {};

  /**
   * The icon drawn when a node is expanded.
   *
   * @type {HTMLTemplateResult}
   */
  expandedIcon = html`${downIcon}`;

  /**
   * The icon drawn when a node is collapsed.
   *
   * @type {HTMLTemplateResult}
   */
  collapsedIcon = html`${rightIcon}`;

  /**
   * The name of the root node
   * @type {string}
   */
  rootNodeName = 'Types';

  /**
   * Stores the generic type id map for the types tree.
   * @type {Map<string, Set<number>> | undefined}
   */
  allTypes?: Map<string, Set<number>> = undefined;

  /**
   * Stores the hierarchy of tree node ids for visual representation.
   * The key is the parent tree node id, and the value is an array of child tree node ids.
   * This is separate from the model node id hierarchy.
   * @type {Map<number, number[]>}
   */
  treeNodes: Map<number, number[]> = new Map();

  /**
   * Counter used to assign indices to type nodes.
   * @type {number}
   */
  indexCounter = 0;

  /**
   * This function will be used by the tree to render the root node.
   * @returns The id of the root node.
   */
  getRoot(): number {
    return TypesTreeNodeId.RootNode;
  }

  /**
   * This function will be used by the tree to get the children of each node.
   *
   * @param {number} nodeId The id of the parent node.
   * @returns {number[]} An array containing the children's ids.
   */
  getChildren(nodeId: number): number[] {
    switch (nodeId) {
      case TypesTreeNodeId.RootNode:
        if (!this.allTypes) {
          this.allTypes = this.model?.getGenericTypeIdMap();
        }
        if (this.allTypes) {
          this.indexCounter = 0;
          this.treeNodes.clear();
          // Record each type entry
          this.allTypes.forEach((_nodesWithType, name) => {
            this.treeNodes.set(this.indexCounter, []); // Lazy load children later
            this.nodesData[this.indexCounter] = {
              nodeName: name,
            };
            this.indexCounter++;
          });
          return Array.from(this.treeNodes.keys());
        }
        return [];
      default:
        // If the nodeId is part of the type indices, we return the children)
        if (this.treeNodes.has(nodeId)) {
          // If children were already loaded, return them
          const children = this.treeNodes.get(nodeId);
          if (children && children.length > 0) return children;
          const typeName = this.getNodeName(nodeId);
          if (typeName && this.allTypes) {
            const nodesWithType = this.allTypes.get(typeName);
            if (nodesWithType) {
              const childrenTreeNodeIds: number[] = [];
              nodesWithType.forEach((modelNodeId) => {
                childrenTreeNodeIds.push(this.indexCounter);
                this.nodesData[this.indexCounter] = {
                  nodeName: this.model?.getNodeName(modelNodeId) ?? 'Unnamed Node',
                  modelNodeId: modelNodeId,
                };
                this.indexCounter++;
              });
              this.treeNodes.set(nodeId, childrenTreeNodeIds);
              return childrenTreeNodeIds;
            }
          }
          return [];
        }
        return [];
    }
  }

  /**
   * Returns the name of a node in the types tree
   * @param nodeId The types tree-specific node id
   */
  getNodeName(nodeId: number) {
    switch (nodeId) {
      case TypesTreeNodeId.RootNode:
        return this.rootNodeName;

      default: {
        const data = this.nodesData[nodeId] as { nodeName?: string } | undefined;
        return data?.nodeName ?? 'unnamed';
      }
    }
  }

  /**
   * Return the CAD type name for a given CAD type id
   * @param cadViewId
   * @returns
   */
  getTypeName(cadViewId: number) {
    const cadTypeName = this.model?.getCadViewMap()?.get(cadViewId);
    return cadTypeName?.replace(/ # Annotation View$/, '') ?? 'Unnamed type';
  }

  /**
   * Return the HTML Fragment for a node.
   * @param id The id of the node to render.
   * @param selected Whether the node is selected or not.
   * @returns The HTML fragment to render for the node.
   */
  getContent(
    _: TreeContext,
    id: number,
    selected?: boolean,
    nodeData?: unknown,
  ): HTMLTemplateResult | typeof nothing {
    if (!this.model) {
      return nothing;
    }

    return this.nodeFactory(this, this.model, id, selected, nodeData);
  }
}

export enum TypesTreeNodeId {
  /**
   * The root node id of the types tree
   */
  RootNode = -1,
}
