/*
The events emitted by the tree nodes.
*/
export type TreeNodeClickEvent = CustomEvent<{ key: number; source: HTMLElement } & BaseMouseEvent>;
export type TreeNodeExpandEvent = CustomEvent<
  { key: number; expanded: boolean; source: HTMLElement } & BaseMouseEvent
>;

declare global {
  interface CustomEventMap {
    'hoops-tree-node-click': TreeNodeClickEvent;
    'hoops-tree-node-aux-click': TreeNodeClickEvent;
    'hoops-tree-node-expand': TreeNodeExpandEvent;
  }
}

export {};
