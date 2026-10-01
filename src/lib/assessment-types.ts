export type Phase = 'penalaran' | 'coding' | 'grading' | 'submitted';
export interface Attempt {
  id: string; nrp: string; nama: string; prodi: string; kelas: string;
  phase: Phase; expires_at: string; version: number;
  mcq_answers: Record<string, number>;
  codes: Record<string, string>;
  result: null | { mcq_score: number; coding_score: number; coding_progress: Record<string, { code: string; passed: boolean }> };
  submitted_at: string | null;
}
export interface SessionState { attempt: Attempt; serverNow: number }
