import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function secret(name: string, minimum = 1) {
  const value = process.env[name];
  if (!value || value.length < minimum) throw new ApiError(503, 'Konfigurasi server belum lengkap. Hubungi panitia.');
  return value;
}
export const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export function equal(a: string, b: string) {
  return timingSafeEqual(Buffer.from(hash(a)), Buffer.from(hash(b)));
}
function sessionKey(role: 'admin' | 'participant') {
  const base = secret('SESSION_SECRET', 32);
  return role === 'admin'
    ? createHmac('sha256', base).update(secret('ADMIN_PASSWORD', 16)).digest()
    : base;
}
export function signSession(id: string, role: 'admin' | 'participant') {
  const payload = Buffer.from(JSON.stringify({ id, role, exp: Date.now() + 24 * 3600_000 })).toString('base64url');
  return `${payload}.${createHmac('sha256', sessionKey(role)).update(payload).digest('base64url')}`;
}
export function verifySession(token: string, role: 'admin' | 'participant') {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) throw new ApiError(401, 'Silakan masuk kembali.');
  const expected = createHmac('sha256', sessionKey(role)).update(payload).digest('base64url');
  if (!equal(signature, expected)) throw new ApiError(401, 'Sesi tidak valid.');
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (data.role !== role || !Number.isFinite(data.exp) || data.exp <= Date.now() || typeof data.id !== 'string') throw Error();
    return data.id as string;
  } catch { throw new ApiError(401, 'Sesi kedaluwarsa. Silakan masuk kembali.'); }
}
export async function session(role: 'admin' | 'participant') {
  return verifySession((await cookies()).get(`pensmate_${role}`)?.value || '', role);
}
export async function setSession(id: string, role: 'admin' | 'participant') {
  (await cookies()).set(`pensmate_${role}`, signSession(id, role), {
    httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 86400,
  });
}
export function origin(req: Request) {
  const expected = process.env.APP_ORIGIN || new URL(req.url).origin;
  if (req.headers.get('origin') !== expected) throw new ApiError(403, 'Asal permintaan tidak valid.');
}
export async function body(req: Request): Promise<Record<string, unknown>> {
  origin(req);
  if (!req.headers.get('content-type')?.startsWith('application/json')) throw new ApiError(415, 'Gunakan JSON.');
  const reader = req.body?.getReader();
  if (!reader) throw new ApiError(400, 'Data kosong.');
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.length;
      if (size > 128_000) { await reader.cancel(); throw new ApiError(413, 'Data terlalu besar.'); }
      chunks.push(value);
    }
    const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!data || Array.isArray(data) || typeof data !== 'object') throw Error();
    return data;
  } catch (error) { if (error instanceof ApiError) throw error; throw new ApiError(400, 'Format data tidak valid.'); }
}
export function text(value: unknown, label: string, max = 100) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new ApiError(400, `${label} tidak valid.`);
  return value.trim();
}
export const json = (data: unknown) => NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
export function failure(error: unknown) {
  if (!(error instanceof ApiError)) console.error('Assessment error:', error instanceof Error ? error.message : 'Database operation failed');
  return NextResponse.json({ error: error instanceof ApiError ? error.message : 'Server bermasalah. Jawaban yang tersimpan tetap aman; coba lagi.' }, {
    status: error instanceof ApiError ? error.status : 500, headers: { 'Cache-Control': 'no-store' },
  });
}
