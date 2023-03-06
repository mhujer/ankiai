/**
 * @see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60924#issuecomment-1358424866
 */
declare global {
    export const { fetch, FormData, Headers, Request, Response }: typeof import('undici');
    export type { FormData, Headers, Request, RequestInit, Response } from 'undici';
}

export {};
