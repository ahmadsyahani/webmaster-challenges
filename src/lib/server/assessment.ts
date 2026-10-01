import 'server-only';
import { mutate } from './db';
import { judge } from './judge';
import { casesFor } from './test-cases';
import { mcqScore } from './answer-key';
import { questions } from '../questions';
import type { Attempt } from '../assessment-types';

export async function finalize(attempt: Attempt): Promise<Attempt> {
  if (attempt.phase !== 'grading') return attempt;
  const progress: Record<string, { code: string; passed: boolean }> = {};
  for (const question of questions) {
    const code = attempt.codes[question.id] || '';
    const passed = code.trim() ? (await judge(code, casesFor(question.id, true))).results.every(r => r.passed) : false;
    progress[question.id] = { code, passed };
  }
  return mutate(attempt.id, 'finalize', {
    mcq_score: mcqScore(attempt.mcq_answers, attempt.mcq_total ?? 15),
    coding_score: Math.round(Object.values(progress).filter(p => p.passed).length / questions.length * 100),
    coding_progress: progress,
  });
}
export function publicAttempt(attempt: Attempt) {
  // Final scores and hidden test results are available to admins only.
  return { ...attempt, result: null };
}
