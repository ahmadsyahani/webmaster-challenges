/* eslint-disable @typescript-eslint/no-require-imports -- Node preload hooks must run synchronously as CommonJS. */
// Compile test TypeScript in memory; no generated files or application writes.
const ts = require('typescript');
const fs = require('node:fs');
require.extensions['.ts'] = function(module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    fileName: filename,
  });
  module._compile(outputText, filename);
};
