import { fetchNotesFromAnki, updateNote } from './anki';
import * as dotenv from 'dotenv';
import { fetchExamples } from './openai/get-sentences-from-chatgpt';
import { parseChatGptOutput } from './openai/parse-chatpt-output';
import sleep from './utils/sleep';

const DECK_TO_PROCESS = 'Deutsch';

const MAX_NOTES_PROCESSED_AT_ONCE = 20;
const MAX_NOTES_PROCESSED_AT_ONE_RUN = 60;

let notesProcessedCount = 0;

void (async function () {
    dotenv.config({ path: '.env.local' });

    const openApiKey = process.env['OPENAI_API_KEY'];
    if (openApiKey === undefined) {
        throw new Error('Please configure OPENAI_API_KEY env variable!');
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition,no-constant-condition
    while (true) {
        const notes = await fetchNotesFromAnki(DECK_TO_PROCESS);
        console.log(`Found ${notes.length} notes eligible for fetching!`);

        const notesForProcessing = notes.slice(0, MAX_NOTES_PROCESSED_AT_ONCE);
        console.log(`Processing batch of ${notesForProcessing.length} notes.`);

        const chatGptResponse = await fetchExamples(openApiKey, notesForProcessing);
        console.dir(chatGptResponse);

        const parsedResponse = parseChatGptOutput(chatGptResponse);
        console.dir(parsedResponse);

        for (const noteId in parsedResponse) {
            const examples = parsedResponse[noteId];
            if (examples === undefined) {
                console.dir(parsedResponse);
                throw new Error(`Missing "${noteId}" in parsedResponse!`);
            }
            const fieldText = examples.join('\n<br>');

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
