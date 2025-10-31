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
  getCadViewMap: () => Map<number, string>;
  isAnnotationView: (cadViewId: number) => boolean;
  isCombineStateView: (cadViewId: number) => boolean;
}

/**
 * The signature of the callback used by ViewAdapter to create node for the
 * `hoops-view-tree`
 *
 * @export
 * @typedef {ViewTreeNodeFactory}
 */
export type ViewTreeNodeFactory = (
  treeContext: TreeContext,
  model: IModel,
  nodeId: number,
  selected?: boolean,
  nodeData?: unknown,
) => HTMLTemplateResult | typeof nothing;
