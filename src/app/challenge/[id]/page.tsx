// src/app/challenge/[id]/page.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { Play, FileText, ArrowLeft, ArrowRight, CheckCircle2, XCircle, Send, AlertTriangle, Lightbulb, Code2 } from 'lucide-react';
import { getQuestionById, questions, Question } from '@/lib/questions';
import Timer from '@/components/Timer';
import { useRouteGuard } from '@/hooks/useRouteGuard';

interface TestResult {
  id: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  error?: string | null;
}

export default function ChallengePage() {
  const params = useParams();
  const questionId = params.id as string;

  return <ChallengeWorkspace key={questionId} questionId={questionId} />;
}

function ChallengeWorkspace({ questionId }: { questionId: string }) {
  useRouteGuard();

  const router = useRouter();

  const currentQuestion = getQuestionById(questionId);
  const currentIndex = questions.findIndex(q => q.id === questionId);
  const isLastQuestion = currentIndex === questions.length - 1;

  const [question] = useState<Question | null>(currentQuestion || null);
  const [code, setCode] = useState(currentQuestion?.initialCode || '');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showHint, setShowHint] = useState(false); // State Toggle Hint

  const runCode = async () => {
    if (!question) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, testCases: question.testCases }),
      });
      const data = await res.json();
      setTestResults(data.results || []);
    } catch {
      alert('Gagal terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setShowSubmitModal(true);
    } else {
      const nextQuestion = questions[currentIndex + 1];
      router.push(`/challenge/${nextQuestion.id}`);
    }
  };

  const handleSubmitAll = () => {
    setShowSubmitModal(false);
    localStorage.removeItem('pensmate_endtime');
    localStorage.removeItem('pensmate_user');
    localStorage.removeItem('pensmate_penalaran_done');
    localStorage.removeItem('pensmate_mcq_answers');
    alert('Terima kasih! Seluruh jawaban kamu telah berhasil disubmit.');
    router.push('/');
  };

  if (!question) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 p-8 flex flex-col items-center justify-center">
        <h1 className="text-xl font-bold mb-4">Soal tidak ditemukan!</h1>
        <button onClick={() => router.push('/')} className="text-blue-600 hover:underline flex items-center gap-2 font-semibold">
          <ArrowLeft size={16} /> Kembali ke Beranda
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 font-sans flex flex-col relative">
      {/* Header Navigation */}
      <div className="max-w-7xl mx-auto w-full mb-3 flex flex-col md:flex-row gap-3 justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">

        {/* Timer & Nomor Soal */}
        <div className="flex items-center gap-2">
          <Timer />
          <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 hidden md:block">Soal:</span>
          {questions.map((q, idx) => {
            const isActive = q.id === questionId;
            return (
              <button
                key={q.id}
                onClick={() => router.push(`/challenge/${q.id}`)}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all flex items-center justify-center border ${isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-105'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={runCode}
            disabled={isLoading}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
          >
            <Play size={15} className={isLoading ? 'animate-pulse text-blue-400' : 'text-emerald-400'} />
            {isLoading ? 'Running...' : 'Run Tests'}
          </button>

          <button
            onClick={handleNext}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${isLastQuestion
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
          >
            {isLastQuestion ? (
              <>Submit All <Send size={15} /></>
            ) : (
              <>Soal Berikutnya <ArrowRight size={15} /></>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-4 flex-grow h-[82vh]">

        {/* Left Panel: Question Description */}
        <div className="lg:col-span-5 border border-slate-200 rounded-xl bg-white flex flex-col overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between text-sm font-semibold text-slate-800">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-blue-600" /> #{currentIndex + 1}. {question.title}
            </div>

            <div className="flex items-center gap-2">
              {/* BADGE BAHASA JAVASCRIPT */}
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded flex items-center gap-1">
                <Code2 size={12} /> JS
              </span>

              <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${question.difficulty === 'Mudah'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                {question.difficulty}
              </span>
            </div>
          </div>

          <div className="p-5 overflow-y-auto text-sm text-slate-700 space-y-5">
            <p className="leading-relaxed text-slate-600">{question.description}</p>

            {/* BOX BUTTON HINT / PETUNJUK */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                  <Lightbulb size={15} className="text-amber-600" /> Butuh Petunjuk?
                </div>
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs font-bold text-amber-800 hover:text-amber-950 underline underline-offset-2 transition-colors"
                >
                  {showHint ? 'Sembunyikan Hint' : 'Tampilkan Hint'}
                </button>
              </div>

              {showHint && (
                <p className="text-xs text-amber-950 leading-relaxed pt-1.5 border-t border-amber-200/80 animate-in fade-in duration-200">
                  {question.hint}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sample Test Cases:</h3>
              {question.testCases.map((tc) => (
                <div key={tc.id} className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="text-xs text-slate-600">
                    <span className="text-slate-400 font-bold">Input:</span> <code className="text-slate-800 font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded">{tc.input}</code>
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="text-slate-400 font-bold">Expected Output:</span> <code className="text-emerald-700 font-mono bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">{tc.expectedOutput}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Editor & Test Results */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex-[3] border border-slate-800 rounded-xl bg-[#1e1e1e] flex flex-col overflow-hidden shadow-sm relative">

            {/* Header Mini Editor */}
            <div className="bg-[#18181b] px-4 py-2 border-b border-gray-800 flex items-center justify-between text-xs font-mono text-gray-400">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Code2 size={14} /> solution.js
              </span>
              <span className="text-[10px] text-gray-500">Language: JavaScript (Node.js)</span>
            </div>

            <div className="flex-grow pt-1">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, monospace',
                  padding: { top: 12 },
                  smoothScrolling: true,
                  cursorBlinking: "smooth"
                }}
              />
            </div>
          </div>

          <div className="flex-[2] border border-slate-200 rounded-xl bg-white flex flex-col overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>Test Results</span>
              {testResults.length > 0 && (
                <span className={testResults.every(r => r.passed) ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                  {testResults.filter(r => r.passed).length} / {testResults.length} Passed
                </span>
              )}
            </div>

            <div className="grow p-4 overflow-y-auto space-y-3">
              {testResults.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 italic text-sm gap-2">
                  <Play size={24} className="opacity-30" />
                  Klik &quot;Run Tests&quot; untuk menguji kodemu...
                </div>
              ) : (
                testResults.map((res) => (
                  <div key={res.id} className={`p-3 rounded-lg border text-xs font-mono transition-all ${res.passed ? 'bg-emerald-50 border-emerald-200 text-slate-800' : 'bg-red-50 border-red-200 text-slate-800'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        {res.passed ? <CheckCircle2 size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-red-600" />}
                        Test Case #{res.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase tracking-wide ${res.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {res.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>

                    {!res.passed && (
                      <div className="space-y-1 text-slate-700 mt-2 pt-2 border-t border-red-200 bg-white p-2 rounded">
                        <div><span className="text-slate-400 block text-[10px] uppercase font-bold">Input:</span> {res.input}</div>
                        <div><span className="text-slate-400 block text-[10px] uppercase font-bold">Expected:</span> <span className="text-emerald-700 font-bold">{res.expectedOutput}</span></div>
                        <div><span className="text-slate-400 block text-[10px] uppercase font-bold">Your Output:</span> <span className="text-red-600 font-bold">{res.actualOutput}</span></div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Modal Submit */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                <AlertTriangle size={24} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Submit Semua Jawaban?</h2>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Kamu telah berada di soal terakhir. Apakah kamu yakin ingin menyelesaikan tes dan mengirim seluruh jawabanmu sekarang?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
              >
                Kembali
              </button>
              <button
                onClick={handleSubmitAll}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
              >
                Ya, Kumpulkan Tes <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}