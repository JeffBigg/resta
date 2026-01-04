'use client';

import { useState } from 'react';
import { Pedido, Repartidor} from '@/types'; 
import { asignarRider, completarPedido, cancelarPedido } from '@/lib/api';
import WhatsAppButton from './WhatsAppButton'; 

interface Props {
  pedido: Pedido;
  repartidores: Repartidor[];
  onUpdate: () => void;
}

// Configuración visual de estados (Colores Pasteles + Adaptación Dark Mode)
const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; icon: string; label: string }> = {
  'Cocina': { 
    color: 'text-orange-600 dark:text-orange-400', 
    bg: 'bg-orange-50 dark:bg-orange-900/20', 
    border: 'border-orange-100 dark:border-orange-900/30', 
    icon: '🔥', label: 'Cocina' 
  },
  'Listo_para_recoger': { 
    color: 'text-blue-600 dark:text-blue-400', 
    bg: 'bg-blue-50 dark:bg-blue-900/20', 
    border: 'border-blue-100 dark:border-blue-900/30', 
    icon: '🛍️', label: 'Listo' 
  },
  'En_ruta': { 
    color: 'text-indigo-600 dark:text-indigo-400', 
    bg: 'bg-indigo-50 dark:bg-indigo-900/20', 
    border: 'border-indigo-100 dark:border-indigo-900/30', 
    icon: '🛵', label: 'En Ruta' 
  },
  'Entregado': { 
    color: 'text-emerald-600 dark:text-emerald-400', 
    bg: 'bg-emerald-50 dark:bg-emerald-900/20', 
    border: 'border-emerald-100 dark:border-emerald-900/30', 
    icon: '✨', label: 'Completado' 
  },
  'Cancelado': { 
    color: 'text-slate-400 dark:text-slate-500', 
    bg: 'bg-slate-50 dark:bg-slate-800/50', 
    border: 'border-slate-100 dark:border-slate-700', 
    icon: '💀', label: 'Cancelado' 
  },
};

