import type { Check, CheckResult, Exercise } from './types';

const BASE_CSS = `
  html { -webkit-text-size-adjust: 100%; }
  body {
    margin: 0;
    padding: 24px;
    background: #fffdf8;
    color: #14150f;
    font-family: Inter, system-ui, -apple-system, 'Segoe UI', sans-serif;
    font-size: 16px;
    line-height: 1.55;
  }
  img, svg, video { max-width: 100%; height: auto; }
  a { color: #1e4b3a; }
`;

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function headScript(): string {
  return `<script>
(function () {
  var logs = [];
  window.__zunoLogs = logs;
  window.__zunoError = null;
  function fmt(value) {
    if (typeof value === 'string') return value;
    if (value instanceof Error) return value.message;
    try { return JSON.stringify(value); } catch (e) { return String(value); }
  }
  ['log', 'info', 'warn', 'error'].forEach(function (level) {
    var original = console[level];
    console[level] = function () {
      logs.push(Array.prototype.map.call(arguments, fmt).join(' '));
      if (logs.length > 200) logs.shift();
      try { original.apply(console, arguments); } catch (e) {}
    };
  });
  window.addEventListener('error', function (event) {
    window.__zunoError = String(event.message || (event.error && event.error.message) || 'Script error');
  });
  window.addEventListener('unhandledrejection', function (event) {
    var reason = event.reason;
    window.__zunoError = String((reason && reason.message) || reason || 'Unhandled rejection');
  });
})();
<\/script>`;
}

function jsCheckEntries(checks: Check[]): string {
  return checks
    .map((check, index) => {
      if (check.kind !== 'js') return '';
      const label = JSON.stringify(check.label);
      const expression = check.expression ?? 'false';
      return `    case ${index}:
      try {
        result = Boolean(await (async () => (${expression}))());
        detail = '';
      } catch (error) {
        result = false;
        detail = String((error && error.message) || error);
      }
      return { label: ${label}, ok: result, detail: detail };`;
    })
    .join('\n');
}

function tailScript(checks: Check[], runId: string): string {
  return `<script>
(async function () {
  var CHECKS = ${JSON.stringify(checks)};
  function norm(value) {
    return String(value == null ? '' : value).toLowerCase().replace(/\\s+/g, ' ').trim();
  }
  function probe(property, value, el) {
    var node = document.createElement('div');
    node.style.position = 'absolute';
    node.style.visibility = 'hidden';
    node.style.pointerEvents = 'none';
    if (el) {
      var computed = getComputedStyle(el);
      node.style.fontSize = computed.fontSize;
      node.style.fontFamily = computed.fontFamily;
    }
    node.style[property] = value;
    document.body.appendChild(node);
    var resolved = getComputedStyle(node)[property];
    node.remove();
    return resolved;
  }
  function color(value) {
    return probe('color', value, null);
  }
  function checkDom(check) {
    var nodes = document.querySelectorAll(check.selector);
    if (!nodes.length) return { label: check.label, ok: false, detail: 'Nothing matches ' + check.selector };
    if (check.textIncludes) {
      var text = Array.prototype.map.call(nodes, function (n) { return n.textContent || ''; }).join(' ');
      if (norm(text).indexOf(norm(check.textIncludes)) === -1) {
        return { label: check.label, ok: false, detail: 'Text does not include “' + check.textIncludes + '”' };
      }
    }
    return { label: check.label, ok: true };
  }
  function checkStyle(check) {
    var el = document.querySelector(check.selector);
    if (!el) return { label: check.label, ok: false, detail: 'Nothing matches ' + check.selector };
    var actual = getComputedStyle(el)[check.property];
    var expected = check.expected;
    if (/color/i.test(check.property)) {
      var actualColor = color(actual);
      var expectedColor = color(expected);
      return {
        label: check.label,
        ok: actualColor === expectedColor,
        detail: actualColor + ' — expected ' + expectedColor
      };
    }
    var resolved = probe(check.property, expected, el);
    var a = parseFloat(actual);
    var b = parseFloat(resolved);
    var numeric = !isNaN(a) && !isNaN(b) && /^[-\\d.]/.test(String(actual).trim()) && /^[-\\d.]/.test(String(resolved).trim());
    var ok = numeric ? Math.abs(a - b) <= 1 : norm(actual) === norm(resolved);
    return { label: check.label, ok: ok, detail: actual + ' — expected ' + resolved };
  }
  function checkConsole(check) {
    var logs = window.__zunoLogs || [];
    var ok = logs.some(function (line) { return norm(line).indexOf(norm(check.includes || '')) !== -1; });
    return { label: check.label, ok: ok, detail: ok ? '' : 'No console output matched' };
  }
  async function jsCheck(index) {
    var result = false;
    var detail = '';
    switch (index) {
${jsCheckEntries(checks)}
      default:
        return { label: 'Unknown check', ok: false };
    }
  }
  function send(results) {
    parent.postMessage(
      {
        type: 'zuno:result',
        runId: ${JSON.stringify(runId)},
        results: results,
        logs: (window.__zunoLogs || []).slice(0, 40),
        error: window.__zunoError || null
      },
      '*'
    );
  }
  var results = [];
  for (var i = 0; i < CHECKS.length; i++) {
    var check = CHECKS[i];
    try {
      if (check.kind === 'dom') results.push(checkDom(check));
      else if (check.kind === 'style') results.push(checkStyle(check));
      else if (check.kind === 'console') results.push(checkConsole(check));
      else if (check.kind === 'js') results.push(await jsCheck(i));
      else results.push({ label: check.label, ok: true });
    } catch (error) {
      results.push({ label: check.label, ok: false, detail: String((error && error.message) || error) });
    }
  }
  send(results);
})();
<\/script>`;
}

