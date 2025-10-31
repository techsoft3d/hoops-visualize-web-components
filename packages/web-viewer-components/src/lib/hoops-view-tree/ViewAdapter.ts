import { html, HTMLTemplateResult, nothing } from 'lit';
import { TreeContext } from '@ts3d-hoops/ui-kit/tree';
import { downIcon, rightIcon } from '@ts3d-hoops/ui-kit/icons';

import './hoops-view-tree-node';
import { IModel, ViewTreeNodeFactory } from './types';
import { Model } from '@ts3d-hoops/web-viewer';

/**
 * Create a `view-tree-node` to render in the view tree. If nodeId is not set
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
  let visible = true;
  if ('getNodeVisibility' in model) {
    const hwvModel = model as Model;
    visible = hwvModel.getNodeVisibility(nodeId);
  }

  const viewAdapter = treeContext as ViewAdapter;
  const data: any = nodeData ?? {
    visible,
  };

  if (!nodeData) {
    viewAdapter.nodesData[nodeId] = data;
  }

  return html`<hoops-view-tree-node
    nodeId=${nodeId}
    nodeName=${viewAdapter.getNodeName(nodeId) ?? 'N/A'}
    ?selected=${selected}
  >
  </hoops-view-tree-node>`;
}

/**
 * This class serves as a proxy to the Model class. It is used by the ViewTree
 * to communicate with the Model.
 *
 * @export
 * @class ViewAdapter
 * @typedef {ViewAdapter}
 * @implements {TreeContext}
 */
export class ViewAdapter implements TreeContext {
  /**
   * The Model where the node will be queried.
   *
   * @type {?IModel}
   */
  model?: IModel;

  /**
   * A function that creates a HTML fragment for a given node.
   *
   * @type {ViewTreeNodeFactory}
   */
  nodeFactory: ViewTreeNodeFactory = defaultNodeFactory;

  /**
   * This structure hold custom data for the nodes inside the context to make it
   * reactive.
   *
   * You can use this variable to record property for your custom view tree
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
  rootNodeName = 'Views';

  /**
   * The name of the combine state views node
   * @type {string}
   */
  combineStateViewsNodeName = 'Combine state views';

  /**
   * The name of the annotation views node
   * @type {string}
   */
  annotationViewsNodeName = 'Annotation views';

  /**
   * The name of the standard views node
   * @type {string}
   */
  standardViewsNodeName = 'Standard views';

  /**
   * This function will be used by the tree to render the root node.
   * @returns The id of the root node.
   */
  getRoot(): number {
    return ViewTreeNodeId.RootNode;
  }

  /**
   * This function will be used by the tree to get the children of each node.
   *
   * @param {number} nodeId The id of the parent node.
   * @returns {number[]} An array containing the children's ids.
   */
  getChildren(nodeId: number): number[] {
    const allViews = this.model?.getCadViewMap();
    switch (nodeId) {
      case ViewTreeNodeId.RootNode:
        return [
          ViewTreeNodeId.CombineStateViewsNode,
          ViewTreeNodeId.AnnotationViewsNode,
          ViewTreeNodeId.StandardViewsNode,
        ];
      case ViewTreeNodeId.CombineStateViewsNode: {
        return Array.from(allViews?.keys() || []).filter(
          (cadViewId) =>
            this.model?.isCombineStateView(cadViewId) && !this.model?.isAnnotationView(cadViewId),
        );
      }
      case ViewTreeNodeId.AnnotationViewsNode: {
        return Array.from(allViews?.keys() || []).filter(
          (cadViewId) => this.model?.isAnnotationView(cadViewId),
        );
      }
      case ViewTreeNodeId.StandardViewsNode: {
        return Array.from(allViews?.keys() || []).filter(
          (cadViewId) =>
            !this.model?.isAnnotationView(cadViewId) && !this.model?.isCombineStateView(cadViewId),
        );
      }
      default:
        return [];
    }
  }

  /**
   * Returns the name of a node in the view tree
   * @param nodeId The view tree-specific node id
   */
  getNodeName(nodeId: number) {
    switch (nodeId) {
      case ViewTreeNodeId.RootNode:
        return this.rootNodeName;

      case ViewTreeNodeId.CombineStateViewsNode:
        return this.combineStateViewsNodeName;

      case ViewTreeNodeId.AnnotationViewsNode:
        return this.annotationViewsNodeName;

      case ViewTreeNodeId.StandardViewsNode:
        return this.standardViewsNodeName;

      default:
        return this.getViewName(nodeId);
    }
  }

  /**
   * Return the CAD view name for a given CAD view id
   * @param cadViewId
   * @returns
   */
  getViewName(cadViewId: number) {
    const cadViewName = this.model?.getCadViewMap()?.get(cadViewId);
    return cadViewName?.replace(/ # Annotation View$/, '') ?? 'Unnamed view';
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

export enum ViewTreeNodeId {
  /**
   * The root node id of the view tree
   */
  RootNode = 0,

  /**
   * The combine state views node id of the view tree
   */
  CombineStateViewsNode = 1,

  /**
   * The annotation views node id of the view tree
   */
  AnnotationViewsNode = 2,

  /**
   * The standard views node id of the view tree
   */
  StandardViewsNode = 3,
}
