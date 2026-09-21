// src/app/penalaran/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mcqQuestions } from '@/lib/mcq';
import { questions as codingQuestions } from '@/lib/questions';
import { BrainCircuit, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import Timer from '@/components/Timer';
import { useRouteGuard } from '@/hooks/useRouteGuard';
import TransitionScreen from '@/components/TransitionScreen';

export default function PenalaranPage() {
  useRouteGuard();

  const params = useParams();
  const mcqId = (params.id as string) || '1';
  const currentNumber = parseInt(mcqId, 10) || 1;
  const currentIndex = Math.max(0, Math.min(currentNumber - 1, mcqQuestions.length - 1));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 font-sans flex flex-col relative overflow-hidden">
      {/* HEADER UTAMA LIGHT MODE */}
      <div className="max-w-6xl mx-auto w-full mb-4 flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
            <BrainCircuit className="text-indigo-600" size={22} />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-800 hidden md:block">Tes Penalaran Logika</h1>
        </div>
        <div className="flex items-center gap-4">
          <Timer />
          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
          <div className="text-sm text-slate-500 font-medium">
            Soal <span className="text-slate-900 font-bold">{currentIndex + 1}</span> dari {mcqQuestions.length}
          </div>
        </div>
      </div>

      {/* WORKSPACE AREA */}
      <PenalaranWorkspace key={mcqId} mcqId={mcqId} />
    </main>
  );
}

function PenalaranWorkspace({ mcqId }: { mcqId: string }) {
  const router = useRouter();

  const currentNumber = parseInt(mcqId, 10) || 1;
  const currentIndex = Math.max(0, Math.min(currentNumber - 1, mcqQuestions.length - 1));
  const currentQ = mcqQuestions[currentIndex];
  const isLastQuestion = currentIndex === mcqQuestions.length - 1;

  const [answers, setAnswers] = useState<{ [key: number]: number }>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pensmate_mcq_answers');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const totalAnswered = Object.keys(answers).length;
  const isAllAnswered = totalAnswered === mcqQuestions.length;

  const handleSelectOption = (optionIndex: number) => {
    const updated = { ...answers, [currentQ.id]: optionIndex };
    setAnswers(updated);
    localStorage.setItem('pensmate_mcq_answers', JSON.stringify(updated));
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showConfirm) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showConfirm]);

  const handleNext = () => {
    if (isLastQuestion) {
      setCountdown(5);
      setShowConfirm(true);
    } else {
      router.push(`/penalaran/${currentIndex + 2}`);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      router.push(`/penalaran/${currentIndex}`);
    }
  };

  const handleFinishPenalaran = () => {
    setShowConfirm(false);
    setIsTransitioning(true);

    localStorage.setItem('pensmate_penalaran_done', 'true');

    setTimeout(() => {
      router.push(`/challenge/${codingQuestions[0].id}`);
    }, 2500);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow h-[80vh]">
        {/* SIDEBAR NAVIGASI SOAL */}
        <div className="lg:col-span-1 border border-slate-200 rounded-xl bg-white p-4 flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Navigasi Soal</h2>
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{totalAnswered}/{mcqQuestions.length}</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {mcqQuestions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isActive = idx === currentIndex;
              const targetNumber = idx + 1;
              return (
                <button
                  key={q.id}
                  onClick={() => router.push(`/penalaran/${targetNumber}`)}
                  className={`w-10 h-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center border ${isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                    : isAnswered
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                >
                  {targetNumber}
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300"></div> Sudah Dijawab
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-slate-100 border border-slate-300"></div> Belum Dijawab
            </div>
          </div>
        </div>

        {/* AREA PERTANYAAN */}
        <div className="lg:col-span-3 border border-slate-200 rounded-xl bg-white flex flex-col overflow-hidden relative shadow-sm">
          <div className="p-6 md:p-8 flex-grow overflow-y-auto space-y-6">
            <h2 className="text-xl md:text-2xl font-bold leading-relaxed text-slate-800">
              {currentIndex + 1}. {currentQ.question}
            </h2>

            {currentQ.codeSnippet && (
              <pre className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-sm font-mono text-slate-100 overflow-x-auto shadow-inner">
                {currentQ.codeSnippet}
              </pre>
            )}

            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt, idx) => {
                const isSelected = answers[currentQ.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${isSelected
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-semibold shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-white'
                      }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm md:text-base">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FOOTER BUTTONS */}
          <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 hover:bg-slate-200"
            >
              <ArrowLeft size={16} /> Sebelumnya
            </button>

            <button
              onClick={handleNext}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm ${isLastQuestion
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
            >
              {isLastQuestion ? 'Selesai & Lanjut Sesi Berikutnya' : 'Selanjutnya'}
              {isLastQuestion ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL KONFIRMASI LIGHT */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${isAllAnswered ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
                {isAllAnswered ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Lanjut ke Sesi Coding?</h2>
                <p className="text-xs text-slate-500">Konfirmasi penyelesaian Sesi 1</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Progress Soal Terjawab:</span>
              <span className={`font-mono font-bold ${isAllAnswered ? 'text-emerald-600' : 'text-amber-600'}`}>
                {totalAnswered} / {mcqQuestions.length} Soal
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {!isAllAnswered ? (
                <span className="text-amber-700 font-medium">
                  Masih ada {mcqQuestions.length - totalAnswered} soal yang belum dijawab. Kamu tetap bisa lanjut, namun disarankan untuk memeriksa kembali.
                </span>
              ) : (
                'Semua soal di Sesi 1 telah selesai dijawab. Setelah ini kamu akan diarahkan ke tes Logic Programming (5 Soal).'
              )}
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
              >
                Cek Kembali
              </button>
              <button
                onClick={handleFinishPenalaran}
                disabled={countdown > 0}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-sm min-w-[150px] justify-center"
              >
                {countdown > 0 ? `Tunggu (${countdown}s)` : <>Lanjut Sesi 2 <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY TRANSISI TETRIS */}
      <TransitionScreen isTransitioning={isTransitioning} />
    </>
  );
}