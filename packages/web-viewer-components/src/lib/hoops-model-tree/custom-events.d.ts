import type { BaseMouseEvent } from '@ts3d-hoops/ui-kit/tree';

/**
 * The event emitted by a hoops-model-tree-node when the visibility button is
 * clicked.
 *
 * @export
 * @typedef {ModelTreeNodeVisibilityClickEvent}
 */

export type ModelTreeNodeVisibilityClickEvent = CustomEvent<
  { nodeId: number; visibility: boolean; source: HTMLElement } & BaseMouseEvent
>;

export type ModelTreeNodeClickEvent = CustomEvent<
  { nodeId: number; source: HTMLElement } & BaseMouseEvent
>;

declare global {
  /**
   * This will extend the DOM in order to allow users to use our events with
   * addEventListeners APIs on DOM components
   */
  interface CustomEventMap {
    'hoops-model-tree-node-visibility-change': ModelTreeNodeVisibilityClickEvent;
    'hoops-model-tree-node-click': ModelTreeNodeClickEvent;
  }
}

export {};
