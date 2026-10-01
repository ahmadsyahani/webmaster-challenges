import { body, failure, json, session, setSession, text, ApiError, secret } from '@/lib/server/security';
import { limit, mutate, rpc } from '@/lib/server/db';
import { publicAttempt } from '@/lib/server/assessment';
import type { Attempt } from '@/lib/assessment-types';
export const runtime = 'nodejs';
export async function GET() {
  try {
    const attempt = await mutate(await session('participant'), 'read');
    return json({ attempt: publicAttempt(attempt), serverNow: Date.now() });
  } catch (error) { return failure(error); }
}
export async function POST(req: Request) {
  try {
    const data = await body(req);
    let attempt: Attempt;
    if (data.action === 'start') {
      secret('SESSION_SECRET', 32);
      const nrp = text(data.nrp, 'NRP', 20);
      if (!/^\d{5,20}$/.test(nrp)) throw new ApiError(400, 'NRP harus 5–20 digit.');
      await limit(`login:${nrp}`, 10, 300);
      await limit('participant-login-global', 300, 60);
      const nama = text(data.nama, 'Nama'), prodi = text(data.prodi, 'Prodi'), kelas = text(data.kelas, 'Kelas', 50);
      // A signed cookie may resume its own attempt. Knowing an NRP alone must
      // never grant access to another participant's answers.
      let existing: Attempt | null = null;
      try { existing = await mutate(await session('participant'), 'read'); }
      catch (error) { if (!(error instanceof ApiError) || error.status !== 401) throw error; }
      attempt = existing?.nrp === nrp ? existing : await rpc('assessment_register', {
        p_nrp: nrp, p_nama: nama, p_prodi: prodi, p_kelas: kelas,
      });
      await setSession(attempt.id, 'participant');
      attempt = await mutate(attempt.id, 'read');
    } else {
      const id = await session('participant');
      await limit(`save:${id}`, 240, 60);
      if (!['save_mcq','save_code','advance'].includes(String(data.action))) throw new ApiError(400, 'Aksi tidak valid.');
      if (!Number.isInteger(data.version)) throw new ApiError(400, 'Versi jawaban tidak valid.');
      attempt = await mutate(id, String(data.action), data, data.version as number);
    }
    return json({ attempt: publicAttempt(attempt), serverNow: Date.now() });
  } catch (error) { return failure(error); }
}
