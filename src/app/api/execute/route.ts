import { body, failure, json, session, ApiError } from '@/lib/server/security';
import { limit, mutate } from '@/lib/server/db';
import { judge } from '@/lib/server/judge';
import { casesFor } from '@/lib/server/test-cases';
export const runtime = 'nodejs';
export const maxDuration = 15;
export async function POST(req: Request) {
  try {
    const data = await body(req);
    const id = await session('participant');
    await limit(`execute:${id}`, 1, 5);
    await limit('execute-global', 60, 60);
    const attempt = await mutate(id, 'read');
    if (attempt.phase !== 'coding') throw new ApiError(409, 'Sesi coding tidak aktif atau waktu telah habis.');
    const questionId = String(data.questionId);
    const cases = casesFor(questionId, false);
    if (!cases.length) throw new ApiError(400, 'Soal tidak ditemukan.');
    return json(await judge(attempt.codes[questionId] || '', cases));
  } catch (error) { return failure(error); }
}
