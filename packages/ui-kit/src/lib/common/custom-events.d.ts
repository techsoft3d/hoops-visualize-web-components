/*
The events emitted by the tree nodes.
*/
export type CoordinateInputChangeEvent = CustomEvent<{ label: string; value: number }>;

declare global {
  interface CustomEventMap {
    'hoops-coordinate-changed': CoordinateInputChangeEvent;
  }
}

export {};
