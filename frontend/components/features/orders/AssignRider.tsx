'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { asignarRider } from '../../../lib/api';
import { Repartidor } from '../../../types';

interface Props {
  pedidoDocumentId: string;
  repartidores: Repartidor[];
}

export default function AssignRider({ pedidoDocumentId, repartidores }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRiderId, setSelectedRiderId] = useState<string>('');

  // FILTRO MÁGICO: Solo mostramos los que pueden trabajar
  const ridersDisponibles = repartidores.filter(r => r.estado === 'Disponible');

  const handleAssign = async () => {
    if (!selectedRiderId) return alert('Por favor selecciona un rider');
    setLoading(true);
    const success = await asignarRider(pedidoDocumentId, selectedRiderId);
    if (success) {
      router.refresh();
      setSelectedRiderId('');
    } else {
      alert('❌ Error al asignar.');
    }
    setLoading(false);
  };

  return (
    <div className="mt-4 flex gap-2">
      <select 
        className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
        value={selectedRiderId}
        onChange={(e) => setSelectedRiderId(e.target.value)}
        disabled={loading}
      >
        <option value="">Seleccionar Rider...</option>
        
        {/* Renderizamos solo los disponibles */}
        {ridersDisponibles.length > 0 ? (
          ridersDisponibles.map((rider) => (
            <option key={rider.documentId} value={rider.documentId}>
              {rider.nombre}
            </option>
          ))
        ) : (
          <option disabled>🚫 No hay riders disponibles</option>
        )}
      </select>

      <button 
        onClick={handleAssign}
        disabled={loading || !selectedRiderId}
        className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400"
      >
        {loading ? '...' : 'Asignar'}
      </button>
    </div>
  );
}