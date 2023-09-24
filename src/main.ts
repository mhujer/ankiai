import { fetchNotesFromAnki, updateNote } from './anki';
import * as dotenv from 'dotenv';
import { fetchExamples } from './openai/get-sentences-from-chatgpt';
import sleep from './utils/sleep';
require('axios-debug-log/enable');

const DECK_TO_PROCESS = 'Deutsch';

const MAX_NOTES_PROCESSED_AT_ONCE = 20;
const MAX_NOTES_PROCESSED_AT_ONE_RUN = 100;

let notesProcessedCount = 0;

void (async function () {
    dotenv.config({ path: '.env.local' });

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition,no-constant-condition
    while (true) {
        const notes = await fetchNotesFromAnki(DECK_TO_PROCESS);
        console.log(`Found ${notes.length} notes eligible for fetching!`);

        const notesForProcessing = notes.slice(0, MAX_NOTES_PROCESSED_AT_ONCE);
        console.log(`Processing batch of ${notesForProcessing.length} notes.`);

        const examplesFromChatGPT = await fetchExamples(notesForProcessing);

        for (const vocabularyExample of examplesFromChatGPT) {
            const noteId = vocabularyExample.id;
            const examples = vocabularyExample.exampleSentences;

            const fieldText = examples.join('<br>');

            const noteForAnki = {
                id: +noteId,
                fields: {
                    FrontTextExample: fieldText,
                },
            };

            console.dir(noteForAnki);
            await updateNote(noteForAnki);
            await sleep(500);
        }

        notesProcessedCount += notesForProcessing.length;
        if (notesProcessedCount >= MAX_NOTES_PROCESSED_AT_ONE_RUN) {
            console.log(`Processed ${notesProcessedCount} notes, quiting.`);
            break;
        }
    }
})();
