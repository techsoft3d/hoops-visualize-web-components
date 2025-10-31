import { TreeContext } from '@ts3d-hoops/ui-kit/tree';
import { BranchVisibility, GenericType } from '@ts3d-hoops/web-viewer';
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
  getCadViewMap: () => Map<number, string>;
  isAnnotationView: (cadViewId: number) => boolean;
  isCombineStateView: (cadViewId: number) => boolean;
  getGenericTypeIdMap: () => Map<GenericType, Set<number>>;
  getNodeName: (nodeId: number) => string | null;
  getNodeChildren: (nodeId: number) => number[];
  getBranchVisibility: (nodeId: number) => BranchVisibility;
}

/**
 * The signature of the callback used by TypesTreeAdapter to create node for the
 * `hoops-types-tree`
 *
 * @export
 * @typedef {TypesTreeNodeFactory}
 */
export type TypesTreeNodeFactory = (
  treeContext: TreeContext,
  model: IModel,
  nodeId: number,
  selected?: boolean,
  nodeData?: unknown,
) => HTMLTemplateResult | typeof nothing;
