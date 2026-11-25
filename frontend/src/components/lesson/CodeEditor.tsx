import { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html as htmlLang } from '@codemirror/lang-html';
import { css as cssLang } from '@codemirror/lang-css';
import { javascript as jsLang } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import type { ExerciseKind } from '../../lib/types';

const editorTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: 'transparent',
      fontSize: '13px',
      height: '100%',
    },
    '.cm-scroller': {
      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      lineHeight: '1.7',
      padding: '6px 0 18px',
    },
    '.cm-content': {
      padding: '10px 0',
      caretColor: '#d8b877',
    },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#5b625d',
      paddingLeft: '6px',
    },
    '.cm-activeLine': { backgroundColor: 'rgba(255, 255, 255, 0.035)' },
    '.cm-activeLineGutter': { backgroundColor: 'transparent', color: '#a5aea6' },
    '&.cm-focused': { outline: 'none' },
    '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: '#2b4a3c !important',
    },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#d8b877' },
  },
  { dark: true },
);

export function CodeEditor({
  value,
  onChange,
  kind,
  readOnly = false,
  minHeight,
}: {
  value: string;
  onChange?: (value: string) => void;
  kind: ExerciseKind;
  readOnly?: boolean;
  minHeight?: string;
}) {
  const extensions = useMemo(() => {
    const language =
      kind === 'html' ? htmlLang() : kind === 'css' ? cssLang() : jsLang();
    return [language, editorTheme, EditorView.lineWrapping];
  }, [kind]);

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      height="100%"
      minHeight={minHeight}
      theme={oneDark}
      extensions={extensions}
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        autocompletion: false,
        bracketMatching: true,
        closeBrackets: true,
        highlightSelectionMatches: false,
        searchKeymap: true,
      }}
    />
  );
}
