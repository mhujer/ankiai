import { expect, test } from 'vitest';
import { parseChatGptOutput } from './parse-chatpt-output';

test('ChatGPT output parsing', () => {
    const output =
        '1675192165669: Die Flüsse können nach starkem Regen anschwellen.\n1675192165669: Die Wunden am Bein können anschwellen und schmerzen.\n\n1675192165662: Man sollte sich immer genau überlegen, bevor Schulden gemacht werden.\n1675192165662: Schulden machen kann in der Zukunft zu großen finanziellen Problemen führen.\n\n1675192165683: Das Publikum war vom Auftritt des Sängers begeistert.\n1675192165683: Einige Mitglieder des Publikums waren unruhig und unzufrieden.\n\n1675192165652: Der Lieferant hat das Paket heute Morgen geliefert.\n1675192165652: Ich kann mich immer auf meinen Lieferanten verlassen.\n\n1675192165655: Sie ist vollkommen glücklich mit ihrem neuen Job.\n1675192165655: Das Essen war vollkommen in Ordnung, aber nicht besonders lecker.';

    const parsed = parseChatGptOutput(output);

    expect(parsed).toStrictEqual({
        1675192165669: [
            'Die Flüsse können nach starkem Regen anschwellen.',
            'Die Wunden am Bein können anschwellen und schmerzen.',
        ],
        1675192165662: [
            'Man sollte sich immer genau überlegen, bevor Schulden gemacht werden.',
            'Schulden machen kann in der Zukunft zu großen finanziellen Problemen führen.',
        ],
        1675192165683: [
            'Das Publikum war vom Auftritt des Sängers begeistert.',
            'Einige Mitglieder des Publikums waren unruhig und unzufrieden.',
        ],
        1675192165652: [
            'Der Lieferant hat das Paket heute Morgen geliefert.',
            'Ich kann mich immer auf meinen Lieferanten verlassen.',
        ],
        1675192165655: [
            'Sie ist vollkommen glücklich mit ihrem neuen Job.',
            'Das Essen war vollkommen in Ordnung, aber nicht besonders lecker.',
        ],
    });
});

test('ChatGPT mangled output throws error', () => {
    const output =
        '1675192165669: Die Flüsse können nach starkem Regen anschwellen. / Die Wunden am Bein können anschwellen und schmerzen.';

    expect(() => {
        parseChatGptOutput(output);
    }).toThrowError(
        'Probably got strangely formatted output from ChatGPT: "1675192165669: Die Flüsse können nach starkem Reg',
    );
});

test('ChatGPT another mangled output throws error', () => {
    const output =
        '1675192165669: Die Flüsse können nach starkem Regen anschwellen. Die Wunden am Bein können anschwellen und schmerzen.';

    expect(() => {
        parseChatGptOutput(output);
    }).toThrowError(
        'Probably got strangely formatted output from ChatGPT: "1675192165669: Die Flüsse können nach starkem Reg',
    );
});
