import { useEffect, useRef, useState } from 'react';
import { buildPlayground } from '../lib/runner';
import { useSandbox } from '../lib/useSandbox';
import { useProgress } from '../lib/progress';
import { CodeEditor } from '../components/lesson/CodeEditor';
import { Icon } from '../components/ui/Icon';

type Pane = 'html' | 'css' | 'js';

const templates: Record<string, { label: string; html: string; css: string; js: string }> = {
  blank: {
    label: 'Blank',
    html: `<main class="card">
  <h1>Hello, Zuno</h1>
  <p>Write something and watch it appear.</p>
</main>`,
    css: `body {
  display: grid;
  place-items: center;
  min-height: 100vh;
  font-family: Inter, system-ui, sans-serif;
}

.card {
  padding: 32px;
  border: 1px solid #e3e0d6;
  border-radius: 16px;
  background: #fffdf8;
}`,
    js: `console.log('Ready when you are.');`,
  },
  counter: {
    label: 'Counter',
    html: `<main class="counter">
  <h1>Counter</h1>
  <p>Count: <span id="count">0</span></p>
  <button id="add" type="button">Add one</button>
</main>`,
    css: `.counter {
  font-family: Inter, system-ui, sans-serif;
  padding: 40px;
  text-align: center;
}

button {
  padding: 10px 18px;
  border-radius: 999px;
  border: none;
  background: #1e4b3a;
  color: #f8f5ec;
  font-size: 14px;
  cursor: pointer;
}`,
    js: `const output = document.querySelector('#count');
let count = 0;

document.querySelector('#add').addEventListener('click', () => {
  count += 1;
  output.textContent = count;
});`,
  },
  grid: {
    label: 'Card grid',
    html: `<section class="grid">
  <article class="tile"><h2>HTML</h2><p>Structure.</p></article>
  <article class="tile"><h2>CSS</h2><p>Layout.</p></article>
  <article class="tile"><h2>JavaScript</h2><p>Behaviour.</p></article>
</section>`,
    css: `.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  padding: 24px;
  font-family: Inter, system-ui, sans-serif;
}

.tile {
  padding: 20px;
  border: 1px solid #e3e0d6;
  border-radius: 14px;
  background: #fffdf8;
}

h2 { margin: 0 0 6px; font-size: 18px; }
p { margin: 0; color: #6f7167; }`,
    js: `console.log('Resize the preview to watch the grid reflow.');`,
  },
};

export function Playground() {
  const [pane, setPane] = useState<Pane>('html');
  const [template, setTemplate] = useState('blank');
  const [html, setHtml] = useState(templates.blank.html);
  const [css, setCss] = useState(templates.blank.css);
  const [js, setJs] = useState(templates.blank.js);
  const [showConsole, setShowConsole] = useState(false);
  const { srcDoc, result, timedOut, run } = useSandbox(4000);
  const { logPlaygroundRun } = useProgress();
  const lastRun = useRef(0);

  useEffect(() => {
    document.title = 'Playground — Zuno';
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      run((runId) => buildPlayground({ markup: html, css, js, runId }));
      const now = Date.now();
      if (now - lastRun.current > 30_000) {
        lastRun.current = now;
        logPlaygroundRun();
      }
    }, 550);
    return () => window.clearTimeout(timer);
  }, [html, css, js, run, logPlaygroundRun]);

  const loadTemplate = (key: string) => {
    const next = templates[key];
    if (!next) return;
    setTemplate(key);
    setHtml(next.html);
    setCss(next.css);
    setJs(next.js);
  };

  const value = pane === 'html' ? html : pane === 'css' ? css : js;
  const setValue = pane === 'html' ? setHtml : pane === 'css' ? setCss : setJs;

  return (
    <div className="page page--wide fade-in">
      <header className="page-head">
        <div>
          <p className="eyebrow">Playground</p>
          <h1 className="page-title">Three panes, no brief.</h1>
          <p className="page-sub">
            Everything runs in a sandboxed frame. Break it, reset it, try the idea you had during the last lesson.
          </p>
        </div>
        <div className="page-head-actions">
          <div className="template-picker" role="group" aria-label="Templates">
            {Object.entries(templates).map(([key, entry]) => (
              <button
                key={key}
                type="button"
                className={`template-btn${template === key ? ' is-active' : ''}`}
                onClick={() => loadTemplate(key)}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="playground">
        <div className="pg-editor">
          <div className="pg-tabs" role="tablist" aria-label="Files">
            {(['html', 'css', 'js'] as Pane[]).map((entry) => (
              <button
                key={entry}
                type="button"
                role="tab"
                aria-selected={pane === entry}
                className={`pg-tab${pane === entry ? ' is-active' : ''}`}
                onClick={() => setPane(entry)}
              >
                <span className={`ws-file-dot ws-file-dot--${entry}`} aria-hidden="true" />
                {entry === 'html' ? 'index.html' : entry === 'css' ? 'styles.css' : 'script.js'}
              </button>
            ))}
          </div>
          <div className="pg-code">
            <CodeEditor value={value} onChange={setValue} kind={pane} />
          </div>
        </div>

        <div className="pg-output">
          <div className="pg-output-bar">
            <div className="pg-output-tabs" role="tablist" aria-label="Output">
              <button
                type="button"
                role="tab"
                aria-selected={!showConsole}
                className={`ws-tab${!showConsole ? ' is-active' : ''}`}
                onClick={() => setShowConsole(false)}
              >
                Preview
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={showConsole}
                className={`ws-tab${showConsole ? ' is-active' : ''}`}
                onClick={() => setShowConsole(true)}
              >
                Console
                {(result?.logs.length ?? 0) > 0 && <span className="ws-tab-count">{result?.logs.length}</span>}
              </button>
            </div>
            <button
              type="button"
              className="ws-btn"
              onClick={() => run((runId) => buildPlayground({ markup: html, css, js, runId }))}
            >
              <Icon name="play" size={13} />
              Run
            </button>
          </div>

          {showConsole ? (
            <div className="ws-console mono pg-console">
              {timedOut && <p className="console-error">Execution timed out after 4 seconds.</p>}
              {result?.error && <p className="console-error">{result.error}</p>}
              {!timedOut && !result?.error && (result?.logs.length ?? 0) === 0 && (
                <p className="console-empty">No output yet. Try console.log().</p>
              )}
              {result?.logs.map((line, index) => (
                <p key={index} className="console-line">
                  <span className="console-caret">›</span>
                  {line}
                </p>
              ))}
            </div>
          ) : (
            <iframe
              title="Playground preview"
              className="ws-frame"
              srcDoc={srcDoc}
              sandbox="allow-scripts allow-forms allow-modals"
            />
          )}
        </div>
      </div>
    </div>
  );
}
