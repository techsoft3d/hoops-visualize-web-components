import { TabChangeEventDetail } from './types';

declare global {
  export type TabChangeEvent = CustomEvent<TabChangeEventDetail>;

  interface CustomEventMap {
    'hoops-tab-change': TabChangeEvent;
  }
}

export {};
