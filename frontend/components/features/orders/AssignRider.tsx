'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { asignarRider } from '@/lib/api';
import { Repartidor } from '@/types';

interface Props {
  pedidoDocumentId: string;
  repartidores: Repartidor[];
}

export default function AssignRider({ pedidoDocumentId, repartidores }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRiderId, setSelectedRiderId] = useState<string>('');

  // FILTRO: Solo mostramos 'Disponible'
  const ridersDisponibles = repartidores.filter(r => r.estado === 'Disponible');

  const handleAssign = async () => {
    if (!selectedRiderId) return;
    setLoading(true);
    
    const success = await asignarRider(pedidoDocumentId, selectedRiderId);
    
    if (success) {
      router.refresh(); // Actualiza la UI instantáneamente
      setSelectedRiderId('');
    } else {
      alert('❌ Error: No se pudo asignar. Intenta de nuevo.');
    }
    setLoading(false);
  };

  return (
    <div className="flex gap-2 w-full">
      <select 
        className="flex-1 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        value={selectedRiderId}
        onChange={(e) => setSelectedRiderId(e.target.value)}
        disabled={loading}
      >
        <option value="">Asignar Rider...</option>
        {ridersDisponibles.length > 0 ? (
          ridersDisponibles.map((rider) => (
            <option key={rider.documentId} value={rider.documentId}>
              {rider.nombre}
            </option>
          ))
        ) : (
          <option disabled>🚫 Sin riders libres</option>
        )}
      </select>

      <button 
        onClick={handleAssign}
        disabled={loading || !selectedRiderId}
        className="px-3 py-2 rounded-lg text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '...' : 'OK'}
      </button>
    </div>
  );
}