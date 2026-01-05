'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { completarPedido } from '@/lib/api'; // Asegúrate que la ruta sea correcta

interface Props {
  documentId: string;
  riderDocumentId?: string;
}

export default function CompleteOrder({ documentId, riderDocumentId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!confirm('¿Confirmar entrega y liberar al rider?')) return;

    setLoading(true);
    // Pasamos el ID del rider para cambiar su estado a Disponible
    const success = await completarPedido(documentId, riderDocumentId);
    
    if (success) {
      router.refresh();
    } else {
      alert('❌ Error al actualizar.');
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleComplete}
      disabled={loading}
      className="w-full h-12 mt-3 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 dark:shadow-emerald-900/40 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-[0.98]"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Procesando...</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Confirmar Entrega</span>
        </>
      )}
    </button>
  );
}