/**
 * The event emitted by a hoops-layer-tree-element when the layer visibility button is
 * clicked.
 *
 * @export
 * @typedef {LayerVisibilityClickEvent}
 */
export type LayerVisibilityClickEvent = CustomEvent<
  { layerId: number; visibility: boolean; source: HTMLElement } & BaseMouseEvent
>;

/**
 * The event emitted by a hoops-layer-tree-element when a node's visibility button is
 * clicked.
 *
 * @export
 * @typedef {LayerNodeVisibilityClickEvent}
 */
export type LayerNodeVisibilityClickEvent = CustomEvent<
  { nodeId: number[]; source: HTMLElement } & BaseMouseEvent
>;

/**
 * The event emitted by a hoops-layer-tree-element when one of its associated
 * node UI element is clicked
 *
 * @export
 * @typedef {LayerTreeNodeClicked}
 */
export type LayerTreeNodeClicked = CustomEvent<
  { layerId: number; nodeId: number; source: HTMLElement } & BaseMouseEvent
>;

/**
 * The event emitted by a hoops-layer-tree-element its layer UI element
 * aka the header is clicked
 *
 * @export
 * @typedef {LayerClicked}
 */
export type LayerClicked = CustomEvent<{ layerId: number; source: HTMLElement } & BaseMouseEvent>;

export type LayerTreeElementClickEvent = CustomEvent<
  { layerId: number; source: HTMLElement } & BaseMouseEvent
>;

export type LayerTreeVisibilityChanged = CustomEvent<
  { nodeIds: number[]; source: HTMLElement } & BaseMouseEvent
>;

export type LayerTreeNodeSelectedEvent = CustomEvent<
  { nodeIds: number[]; source: HTMLElement } & BaseMouseEvent
>;

declare global {
  interface CustomEventMap {
    'hoops-layer-visibility-change': LayerVisibilityClickEvent;
    'hoops-layer-node-visibility-change': LayerNodeVisibilityClickEvent;
    'hoops-layer-tree-node-clicked': LayerTreeNodeClicked;
    'hoops-layer-clicked': LayerClicked;
    'hoops-layer-tree-element-click': LayerTreeElementClickEvent;
    'hoops-layer-tree-node-selected': LayerTreeNodeSelectedEvent;
    'hoops-layer-tree-visibility-changed': LayerTreeVisibilityChanged;
  }
}

export {};
