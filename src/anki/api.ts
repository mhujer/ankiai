export type NoteId = number;
type CardId = number;

type AnkiConnectError = string | null;

interface FindNotesResponse {
    result: NoteId[];
    error: AnkiConnectError;
}

interface NotesInfoItem<T> {
    noteId: NoteId;
    tags: string[];
    fields: T;
    modelName: string;
    cards: CardId[];
}

// alternative would be: `interface NotesInfoItemFields { [index: string]: NotesInfoItemField; }`
export type NotesInfoItemFields = Record<string, NotesInfoItemField>;

export interface NotesInfoItemField {
    value: string;
    order: number;
}

interface NotesInfoResponse<T> {
    result: NotesInfoItem<T>[];
    error: AnkiConnectError;
}

export const findNotes = async (deckName: string): Promise<NoteId[]> => {
    // if the deckname contains spaces, they must be replaced with underscore
    const treatedDeckName = deckName.replaceAll(' ', '_');

    const data = await fetch('http://127.0.0.1:8765', {
        method: 'POST',
        body: JSON.stringify({
            action: 'findNotes',
            version: 6,
            params: {
                query: 'deck:' + treatedDeckName,
            },
        }),
    });

    const parsedData = (await data.json()) as FindNotesResponse;
    if (parsedData.error !== null) {
        throw new Error(parsedData.error);
    }

    return parsedData.result;
};

export const fetchNotesInfo = async <T extends NotesInfoItemFields>(notesIds: NoteId[]) => {
    const data = await fetch('http://127.0.0.1:8765', {
        method: 'POST',
        body: JSON.stringify({
            action: 'notesInfo',
            version: 6,
            params: {
                notes: notesIds,
            },
        }),
    });

    const parsedData = (await data.json()) as NotesInfoResponse<T>;
    if (parsedData.error !== null) {
        throw new Error(parsedData.error);
    }

    return parsedData.result;
};

export type UpdateNoteFieldsFields = Record<string, string>;

export interface UpdateNoteFieldsNote<T extends UpdateNoteFieldsFields> {
    id: NoteId;
    fields: T;
}

interface UpdateNoteFieldsResponse {
    error: string | null;
    result: null;
}

export const updateNoteFields = async <T extends UpdateNoteFieldsFields>(
    note: UpdateNoteFieldsNote<T>,
): Promise<null> => {
    const data = await fetch('http://127.0.0.1:8765', {
        method: 'POST',
        body: JSON.stringify({
            action: 'updateNoteFields',
            version: 6,
            params: {
                note: note,
            },
        }),
    });
    const parsedData = (await data.json()) as UpdateNoteFieldsResponse;
    if (parsedData.error !== null) {
        throw new Error(parsedData.error);
    }

    return parsedData.result;
};
