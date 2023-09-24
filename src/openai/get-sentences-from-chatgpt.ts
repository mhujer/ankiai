import type { NoteForProcessing } from '../anki';
import { generatePrompt } from './generate-prompt';
import { createJsonTranslator, createLanguageModel } from 'typechat';
import fs from 'fs';
import path from 'path';
import type { AllVocabularyExamples } from './typechat-response-schema';

export const fetchExamples = async (language: string, vocabulary: NoteForProcessing[]) => {
    if (vocabulary.length === 0) {
        throw new Error('No vocabulary passed!');
    }

    const model = createLanguageModel(process.env);
    // @todo path is from `build/openai/`
    const schema = fs.readFileSync(path.join(__dirname, '../../src/openai/typechat-response-schema.ts'), 'utf8');
    const translator = createJsonTranslator<AllVocabularyExamples>(model, schema, 'AllVocabularyExamples');

    const vocabularyPrompt = generatePrompt(vocabulary);
    console.log(vocabularyPrompt);

    const prompt =
        'You are a helpful vocabulary learning assistant who helps user generate example sentences in ' +
        language +
        ' for language learning. I will provide each word prefixed by ID and you will generate two example sentences for each input. The sentences should be complex enough for A2/B1 level.\n' +
        vocabularyPrompt;

    const response = await translator.translate(prompt);
    if (!response.success) {
        console.dir(response);
        throw new Error('Error fetching data from chatGPT: ' + response.message);
    } else {
        console.dir(response.data.items);
        return response.data.items;
    }
};
