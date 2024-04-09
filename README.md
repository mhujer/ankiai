# Anki AI - Add example sentences to your Anki notes with ChatGPT

> _Note: This README has been improved by ChatGPT 😀_

Anki AI is a powerful tool that leverages the chat completion API from ChatGPT to generate example sentences for your Anki notes. With Anki AI, you can quickly and easily enhance your Anki notes with relevant and useful example sentences, regardless of the language you are studying.

> **I wrote [an article about Anki AI on my blog](https://blog.martinhujer.cz/anki-ai-example-sentences-for-anki-with-chat-gpt/).**

## Depends on:

1. [AnkiConnect](https://github.com/FooSoft/anki-connect) plugin to provide HTTP API for Anki.
2. [Chat completion API](https://platform.openai.com/docs/guides/chat) from ChatGPT to generate sentences.

## How to use

Anki AI was originally created to add example sentences to my German Anki notes, but it can be easily adapted to work with other languages as well. To use Anki AI, follow these steps:

1. [Obtain an OpenAI API key](https://platform.openai.com/account/api-keys) and add it to your `.env.local` under `OPENAI_API_KEY` entry. See the included `.env` file for an example.
2. Install [AnkiConnect](https://ankiweb.net/shared/info/2055492159) to your Anki
3. Configure `ANKI_DECK` in `.env.local` file to match the name of the deck you want to process (e.g. `'Deutsch'`).
4. Configure `ANKI_LANGUAGE` in `.env.local` file to the language of your cards (e.g. `'Spanish'` or `'German'`) 
4. Modify `NoteFields` interface to match fields names in your Anki notes
5. Replace all occurences of `FrontTextExample` with the name of the field where you want the example sentences to be placed.
7. Ensure that Anki is running.
8. Run `npm run dev` to start the Anki AI application.

By following these simple steps, you can quickly and easily enhance your Anki notes with relevant and useful example sentences using Anki AI.

## Examples

I got pretty good results (at least for my language learning needs).

```js
[
    { noteId: 1675192165656, text: 'der Ton' },
    { noteId: 1675192165657, text: 'der Führerschein' },
    { noteId: 1675192165661, text: 'die Schuld' },
    { noteId: 1675192165667, text: 'die Biene' },
    { noteId: 1675192165670, text: 'sich entzünden' },
    { noteId: 1675192165675, text: 'der Kaufmann' },
    { noteId: 1675192165675, text: 'die Kauffrau' },
    { noteId: 1675192165676, text: 'das Tischtennis' },
    { noteId: 1675192165681, text: 'die Stellenanzeige' },
    { noteId: 1675192165688, text: 'der Auftritt' },
    { noteId: 1675192165668, text: 'der Stich' },
    { noteId: 1675192165672, text: 'die Umschulung' },
    { noteId: 1675192165659, text: 'mit einem blauen Auge davonkommen' },
    { noteId: 1675192165685, text: 'ziemlich gut' },
    { noteId: 1675192165654, text: 'der Abnehmer' },
    { noteId: 1675192165669, text: 'anschwellen' },
    { noteId: 1675192165662, text: 'Schulden machen' },
    { noteId: 1675192165683, text: 'das Publikum' },
    { noteId: 1675192165652, text: 'der Lieferant' },
    { noteId: 1675192165655, text: 'vollkommen' },
];
```

```js
{
    '1675192165656': [
        'Der Ton der Musik war zu laut.',
        'Kannst du bitte den Ton des Fernsehers erhöhen?'
    ],
    '1675192165657': [
        'Ich habe gestern meinen Führerschein bestanden.',
        'Ich kann meinen Führerschein nicht finden. '
    ],
    '1675192165661': [
        'Ich habe keine Schuld an dem Unfall.',
        'Er hat die Schuld auf sich genommen.'
    ],
    '1675192165667': [
        'Die Biene ist auf einer Blume gelandet.',
        'Die Biene hat mich gestochen.'
    ],
    '1675192165670': [
        'Das Feuer hat sich schnell entzündet.',
        'Die Zigarette hat sich auf dem Teppich entzündet.'
    ],
    '1675192165675': [
        'Der Kaufmann hat einen neuen Laden eröffnet.',
        'Die Kauffrau arbeitet im Einzelhandel.'
    ],
    '1675192165676': [
        'Ich liebe Tischtennis spielen.',
        'Können wir Tischtennis im Garten spielen?'
    ],
    '1675192165681': [
        'Ich habe eine interessante Stellenanzeige gefunden.',
        'Die Stellenanzeige hat keine Angaben zum Gehalt.'
    ],
    '1675192165688': [
        'Sein Auftritt auf der Bühne war fantastisch.',
        'Der Musiker hatte einen schlechten Auftritt.'
    ],
    '1675192165668': [
        'Die Stechmücke hat mich gestochen.',
        'Er hat einen Stich ins Herz bekommen.'
    ],
    '1675192165672': [
        'Ich muss eine Umschulung machen, um eine neue Arbeit zu finden.',
        'Die Umschulung hat mir sehr geholfen, einen neuen Job zu finden.'
    ],
    '1675192165659': [
        'Ich bin froh, dass ich mit einem blauen Auge davon gekommen bin. ',
        'Er kam gestern mit einem blauen Auge davon.'
    ],
    '1675192165685': [
        'Sein Deutsch ist ziemlich gut.',
        'Sie spielt ziemlich gut Gitarre.'
    ],
```
