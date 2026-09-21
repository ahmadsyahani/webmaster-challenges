// src/hooks/useRouteGuard.ts
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function useRouteGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isPenalaranDone = localStorage.getItem('pensmate_penalaran_done');
    if (pathname?.startsWith('/penalaran') && isPenalaranDone === 'true') {
  router.replace('/challenge/1');
} else if (pathname?.startsWith('/challenge') && isPenalaranDone !== 'true') {
  router.replace('/penalaran/1');
}
  }, [pathname, router]);
}