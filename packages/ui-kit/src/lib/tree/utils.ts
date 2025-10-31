import { BaseMouseEvent } from './types';

/**
 * A helper function to create a BaseMouseEvent from a MouseEvent
 *
 * @export
 * @param {MouseEvent} event
 * @returns {BaseMouseEvent}
 */
export function toBaseMouseEvent(event: MouseEvent): BaseMouseEvent {
  return {
    altKey: event.altKey,
    button: event.button,
    buttons: event.buttons,
    clientX: event.clientX,
    clientY: event.clientY,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    movementX: event.movementX,
    movementY: event.movementY,
    offsetX: event.offsetX,
    offsetY: event.offsetY,
    pageX: event.pageX,
    pageY: event.pageY,
    screenX: event.screenX,
    screenY: event.screenY,
    shiftKey: event.shiftKey,
  };
}
