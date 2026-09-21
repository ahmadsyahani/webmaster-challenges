// src/components/Timer.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Timer as TimerIcon } from 'lucide-react';

export default function Timer() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    let endTimeStr = localStorage.getItem('pensmate_endtime');
    if (!endTimeStr) {
      const defaultEndTime = new Date().getTime() + 60 * 60 * 1000;
      localStorage.setItem('pensmate_endtime', defaultEndTime.toString());
      endTimeStr = defaultEndTime.toString();
    }

    const endTime = parseInt(endTimeStr, 10);

    const handle = requestAnimationFrame(() => {
      setIsMounted(true);
      const initialDistance = endTime - new Date().getTime();
      setTimeLeft(initialDistance > 0 ? initialDistance : 0);
    });

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        alert('WAKTU HABIS! Jawaban kamu telah di-submit secara otomatis.');
        localStorage.removeItem('pensmate_endtime');
        localStorage.removeItem('pensmate_user');
        router.push('/');
      } else {
        setTimeLeft(distance);
      }
    }, 1000);

    return () => {
      cancelAnimationFrame(handle);
      clearInterval(interval);
    };
  }, [router]);

  if (!isMounted || timeLeft === null) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 font-mono text-sm font-bold text-slate-400 animate-pulse">
        <TimerIcon size={16} className="text-slate-400" />
        --:--
      </div>
    );
  }

  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const isWarning = timeLeft < 5 * 60 * 1000;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-bold shadow-sm transition-colors ${isWarning
        ? 'bg-red-50 border-red-200 text-red-600 animate-pulse'
        : 'bg-amber-50 border-amber-200 text-amber-700'
      }`}>
      <TimerIcon size={16} className={isWarning ? 'text-red-600' : 'text-amber-600'} />
      {formattedTime}
    </div>
  );
}