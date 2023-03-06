// @see https://github.com/microsoft/TypeScript/issues/32098#issuecomment-1279645368
export type RegExpGroups<T extends string> =
    | (RegExpMatchArray & {
          groups?: { [name in T]: string } | { [key: string]: string }; // eslint-disable-line @typescript-eslint/consistent-indexed-object-style
      })
    | null;
