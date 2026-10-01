'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Code2, Clock3, Loader2 } from 'lucide-react';
import { api } from '@/lib/client-api';

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return <main className="registration-page registration-simple">
    <nav className="site-nav"><Link href="/" className="brand"><span className="brand-icon"><Code2 size={19}/></span>PensMate<span className="brand-caption">Webmaster</span></Link><span className="nav-caption">PENS · RnD</span></nav>
    <section className="registration-split-card" aria-labelledby="registration-title">
      <div className="registration-form-side">
        <p className="eyebrow">ASSESSMENT WEBMASTER</p>
        <h1 id="registration-title">Mulai assessment</h1>
        <p className="registration-simple-intro">Isi data diri untuk masuk ke sesi penalaran dan coding JavaScript.</p>
        <p className="registration-simple-meta"><span>15 soal</span><i/> <span>10 soal</span><i/> <span>60 menit</span></p>
        <form onSubmit={async e => {
          e.preventDefault(); if (busy) return;
          const values = new FormData(e.currentTarget);
          setBusy(true); setError('');
          try {
            await api('/api/assessment', { action: 'start', nama: values.get('nama'), nrp: values.get('nrp'), prodi: values.get('prodi'), kelas: values.get('kelas') });
            router.push('/assessment');
          } catch(e) { setError(e instanceof Error ? e.message : 'Belum bisa memulai. Coba lagi.'); }
          finally { setBusy(false); }
        }}>
          <fieldset disabled={busy}>
            <label htmlFor="nama">Nama lengkap</label><input id="nama" name="nama" placeholder="Sesuai data mahasiswa" autoComplete="name" maxLength={100} required />
            <label htmlFor="nrp">NRP / NIM</label><input id="nrp" name="nrp" inputMode="numeric" pattern="[0-9]{5,20}" title="Masukkan 5 sampai 20 digit angka" placeholder="Contoh: 3124500001" maxLength={20} required /><span className="field-hint">Satu NRP untuk satu kali pengerjaan.</span>
            <div className="form-columns"><div><label htmlFor="prodi">Program studi</label><input id="prodi" name="prodi" placeholder="Contoh: D4 Teknik Informatika" maxLength={100} required /></div><div><label htmlFor="kelas">Kelas</label><input id="kelas" name="kelas" placeholder="Contoh: 2 D4 IT A" maxLength={50} required /></div></div>
            <p className="registration-simple-note"><Clock3 size={15}/> Waktu mulai saat assessment dimulai.</p>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button start-button" type="submit">{busy ? <><Loader2 size={16} className="spin"/> Menyiapkan sesi…</> : <>Mulai <ArrowRight size={17}/></>}</button>
          </fieldset>
        </form>
      </div>
      <aside className="registration-guide-side" aria-labelledby="guide-title">
        <p className="eyebrow">SEBELUM MULAI</p>
        <h2 id="guide-title">Alur & aturan</h2>
        <ol className="registration-guide-steps">
          <li><span>01</span><div><strong>Penalaran · 15 soal</strong><p>Pilih satu jawaban. Kamu bisa berpindah soal; sesi terkunci saat lanjut ke coding.</p></div></li>
          <li><span>02</span><div><strong>Coding · 10 soal</strong><p>Tulis JavaScript dan jalankan contoh tes. Penilaian juga memakai tes tambahan.</p></div></li>
          <li><span>03</span><div><strong>Periksa & kumpulkan</strong><p>Pastikan jawaban tersimpan sebelum mengirim. Setelah dikumpulkan, jawaban terkunci.</p></div></li>
        </ol>
        <div className="registration-guide-rules">
          <p><Clock3 size={15}/> Waktu 60 menit mencakup kedua sesi. Saat habis, jawaban tersimpan dikumpulkan.</p>
          <p><Code2 size={15}/> Jawaban tersimpan otomatis. Gunakan satu tab dan browser yang sama.</p>
          <p><span className="guide-dot"/> Satu NRP hanya dapat memulai satu assessment.</p>
        </div>
      </aside>
    </section>
  </main>;
}
