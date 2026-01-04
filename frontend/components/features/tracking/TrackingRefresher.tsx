'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TrackingRefresher() {
  const router = useRouter();

  useEffect(() => {
    // Recarga la página suavemente cada 10 segundos
    const interval = setInterval(() => {
      router.refresh();
    }, 10000);

    return () => clearInterval(interval);
  }, [router]);

  return null; // Este componente es invisible, solo es lógica
}