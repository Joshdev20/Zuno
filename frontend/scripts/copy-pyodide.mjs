import { cp, mkdir, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, '../node_modules/pyodide');
const target = resolve(here, '../public/pyodide');
const files = ['pyodide.js', 'pyodide.asm.js', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json'];

try {
  await stat(source);
} catch {
  console.log('[pyodide] runtime not installed — run npm install');
  process.exit(0);
}

await mkdir(target, { recursive: true });
for (const file of files) {
  await cp(resolve(source, file), resolve(target, file));
}
console.log(`[pyodide] runtime copied to public/pyodide (${files.length} files)`);
