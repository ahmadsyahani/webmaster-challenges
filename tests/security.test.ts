import { test } from 'node:test';
import assert from 'node:assert/strict';
import { signSession, verifySession, body, ApiError } from '../src/lib/server/security';
import { mcqScore, MCQ_KEY } from '../src/lib/server/answer-key';
import { mcqQuestions } from '../src/lib/mcq';
import { questions } from '../src/lib/questions';
import { csvCell } from '../src/lib/csv';
process.env.SESSION_SECRET = 'test-only-secret-that-is-more-than-32-characters';
process.env.ADMIN_PASSWORD = 'test-only-admin-password';

test('signed sessions reject tampering, wrong roles and expired tokens', () => {
  const signed = signSession('attempt-1', 'participant');
  assert.equal(verifySession(signed, 'participant'), 'attempt-1');
  assert.throws(() => verifySession(signed, 'admin'), ApiError);
  assert.throws(() => verifySession(signed + 'x', 'participant'), ApiError);
  const [payload, signature] = signed.split('.');
  const changed = JSON.parse(Buffer.from(payload, 'base64url').toString()); changed.id = 'other';
  assert.throws(() => verifySession(Buffer.from(JSON.stringify(changed)).toString('base64url') + '.' + signature, 'participant'));
  const original = Date.now; Date.now = () => original() + 25 * 3600_000;
  try { assert.throws(() => verifySession(signed, 'participant'), ApiError); } finally { Date.now = original; }
});
test('changing admin password invalidates existing admin sessions only', () => {
  const admin = signSession('admin', 'admin');
  const participant = signSession('attempt-1', 'participant');
  assert.equal(verifySession(admin, 'admin'), 'admin');
  process.env.ADMIN_PASSWORD = 'a-different-admin-password';
  try {
    assert.throws(() => verifySession(admin, 'admin'), (error: ApiError) => error.status === 401);
    assert.equal(verifySession(participant, 'participant'), 'attempt-1');
  } finally {
    process.env.ADMIN_PASSWORD = 'test-only-admin-password';
  }
});
test('MCQ public data has no answer keys; unknown IDs cannot inflate scores', () => {
  assert.equal(mcqQuestions.length, 20);
  assert.deepEqual(mcqQuestions.map(q => q.id), Array.from({length:20}, (_,i) => i+1));
  assert.deepEqual(Object.keys(MCQ_KEY).map(Number).sort((a,b) => a-b), mcqQuestions.map(q => q.id));
  assert.equal(mcqScore(MCQ_KEY), 100);
  assert.equal(mcqScore(Object.fromEntries(Object.entries(MCQ_KEY).filter(([id]) => Number(id) <= 15)),15), 100);
  assert.equal(mcqScore({ ...MCQ_KEY, '999': 2 }), 100);
  assert.equal(mcqScore({}), 0);
  assert.ok(mcqQuestions.every(q => !('correctAnswer' in q)));
  assert.ok(questions.every(q => !('hint' in q)), 'Full-solution hints must not be included in public questions');
});
test('CSV preserves delimiters and neutralizes spreadsheet formulas', () => {
  assert.equal(csvCell('Nama, "A"\nB'), '"Nama, ""A""\nB"');
  assert.equal(csvCell(' =1+1'), '"\' =1+1"');
});
test('request validation rejects CSRF, non-object JSON and large bodies', async () => {
  const req = (raw: string, origin = 'http://localhost:3000') => new Request('http://localhost:3000/api/assessment', { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: raw });
  await assert.rejects(body(req('{}','https://attacker.example')), (e: ApiError) => e.status === 403);
  await assert.rejects(body(req('[]')), (e: ApiError) => e.status === 400);
  await assert.rejects(body(req(JSON.stringify({ code: 'a'.repeat(130000) }))), (e: ApiError) => e.status === 413);
  assert.deepEqual(await body(req('{"action":"start"}')), { action: 'start' });
});
