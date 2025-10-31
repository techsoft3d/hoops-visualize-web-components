import { html, HTMLTemplateResult, nothing } from 'lit';
import { TreeContext } from '@ts3d-hoops/ui-kit/tree';
import { downIcon, rightIcon } from '@ts3d-hoops/ui-kit/icons';

import './hoops-model-tree-node';
import { branchVisibilityFromComBranchVisibility, IModel, ModelTreeNodeFactory } from './types';

/**
 * Create a `model-tree-node` to render in the model tree. If nodeId is not set
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
  const branchVisibility = branchVisibilityFromComBranchVisibility(model.getBranchVisibility(nodeId));
  const modelAdapter = treeContext as ModelAdapter;
  const data: any = nodeData ?? {
    visibility: branchVisibility,
  };
  data.visibility = branchVisibility;

  if (!nodeData) {
    modelAdapter.nodesData[nodeId] = data;
  }

  return html`<hoops-model-tree-node
    nodeId=${nodeId}
    nodeName=${model.getNodeName(nodeId) ?? 'N/A'}
    nodeType=${model.getNodeType(nodeId)}
    ?isRoot=${model.getAbsoluteRootNode() === nodeId}
    visibility=${data.visibility}
    ?selected=${selected}
  >
  </hoops-model-tree-node>`;
}

/**
 * This class serves as a proxy to the Model class. I is used by the ModelTree
 * to communicate with the Model.
 *
 * @export
 * @class ModelAdapter
 * @typedef {ModelAdapter}
 * @implements {TreeContext}
 */
export default class ModelAdapter implements TreeContext {
  /**
   * The Model where the node will be queried.
   *
   * @type {?IModel}
   */
  model?: IModel;

  /**
   * A function that creates a HTML fragment for a given node.
   *
   * @type {ModelTreeNodeFactory}
   */
  nodeFactory: ModelTreeNodeFactory = defaultNodeFactory;

  /**
   * This structure hold custom data for the nodes inside the context to make it
   * reactive.
   *
   * You can use this variable to record property for your custom model tree
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
   * This function will be used by the tree to render the root node.
   * @returns The id of the root node.
   */
  getRoot(): number {
    return this.model?.getAbsoluteRootNode() ?? Number.NaN;
  }

  /**
   * This function will be used by the tree to get the children of each node.
   *
   * @param {number} nodeId The id of the parent node.
   * @returns {number[]} An array containing the children's ids.
   */
  getChildren(nodeId: number): number[] {
    return this.model?.getNodeChildren(nodeId) ?? [];
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
