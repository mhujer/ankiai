import { expect, test } from 'vitest';
import { generatePrompt } from './generate-prompt';

test('generate prompt', () => {
    const prompt = generatePrompt([
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

    expect(prompt).toBe('1: der Foo\n1: der Bar\n2: die FooBaz');
});
