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
      router.refresh(); 
      setSelectedRiderId('');
    } else {
      alert('❌ Error: No se pudo asignar. Intenta de nuevo.');
    }
    setLoading(false);
  };

  return (
    <div className="flex gap-3 w-full items-center">
      {/* SELECT PERSONALIZADO */}
      <div className="relative flex-1">
        <select 
          className="w-full appearance-none bg-background border border-input text-foreground text-sm font-medium rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:bg-accent/50"
          value={selectedRiderId}
          onChange={(e) => setSelectedRiderId(e.target.value)}
          disabled={loading}
        >
          <option value="" className="bg-popover text-popover-foreground">🛵 Asignar Rider...</option>
          {ridersDisponibles.length > 0 ? (
            ridersDisponibles.map((rider) => (
              <option key={rider.documentId} value={rider.documentId} className="bg-popover text-popover-foreground">
                {rider.nombre}
              </option>
            ))
          ) : (
            <option disabled className="bg-popover text-popover-foreground">🚫 Sin riders libres</option>
          )}
        </select>
        
        {/* Icono de flecha custom (Absolute position) */}
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
        </div>
      </div>

      {/* BOTÓN DE CONFIRMACIÓN */}
      <button 
        onClick={handleAssign}
        disabled={loading || !selectedRiderId}
        className="h-11.5 w-11.5 flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-95"
        title="Confirmar asignación"
      >
        {loading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
        )}
      </button>
    </div>
  );
}