import { Uuid } from '@ts3d-hoops/web-viewer';

export interface MarkupItemData {
  id: Uuid;
  type: string;
}

export interface MarkupViewData {
  id: Uuid;
  items: MarkupItemData[];
}
