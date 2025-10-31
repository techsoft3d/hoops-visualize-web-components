declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface CustomEventMap {}

  interface CustomEventTarget<T> {
    dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K]): boolean;
    dispatchEvent(ev: Event): boolean;

    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: T, ev: CustomEventMap[K]) => void,
      options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ): void;

    removeEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: T, ev: CustomEventMap[K]) => void,
      options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions,
    ): void;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Node extends CustomEventTarget<Node> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends CustomEventTarget<Window> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Document extends CustomEventTarget<Document> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Element extends CustomEventTarget<Element> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface HTMLElement extends CustomEventTarget<HTMLElement> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface HTMLElementEventMap extends CustomEventMap {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DocumentEventMap extends CustomEventMap {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface WindowEventMap extends CustomEventMap {}
}

export {};
