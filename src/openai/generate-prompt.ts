import type { NoteForProcessing } from '../anki';

export const generatePrompt = (vocabulary: NoteForProcessing[]): string => {
    return vocabulary.map((note) => `${note.noteId}: ${note.text}`).join('\n');
};
