import type { NoteId } from '../anki/api';
import type { RegExpGroups } from '../regexp';

export interface NoteExample {
    noteId: NoteId;
    example: string;
}

type NoteExamples = Record<NoteId, string[]>;

export const parseChatGptOutput = (chatGptOutput: string): NoteExamples => {
    const lines = chatGptOutput.split('\n');
    const nonEmptyLines = lines.filter((line) => line.trim().length > 0);

    const newNotes: NoteExamples = {};

    nonEmptyLines.forEach((line: string): void => {
        const match: RegExpGroups<'id' | 'text'> = line.match(/^(?<id>\d+):\s(?<text>.*)$/);
        if (match === null || match.groups === undefined) {
            throw new Error(`Invalid line structure: "${line}"!`);
        }
        const {
            groups: { id, text },
        } = match;

        const idNumber = +id;

        if (newNotes[idNumber] === undefined) {
            newNotes[idNumber] = [text];
        } else {
            const existingNote = newNotes[idNumber];
            if (!Array.isArray(existingNote)) {
                console.dir(newNotes);
                throw new Error('Expected an array!');
            }
            existingNote.push(text);
        }
    });

    for (const noteId in newNotes) {
        const newNote = newNotes[noteId];
        // sometimes ChatGPT decides to return another format of output, so this checks it
        if (newNote === undefined || newNote.length < 2) {
            throw new Error('Probably got strangely formatted output from ChatGPT: ' + JSON.stringify(chatGptOutput));
        }
    }

    return newNotes;
};
