// src/app/api/execute/route.ts
import { NextResponse } from 'next/server';

interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, testCases } = body;

    if (!code || !testCases) {
      return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
    }

    const results = testCases.map((tc: TestCase) => {
      const logs: string[] = [];
      const customConsole = {
        log: (...args: unknown[]) => {
          logs.push(args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' '));
        },
        error: (...args: unknown[]) => {
          logs.push('[Error] ' + args.join(' '));
        }
      };

      try {
        const executeFn = new Function('console', 'input', code);
        executeFn(customConsole, tc.input);

        const actualOutput = logs.join('\n').trim();
        const passed = actualOutput === tc.expectedOutput.trim();

        return {
          id: tc.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: actualOutput || '(Tidak ada output)',
          passed: passed,
          error: null
        };
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Runtime Error';
        return {
          id: tc.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: `Error: ${errorMessage}`,
          passed: false,
          error: errorMessage
        };
      }
    });

    const allPassed = results.every((r: { passed: boolean }) => r.passed);

    return NextResponse.json({
      results: results,
      allPassed: allPassed
    });

  } catch {
    return NextResponse.json({ error: 'Server error saat mengeksekusi kode.' }, { status: 500 });
  }
}