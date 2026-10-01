'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Code2, Clock3, Check, ArrowLeft, ArrowRight, CheckCircle2, Play, Send, Loader2, CircleHelp } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import { mcqQuestions } from '@/lib/mcq';
import { questions } from '@/lib/questions';
import { api } from '@/lib/client-api';
import type { Attempt, SessionState } from '@/lib/assessment-types';
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false, loading: () => <p>Memuat editor…</p> });
type Run = { results: { id: number; passed: boolean; actualOutput: string; expectedOutput: string }[]; runtime: number };

function InlineText({ text }: { text: string }) {
  return <>{text.split(/(\x60[^\x60]+\x60|\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') ? <strong key={i}>{part.slice(2,-2)}</strong> :
    part.startsWith('\x60') ? <code key={i}>{part.slice(1,-1)}</code> : part)}</>;
}

export default function Assessment({ initialId = 1 }: { initialId?: number }) {
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const current = useRef<Attempt | null>(null);
  const [index, setIndex] = useState(Math.max(0, initialId - 1));
  const [code, setCode] = useState('');
  const draft = useRef<{ id: string; code: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const working = useRef(false);
  const [error, setError] = useState('');
  const [remaining, setRemaining] = useState(3600_000);
  const deadline = useRef(Infinity);
  const retryAt = useRef(0);
  const [run, setRun] = useState<Run | null>(null);
  const [confirm, setConfirm] = useState<'advance' | 'submit' | null>(null);
  const [recoverable, setRecoverable] = useState<string | null>(null);

  const accept = useCallback((data: SessionState) => {
    current.current = data.attempt; setAttempt(data.attempt);
    // Use the server clock and monotonic elapsed time, not the participant's wall clock.
    deadline.current = performance.now() + Math.max(0, Date.parse(data.attempt.expires_at) - data.serverNow);
    setRemaining(Math.max(0, deadline.current - performance.now()));
  }, []);

  const flush = useCallback(async () => {
    // Typing is allowed while autosave is in flight. Drain any newer draft too.
    while (draft.current && current.current?.phase === 'coding') {
      const pending = draft.current;
      const data = await api<SessionState>('/api/assessment', {
        action: 'save_code', questionId: pending.id, code: pending.code, version: current.current.version,
      });
      accept(data);
      if (draft.current === pending) {
        draft.current = null; setDirty(false);
        localStorage.removeItem(`pensmate_draft_${data.attempt.id}_${pending.id}`);
      }
      if (data.attempt.phase !== 'coding') { draft.current = null; setDirty(false); break; }
    }
  }, [accept]);

  const action = useCallback(async (task: () => Promise<void>) => {
    if (working.current) return;
    working.current = true; setBusy(true); setError('');
    try { await task(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Koneksi terputus. Coba lagi.'); }
    finally { working.current = false; setBusy(false); }
  }, []);

  const finish = useCallback(async (manual: boolean) => {
    if (!current.current || current.current.phase === 'submitted') return;
    await action(async () => {
      if (manual) await flush();
      else accept(await api<SessionState>('/api/assessment'));
      const data = await api<SessionState>('/api/submit', { version: current.current!.version });
      accept(data); setConfirm(null);
    });
  }, [accept, action, flush]);

  useEffect(() => {
    let active = true;
    api<SessionState>('/api/assessment').then(data => {
      if (!active) return;
      accept(data);
      const max = data.attempt.phase === 'penalaran' ? mcqQuestions.length : questions.length;
      const next = Math.min(max - 1, Math.max(0, initialId - 1));
      setIndex(next);
      const id = String(next + 1);
      setCode(data.attempt.codes[id] ?? questions[next]?.initialCode ?? '');
      setRecoverable(localStorage.getItem(`pensmate_draft_${data.attempt.id}_${id}`));
    }).catch(e => active && setError(e.message));
    return () => { active = false; };
  }, [accept, initialId]);

  useEffect(() => {
    const interval = setInterval(() => {
      const a = current.current;
      if (!a || a.phase === 'submitted') return;
      const left = Math.max(0, deadline.current - performance.now()); setRemaining(left);
      if ((left === 0 || a.phase === 'grading') && !working.current && performance.now() > retryAt.current) {
        retryAt.current = performance.now() + 15_000;
        void finish(false);
      } else if (left > 0 && draft.current && !working.current) { void action(flush); }
    }, 1000);
    return () => clearInterval(interval);
  }, [action, finish, flush]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (draft.current || working.current) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);

  const changeCode = (value: string) => {
    setCode(value); setRun(null); setDirty(true); setRecoverable(null);
    draft.current = { id: String(index + 1), code: value };
    try { localStorage.setItem(`pensmate_draft_${attempt!.id}_${index + 1}`, value); }
    catch { setError('Penyimpanan lokal tidak tersedia. Pastikan status berubah menjadi Tersimpan sebelum keluar.'); }
  };
  const navigate = (next: number) => action(async () => {
    await flush(); setIndex(next); setRun(null);
    const id = String(next + 1);
    setCode(current.current!.codes[id] ?? questions[next]?.initialCode ?? '');
    setRecoverable(localStorage.getItem(`pensmate_draft_${current.current!.id}_${id}`));
  });

  if (!attempt) return <main className="assessment-shell loading-screen"><span className="brand-icon"><Code2 size={26}/></span><h1>PensMate Assessment</h1><p role="status">{error || 'Menyiapkan ruang berpikirmu…'}</p>{error ? <Link href="/">Kembali ke pendaftaran</Link> : <Loader2 className="spin" size={22}/>}</main>;
  if (attempt.phase === 'submitted') return <main className="assessment-shell receipt-page"><section className="assessment-card receipt-card"><span className="receipt-check"><CheckCircle2 size={38}/></span><p className="eyebrow">ASSESSMENT SELESAI</p><h1>Terima kasih, {attempt.nama.split(' ')[0]}!</h1><p>Jawaban kamu sudah terkumpul.<br/>Selanjutnya, biarkan panitia mengenal cara berpikirmu.</p><dl className="receipt-details"><div><dt>Peserta</dt><dd>{attempt.nama}</dd></div><div><dt>NRP / NIM</dt><dd>{attempt.nrp}</dd></div><div><dt>Prodi / kelas</dt><dd>{attempt.prodi} · {attempt.kelas}</dd></div></dl><div className="receipt-reference"><span>BUKTI PENGUMPULAN</span><code>{attempt.id}</code></div><Link className="primary-button" href="/">Kembali ke beranda <ArrowRight size={17}/></Link><p className="field-hint">Hasil seleksi akan disampaikan oleh panitia.</p></section></main>;
  const locked = remaining <= 0 || attempt.phase === 'grading';
  const isMcq = attempt.phase === 'penalaran';
  const list = isMcq ? mcqQuestions : questions;
  const qIndex = Math.min(index, list.length - 1);
  const question = questions[qIndex];
  const mcq = mcqQuestions[qIndex];
  const minutes = Math.floor(remaining / 60_000), seconds = Math.floor(remaining / 1000) % 60;
  const answered = Object.keys(attempt.mcq_answers).length;
  const codes = Object.values(attempt.codes).filter(c => c.trim()).length;
  const progressCount = isMcq ? answered : codes;
  return <main className="assessment-shell wide exam-page">
    <header className="exam-topbar"><span className="brand"><span className="brand-icon"><Code2 size={21}/></span>PensMate<span className="brand-divider">/</span><span className="brand-caption">Assessment</span></span><div className="candidate-badge"><span className="avatar">{attempt.nama[0]?.toUpperCase()}</span><div><strong>{attempt.nama}</strong><small>{attempt.nrp} · {attempt.kelas}</small></div></div></header>
    <section className="exam-toolbar"><div className="session-steps"><span className={isMcq ? 'active' : 'complete'}><b>{isMcq ? '1' : <Check size={13}/>}</b> Penalaran</span><span className="step-line"/><span className={!isMcq ? 'active' : ''}><b>2</b> Coding</span></div><div className={'timer-display'+(remaining < 300_000 ? ' urgent' : '')}><Clock3 size={19}/><div><small>Sisa waktu</small><strong>{String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}</strong></div></div></section>
    {error && <div className="notice error" role="alert">{error} <button disabled={busy} onClick={() => locked ? void finish(false) : void action(flush)}>Coba lagi</button><p>Jika ada konflik tab, salin draft lalu muat ulang. Gunakan satu tab untuk mengerjakan.</p></div>}
    {locked ? <section className="assessment-card receipt-card"><span className="receipt-check"><Clock3 size={32}/></span><h2>Jawabanmu sudah dikunci.</h2><p>Jawaban terakhir yang tersimpan sedang disiapkan untuk penilaian.</p><p>Tunggu hingga bukti pengumpulan muncul. Jika koneksi terputus, buka kembali halaman ini di browser yang sama.</p><button className="primary-button" disabled={busy} onClick={() => void finish(false)}>{busy ? <><Loader2 size={17} className="spin"/> Menilai jawaban…</> : 'Selesaikan pengumpulan'}</button></section> : <div className="exam-layout">
      <aside className="exam-sidebar"><section className="assessment-card navigator-card"><p className="eyebrow">{isMcq ? 'SESI 01' : 'SESI 02'}</p><h2>{isMcq ? 'Penalaran logika' : 'Coding JavaScript'}</h2><p className="navigator-count"><strong>{progressCount}</strong> / {list.length} {isMcq ? 'terjawab' : 'terisi'}</p><div className="progress-track" role="progressbar" aria-label="Progres jawaban" aria-valuenow={progressCount} aria-valuemin={0} aria-valuemax={list.length}><span style={{width: `${progressCount/list.length*100}%`}}/></div>
      <nav className="question-nav" aria-label="Navigasi soal">{list.map((q, i) => {
        const filled = isMcq ? attempt.mcq_answers[String(q.id)] !== undefined : Boolean(attempt.codes[String(q.id)]?.trim());
        return <button key={q.id} disabled={busy} aria-label={`Soal ${i+1}${filled ? ', terisi' : ''}`} aria-current={qIndex === i ? 'step' : undefined} className={qIndex === i ? 'selected' : filled ? 'answered' : ''} onClick={() => void navigate(i)}>{i + 1}</button>;
      })}</nav><div className="nav-legend"><span><i className="legend-filled"/> Terisi</span><span><i/> Belum</span></div></section>
      <div className="save-indicator" role="status">{busy ? <Loader2 size={16} className="spin"/> : dirty ? <Clock3 size={16}/> : <CheckCircle2 size={16}/>}<span>{busy ? 'Menyimpan / memproses…' : dirty ? 'Menyimpan perubahan…' : 'Semua perubahan tersimpan'}</span></div>
      <div className="sidebar-note"><CircleHelp size={17}/><p>{isMcq ? 'Kamu bisa berpindah soal dan memeriksa jawaban sebelum lanjut ke sesi coding.' : 'Jalankan contoh untuk mengecek kode. Penilaian akhir juga memakai pengujian tambahan.'}</p></div></aside>
      <div className="exam-content">
      {isMcq ? <section className="assessment-card question-card"><div className="question-meta"><span>PERTANYAAN {String(qIndex+1).padStart(2,'0')}</span><span>Pilihan ganda</span></div><h2>{mcq.question}</h2>{mcq.codeSnippet && <pre className="code-block">{mcq.codeSnippet}</pre>}<p className="answer-instruction">Pilih satu jawaban yang paling tepat.</p><div className="answer-options">{mcq.options.map((option, i) => {
        const selected = attempt.mcq_answers[String(mcq.id)] === i;
        return <button key={i} disabled={busy} aria-pressed={selected} className={selected ? 'selected' : ''} onClick={() => void action(async () => accept(await api<SessionState>('/api/assessment', { action: 'save_mcq', questionId: String(mcq.id), option: i, version: current.current!.version })))}><span className="option-letter">{String.fromCharCode(65+i)}</span><span>{option}</span><span className="option-check">{selected && <CheckCircle2 size={19}/>}</span></button>;
      })}</div></section>
      : <div className="workspace-grid"><section className="assessment-card problem-card"><div className="question-meta"><span>CHALLENGE {String(qIndex+1).padStart(2,'0')}</span><span>{question.difficulty}</span></div><h2>{question.title}</h2><p className="preserve-lines"><InlineText text={question.description}/></p><h3>Contoh pengujian</h3>{question.testCases.map(tc => <pre className="code-block" key={tc.id}><span>{tc.input}</span><br/><span className="expected-output">→ {tc.expectedOutput}</span></pre>)}</section><section className="assessment-card editor-card"><div className="editor-toolbar"><span><Code2 size={15}/> solution.js</span><span>JavaScript</span></div>
        {recoverable !== null && recoverable !== code && <div className="notice">Ada draft lokal yang belum tersimpan. <button onClick={() => changeCode(recoverable)}>Pulihkan draft</button></div>}
        <div id="code-editor"><Editor height="390px" language="javascript" value={code} onChange={v => changeCode((v || '').slice(0,20000))} options={{ ariaLabel: 'Editor kode JavaScript', minimap: { enabled: false }, fontSize: 14, tabSize: 2, scrollBeyondLastLine: false, padding: {top: 18}, lineNumbersMinChars: 3 }} /></div>
        <details className="fallback-editor"><summary>Gunakan editor teks alternatif</summary><textarea aria-label="Editor teks alternatif" rows={14} maxLength={20000} value={code} onChange={e => changeCode(e.target.value)} /></details>
        <div className="run-toolbar"><span>{code.length.toLocaleString('id-ID')} / 20.000 karakter</span><button className="run-button" disabled={busy} onClick={() => void action(async () => { await flush(); const result = await api<Run>('/api/execute', { questionId: String(qIndex + 1) }); if (!draft.current) setRun(result); })}><Play size={14}/> Jalankan contoh</button></div>
        <div className="test-output" role="status">{run ? <><div className="question-meta"><span>HASIL PENGUJIAN</span><span>{run.runtime} ms</span></div><p><strong>{run.results.filter(r => r.passed).length}/{run.results.length}</strong> contoh lulus</p>{run.results.map(r => <p key={r.id} className={r.passed ? 'test-pass' : 'error'}>{r.passed ? '✓' : '×'} Contoh {r.id}: {r.passed ? 'Lulus' : `Gagal — output: ${r.actualOutput}`}</p>)}</> : <p><Play size={16}/> Jalankan kode untuk melihat hasil pengujian di sini.</p>}</div>
      </section></div>}
      <footer className="exam-actions"><button disabled={busy || qIndex === 0} onClick={() => void navigate(qIndex - 1)}><ArrowLeft size={16}/> Sebelumnya</button><span>{qIndex+1} dari {list.length} soal</span><div className="button-row">{qIndex < list.length - 1 && <button className="primary-button" disabled={busy} onClick={() => void navigate(qIndex + 1)}>Berikutnya <ArrowRight size={16}/></button>}{(qIndex === list.length-1 || !isMcq || answered===15) && <button className={qIndex===list.length-1 ? 'primary-button' : ''} disabled={busy || (isMcq && answered !== 15)} onClick={() => setConfirm(isMcq ? 'advance' : 'submit')}>{isMcq ? <>Lanjut ke coding <ArrowRight size={16}/></> : <>Kumpulkan <Send size={15}/></>}</button>}</div></footer>
      {isMcq && qIndex===14 && answered<15 && <p className="field-hint">Masih ada {15-answered} soal belum dijawab. Gunakan nomor soal untuk melengkapinya.</p>}
      </div>
    </div>}
    {confirm && !locked && <ConfirmDialog busy={busy} onClose={() => setConfirm(null)}><span className="receipt-check">{confirm==='advance' ? <Code2 size={27}/> : <Send size={27}/>}</span><p className="eyebrow">{confirm==='advance' ? 'SATU LANGKAH LAGI' : 'SELESAIKAN ASSESSMENT'}</p><h2 id="confirm-title">{confirm === 'advance' ? 'Siap beralih ke coding?' : 'Sudah yakin dengan jawabanmu?'}</h2><p>{confirm === 'advance' ? 'Jawaban penalaran akan dikunci. Sisa waktu yang sama bisa kamu gunakan untuk menyelesaikan tantangan coding.' : `${codes} dari 10 soal coding memiliki kode tersimpan. Semua jawaban akan dikunci dan dinilai. Soal yang kosong bernilai nol.`}</p><div className="button-row"><button disabled={busy} onClick={() => setConfirm(null)}>Periksa kembali</button><button className="primary-button" disabled={busy} onClick={() => confirm === 'submit' ? void finish(true) : void action(async () => { const data = await api<SessionState>('/api/assessment', { action: 'advance', version: current.current!.version }); accept(data); setIndex(0); setCode(data.attempt.codes['1'] ?? questions[0].initialCode); setRun(null); setConfirm(null); })}>{busy ? 'Memproses…' : confirm==='advance' ? 'Ya, lanjutkan' : 'Ya, kumpulkan'}</button></div></ConfirmDialog>}
  </main>;
}
