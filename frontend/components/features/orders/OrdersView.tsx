'use client';

import { useRouter } from 'next/navigation';
import { Pedido, Repartidor } from '../../../types';
import CreateOrderModal from './CreateOrderModal';
import AssignRider from './AssignRider';
import CompleteOrder from './CompleteOrder';
import { cancelarPedido } from '../../../lib/api';

interface Props {
  pedidos: Pedido[];
  repartidores: Repartidor[];
}

export default function OrdersView({ pedidos, repartidores }: Props) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-end">
        <CreateOrderModal />
      </div>
      
      {pedidos.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pedidos.map((pedido) => (
            <OrderCard key={pedido.documentId} pedido={pedido} repartidores={repartidores} />
          ))}
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTES ACTUALIZADOS ---

function OrderCard({ pedido, repartidores }: { pedido: Pedido, repartidores: Repartidor[] }) {
    const router = useRouter();
    const isCancelled = pedido.status_entrega === 'Cancelado';
    const isDelivered = pedido.status_entrega === 'Entregado';

    // Helper para formatear hora (Ej: 02:30 PM)
    const formatTime = (dateString: string) => {
        if (!dateString) return '--:--';
        return new Date(dateString).toLocaleTimeString('es-PE', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    };

    const handleCancel = async () => {
        if (!confirm('¿Estás seguro de que deseas CANCELAR este pedido?')) return;
        const success = await cancelarPedido(pedido.documentId);
        if (success) router.refresh();
        else alert('Error al cancelar');
    };

    return (
        <article className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all flex flex-col h-full relative group ${isCancelled ? 'opacity-60 bg-gray-50' : 'hover:shadow-md'}`}>
            
            {/* CABECERA: ID y Hora de Pedido */}
            <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center gap-2">
                    <StatusBadge status={pedido.status_entrega} />
                    <span className="text-gray-400 text-xs font-mono bg-gray-50 px-2 py-1 rounded">#{pedido.id}</span>
                 </div>
                 {/* HORA DEL PEDIDO */}
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Pedido</span>
                    <span className="text-xs font-mono text-gray-600 font-medium">{formatTime(pedido.createdAt)}</span>
                 </div>
            </div>

            {/* CUERPO PRINCIPAL */}
            <div className="mb-4 relative">
                 {/* Botón Cancelar Absoluto (Más discreto) */}
                 {!isCancelled && !isDelivered && (
                    <button 
                        onClick={handleCancel}
                        title="Cancelar Pedido"
                        className="absolute -top-1 right-0 text-gray-300 hover:text-red-500 p-1 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                <h2 className={`text-lg font-bold leading-tight ${isCancelled ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {pedido.cliente_nombre}
                </h2>
                {!isCancelled && pedido.cliente_telefono && (
                    <WhatsAppButton phone={pedido.cliente_telefono} trackingId={pedido.documentId} cliente={pedido.cliente_nombre} />
                )}
            </div>
            
            <p className="text-gray-500 text-sm mb-4 truncate flex items-center gap-1">
                <span>📍</span> {pedido.direccion_entrega}
            </p>

            <div className="bg-gray-50 p-3 rounded-xl text-sm text-gray-700 mb-4 flex-grow border border-gray-100">
                <p className="font-semibold text-[10px] text-gray-400 uppercase tracking-wider mb-2">Orden</p>
                <ul className="space-y-1">
                    {pedido.detalle_pedido?.items?.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                           <span className={`w-1.5 h-1.5 rounded-full ${isCancelled ? 'bg-gray-400' : 'bg-blue-400'}`}></span> 
                           <span className={isCancelled ? 'text-gray-500' : ''}>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* AREA DE ACCIONES Y TIEMPO FINAL */}
            <div className="border-t pt-4 mt-auto">
                {isCancelled ? (
                     <div className="text-center py-2 bg-red-50 rounded-lg border border-red-100 opacity-80">
                        <span className="text-sm text-red-500 font-bold">🚫 Cancelado</span>
                     </div>
                ) : (
                    <>
                        {pedido.status_entrega !== 'En_ruta' && !isDelivered && (
                            <AssignRider pedidoDocumentId={pedido.documentId} repartidores={repartidores} />
                        )}
                        {pedido.status_entrega === 'En_ruta' && (
                            <div className="flex flex-col gap-2">
                                <div className="text-center py-1 bg-yellow-50 rounded text-xs text-yellow-700 font-bold">🛵 En Ruta: {pedido.repartidor?.nombre}</div>
                                <CompleteOrder documentId={pedido.documentId} riderDocumentId={pedido.repartidor?.documentId} />
                            </div>
                        )}
                        {isDelivered && (
                            <div className="flex justify-between items-center bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                                <span className="text-sm text-green-700 font-bold">🏁 Entregado</span>
                                <div className="text-right">
                                    <span className="block text-[10px] text-green-600 uppercase">Hora</span>
                                    <span className="text-xs font-mono text-green-800 font-bold">{formatTime(pedido.updatedAt)}</span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </article>
    );
}

// --- AUXILIARES ---

function WhatsAppButton({ phone, trackingId, cliente }: { phone: string, trackingId: string, cliente: string }) {
    const trackingLink = `http://localhost:3000/tracking/${trackingId}`;
    const message = `Hola ${cliente}, tu pedido está confirmado. Sigue el estado aquí: ${trackingLink}`;
    return (
        <a href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className="text-xs text-green-600 font-bold hover:underline flex items-center gap-1 mt-1">
            <span>💬 Enviar Tracking</span>
        </a>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        'En_ruta': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'Entregado': 'bg-green-100 text-green-800 border-green-200',
        'Cocina': 'bg-red-100 text-red-800 border-red-200',
        'Listo_para_recoger': 'bg-blue-100 text-blue-800 border-blue-200',
        'Cancelado': 'bg-gray-100 text-gray-500 border-gray-200 line-through',
    };
    return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
            {status?.replace(/_/g, ' ') || 'PENDIENTE'}
        </span>
    );
}

function EmptyState() {
    return <div className="text-center py-20 text-gray-500">No hay pedidos activos.</div>;
}