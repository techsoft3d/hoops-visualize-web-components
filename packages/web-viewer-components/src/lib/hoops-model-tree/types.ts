import { BranchVisibility as ComBranchVisibility, NodeType } from '@ts3d-hoops/web-viewer';
import { TreeContext } from '@ts3d-hoops/ui-kit/tree';
import { HTMLTemplateResult, nothing } from 'lit';

/**
 * This interface is a subset of the Model API, it is meant to allow mocking and
 * proxying the Model without having to wrap the whole interface.
 *
 * @export
 * @interface IModel
 * @typedef {IModel}
 */
export interface IModel {
  getAbsoluteRootNode: () => number;
  getNodeChildren: (nodeId: number) => number[];
  getNodeName: (nodeId: number) => string | null;
  getNodeType: (nodeId: number) => NodeType;
  getBranchVisibility: (nodeId: number) => ComBranchVisibility;
}

/**
 * The signature of the callback used by ModelAdapter to create node for the
 * `hoops-model-tree`
 *
 * @export
 * @typedef {ModelTreeNodeFactory}
 */
export type ModelTreeNodeFactory = (
  treeContext: TreeContext,
  model: IModel,
  nodeId: number,
  selected?: boolean,
  nodeData?: unknown,
) => HTMLTemplateResult | typeof nothing;

export type BranchVisibility = 'Hidden' | 'Shown' | 'Mixed' | 'Unknown';
export function branchVisibilityFromComBranchVisibility(value: ComBranchVisibility): BranchVisibility {
  switch (value) {
    case ComBranchVisibility.Hidden:
      return 'Hidden';
    case ComBranchVisibility.Shown:
      return 'Shown';
    case ComBranchVisibility.Mixed:
      return 'Mixed';
    default:
      return 'Unknown';
  }
}