function injectHead(code: string, head: string, baseStyle: string): string {
  const styleTag = `<style>${baseStyle}</style>`;
  const bodyMatch = /<body[^>]*>/i.exec(code);
  if (bodyMatch && bodyMatch.index !== undefined) {
    const insertAt = bodyMatch.index + bodyMatch[0].length;
    return code.slice(0, insertAt) + styleTag + head + code.slice(insertAt);
  }
  const headClose = /<\/head>/i.exec(code);
  if (headClose && headClose.index !== undefined) {
    return code.slice(0, headClose.index) + styleTag + code.slice(headClose.index);
  }
  return styleTag + head + code;
}

function injectTail(code: string, tail: string): string {
  const bodyClose = code.toLowerCase().lastIndexOf('</body>');
  if (bodyClose !== -1) return code.slice(0, bodyClose) + tail + code.slice(bodyClose);
  return code + tail;
}

function ensureDocument(code: string): string {
  if (/<html[\s>]/i.test(code)) return code;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Preview</title></head><body>${code}</body></html>`;
}

export interface BuildOptions {
  exercise: Pick<Exercise, 'kind' | 'markup' | 'prelude'>;
  code: string;
  checks: Check[];
  runId: string;
}

export function buildDocument({ exercise, code, checks, runId }: BuildOptions): string {
  const head = headScript();
  const tail = tailScript(checks, runId);

  if (exercise.kind === 'html') {
    const doc = ensureDocument(code);
    return `<!-- ${runId} -->${injectTail(injectHead(doc, head, BASE_CSS), tail)}`;
  }

  const markup = exercise.markup ?? '';
  const userCss = exercise.kind === 'css' ? code : '';
  const userJs = exercise.kind === 'js' ? `${exercise.prelude ? `${exercise.prelude}\n\n` : ''}${code}` : '';

  return `<!doctype html><!-- ${runId} -->
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Preview</title>
<style>${BASE_CSS}</style>
<style>${userCss}</style>
</head>
<body>
${markup}
${head}
<script>
${userJs}
<\/script>
${tail}
</body>
</html>`;
}

export function buildPlayground({
  markup,
  css,
  js,
  runId,
}: {
  markup: string;
  css: string;
  js: string;
  runId: string;
}): string {
  return `<!doctype html><!-- ${runId} -->
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Playground</title>
<style>${BASE_CSS}</style>
<style>${css}</style>
</head>
<body>
${markup}
${headScript()}
<script>
${js}
<\/script>
<script>
setTimeout(function () {
  parent.postMessage(
    {
      type: 'zuno:result',
      runId: ${JSON.stringify(runId)},
      results: [],
      logs: (window.__zunoLogs || []).slice(0, 60),
      error: window.__zunoError || null
    },
    '*'
  );
}, 120);
<\/script>
</body>
</html>`;
}

export function evaluateSourceChecks(code: string, checks: Check[]): CheckResult[] {
  return checks
    .filter((check) => check.kind === 'source')
    .map((check) => ({
      label: check.label,
      ok: code.toLowerCase().includes((check.includes ?? '').toLowerCase()),
      detail: code.toLowerCase().includes((check.includes ?? '').toLowerCase())
        ? undefined
        : `Expected to find “${check.includes}” in your code`,
    }));
}

export function mergeResults(checks: Check[], frameResults: CheckResult[], code: string): CheckResult[] {
  const sourceResults = evaluateSourceChecks(code, checks);
  let sourceIndex = 0;
  return checks.map((check, index) => {
    if (check.kind === 'source') {
      const result = sourceResults[sourceIndex++];
      return result ?? { label: check.label, ok: false };
    }
    return frameResults[index] ?? { label: check.label, ok: false, detail: 'Check did not run' };
  });
}

export { escapeHtml };
