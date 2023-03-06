import type { NoteForProcessing } from '../anki';

export const filterNoteContent = (input: string): string => {
    return input // https://chat.openai.com/chat/7e66101d-3410-4570-9b5d-2b65aac583cf
        .replace(/\([^)]*\)/g, '') // remove content in parentheses
        .replace(/<\/?[^>]+(>|$)/g, '') // remove HTML tags
        .trim();
};

export const isSentence = (input: string): boolean => {
    return input.endsWith('.');
};

export const splitMultiTerms = (notes: NoteForProcessing[]): NoteForProcessing[] => {
    const newNotes = [];
    for (const note of notes) {
        const noteTextSplits = note.text.split(',');
        const newNotesForNote = noteTextSplits.map((noteTextSplit): NoteForProcessing => {
            return {
                noteId: note.noteId,
                text: noteTextSplit.trim(),
            };
        });
        newNotes.push(...newNotesForNote);
    }

    return newNotes;
};
