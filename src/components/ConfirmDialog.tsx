'use client';
import { useEffect, useRef, type ReactNode } from 'react';

export default function ConfirmDialog({ children, onClose, busy }: { children: ReactNode; onClose: () => void; busy: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current!; dialog.showModal(); return () => dialog.close(); }, []);
  return <dialog ref={ref} className="confirm-dialog" aria-labelledby="confirm-title" onCancel={e => { e.preventDefault(); if (!busy) onClose(); }}>{children}</dialog>;
}
