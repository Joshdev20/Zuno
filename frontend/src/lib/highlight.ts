export type TokenClass = 'tag' | 'attr' | 'str' | 'num' | 'key' | 'com' | 'fn' | 'op' | 'punc';

export interface Token {
  text: string;
  cls?: TokenClass;
}

export type CodeLanguage = 'html' | 'css' | 'js' | 'python' | 'text';

const KEYWORDS: Record<string, string[]> = {
  js: [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'new', 'class',
    'extends', 'import', 'export', 'default', 'from', 'async', 'await', 'try', 'catch', 'finally',
    'throw', 'typeof', 'instanceof', 'in', 'of', 'switch', 'case', 'break', 'continue', 'delete',
    'true', 'false', 'null', 'undefined', 'this', 'void', 'yield', 'static', 'get', 'set',
  ],
  python: [
    'def', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and', 'or', 'import',
    'from', 'as', 'class', 'with', 'try', 'except', 'finally', 'raise', 'pass', 'break',
    'continue', 'lambda', 'yield', 'global', 'nonlocal', 'assert', 'del', 'is', 'None', 'True',
    'False', 'self',
  ],
  css: ['important', 'media', 'supports', 'keyframes', 'import', 'font-face', 'from', 'to'],
};

const WORD = /[A-Za-z_$#@-]/;

function toSet(list: string[]): Set<string> {
  return new Set(list);
}

const keywordSets: Record<string, Set<string>> = {
  js: toSet(KEYWORDS.js),
  python: toSet(KEYWORDS.python),
  css: toSet(KEYWORDS.css),
};

function normalize(language?: string): CodeLanguage {
  const value = (language ?? '').toLowerCase();
  if (value.startsWith('py')) return 'python';
  if (value === 'js' || value === 'javascript') return 'js';
  if (value === 'css') return 'css';
  if (value === 'html' || value === 'htm') return 'html';
  return 'text';
}

export function tokenize(code: string, language?: string): Token[] {
  const lang = normalize(language);
  if (lang === 'text') return [{ text: code }];

  const tokens: Token[] = [];
  const push = (text: string, cls?: TokenClass) => {
    if (!text) return;
    const last = tokens[tokens.length - 1];
    if (last && last.cls === cls) last.text += text;
    else tokens.push({ text, cls });
  };

  let i = 0;
  let braceDepth = 0;
  let insideTag = false;

  const takeString = (quote: string) => {
    const start = i;
    i += quote.length;
    while (i < code.length) {
      if (code[i] === '\\') {
        i += 2;
        continue;
      }
      if (code.startsWith(quote, i)) {
        i += quote.length;
        break;
      }
      i += 1;
    }
    push(code.slice(start, i), 'str');
  };

  while (i < code.length) {
    const ch = code[i];

    if (lang === 'html' && code.startsWith('<!--', i)) {
      const end = code.indexOf('-->', i);
      const stop = end === -1 ? code.length : end + 3;
      push(code.slice(i, stop), 'com');
      i = stop;
      continue;
    }

    if ((lang === 'css' || lang === 'js') && code.startsWith('/*', i)) {
      const end = code.indexOf('*/', i);
      const stop = end === -1 ? code.length : end + 2;
      push(code.slice(i, stop), 'com');
      i = stop;
      continue;
    }

    if (lang === 'js' && code.startsWith('//', i)) {
      const end = code.indexOf('\n', i);
      const stop = end === -1 ? code.length : end;
      push(code.slice(i, stop), 'com');
      i = stop;
      continue;
    }

    if (lang === 'python' && ch === '#') {
      const end = code.indexOf('\n', i);
      const stop = end === -1 ? code.length : end;
      push(code.slice(i, stop), 'com');
      i = stop;
      continue;
    }

    if (lang === 'python' && (code.startsWith('"""', i) || code.startsWith("'''", i))) {
      takeString(code.slice(i, i + 3));
      continue;
    }

    if (ch === '"' || ch === "'" || (lang === 'js' && ch === '`')) {
      takeString(ch);
      continue;
    }

    if (lang === 'html') {
      if (ch === '<') {
        const closing = code[i + 1] === '/';
        push('<', 'punc');
        i += 1;
        if (closing) {
          push('/', 'punc');
          i += 1;
        }
        if (code[i] === '!') {
          const end = code.indexOf('>', i);
          const stop = end === -1 ? code.length : end + 1;
          push(code.slice(i, stop), 'com');
          i = stop;
          continue;
        }
        const nameMatch = /^[A-Za-z][\w:-]*/.exec(code.slice(i));
        if (nameMatch) {
          push(nameMatch[0], 'tag');
          i += nameMatch[0].length;
        }
        insideTag = true;
        continue;
      }
      if (insideTag) {
        if (ch === '>') {
          push('>', 'punc');
          i += 1;
          insideTag = false;
          continue;
        }
        if (ch === '/' && code[i + 1] === '>') {
          push('/>', 'punc');
          i += 2;
          insideTag = false;
          continue;
        }
        if (ch === '=') {
          push('=', 'punc');
          i += 1;
          continue;
        }
        if (ch === '"' || ch === "'") {
          takeString(ch);
          continue;
        }
        const attr = /^[A-Za-z_:@][\w:.-]*/.exec(code.slice(i));
        if (attr) {
          push(attr[0], 'attr');
          i += attr[0].length;
          continue;
        }
      }
      push(ch);
      i += 1;
      continue;
    }

    if (lang === 'css' && ch === '#' && /^#[0-9a-fA-F]{3,8}\b/.test(code.slice(i))) {
      const hex = /^#[0-9a-fA-F]{3,8}/.exec(code.slice(i))![0];
      push(hex, 'num');
      i += hex.length;
      continue;
    }

    if (/[0-9]/.test(ch)) {
      const num = /^\d+(\.\d+)?(px|rem|em|%|s|ms|vh|vw|fr|deg|ch|ex)?/.exec(code.slice(i));
      push(num ? num[0] : ch, 'num');
      i += num ? num[0].length : 1;
      continue;
    }

    if (WORD.test(ch)) {
      const word = /^[A-Za-z_$@#-][\w$-]*/.exec(code.slice(i))?.[0] ?? ch;
      const rest = code.slice(i + word.length);
      const nextChar = rest.trimStart()[0];
      const keywords = keywordSets[lang];

      if (lang === 'css') {
        const prevChar = code.slice(0, i).trimEnd().slice(-1);
        const statementStart = prevChar === '' || '{},;'.includes(prevChar);
        if (word.startsWith('@') || word === 'important') push(word, 'key');
        else if (nextChar === ':') push(word, 'attr');
        else if (statementStart || prevChar === '.' || prevChar === '#') push(word, 'tag');
        else if (nextChar === '(') push(word, 'fn');
        else push(word);
      } else if (keywords?.has(word)) {
        push(word, 'key');
      } else if (nextChar === '(') {
        push(word, 'fn');
      } else if (word.startsWith('@')) {
        push(word, 'attr');
      } else {
        push(word);
      }
      i += word.length;
      continue;
    }

    if (ch === '{') {
      braceDepth += 1;
      push(ch, 'punc');
      i += 1;
      continue;
    }
    if (ch === '}') {
      braceDepth = Math.max(0, braceDepth - 1);
      push(ch, 'punc');
      i += 1;
      continue;
    }

    if ('()[],;:'.includes(ch)) {
      push(ch, 'punc');
      i += 1;
      continue;
    }

    if ('=+-*/%<>!&|?'.includes(ch)) {
      push(ch, 'op');
      i += 1;
      continue;
    }

    push(ch);
    i += 1;
  }

  return tokens;
}
