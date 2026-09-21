// src/app/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Code2, ArrowRight, BrainCircuit, ShieldAlert } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !studentId) {
      alert('Harap isi Nama dan NIM/NRP kamu dulu ya!');
      return;
    }

    const DURATION_IN_MINUTES = 60;
    const endTime = new Date().getTime() + DURATION_IN_MINUTES * 60 * 1000;

    localStorage.setItem('pensmate_user', JSON.stringify({ name, studentId }));
    localStorage.setItem('pensmate_endtime', endTime.toString());

    router.push('/penalaran/1');
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="max-w-xl w-full bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
            <Code2 className="text-blue-600" size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">PensMate Logic Assessment</h1>
            <p className="text-sm text-slate-500 font-medium">Recruitment RnD Webmaster — PensMate</p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col gap-1 text-slate-700">
            <span className="text-indigo-600 flex items-center gap-1.5"><BrainCircuit size={15} /> Sesi 1</span>
            15 Soal Penalaran Logika
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col gap-1 text-slate-700">
            <span className="text-blue-600 flex items-center gap-1.5"><Code2 size={15} /> Sesi 2</span>
            5 Soal Logic Programming
          </div>
        </div>

        {/* Petunjuk */}
        <div className="space-y-2 text-xs text-slate-600 bg-amber-50/60 p-4 rounded-xl border border-amber-200/80">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
            <ShieldAlert size={15} className="text-amber-600" /> Petunjuk Pengerjaan:
          </div>
          <ul className="list-disc list-inside space-y-1.5 leading-relaxed text-amber-950">
            <li>Tes terdiri dari 2 sesi: Pilihan Ganda (Penalaran) & Praktik (Coding).</li>
            <li>Selesaikan Sesi 1 terlebih dahulu untuk membuka akses Sesi 2.</li>
            <li>Pada Sesi 2, uji kode kamu dengan mengklik tombol <strong>Run Tests</strong>.</li>
            <li>Gunakan nomor di header untuk navigasi dan <strong>Submit Test</strong> di akhir tes.</li>
          </ul>
        </div>

        {/* Form Identitas */}
        <form onSubmit={handleStart} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
            <input
              type="text"
              required
              placeholder="Masukkan nama kamu..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">NIM / Class</label>
            <input
              type="text"
              required
              placeholder="Contoh: 3123500001 / 2 D4 IT B"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm text-sm mt-4"
          >
            Mulai Tes Sekarang <ArrowRight size={16} />
          </button>
        </form>

      </div>
    </main>
  );
}