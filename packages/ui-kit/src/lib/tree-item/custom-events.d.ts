export type TreeItemExpandEvent = CustomEvent<{
  expanded: boolean;
}>;

export type TreeItemSelectEvent = CustomEvent<{
  selected: boolean;
}>;

declare global {
  interface CustomEventMap {
    'hoops-tree-item-expand': TreeItemExpandEvent;

    'hoops-tree-item-select': TreeItemSelectEvent;
  }
}

export {};
