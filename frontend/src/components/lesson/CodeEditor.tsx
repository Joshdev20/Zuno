import { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html as htmlLang } from '@codemirror/lang-html';
import { css as cssLang } from '@codemirror/lang-css';
import { javascript as jsLang } from '@codemirror/lang-javascript';
import { python as pythonLang } from '@codemirror/lang-python';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { Prec } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import type { ExerciseKind } from '../../lib/types';

const editorTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: 'transparent',
      color: '#dfe4f2',
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
      caretColor: '#a78bff',
    },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#4a5474',
      paddingLeft: '6px',
    },
    '.cm-activeLine': { backgroundColor: 'rgba(255, 255, 255, 0.035)' },
    '.cm-activeLineGutter': { backgroundColor: 'transparent', color: '#8f99b8' },
    '&.cm-focused': { outline: 'none' },
    '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: 'rgba(123, 92, 255, 0.3) !important',
    },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#a78bff' },
  },
  { dark: true },
);

const highlight = HighlightStyle.define([
  { tag: [tags.comment, tags.lineComment, tags.blockComment], color: '#5d688c', fontStyle: 'italic' },
  { tag: [tags.tagName, tags.typeName, tags.className, tags.namespace], color: '#9d8cff' },
  { tag: tags.angleBracket, color: '#6b7694' },
  { tag: [tags.attributeName, tags.propertyName], color: '#6fd3c7' },
  { tag: [tags.string, tags.special(tags.string), tags.attributeValue, tags.regexp], color: '#e8c07a' },
  { tag: [tags.number, tags.integer, tags.float, tags.bool, tags.null, tags.atom], color: '#f0a3c8' },
  {
    tag: [tags.keyword, tags.controlKeyword, tags.moduleKeyword, tags.operatorKeyword, tags.definitionKeyword],
    color: '#a78bff',
  },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: '#8fc7ff' },
  { tag: [tags.definition(tags.variableName), tags.variableName], color: '#dfe4f2' },
  { tag: [tags.operator, tags.punctuation], color: '#8a94b2' },
  { tag: [tags.brace, tags.squareBracket, tags.paren], color: '#7d88a8' },
  { tag: [tags.meta, tags.documentMeta], color: '#7d88a8' },
  { tag: [tags.heading, tags.strong], color: '#eef1fb', fontWeight: '600' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.invalid, color: '#ff8f8a' },
]);

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
      kind === 'html' ? htmlLang() : kind === 'css' ? cssLang() : kind === 'python' ? pythonLang() : jsLang();
    return [language, editorTheme, Prec.highest(syntaxHighlighting(highlight)), EditorView.lineWrapping];
  }, [kind]);

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      height="100%"
      minHeight={minHeight}
      theme="none"
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
