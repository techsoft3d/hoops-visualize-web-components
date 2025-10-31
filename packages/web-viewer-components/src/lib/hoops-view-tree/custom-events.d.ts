export type ViewTreeNodeClickEvent = CustomEvent<
  { nodeId: number; source: HTMLElement } & BaseMouseEvent
>;

declare global {
  interface CustomEventMap {
    'hoops-view-tree-node-click': ViewTreeNodeClickEvent;
  }
}

export {};
