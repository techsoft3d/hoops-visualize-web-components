import { CallbackMap, Operators, Uuid } from '@ts3d-hoops/web-viewer';
import { INoteTextService, NoteTextItemData } from './types';
import { formatNoteTextItem } from './utils';

export default class NoteTextService extends EventTarget implements INoteTextService {
  public readonly serviceName = 'NoteTextService' as const;

  private _noteTextManager?: Operators.NoteTextManager;

  private callbackMap: CallbackMap;

  constructor(noteTextManager?: Operators.NoteTextManager) {
    super();

    this._noteTextManager = noteTextManager;

    this.noteTextCreated = this.noteTextCreated.bind(this);
    this.noteTextDeleted = this.noteTextDeleted.bind(this);
    this.noteTextUpdated = this.noteTextUpdated.bind(this);
    this.noteTextHidden = this.noteTextHidden.bind(this);
    this.noteTextShown = this.noteTextShown.bind(this);

    this.callbackMap = {
      noteTextCreated: this.noteTextCreated,
      noteTextDeleted: this.noteTextDeleted,
      noteTextUpdated: this.noteTextUpdated,
      noteTextHidden: this.noteTextHidden,
      noteTextShown: this.noteTextShown,
    };

    if (this._noteTextManager) {
      this.bind();
    }
  }

  public getNoteTexts(): NoteTextItemData[] {
    if (!this._noteTextManager) {
      throw new Error('Cannot get note texts: NoteTextManager not initialized');
    }

    return this._noteTextManager.getNoteTextList().map(formatNoteTextItem);
  }

  public getNoteText(uniqueId: Uuid): NoteTextItemData | undefined {
    if (!this._noteTextManager) {
      throw new Error('Cannot get note text: NoteTextManager not initialized');
    }

    const noteText = this._noteTextManager
      .getNoteTextList()
      .find((noteText) => noteText.uniqueId === uniqueId);
    return noteText ? formatNoteTextItem(noteText) : undefined;
  }

  public getNoteTextKeys(): Uuid[] {
    if (!this._noteTextManager) {
      throw new Error('Cannot get note text keys: NoteTextManager not initialized');
    }

    return this._noteTextManager.getNoteTextList().map((noteText) => noteText.uniqueId);
  }

  async setActiveNoteText(id: Uuid): Promise<boolean> {
    if (!this._noteTextManager) {
      throw new Error('Cannot select note text: NoteTextManager not initialized');
      return false;
    }

    const noteText = this._noteTextManager
      .getNoteTextList()
      .find((noteText) => noteText.uniqueId === id);
    if (!noteText) {
      console.error(`Note text with id ${id} not found`);
      return false;
    }

    await noteText.restore();
    this._noteTextManager.viewer.markupManager.selectMarkup(noteText, this._noteTextManager.viewer.view);
    return true;
  }

  getActiveNoteTextKey(): Uuid | undefined {
    if (!this._noteTextManager) {
      console.error('Cannot get selected note text: NoteTextManager not initialized');
      return undefined;
    }

    return this._noteTextManager.getActiveItem()?.uniqueId;
  }

  getActiveNoteText(): NoteTextItemData | undefined {
    if (!this._noteTextManager) {
      console.error('Cannot get selected note text: NoteTextManager not initialized');
      return undefined;
    }

    const note = this._noteTextManager.getActiveItem();
    return note ? formatNoteTextItem(note) : undefined;
  }

  async removeNoteText(item: NoteTextItemData): Promise<void> {
    if (!this._noteTextManager) {
      throw new Error('Cannot remove note text: NoteTextManager not initialized');
    }

    const noteText = this._noteTextManager
      .getNoteTextList()
      .find((noteText) => noteText.uniqueId === item.id);
    if (!noteText) {
      console.error(`Note text with id ${item.id} not found`);
      return;
    }

    return noteText.remove(this.noteTextManager?.viewer.view ?? null);
  }

  private noteTextCreated(noteText: Operators.Markup.Note.NoteText): void {
    this.dispatchEvent(
      new CustomEvent<NoteTextItemData>('hoops-note-text-created', {
        detail: formatNoteTextItem(noteText),
        bubbles: true,
        composed: true,
      }),
    );
  }

  private noteTextDeleted(noteText: Operators.Markup.Note.NoteText): void {
    this.dispatchEvent(
      new CustomEvent<NoteTextItemData>('hoops-note-text-deleted', {
        detail: formatNoteTextItem(noteText),
        bubbles: true,
        composed: true,
      }),
    );
  }

  private noteTextUpdated(noteText: Operators.Markup.Note.NoteText): void {
    this.dispatchEvent(
      new CustomEvent<NoteTextItemData>('hoops-note-text-updated', {
        detail: formatNoteTextItem(noteText),
        bubbles: true,
        composed: true,
      }),
    );
  }

  private noteTextHidden(noteText: Operators.Markup.Note.NoteText): void {
    this.dispatchEvent(
      new CustomEvent<NoteTextItemData>('hoops-note-text-hidden', {
        detail: formatNoteTextItem(noteText),
        bubbles: true,
        composed: true,
      }),
    );
  }

  private noteTextShown(noteText: Operators.Markup.Note.NoteText): void {
    this.dispatchEvent(
      new CustomEvent<NoteTextItemData>('hoops-note-text-shown', {
        detail: formatNoteTextItem(noteText),
        bubbles: true,
        composed: true,
      }),
    );
  }

  private bind(): void {
    if (!this._noteTextManager) {
      throw new Error('NoteTextManager is not set');
    }

    this._noteTextManager.viewer.setCallbacks(this.callbackMap);
  }

  private unbind() {
    if (!this._noteTextManager) {
      throw new Error('NoteTextManager is not set');
    }
    this._noteTextManager.viewer.unsetCallbacks(this.callbackMap);
  }

  public get noteTextManager(): Operators.NoteTextManager | undefined {
    return this._noteTextManager;
  }

  public set noteTextManager(value: Operators.NoteTextManager | undefined) {
    if (this._noteTextManager === value) {
      return;
    }

    if (this._noteTextManager) {
      this.unbind();
    }

    this._noteTextManager = value;
    this.bind();
    this.dispatchEvent(
      new CustomEvent('hoops-note-text-manager-reset', { bubbles: true, composed: true }),
    );
  }

  public reset(): void {
    this.dispatchEvent(
      new CustomEvent('hoops-note-text-manager-reset', { bubbles: true, composed: true }),
    );
  }
}
