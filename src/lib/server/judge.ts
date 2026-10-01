import 'server-only';
import { Worker } from 'node:worker_threads';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import type { TestCase } from '../questions';

export interface TestResult { id: number; input: string; expectedOutput: string; actualOutput: string; passed: boolean; error: string | null }
// Only this trusted worker has Node access. Candidate code runs in a fresh WASM
// interpreter with no process, require, fetch, filesystem or host callbacks.
const workerSource = String.raw`
const { parentPort, workerData } = require('node:worker_threads');
(async () => {
  const { getQuickJS } = require(workerData.modulePath);
  const engine = await getQuickJS();
  const started = Date.now(); const results = [];
  for (const tc of workerData.cases) {
    const runtime = engine.newRuntime();
    runtime.setMemoryLimit(16 * 1024 * 1024);
    runtime.setMaxStackSize(256 * 1024);
    const deadline = Date.now() + 150;
    runtime.setInterruptHandler(() => Date.now() > deadline);
    const vm = runtime.newContext();
    let actualOutput = ''; let error = null;
    // Capture a trusted serializer before executing candidate code. Comparison
    // with the expected answer happens in the host, never inside candidate code.
    const jsonObject = vm.getProp(vm.global, 'JSON');
    const stringify = vm.getProp(jsonObject, 'stringify');
    try {
      const loaded = vm.evalCode(workerData.code, 'answer.js');
      if (loaded.error) { loaded.error.dispose(); throw Error('Syntax/runtime error atau batas sumber daya terlampaui.'); }
      loaded.value.dispose();
      const evaluated = vm.evalCode(tc.input, 'test.js');
      if (evaluated.error) { evaluated.error.dispose(); throw Error('Runtime error atau batas sumber daya terlampaui.'); }
      try {
        const serialized = vm.callFunction(stringify, jsonObject, evaluated.value);
        if (serialized.error) { serialized.error.dispose(); throw Error('Hasil tidak dapat diserialisasi.'); }
        try {
          if (vm.typeof(serialized.value) === 'string') actualOutput = vm.getString(serialized.value);
          else actualOutput = '(Tidak ada output; gunakan return)';
        } finally { serialized.value.dispose(); }
      } finally { evaluated.value.dispose(); }
      if (actualOutput.length > 4096) throw Error('Output terlalu panjang.');
    } catch(e) { error = e.message || 'Eksekusi gagal'; actualOutput = error; }
    finally { stringify.dispose(); jsonObject.dispose(); vm.dispose(); runtime.dispose(); }
    results.push({ ...tc, actualOutput, passed: !error && actualOutput === tc.expectedOutput, error });
  }
  parentPort.postMessage({ results, runtime: Date.now() - started });
})().catch(() => parentPort.postMessage({ failed: true }));
`;

export async function judge(code: string, cases: TestCase[]): Promise<{ results: TestResult[]; runtime: number }> {
  const modulePath = createRequire(join(process.cwd(), 'package.json')).resolve('quickjs-emscripten');
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerSource, { eval: true, workerData: { modulePath, code, cases },
      resourceLimits: { maxOldGenerationSizeMb: 64, maxYoungGenerationSizeMb: 16, stackSizeMb: 2 } });
    let settled = false;
    const finish = (error?: Error, result?: { results: TestResult[]; runtime: number }) => {
      if (settled) return; settled = true; clearTimeout(timer); void worker.terminate();
      if (error) reject(error); else resolve(result!);
    };
    const timer = setTimeout(() => finish(undefined, {
      runtime: 4000, results: cases.map(tc => ({ ...tc, passed: false, actualOutput: 'Batas waktu eksekusi terlampaui.', error: 'Timeout' })),
    }), 4000);
    worker.once('message', data => data.failed ? finish(new Error('Sandbox initialization failed')) : finish(undefined, data));
    worker.once('error', error => finish(error));
    worker.once('exit', () => { if (!settled) finish(new Error('Sandbox terminated unexpectedly')); });
  });
}
