export interface AllVocabularyExamples {
    items: VocabularyExamples[];
}

export interface VocabularyExamples {
    id: number;
    exampleSentences: [string, string];
}
