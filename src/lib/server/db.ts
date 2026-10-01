import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { ApiError, secret } from './security';
import type { Attempt } from '../assessment-types';
export function db() {
  return createClient(process.env.SUPABASE_URL || secret('NEXT_PUBLIC_SUPABASE_URL'), secret('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
export async function rpc(name: string, args: Record<string, unknown>) {
  const { data, error } = await db().rpc(name, args);
  if (error) {
    if (error.message.startsWith('APP:')) {
      const first = error.message.indexOf(':', 4);
      const status = Number(error.message.slice(4, first));
      const message = error.message.slice(first + 1);
      throw new ApiError(status, message);
    }
    throw new Error(`Database ${name}: ${error.code}`);
  }
  return data;
}
export async function mutate(id: string, action: string, payload: Record<string, unknown> = {}, version = -1): Promise<Attempt> {
  return rpc('assessment_mutate', { p_id: id, p_action: action, p_payload: payload, p_version: version });
}
export async function limit(key: string, maximum: number, seconds: number) {
  await rpc('assessment_rate_limit', { p_key: key, p_max: maximum, p_seconds: seconds });
}
