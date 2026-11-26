/* eslint-disable no-restricted-globals */
const runtimeBase = new URL('pyodide/', self.location.href).href;
importScripts(runtimeBase + 'pyodide.js');

let booting = null;

function boot() {
  if (!booting) booting = loadPyodide({ indexURL: runtimeBase });
  return booting;
}

self.onmessage = async (event) => {
  const { id, code, checks } = event.data;
  const logs = [];
  try {
    const runtime = await boot();
    runtime.setStdout({ batched: (line) => logs.push(line) });
    runtime.setStderr({ batched: (line) => logs.push(line) });
    const namespace = runtime.toPy({ __name__: '__main__' });
    namespace.set('__zuno_src', code);

    let error = null;
    try {
      await runtime.runPythonAsync(code, { globals: namespace });
    } catch (thrown) {
      error = thrown && thrown.message ? String(thrown.message) : String(thrown);
    }

    namespace.set('__zuno_out', logs.join('\n'));
    const results = [];
    for (const check of checks) {
      if (error) {
        results.push({ label: check.label, ok: false, detail: 'Code did not finish running.' });
        continue;
      }
      try {
        const value = await runtime.runPythonAsync('bool(' + check.expression + ')', { globals: namespace });
        results.push({ label: check.label, ok: Boolean(value) });
      } catch (thrown) {
        const message = thrown && thrown.message ? String(thrown.message).trim().split('\n').pop() : 'check failed';
        results.push({ label: check.label, ok: false, detail: message });
      }
    }
    self.postMessage({ id, logs, error, results });
  } catch (thrown) {
    self.postMessage({ id, logs, error: 'Could not start Python: ' + String(thrown), results: [] });
  }
};
