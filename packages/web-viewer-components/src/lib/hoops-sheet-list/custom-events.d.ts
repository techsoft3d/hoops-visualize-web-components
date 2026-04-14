import { BaseMouseEvent } from '@ts3d-hoops/ui-kit/list';

export type SheetListNodeClickEvent = CustomEvent<
  { nodeId: number; source: HTMLElement } & BaseMouseEvent
>;

declare global {
  interface CustomEventMap {
    'hoops-sheet-list-node-click': SheetListNodeClickEvent;
  }
}

export {};
