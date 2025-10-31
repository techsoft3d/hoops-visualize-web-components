import { type Uuid } from '@ts3d-hoops/web-viewer';
import { type RedlineItemData } from '../services';

export type DeleteMarkupViewEvent = CustomEvent<{
  markupViewId: Uuid;
  markupItem: RedlineItemData;
}>;

declare global {
  interface CustomEventMap {
    'hoops-delete-markup': DeleteMarkupViewEvent;
  }
}

export {};
