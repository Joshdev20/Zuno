import { useMemo } from 'react';
import { tokenize } from '../../lib/highlight';

export function CodeTokens({ code, language }: { code: string; language?: string }) {
  const tokens = useMemo(() => tokenize(code, language), [code, language]);

  return (
    <>
      {tokens.map((token, index) =>
        token.cls ? (
          <span key={index} className={`tok-${token.cls}`}>
            {token.text}
          </span>
        ) : (
          token.text
        ),
      )}
    </>
  );
}
