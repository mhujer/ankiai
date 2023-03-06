import { expect, it } from 'vitest';
import sleep from './sleep';

it('returns a promise', () => {
    const sleepPromise = sleep(1);
    expect(sleepPromise).instanceOf(Promise);
});

it('can be called with await', async () => {
    await sleep(1);
});
