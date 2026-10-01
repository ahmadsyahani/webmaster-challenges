'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/client-api';
import { mcqQuestions } from '@/lib/mcq';
import { questions } from '@/lib/questions';
import type { Attempt } from '@/lib/assessment-types';
import { csvCell } from '@/lib/csv';
import { Code2, Download, RefreshCw, LogOut, ChevronLeft, ChevronRight, Eye, ClipboardCheck, Loader2, Lock } from 'lucide-react';

type Listing = { attempts: Attempt[]; count: number; page: number };

function Badge({ phase }: { phase: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    penalaran: { label: 'Penalaran', cls: 'badge-phase badge-active' },
    coding: { label: 'Coding', cls: 'badge-phase badge-active' },
    grading: { label: 'Menunggu nilai', cls: 'badge-phase badge-pending' },
    submitted: { label: 'Selesai', cls: 'badge-phase badge-done' },
  };
  const { label, cls } = map[phase] || { label: phase, cls: 'badge-phase' };
  return <span className={cls}>{label}</span>;
}

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [listing, setListing] = useState<Listing>({ attempts: [], count: 0, page: 0 });
  const [detail, setDetail] = useState<{ attempt: Attempt; answerKey: Record<string, number> } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async (page = 0) => {
    const data = await api<Listing>(`/api/admin?page=${page}`);
    setListing(data);
    setAuthenticated(true);
  }, []);

  useEffect(() => {
    api<Listing>('/api/admin?page=0')
      .then(data => { setListing(data); setAuthenticated(true); })
      .catch(() => {});
  }, []);

  async function act(task: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError('');
    try { await task(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Gagal memproses.'); }
    finally { setBusy(false); }
  }

  function exportCSV() {
    const rows = [
      ['Nama', 'NRP', 'Prodi', 'Kelas', 'Status', 'MCQ', 'Coding', 'Waktu submit'],
      ...listing.attempts.map(a => [
        a.nama, a.nrp, a.prodi, a.kelas, a.phase,
        String(a.result?.mcq_score ?? ''),
        String(a.result?.coding_score ?? ''),
        a.submitted_at || '',
      ]),
    ];
    const url = URL.createObjectURL(
      new Blob(['\uFEFF' + rows.map(r => r.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' })
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `hasil-halaman-${listing.page + 1}.csv`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const totalPages = Math.max(1, Math.ceil(listing.count / 25));

  // Login view
  if (!authenticated) {
    return (
      <main className="assessment-shell admin-login-page">
        <header className="assessment-card assessment-header">
          <span className="brand-icon"><Lock size={20} /></span>
          <p className="eyebrow">Akses terbatas</p>
          <h1>Admin PensMate</h1>
        </header>
        <form
          className="assessment-card admin-login-card"
          onSubmit={e => {
            e.preventDefault();
            void act(async () => {
              await api('/api/admin', { action: 'login', password });
              setPassword('');
              await refresh();
            });
          }}
        >
          <p className="admin-login-copy">Masukkan password panitia untuk melihat data peserta.</p>
          {error && <p className="notice error" role="alert">{error}</p>}
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Ketik password admin"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button className="primary-button" disabled={busy}>
            {busy ? <><Loader2 size={16} className="spin" /> Memeriksa...</> : 'Masuk'}
          </button>
        </form>
      </main>
    );
  }

  // Dashboard view
  return (
    <main className={`assessment-shell ${authenticated ? 'wide' : 'admin-login-page'}`}>
      {/* Top bar */}
      <header className="admin-topbar">
        <span className="brand">
          <span className="brand-icon"><Code2 size={20} /></span>
          PensMate
          <span className="brand-divider">/</span>
          <span className="brand-caption">Admin</span>
        </span>
        <button
          className="admin-logout-btn"
          disabled={busy}
          onClick={() => void act(async () => {
            await api('/api/admin', { action: 'logout' });
            setAuthenticated(false);
            setListing({ attempts: [], count: 0, page: 0 });
            setDetail(null);
          })}
        >
          <LogOut size={15} /> Keluar
        </button>
      </header>

      {error && <p className="notice error" role="alert">{error}</p>}

      {/* Stats row */}
      <section className="admin-stats-row">
        <div className="admin-stat-card">
          <span className="admin-stat-value">{listing.count}</span>
          <span className="admin-stat-label">Total peserta</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">
            {listing.attempts.filter(a => a.phase === 'submitted').length}
          </span>
          <span className="admin-stat-label">Selesai (halaman ini)</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">
            {listing.attempts.filter(a => ['penalaran', 'coding'].includes(a.phase)).length}
          </span>
          <span className="admin-stat-label">Sedang mengerjakan</span>
        </div>
      </section>

      {/* Table */}
      <section className="assessment-card admin-table-card">
        <div className="admin-table-header">
          <h2>Data peserta</h2>
          <div className="button-row">
            <button disabled={busy} onClick={() => void act(() => refresh(listing.page))}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button onClick={exportCSV}>
              <Download size={14} /> CSV
            </button>
          </div>
        </div>
        <p className="admin-table-hint">
          Jawaban tersimpan otomatis. Klik Nilai untuk memproses jawaban peserta yang waktunya sudah habis.
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Peserta</th>
                <th>NRP / Prodi / Kelas</th>
                <th>Status</th>
                <th>MCQ</th>
                <th>Coding</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {listing.attempts.length === 0 && (
                <tr><td colSpan={6} className="admin-empty">Belum ada peserta yang memulai tes.</td></tr>
              )}
              {listing.attempts.map(a => (
                <tr key={a.id}>
                  <td><strong>{a.nama}</strong></td>
                  <td>
                    {a.nrp}<br />
                    <small>{a.prodi}</small><br />
                    <small>{a.kelas}</small>
                  </td>
                  <td>
                    <Badge phase={a.phase} />
                    <br />
                    <small>Batas: {new Date(a.expires_at).toLocaleString('id-ID')}</small>
                  </td>
                  <td className="admin-score">{a.result?.mcq_score ?? '\u2014'}</td>
                  <td className="admin-score">{a.result?.coding_score ?? '\u2014'}</td>
                  <td>
                    <div className="button-row">
                      <button
                        disabled={busy}
                        onClick={() => void act(async () => setDetail(await api(`/api/admin?id=${a.id}`)))}
                        title="Lihat detail"
                      >
                        <Eye size={14} />
                      </button>
                      {a.phase !== 'submitted' && (
                        <button
                          disabled={busy}
                          onClick={() => void act(async () => {
                            await api('/api/admin', { action: 'finalize', id: a.id });
                            await refresh(listing.page);
                          })}
                          title="Nilai"
                        >
                          <ClipboardCheck size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="admin-pagination">
          <button
            disabled={busy || listing.page === 0}
            onClick={() => void act(() => refresh(listing.page - 1))}
          >
            <ChevronLeft size={15} />
          </button>
          <span>Halaman {listing.page + 1} dari {totalPages}</span>
          <button
            disabled={busy || (listing.page + 1) * 25 >= listing.count}
            onClick={() => void act(() => refresh(listing.page + 1))}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </section>

      {/* Detail panel */}
      {detail && (
        <section className="assessment-card admin-detail-card">
          <div className="admin-table-header">
            <h2>Jawaban {detail.attempt.nama}</h2>
            <button onClick={() => setDetail(null)}>Tutup</button>
          </div>
          <h3>Penalaran</h3>
          {mcqQuestions.map(q => (
            <details key={q.id}>
              <summary>{q.id}. {q.question}</summary>
              {q.codeSnippet && <pre className="code-block">{q.codeSnippet}</pre>}
              <p>Jawaban: {q.options[detail.attempt.mcq_answers[String(q.id)]] ?? 'Kosong'}</p>
              <p>Kunci: {q.options[detail.answerKey[String(q.id)]]}</p>
            </details>
          ))}
          <h3>Coding</h3>
          {questions.map(q => (
            <details key={q.id}>
              <summary>
                {q.id}. {q.title} ·{' '}
                {detail.attempt.result?.coding_progress[q.id]?.passed
                  ? 'Lulus'
                  : detail.attempt.result
                    ? 'Belum lulus'
                    : 'Belum dinilai'}
              </summary>
              <pre className="code-block">{detail.attempt.codes[q.id] || '// Kosong'}</pre>
            </details>
          ))}
        </section>
      )}
    </main>
  );
}
