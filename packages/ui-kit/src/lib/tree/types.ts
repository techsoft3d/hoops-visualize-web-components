import { HTMLTemplateResult, nothing } from 'lit';

/**
 * A subset of the MouseEvent properties that we add to event triggered on the
 * tree.
 *
 * @export
 * @typedef {BaseMouseEvent}
 */
export type BaseMouseEvent = Pick<
  MouseEvent,
  | 'altKey'
  | 'button'
  | 'buttons'
  | 'clientX'
  | 'clientY'
  | 'ctrlKey'
  | 'metaKey'
  | 'movementX'
  | 'movementY'
  | 'offsetX'
  | 'offsetY'
  | 'pageX'
  | 'pageY'
  | 'screenX'
  | 'screenY'
  | 'shiftKey'
>;

/**
 * This represent the state of the entries in the tree.
 * This structure is managed by the tree internally .
 */
export type TreeEntryData = {
  key: number;
  parentKey?: number;
  expanded: boolean;
  children: number[];
};

/**
 * This interface represent the context of the tree. It contains all the
 * necessary data for the tree to display.
 *
 * @export
 * @interface TreeContext
 * @typedef {TreeContext}
 */
export interface TreeContext {
  expandedIcon: HTMLTemplateResult;
  collapsedIcon: HTMLTemplateResult;
  leafIcon?: HTMLTemplateResult;
  nodesData?: Record<number, unknown>;

  getRoot(): number;
  getChildren(key: number): number[];
  getContent(
    context: TreeContext,
    key: number,
    selected?: boolean,
    nodeData?: unknown,
  ): HTMLTemplateResult | typeof nothing;
}
