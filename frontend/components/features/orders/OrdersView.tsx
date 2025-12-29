'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Pedido, Repartidor } from '@/types';
import CreateOrderModal from './CreateOrderModal';
import OrderCard from './OrderCard';

interface Props {
  pedidos: Pedido[];
  repartidores: Repartidor[];
}

export default function OrdersView({ pedidos, repartidores }: Props) {
  const router = useRouter();

  // --- LÓGICA DE AUTO-REFRESH (POLLING) ---
  useEffect(() => {
    // Cada 15 segundos, recarga los datos silenciosamente
    const intervalId = setInterval(() => {
      router.refresh(); 
    }, 15000);

    return () => clearInterval(intervalId); // Limpieza al salir
  }, [router]);

  // Ordenar pedidos: Los más recientes primero
  const pedidosOrdenados = [...pedidos].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Barra superior con botón de crear */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        {/* Indicador EN VIVO */}
        <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            SISTEMA EN VIVO
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-sm text-gray-500 font-medium">Total: {pedidos.length}</span>
          <CreateOrderModal />
        </div>
      </div>
      
      {/* Grid de Tarjetas */}
      {pedidos.length === 0 ? (
         <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500">No hay pedidos activos.</p>
            <p className="text-xs text-gray-400 mt-2">Esperando nuevos pedidos...</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {pedidosOrdenados.map((pedido) => (
            <OrderCard 
              key={pedido.documentId} 
              pedido={pedido} 
              repartidores={repartidores} 
            />
          ))}
        </div>
      )}
    </div>
  );
}