import { HTMLTemplateResult, nothing } from 'lit';

/**
 * A subset of the MouseEvent properties that we add to event triggered on the
 * list.
 *
 * @export
 * @typedef {BaseMouseEvent}
 */
export type BaseMouseEvent = Pick<
  MouseEvent,
  | 'altKey'
  | 'button'
  | 'buttons'
  | 'clientX'
  | 'clientY'
  | 'ctrlKey'
  | 'metaKey'
  | 'movementX'
  | 'movementY'
  | 'offsetX'
  | 'offsetY'
  | 'pageX'
  | 'pageY'
  | 'screenX'
  | 'screenY'
  | 'shiftKey'
>;

/**
 * This interface represent the context of the list. It contains all the
 * necessary data for the list to display.
 *
 * @export
 * @interface ListContext
 * @typedef {ListContext}
 */
export interface ListContext {
  elementsData?: Map<number, string>;
  sortedByValue: boolean;
  getContent(
    context: ListContext,
    key: number,
    selected?: boolean,
  ): HTMLTemplateResult | typeof nothing;
}
