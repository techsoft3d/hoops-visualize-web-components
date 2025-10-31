export type TypesTreeNodeClickEvent = CustomEvent<
  { nodeId: number; source: HTMLElement } & BaseMouseEvent
>;

export type TypesTreeTypeNodeClickEvent = CustomEvent<
  { nodeIds: number[]; source: HTMLElement; isTypeNode: boolean } & BaseMouseEvent
>;

export type TypesTreeNodeVisibilityChangeEvent = CustomEvent<
  { nodeIds: number[]; source: HTMLElement; visible: boolean } & BaseMouseEvent
>;

declare global {
  interface CustomEventMap {
    'hoops-types-tree-node-click': TypesTreeNodeClickEvent;
    'hoops-types-tree-type-node-click': TypesTreeTypeNodeClickEvent;
    'hoops-types-tree-node-visibility-change': TypesTreeNodeVisibilityChangeEvent;
  }
}

export {};
