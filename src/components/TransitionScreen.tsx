// src/components/TransitionScreen.tsx
"use client";

import { TetrisLoader } from "@/components/ui/loader-tetris";

export default function TransitionScreen({ isTransitioning }: { isTransitioning: boolean }) {
    if (!isTransitioning) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="flex w-full items-center justify-center p-10">
                <div className="bg-white text-slate-800 flex flex-col items-center gap-6 rounded-2xl border border-slate-200 px-10 py-8 shadow-2xl">
                    <TetrisLoader
                        columns={10}
                        rows={16}
                        cellSize={8}
                        gap={2}
                        speed={35}
                        label="Menyiapkan Workspace Coding"
                    />
                    <div className="space-y-2 text-center">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full">
                            Sesi 1 Selesai
                        </span>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-3">
                            Memuat Logic Programming...
                        </h2>
                        <p className="text-slate-500 text-xs max-w-[250px] mx-auto">
                            Sekitar 3 detik. Gunakan sisa waktu dengan bijak.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}