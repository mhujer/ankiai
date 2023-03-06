import { Configuration, OpenAIApi } from 'openai';
import type { NoteForProcessing } from '../anki';
import { generatePrompt } from './generate-prompt';

export const fetchExamples = async (apiKey: string, vocabulary: NoteForProcessing[]) => {
    if (vocabulary.length === 0) {
        throw new Error('No vocabulary passed!');
    }

    const configuration = new Configuration({
        apiKey: apiKey,
    });
    const openai = new OpenAIApi(configuration);

    const prompt = generatePrompt(vocabulary);
    console.log(prompt);

    const chatCompletion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content:
                    'You are a helpful vocabulary learning asistent who helps user generate example sentences in German for language learning. I will provide each word prefixed by ID and you will generate two example sentences for each input. Each sentence in response must be on its own line and starting with ID I provided so it can be parsed with regex /^(\\d+): (.*)$/',
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
    });

    const data = chatCompletion.data;

    if (chatCompletion.data.choices[0] === undefined || chatCompletion.data.choices[0].message === undefined) {
        console.dir(data);
        console.log(JSON.stringify(data));
        throw new Error('Invalid response structure!');
    }

    // finish_reason should be 'stop', but sometimes it returns null and the output seems ok, so I can use it as well
    if (
        chatCompletion.data.choices[0].finish_reason !== 'stop' &&
        chatCompletion.data.choices[0].finish_reason !== null // eslint-disable-line @typescript-eslint/no-unnecessary-condition
    ) {
        console.dir(data);
        console.log(JSON.stringify(data));
        throw new Error('Response incomplete!');
    }

    return chatCompletion.data.choices[0].message.content;
};
