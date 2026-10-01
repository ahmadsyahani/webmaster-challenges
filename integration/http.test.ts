import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

// Real production Next HTTP routes + real local PostgreSQL. The small REST
// adapter implements only the Supabase operations exercised by this test.
// Neither the production URL nor any existing environment secret is used.
test('production HTTP flow: self registration, save, lock, grade, resume and access control', { timeout: process.env.PENSMATE_UI_PREVIEW ? 600000 : 90000 }, async () => {
  const database = new PGlite();
  await database.exec('create role anon; create role authenticated; create role service_role bypassrls;');
  await database.exec(await readFile('supabase/migrations/20261001_secure_assessment.sql','utf8'));
  await database.exec(await readFile('supabase/migrations/20261002_self_registration.sql','utf8'));
  await database.exec(await readFile('supabase/migrations/20261003_twenty_mcq.sql','utf8'));
  const bridge = createServer(async (req,res) => {
    res.setHeader('Content-Type','application/json');
    if (req.headers.authorization !== 'Bearer integration-service-key') { res.statusCode=401; res.end('{}'); return; }
    try {
      let raw=''; for await (const part of req) raw+=part;
      const b=raw ? JSON.parse(raw) : {}; const url=new URL(req.url!,'http://localhost');
      const fn=url.pathname.split('/').pop();
      let result: unknown;
      if (url.pathname.includes('/rpc/')) {
        const args: Record<string,unknown[]> = {
          assessment_rate_limit:[b.p_key,b.p_max,b.p_seconds],
          assessment_register:[b.p_nrp,b.p_nama,b.p_prodi,b.p_kelas],
          assessment_mutate:[b.p_id,b.p_action,JSON.stringify(b.p_payload),b.p_version],
        };
        if (!fn || !args[fn]) throw Error('Unsupported RPC');
        result=(await database.query<{data:unknown}>(`select ${fn}(${args[fn].map((_,i)=>'$'+(i+1)).join(',')}) data`,args[fn])).rows[0].data;
      } else if (fn==='assessment_invites' && req.method==='POST') {
        await database.query('insert into assessment_invites(nrp,nama,kelas,token_hash) values($1,$2,$3,$4)',[b.nrp,b.nama,b.kelas,b.token_hash]); result=null;
      } else if (fn==='submissions') {
        res.statusCode=404; res.end(JSON.stringify({ code:'PGRST205',message:'No legacy table in test database' })); return;
      } else if (fn==='assessment_attempts') {
        result=(await database.query('select * from assessment_attempts order by started_at desc')).rows;
        res.setHeader('Content-Range',`0-24/${(result as unknown[]).length}`);
      } else { throw Error('Unsupported REST operation'); }
      res.end(JSON.stringify(result));
    } catch(error) {
      const e=error as {message:string;code?:string}; res.statusCode=400; res.end(JSON.stringify({ message:e.message,code:e.code||'P0001' }));
    }
  });
  bridge.listen(0,'127.0.0.1'); await once(bridge,'listening');
  const reserve=createServer(); reserve.listen(0,'127.0.0.1'); await once(reserve,'listening');
  const port=(reserve.address() as AddressInfo).port; await new Promise<void>(r=>reserve.close(()=>r()));
  const origin=`http://127.0.0.1:${port}`;
  const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)], {
    cwd:process.cwd(),windowsHide:true,env:{...process.env,NODE_ENV:'production',
      SUPABASE_URL:`http://127.0.0.1:${(bridge.address() as AddressInfo).port}`,SUPABASE_SERVICE_ROLE_KEY:'integration-service-key',
      SESSION_SECRET:'integration-secret-at-least-32-chars-long',ADMIN_PASSWORD:'integration-password-12345',APP_ORIGIN:origin},
    stdio:['ignore','pipe','pipe'],
  });
  // Drain pipes so the server never blocks on logging.
  child.stdout.resume(); child.stderr.resume();
  async function request(path:string,data?:unknown,cookie='') {
    return fetch(origin+path,{method:data?'POST':'GET',headers:{origin,'Content-Type':'application/json',cookie},body:data?JSON.stringify(data):undefined});
  }
  try {
    let ready=false;
    for(let i=0;i<100;i++) {
      try { const res=await request('/'); if(res.ok){ready=true;break;} } catch {}
      if(child.exitCode!==null) throw Error('Next exited before readiness');
      await new Promise(r=>setTimeout(r,100));
    }
    assert.ok(ready,'Next production server starts');
    assert.equal((await request('/api/admin')).status,401);
    assert.equal((await request('/api/execute',{questionId:'1'})).status,401);
    assert.equal((await request('/api/submit',{version:0})).status,401);
    assert.equal((await request('/api/admin',{action:'login',password:'wrong'})).status,401);
    const login=await request('/api/admin',{action:'login',password:'integration-password-12345'});
    assert.equal(login.status,200); const admin=login.headers.get('set-cookie')!.split(';')[0];
    assert.match(login.headers.get('set-cookie')!,/HttpOnly/i); assert.match(login.headers.get('set-cookie')!,/SameSite=strict/i);
    assert.equal((await request('/api/assessment',{action:'start',nrp:'123456',nama:'Test User',prodi:'',kelas:'A'})).status,400);
    const start=await request('/api/assessment',{action:'start',nrp:'123456',nama:'Test User',prodi:'D4 Teknik Informatika',kelas:'2 D4 IT A'});
    assert.equal(start.status,200); const participant=start.headers.get('set-cookie')!.split(';')[0];
    let state=await start.json(); const id=state.attempt.id;
    assert.equal(state.attempt.prodi,'D4 Teknik Informatika');
    assert.equal(state.attempt.mcq_total,20);
    assert.equal((await request('/api/assessment',{action:'start',nrp:'123456',nama:'Other User',prodi:'D4 Teknik Informatika',kelas:'A'})).status,409);
    assert.equal((await request('/api/admin',undefined,participant)).status,401);
    const csrf=await fetch(origin+'/api/assessment',{method:'POST',headers:{origin:'https://wrong.example','Content-Type':'application/json',cookie:participant},body:'{}'});
    assert.equal(csrf.status,403);
    assert.equal((await request('/api/assessment',{action:'advance',version:state.attempt.version},participant)).status,400);
    for(let q=1;q<=20;q++) {
      const res=await request('/api/assessment',{action:'save_mcq',questionId:String(q),option:0,version:state.attempt.version},participant);
      assert.equal(res.status,200); state=await res.json();
      if (q===15) assert.equal((await request('/api/assessment',{action:'advance',version:state.attempt.version},participant)).status,400);
    }
    state=await (await request('/api/assessment',{action:'advance',version:state.attempt.version},participant)).json();
    assert.equal(state.attempt.phase,'coding');
    assert.equal((await request('/api/assessment',{action:'save_mcq',questionId:'1',option:2,version:state.attempt.version},participant)).status,409);
    state=await (await request('/api/assessment',{action:'save_code',questionId:'1',code:'function add(a,b){return a+b}',version:state.attempt.version},participant)).json();
    const run=await request('/api/execute',{questionId:'1',code:'evil',testCases:[]},participant);
    assert.equal(run.status,200); assert.equal((await run.json()).results.length,3);
    const submitted=await request('/api/submit',{version:state.attempt.version,codingProgress:{'999':{passed:true}},mcqAnswers:{'1':2}},participant);
    assert.equal(submitted.status,200); state=await submitted.json();
    assert.equal(state.attempt.phase,'submitted'); assert.equal(state.attempt.result,null);
    const repeated=await request('/api/submit',{version:0},participant);
    assert.equal(repeated.status,200); assert.equal((await repeated.json()).attempt.id,id);
    const detail=await (await request(`/api/admin?id=${id}`,undefined,admin)).json();
    assert.equal(detail.attempt.result.coding_score,10); assert.equal(detail.attempt.mcq_answers['1'],0);
    const resume=await (await request('/api/assessment',{action:'start',nrp:'123456',nama:'Test User',prodi:'D4 Teknik Informatika',kelas:'2 D4 IT A'},participant)).json();
    assert.equal(resume.attempt.id,id); assert.equal(resume.attempt.phase,'submitted');
    assert.equal((await request('/api/assessment',undefined,participant+'tampered')).status,401);
    if (process.env.PENSMATE_UI_PREVIEW) {
      console.log('ISOLATED_UI_PREVIEW=' + origin);
      await new Promise(resolve => setTimeout(resolve, 480000));
    }
  } finally {
    child.kill(); await once(child,'exit').catch(()=>{});
    await new Promise<void>(resolve=>bridge.close(()=>resolve())); await database.close();
  }
});
