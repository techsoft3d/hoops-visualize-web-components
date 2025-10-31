import { Operators } from '@ts3d-hoops/web-viewer';
import { NoteTextItemData } from './types';

export function formatNoteTextItem(markup: Operators.Markup.Note.NoteText): NoteTextItemData {
  return {
    id: markup.uniqueId,
    type: markup.getClassName(),
    text: markup.getText(),
  };
}

export function formatNoteTextIcon(className: string): string {
  switch (className) {
    case 'Communicator.Markup.Note.NoteText':
      return 'note';
    default:
      console.warn(`Unknown note text class name: ${className}`);
      return 'undefined';
  }
}
