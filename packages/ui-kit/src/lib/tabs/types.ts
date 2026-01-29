/**
 * Event detail for tab selection changes.
 */
export interface TabChangeEventDetail {
  /** The index of the newly selected tab */
  selectedIndex: number;
  /** The value of the newly selected tab, if provided */
  selectedValue?: string;
}