export default function OrderCard({ pedido, repartidores, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  const [selectedRider, setSelectedRider] = useState("");

  // Datos calculados
  const statusInfo = STATUS_CONFIG[pedido.status_entrega] || STATUS_CONFIG['Cocina'];
  const isCancelled = pedido.status_entrega === 'Cancelado';
  const isDelivered = pedido.status_entrega === 'Entregado';
  
  // Hora formateada
  const timeString = new Date(pedido.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  const deliveredTime = new Date(pedido.updatedAt || new Date()).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  // --- LÓGICA (Intacta) ---
  const handleAssign = async () => {
    if (!selectedRider) return;
    setLoading(true);
    const success = await asignarRider(pedido.documentId, selectedRider);
    setLoading(false);
    if (success) onUpdate();
  };

  const handleComplete = async () => {
    if (!confirm("¿Confirmar entrega del pedido?")) return;
    setLoading(true);
    const riderId = pedido.repartidor?.documentId;
    const success = await completarPedido(pedido.documentId, riderId);
    setLoading(false);
    if (success) onUpdate();
  };

  const handleCancel = async () => {
    if (!confirm('¿Cancelar este pedido?')) return;
    setLoading(true);
    const success = await cancelarPedido(pedido.documentId);
    setLoading(false);
    if (success) onUpdate();
  };

  return (
    <article className={`
        group relative w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800
        shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] dark:shadow-none dark:hover:shadow-slate-800/50
        transition-all duration-300 ease-out hover:-translate-y-1 overflow-hidden flex flex-col h-full
        ${isCancelled ? 'opacity-50 grayscale' : ''}
    `}>
      
      {/* 1. BOTÓN CANCELAR (FANTASMA) */}
      {!isCancelled && !isDelivered && (
         <button 
           onClick={handleCancel}
           disabled={loading}
           className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 shadow-sm border border-slate-100 dark:border-slate-700"
           title="Cancelar Pedido"
         >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
           </svg>
         </button>
      )}

      {/* 2. HEADER ELEGANTE */}
      <div className={`px-5 py-4 flex justify-between items-center border-b transition-colors
        ${isDelivered 
          ? 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/10' 
          : 'border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30'
        }`}>
        
        {/* Badge de Estado */}
        <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 shadow-sm ${statusInfo.bg} ${statusInfo.border}`}>
           <span className="text-sm">{statusInfo.icon}</span>
           <span className={`text-[11px] font-bold uppercase tracking-wide ${statusInfo.color}`}>
             {statusInfo.label}
           </span>
        </div>

        {/* Hora de Ingreso */}
        <span className="font-mono text-xs font-medium text-slate-400 dark:text-slate-500">
           {timeString}
        </span>
      </div>

      {/* 3. CONTENIDO PRINCIPAL */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        
        {/* Cliente (Hero) */}
        <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cliente</span>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight truncate pr-2" title={pedido.cliente_nombre}>
                    {pedido.cliente_nombre}
                </h3>
                {/* WhatsApp Button */}
                {!isCancelled && pedido.cliente_telefono && (
                    <WhatsAppButton 
                        phone={pedido.cliente_telefono} 
                        trackingId={pedido.documentId} 
                        cliente={pedido.cliente_nombre} 
                    />
                )}
            </div>
        </div>

        {/* Dirección */}
        <div className="flex gap-2.5 items-start">
             <div className="mt-0.5 w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                </svg>
             </div>
             <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                 {pedido.direccion_entrega}
             </p>
        </div>

        {/* Items (Estilo Checklist) */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 transition-colors">
            <ul className="space-y-2">
                {pedido.detalle_pedido.items.slice(0, 3).map((item, i) => (
                <li key={i} className="flex items-start justify-between text-xs text-slate-700 dark:text-slate-300">
                    {typeof item === 'string' ? (
                        <span>{item}</span>
                    ) : (
                        <>
                            <span className="truncate text-slate-600 dark:text-slate-300 font-medium">{item.nombre}</span>
                            <span className="shrink-0 font-bold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400">
                                x{item.cantidad}
                            </span>
                        </>
                    )}
                </li>
                ))}
                {pedido.detalle_pedido.items.length > 3 && (
                    <li className="text-[10px] text-center font-bold text-slate-400 dark:text-slate-500 pt-1">
                        + {pedido.detalle_pedido.items.length - 3} items más
                    </li>
                )}
            </ul>
        </div>

      </div>

      {/* 4. FOOTER DE ACCIONES */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800 mt-auto transition-colors">
        
        {/* ESCENARIO 1: ASIGNAR RIDER */}
        {['Cocina', 'Listo_para_recoger'].includes(pedido.status_entrega) && (
          <div className="flex gap-2 animate-in fade-in duration-300">
            <div className="relative flex-1 group/input">
              <select 
                className="w-full appearance-none bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                value={selectedRider}
                onChange={(e) => setSelectedRider(e.target.value)}
                disabled={loading}
              >
                <option value="">🛵 Elegir Rider...</option>
                {repartidores
                   .filter(r => r.estado === 'Disponible')
                   .map(r => (
                  <option key={r.documentId} value={r.documentId}>
                    {r.nombre}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-hover/input:text-blue-500 transition-colors">
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            
            <button
              onClick={handleAssign}
              disabled={!selectedRider || loading}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white p-3 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center aspect-square"
            >
              {loading ? (
                <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              )}
            </button>
          </div>
        )}

        {/* ESCENARIO 2: CONFIRMAR ENTREGA */}
        {pedido.status_entrega === 'En_ruta' && (
           <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                 <div className="w-6 h-6 rounded-full bg-white dark:bg-indigo-900 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                    {pedido.repartidor?.nombre?.charAt(0).toUpperCase()}
                 </div>
                 <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 truncate">{pedido.repartidor?.nombre}</span>
              </div>

              <button
                 onClick={handleComplete}
                 disabled={loading}
                 className="w-full bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                 {loading ? <span className="animate-spin">⟳</span> : (
                    <>
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                       <span>CONFIRMAR ENTREGA</span>
                    </>
                 )}
              </button>
           </div>
        )}

        {/* ESCENARIO 3: ENTREGADO */}
        {isDelivered && (
           <div className="flex flex-col items-center justify-center py-1 animate-in zoom-in duration-300">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Entregado a las</span>
              <div className="px-4 py-1.5 bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 font-mono text-sm font-bold rounded-lg border border-emerald-200/50 dark:border-emerald-800">
                  {deliveredTime}
              </div>
           </div>
        )}

        {/* ESCENARIO 4: CANCELADO */}
        {isCancelled && (
           <div className="text-center py-2">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cancelado</span>
           </div>
        )}

      </div>
    </article>
  );
}