'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { completarPedido } from '../../../lib/api';

interface Props {
  documentId: string;
  riderDocumentId?: string; // Nuevo prop opcional
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
      className="w-full mt-2 bg-green-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition flex justify-center gap-2"
    >
      {loading ? <span>Procesando...</span> : <span>✅ Confirmar Entrega</span>}
    </button>
  );
}