export type ContextMenuItemClicked = CustomEvent<{ source: HTMLElement } & MouseEvent>;

declare global {
  interface CustomEventMap {
    'context-menu-item-clicked': ContextMenuItemClicked;
  }
}

export {};
