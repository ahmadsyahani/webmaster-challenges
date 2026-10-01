import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import type { Attempt } from '../src/lib/assessment-types';

test('self-registration migration preserves existing results and registers four fields without invitations', async () => {
  const db = new PGlite();
  try {
    await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
    await db.exec(await readFile('supabase/migrations/20261001_secure_assessment.sql','utf8'));
    await db.exec("insert into assessment_invites(nrp,nama,kelas,token_hash) values('100000','Existing','A','old'); select assessment_start('100000','old');");
    const old = (await db.query<{id:string}>('select id from assessment_attempts')).rows[0].id;
    await db.exec(await readFile('supabase/migrations/20261002_self_registration.sql','utf8'));
    assert.equal((await db.query<{id:string}>('select id from assessment_attempts')).rows[0].id,old);
    const register = (nrp='200000',prodi='D4 Teknik Informatika') => db.query<{a:Attempt}>(
      'select assessment_register($1,$2,$3,$4) a',[nrp,'  Peserta Baru  ',prodi,'2 D4 IT A']);
    const a=(await register()).rows[0].a;
    assert.equal(a.nama,'Peserta Baru'); assert.equal(a.prodi,'D4 Teknik Informatika'); assert.equal(a.kelas,'2 D4 IT A');
    assert.equal(a.phase,'penalaran');
    await assert.rejects(register(),/NRP sudah terdaftar/);
    await assert.rejects(register('100000'),/NRP sudah terdaftar/);
    await assert.rejects(register('300000','  '),/Lengkapi/);
    await assert.rejects(register('invalid'),/Lengkapi/);
    await db.exec("create table submissions(nrp text); insert into submissions values ('400000');");
    await assert.rejects(register('400000'),/pernah mengumpulkan/);
    await db.exec('set role anon;');
    await assert.rejects(register('500000'),/permission denied/);
    await db.exec('reset role;');
  } finally { await db.close(); }
});
