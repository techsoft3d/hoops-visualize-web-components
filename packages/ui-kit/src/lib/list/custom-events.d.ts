declare global {
  /*
    The events emitted by the list elements.
   */
  type ListElementClickEvent = CustomEvent<{ key: number; source: HTMLElement } & BaseMouseEvent>;

  interface CustomEventMap {
    'hoops-list-element-click': ListElementClickEvent;
  }
}

export {};
