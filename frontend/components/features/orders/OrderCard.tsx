'use client';

import { useState } from 'react';
import { Pedido, Repartidor, ItemPedido } from '@/types';
import { cancelarPedido, asignarRider, completarPedido } from '@/lib/api';
import StatusBadge from '@/components/ui/StatusBadge';
import WhatsAppButton from './WhatsAppButton';

interface Props {
  pedido: Pedido;
  repartidores: Repartidor[];
  onUpdate: () => void; // 🔥 NECESARIO: Para que el padre sepa cuándo refrescar
}

export default function OrderCard({ pedido, repartidores, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  
  const isCancelled = pedido.status_entrega === 'Cancelado';
  const isDelivered = pedido.status_entrega === 'Entregado';
  const isEnRuta = pedido.status_entrega === 'En_ruta';

  const formatTime = (dateString: string) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('es-PE', { 
      hour: '2-digit', minute: '2-digit', hour12: true 
    });
  };

  // --- LÓGICA DE ACCIONES ---

  const handleCancel = async () => {
    if (!confirm('¿Estás seguro de cancelar este pedido?')) return;
    setLoading(true);
    try {
        const success = await cancelarPedido(pedido.documentId);
        if (success) onUpdate();
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const handleAssignRider = async (riderId: string) => {
    if (!riderId) return;
    setLoading(true);
    try {
        const success = await asignarRider(pedido.documentId, riderId);
        if (success) onUpdate();
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const handleCompleteOrder = async () => {
    if (!confirm('¿Confirmar entrega del pedido?')) return;
    setLoading(true);
    try {
        const riderId = pedido.repartidor?.documentId;
        const success = await completarPedido(pedido.documentId, riderId);
        if (success) onUpdate();
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  // --- LÓGICA DE RENDERIZADO DE ITEMS (Soporte n8n) ---
  const renderItemContent = (item: string | ItemPedido) => {
    if (typeof item === 'string') {
        return item; // Caso Web antigua
    }
    // Caso n8n / WhatsApp
    return (
        <span className="flex justify-between w-full">
            <span>{item.nombre}</span>
            <span className="font-bold text-[10px] bg-gray-200 px-1.5 rounded ml-2">x{item.cantidad}</span>
        </span>
    );
  };

  return (
    <article className={`w-full bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full relative group transition-all overflow-hidden ${isCancelled ? 'opacity-60 bg-gray-50' : 'hover:shadow-md'}`}>
      
      {/* PADDING RESPONSIVO */}
      <div className="p-4 sm:p-5 flex flex-col h-full">

        {/* --- HEADER: Badge y Hora --- */}
        <div className="flex justify-between items-start gap-2 mb-3">
           <div className="shrink-0">
              <StatusBadge status={pedido.status_entrega} />
           </div>
           
           <div className="text-right shrink-0">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Hora</span>
              <span className="text-xs font-mono text-gray-600 font-medium whitespace-nowrap">
                {formatTime(pedido.createdAt)}
              </span>
           </div>
        </div>

        {/* --- CLIENTE --- */}
        <div className="mb-3 relative pr-6 min-w-0">
           {!isCancelled && !isDelivered && (
              <button 
                onClick={handleCancel} 
                disabled={loading}
                className="absolute -top-2 -right-2 text-gray-300 hover:text-red-500 p-2 z-10 transition-colors"
                aria-label="Cancelar pedido"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
           )}
           
           <h2 className={`text-lg font-bold leading-tight wrap-break-word ${isCancelled ? 'line-through text-gray-400' : 'text-gray-900'}`}>
              {pedido.cliente_nombre}
           </h2>
           
           {!isCancelled && pedido.cliente_telefono && (
              <div className="mt-1">
                 <WhatsAppButton 
                   phone={pedido.cliente_telefono} 
                   trackingId={pedido.documentId} 
                   cliente={pedido.cliente_nombre} 
                 />
              </div>
           )}
        </div>
        
        {/* DIRECCIÓN */}
        <div className="flex items-start gap-1 mb-4">
           <span className="shrink-0 text-sm">📍</span>
           <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 wrap-break-word leading-snug">
              {pedido.direccion_entrega}
           </p>
        </div>

        {/* --- LISTA DE ITEMS (Corregido para n8n) --- */}
        <div className="bg-slate-50 p-3 rounded-xl text-sm text-gray-700 mb-4 grow border border-gray-100">
            <ul className="space-y-2">
                {pedido.detalle_pedido?.items?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                        <span className={`mt-1.5 w-1.5 h-1.5 shrink-0 rounded-full ${isCancelled ? 'bg-gray-400' : 'bg-blue-500'}`}></span>
                        <span className="wrap-break-word leading-snug w-full">
                            {renderItemContent(item)}
                        </span>
                    </li>
                ))}
            </ul>
        </div>

        {/* --- ACCIONES (FOOTER) --- */}
        <div className="mt-auto pt-3 border-t border-gray-50">
            
            {isCancelled && (
               <div className="text-red-400 text-xs font-bold text-center uppercase py-2 bg-red-50 rounded-lg">
                  🚫 Pedido Cancelado
               </div>
            )}
            
            {isDelivered && (
               <div className="flex justify-between items-center text-green-700 font-bold text-xs bg-green-50 px-3 py-2 rounded-lg">
                  <span>🏁 Entregado</span>
                  <span className="font-mono opacity-75">{formatTime(pedido.updatedAt)}</span>
               </div>
            )}

            {/* Selector de Rider (Integrado para que funcione onUpdate) */}
            {!isCancelled && !isDelivered && !isEnRuta && (
               <div className="w-full">
                  <select 
                    className="w-full bg-white border border-gray-200 text-gray-700 text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:border-blue-300 transition-colors"
                    defaultValue=""
                    onChange={(e) => handleAssignRider(e.target.value)}
                    disabled={loading}
                  >
                    <option value="" disabled>🛵 Asignar Repartidor...</option>
                    {repartidores
                        .filter(r => r.estado === 'Disponible')
                        .map(r => (
                            <option key={r.documentId} value={r.documentId}>{r.nombre}</option>
                        ))
                    }
                  </select>
               </div>
            )}

            {/* En Ruta - Completar (Integrado) */}
            {isEnRuta && (
               <div className="flex flex-col gap-2 w-full">
                  <div className="text-center py-1.5 bg-yellow-50 rounded-lg text-xs text-yellow-700 font-bold border border-yellow-100 truncate px-2">
                      🛵 {pedido.repartidor?.nombre || 'Rider Asignado'}
                  </div>
                  <button 
                    onClick={handleCompleteOrder}
                    disabled={loading}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex justify-center items-center gap-2"
                  >
                    {loading ? <span className="animate-spin">⟳</span> : '✅ Confirmar Entrega'}
                  </button>
               </div>
            )}
        </div>

      </div>
    </article>
  );
}