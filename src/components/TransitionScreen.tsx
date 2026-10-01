// src/components/TransitionScreen.tsx
"use client";

import { TetrisLoader } from "@/components/ui/loader-tetris";

export default function TransitionScreen({ isTransitioning }: { isTransitioning: boolean }) {
    if (!isTransitioning) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            style={{ background: 'rgba(26, 25, 23, 0.4)', backdropFilter: 'blur(8px)' }}
        >
            <div
                className="flex flex-col items-center gap-6 rounded-lg px-10 py-8"
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-plus-jakarta), system-ui, sans-serif',
                }}
            >
                <TetrisLoader
                    columns={10}
                    rows={16}
                    cellSize={8}
                    gap={2}
                    speed={35}
                    label="Menyiapkan Workspace Coding"
                />
                <div className="space-y-2 text-center">
                    <span
                        className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded"
                        style={{
                            background: 'var(--success-bg)',
                            color: 'var(--success)',
                            border: '1px solid var(--success-border)',
                        }}
                    >
                        Sesi 1 Selesai
                    </span>
                    <h2
                        className="text-xl font-bold tracking-tight mt-3"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Memuat Sesi 2...
                    </h2>
                    <p className="text-xs max-w-[250px] mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        Sekitar 3 detik. Gunakan sisa waktu dengan bijak.
                    </p>
                </div>
            </div>
        </div>
    );
}