// Run the existing TypeScript/TSX sources in Node without generated files or new dependencies.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const cache = new Map();

function loadSource(filename) {
  const file = path.resolve(root, filename);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    fileName: file,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const localRequire = (name) => {
    if (!name.startsWith('.') && !name.startsWith('@/')) return require(name);
    const base = name.startsWith('@/') ? path.join(root, 'src', name.slice(2)) : path.resolve(path.dirname(file), name);
    const resolved = ['.ts', '.tsx'].map((ext) => base + ext).find(fs.existsSync);
    if (!resolved) throw new Error(`Cannot load ${name} from ${file}`);
    return loadSource(resolved);
  };
  new Function('require', 'module', 'exports', code)(localRequire, module, module.exports);
  return module.exports;
}

module.exports = { loadSource };
