import { expect, test } from 'vitest';
import { filterNoteContent, isSentence, splitMultiTerms } from './note-text-filter';
import type { NoteForProcessing } from '../anki';

test('Note content filtering', () => {
    expect(filterNoteContent('der Ton<br><br>(Das Bier gibt es in großen Einliterkrügen aus Glas oder Ton.)')).toEqual(
        'der Ton',
    );
    expect(filterNoteContent('der Führerschein')).toEqual('der Führerschein');
    expect(filterNoteContent('der Kaufmann, die Kauffrau')).toEqual('der Kaufmann, die Kauffrau');
    expect(filterNoteContent('anschwellen (schwillt an, o, i. o)')).toEqual('anschwellen');
    expect(
        filterNoteContent('die Schwellung, die Anschwellung<br><br>(die Anschwellung nach einem Bienenstich)'),
    ).toEqual('die Schwellung, die Anschwellung');
    expect(filterNoteContent('(j-m/für j-n) den Daumen drücken<br><br>(Ich drücke dir die Daumen.)')).toEqual(
        'den Daumen drücken',
    );
});

test('Is sentence', () => {
    expect(isSentence('Meine Nase ist Verstopft.')).toBe(true);
    expect(isSentence('Alles auf den Kopf stellen.')).toBe(true);
    expect(isSentence('die Schuld')).toBe(false);
    expect(isSentence('mit einem blauen Auge davonkommen')).toBe(false);
});

test('Splits notes with multiple terms', () => {
    const input: NoteForProcessing[] = [
        {
            noteId: 1,
            text: 'der Foo, der Bar',
        },

        {
            noteId: 2,
            text: 'die FooBaz',
        },
    ];

    expect(splitMultiTerms(input)).toStrictEqual([
        {
            noteId: 1,
            text: 'der Foo',
        },
        {
            noteId: 1,
            text: 'der Bar',
        },
        {
            noteId: 2,
            text: 'die FooBaz',
        },
    ]);
});
