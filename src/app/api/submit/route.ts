import { body, failure, json, session, ApiError } from '@/lib/server/security';
import { limit, mutate } from '@/lib/server/db';
import { finalize, publicAttempt } from '@/lib/server/assessment';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function POST(req: Request) {
  try {
    const data = await body(req);
    const id = await session('participant');
    if (!Number.isInteger(data.version)) throw new ApiError(400, 'Versi jawaban tidak valid.');
    const existing = await mutate(id, 'read');
    if (existing.phase === 'submitted') return json({ success: true, attempt: publicAttempt(existing), serverNow: Date.now() });
    await limit(`submit:${id}`, 1, 10);
    const attempt = await finalize(await mutate(id, 'freeze', {}, data.version as number));
    return json({ success: true, attempt: publicAttempt(attempt), serverNow: Date.now() });
  } catch (error) { return failure(error); }
}
