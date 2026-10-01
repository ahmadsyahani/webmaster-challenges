import { cookies } from 'next/headers';
import { body, failure, json, session, setSession, text, ApiError, secret, equal } from '@/lib/server/security';
import { db, limit, mutate } from '@/lib/server/db';
import { finalize } from '@/lib/server/assessment';
import { MCQ_KEY } from '@/lib/server/answer-key';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function GET(req: Request) {
  try {
    await session('admin');
    const params = new URL(req.url).searchParams;
    if (params.has('id')) {
      const id = text(params.get('id'), 'ID', 36);
      if (!/^[0-9a-f-]{36}$/.test(id)) throw new ApiError(400, 'ID tidak valid.');
      return json({ attempt: await mutate(id, 'read'), answerKey: MCQ_KEY });
    }
    const page = Math.max(0, Math.min(10000, Math.floor(Number(params.get('page')) || 0)));
    const { data, error, count } = await db().from('assessment_attempts')
      .select('id,nama,nrp,prodi,kelas,phase,expires_at,submitted_at,result', { count: 'exact' })
      .order('started_at', { ascending: false }).range(page * 25, page * 25 + 24);
    if (error) throw Error(`Admin list: ${error.code}`);
    return json({ attempts: data, count, page });
  } catch (error) { return failure(error); }
}
export async function POST(req: Request) {
  try {
    const data = await body(req);
    if (data.action === 'login') {
      await limit('admin-login', 10, 300);
      if (!equal(text(data.password, 'Password', 200), secret('ADMIN_PASSWORD', 16))) throw new ApiError(401, 'Password tidak cocok.');
      await setSession('admin', 'admin'); return json({ success: true });
    }
    await session('admin');
    if (data.action === 'logout') {
      (await cookies()).delete('pensmate_admin'); return json({ success: true });
    }
    if (data.action === 'finalize') {
      const id = text(data.id, 'ID', 36);
      if (!/^[0-9a-f-]{36}$/.test(id)) throw new ApiError(400, 'ID tidak valid.');
      await limit(`submit:${id}`, 1, 10);
      const attempt = await mutate(id, 'read');
      if (!['grading','submitted'].includes(attempt.phase)) throw new ApiError(409, 'Peserta masih mengerjakan.');
      return json({ attempt: await finalize(attempt) });
    }
    throw new ApiError(400, 'Aksi tidak dikenal.');
  } catch (error) { return failure(error); }
}
