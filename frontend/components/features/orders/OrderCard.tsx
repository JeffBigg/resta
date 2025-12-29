'use client';

import { useRouter } from 'next/navigation';
import { Pedido, Repartidor } from '@/types';
import { cancelarPedido } from '@/lib/api';
import AssignRider from './AssignRider';
import CompleteOrder from './CompleteOrder'; // Asegúrate de tener este componente o quitarlo si no lo usas aún
import StatusBadge from '@/components/ui/StatusBadge';
import WhatsAppButton from './WhatsAppButton';

interface Props {
  pedido: Pedido;
  repartidores: Repartidor[];
}

export default function OrderCard({ pedido, repartidores }: Props) {
  const router = useRouter();
  
  // Helpers de estado
  const isCancelled = pedido.status_entrega === 'Cancelado';
  const isDelivered = pedido.status_entrega === 'Entregado';
  const isEnRuta = pedido.status_entrega === 'En_ruta';

  const formatTime = (dateString: string) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('es-PE', { 
      hour: '2-digit', minute: '2-digit', hour12: true 
    });
  };

  const handleCancel = async () => {
    if (!confirm('¿Estás seguro de cancelar este pedido?')) return;
    const success = await cancelarPedido(pedido.documentId);
    if (success) router.refresh();
  };

  return (
    <article className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full relative group transition-all ${isCancelled ? 'opacity-60 bg-gray-50' : 'hover:shadow-md'}`}>
      
      {/* HEADER: Badge y Hora */}
      <div className="flex justify-between items-start mb-3">
         <StatusBadge status={pedido.status_entrega} />
         <div className="text-right">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Hora</span>
            <span className="text-xs font-mono text-gray-600 font-medium">{formatTime(pedido.createdAt)}</span>
         </div>
      </div>

      {/* CLIENTE */}
      <div className="mb-4 relative pr-6">
         {!isCancelled && !isDelivered && (
            <button onClick={handleCancel} className="absolute -top-1 -right-2 text-gray-300 hover:text-red-500 p-2">
               ✖
            </button>
         )}
         <h2 className={`text-lg font-bold leading-tight ${isCancelled ? 'line-through text-gray-400' : 'text-gray-900'}`}>
            {pedido.cliente_nombre}
         </h2>
         {!isCancelled && pedido.cliente_telefono && (
            <WhatsAppButton 
                phone={pedido.cliente_telefono} 
                trackingId={pedido.documentId} 
                cliente={pedido.cliente_nombre} 
            />
         )}
      </div>
      
      <p className="text-gray-500 text-xs mb-4 truncate flex items-center gap-1">
         📍 {pedido.direccion_entrega}
      </p>

      {/* ITEMS */}
      <div className="bg-gray-50 p-3 rounded-xl text-sm text-gray-700 mb-4 flex-grow border border-gray-100">
          <ul className="space-y-1">
              {pedido.detalle_pedido?.items?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                      <span className={`mt-1.5 w-1.5 h-1.5 flex-shrink-0 rounded-full ${isCancelled ? 'bg-gray-400' : 'bg-blue-500'}`}></span>
                      <span className="leading-snug">{item}</span>
                  </li>
              ))}
          </ul>
      </div>

      {/* ACCIONES */}
      <div className="mt-auto pt-3 border-t border-gray-50">
          {/* Caso 1: Cancelado */}
          {isCancelled && <div className="text-red-400 text-xs font-bold text-center uppercase">🚫 Pedido Cancelado</div>}
          
          {/* Caso 2: Entregado */}
          {isDelivered && (
             <div className="flex justify-between items-center text-green-700 font-bold text-xs bg-green-50 px-3 py-2 rounded-lg">
                <span>🏁 Entregado</span>
                <span className="font-mono opacity-75">{formatTime(pedido.updatedAt)}</span>
             </div>
          )}

          {/* Caso 3: Asignar Rider (Solo si no está entregado ni cancelado ni en ruta) */}
          {!isCancelled && !isDelivered && !isEnRuta && (
             <AssignRider pedidoDocumentId={pedido.documentId} repartidores={repartidores} />
          )}

          {/* Caso 4: Completar (Si está en ruta) */}
          {isEnRuta && (
             <div className="flex flex-col gap-2">
                <div className="text-center py-1 bg-yellow-50 rounded text-xs text-yellow-700 font-bold border border-yellow-100">
                   🛵 {pedido.repartidor?.nombre || 'Rider Asignado'}
                </div>
                {/* Aquí iría tu botón de completar */}
                <CompleteOrder documentId={pedido.documentId} riderDocumentId={pedido.repartidor?.documentId} />
             </div>
          )}
      </div>
    </article>
  );
}