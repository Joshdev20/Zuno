import type { Check, CheckResult } from './types';

const BOOT_BUDGET = 60_000;
const RUN_BUDGET = 8_000;

export interface PythonRun {
  logs: string[];
  error: string | null;
  results: CheckResult[];
}

interface Pending {
  resolve: (run: PythonRun) => void;
  timer: number;
  checks: Array<{ label: string }>;
}

let worker: Worker | null = null;
let booted = false;
let seq = 0;
const pending = new Map<number, Pending>();

function failAll(message: string) {
  for (const [id, entry] of pending) {
    window.clearTimeout(entry.timer);
    pending.delete(id);
    entry.resolve({
      logs: [],
      error: message,
      results: entry.checks.map((check) => ({ label: check.label, ok: false, detail: 'Python did not start.' })),
    });
  }
}

function resetWorker() {
  worker?.terminate();
  worker = null;
  booted = false;
}

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(`${import.meta.env.BASE_URL}pyodide-worker.js`);
  worker.addEventListener('message', (event: MessageEvent) => {
    const data = event.data as { id?: number; ready?: boolean } & Partial<PythonRun>;
    if (data.ready) {
      booted = true;
      return;
    }
    const entry = data.id === undefined ? undefined : pending.get(data.id);
    if (!entry || data.id === undefined) return;
    pending.delete(data.id);
    window.clearTimeout(entry.timer);
    booted = true;
    entry.resolve({
      logs: data.logs ?? [],
      error: data.error ?? null,
      results: data.results ?? [],
    });
  });
  worker.addEventListener('error', (event) => {
    resetWorker();
    failAll(
      event.message
        ? `Python runtime failed to load: ${event.message}`
        : 'Python runtime failed to load. Check your connection and press Run again.',
    );
  });
  return worker;
}

export function runPython(code: string, checks: Check[]): Promise<PythonRun> {
  const id = ++seq;
  const active = getWorker();
  const payload = checks
    .filter((check) => check.kind === 'python' && check.expression)
    .map((check) => ({ label: check.label, expression: check.expression as string }));

  return new Promise((resolve) => {
    const budget = booted ? RUN_BUDGET : BOOT_BUDGET;
    const timer = window.setTimeout(() => {
      pending.delete(id);
      const wasBooted = booted;
      resetWorker();
      resolve({
        logs: [],
        error: wasBooted
          ? `Stopped after ${RUN_BUDGET / 1000}s. An endless loop is the usual cause — check your loop condition.`
          : 'The Python runtime did not finish loading. Press Run to try again.',
        results: payload.map((check) => ({ label: check.label, ok: false, detail: 'Timed out.' })),
      });
    }, budget);

    pending.set(id, { resolve, timer, checks: payload });
    active.postMessage({ id, code, checks: payload });
  });
}

const hints: Array<[RegExp, string]> = [
  [/NameError: name '(.+)' is not defined/, '`$1` is used before it exists. Check the spelling and make sure the line that creates it runs first.'],
  [/IndentationError|TabError/, 'Python reads indentation as structure. Every line inside a block needs the same number of spaces — four is the convention.'],
  [/SyntaxError/, 'The parser stopped early. Look one line above the arrow: that is usually where a bracket, quote or colon is missing.'],
  [/TypeError: can only concatenate str/, '`+` joins two strings, not a string and a number. Convert with `str(...)` or use an f-string.'],
  [/TypeError: unsupported operand type\(s\)/, 'Those two types do not combine. Convert one of them first — `int("5")`, `str(5)`, and so on.'],
  [/ZeroDivisionError/, 'Something divided by zero. Guard the divisor before you use it.'],
  [/KeyError: '?(\w+)'?/, "That key is not in the dictionary. Print the dict or use `.get('$1', default)` so a miss is safe."],
  [/IndexError: list index out of range/, 'The index is past the end of the list. Indexes start at 0 and the last one is `len(items) - 1`.'],
  [/AttributeError: '(.+)' object has no attribute '(.+)'/, 'A `$1` has no `$2`. Check the type before calling the method, or convert it first.'],
  [/ModuleNotFoundError: No module named '(.+)'/, '`$1` is not available in this sandbox. Stick to the modules that ship with Python.'],
];

export function explainPythonError(message: string): string | null {
  for (const [pattern, hint] of hints) {
    const match = message.match(pattern);
    if (match) return hint.replace(/\$(\d)/g, (_all, index) => match[Number(index)] ?? '');
  }
  return null;
}
