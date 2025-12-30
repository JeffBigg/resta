'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Pedido, Repartidor } from '@/types';
import OrderCard from './OrderCard';
import CreateOrderModal from './CreateOrderModal';

interface Props {
  pedidos: Pedido[];
  repartidores: Repartidor[];
}

type FilterType = 'todos' | 'pendientes' | 'entregados' | 'cancelados';

export default function OrdersView({ pedidos, repartidores }: Props) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('todos');

  // Auto-refresh
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 15000);
    return () => clearInterval(id);
  }, [router]);

  // Lógica de Filtrado y Orden
  const pedidosProcesados = useMemo(() => {
    const getPriority = (status: string) => {
      if (['Cocina', 'Listo_para_recoger', 'En_ruta'].includes(status)) return 1;
      if (status === 'Entregado') return 2;
      if (status === 'Cancelado') return 3;
      return 4;
    };

    return pedidos
      .filter(p => {
        const s = p.status_entrega;
        if (activeFilter === 'todos') return true;
        if (activeFilter === 'pendientes') return ['Cocina', 'Listo_para_recoger', 'En_ruta'].includes(s);
        if (activeFilter === 'entregados') return s === 'Entregado';
        if (activeFilter === 'cancelados') return s === 'Cancelado';
        return true;
      })
      .sort((a, b) => {
        const pa = getPriority(a.status_entrega);
        const pb = getPriority(b.status_entrega);
        if (pa !== pb) return pa - pb;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [pedidos, activeFilter]);

  // Contadores
  const counts = useMemo(() => ({
    todos: pedidos.length,
    pendientes: pedidos.filter(p => ['Cocina', 'Listo_para_recoger', 'En_ruta'].includes(p.status_entrega)).length,
    entregados: pedidos.filter(p => p.status_entrega === 'Entregado').length,
    cancelados: pedidos.filter(p => p.status_entrega === 'Cancelado').length,
  }), [pedidos]);

  const TABS: { key: FilterType; label: string; color: string }[] = [
    { key: 'todos', label: 'Todos', color: 'bg-gray-800 text-white' },
    { key: 'pendientes', label: 'Pendientes', color: 'bg-blue-600 text-white' },
    { key: 'entregados', label: 'Entregados', color: 'bg-emerald-600 text-white' },
    { key: 'cancelados', label: 'Cancelados', color: 'bg-rose-500 text-white' },
  ];

  return (
    <div className="flex flex-col min-h-[85vh] space-y-4 pb-28 md:pb-10 animate-in fade-in duration-300">

      {/* HEADER DE FILTROS (STICKY) */}
      {/* max-w-full asegura que el header no exceda el ancho de la pantalla */}
      <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-md py-2 -mx-4 px-4 shadow-sm md:static md:bg-transparent md:shadow-none md:mx-0 md:p-0 md:mb-6 transition-all max-w-[100vw]">
        
        <div className="flex items-center justify-between gap-4">

          {/* 🔥 LA SOLUCIÓN: min-w-0 */}
          {/* Al agregar min-w-0, permitimos que este contenedor se encoja dentro del flex padre */}
          <div className="overflow-x-auto no-scrollbar flex-1 min-w-0">
            <div className="flex gap-2 min-w-max pb-1 pr-4"> {/* Agregué pr-4 para dar aire al final del scroll */}
              {TABS.map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`relative flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-100 ${
                    activeFilter === key
                      ? `${color} shadow-md transform scale-[1.02]`
                      : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span>{label}</span>
                  {counts[key] > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                        activeFilter === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {counts[key]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Botón Desktop */}
          <div className="hidden md:block flex-shrink-0">
            <CreateOrderModal />
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-grow w-full min-w-0"> {/* w-full y min-w-0 protegen el grid */}
        {pedidosProcesados.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-20 text-gray-400 opacity-60">
              <p className="text-5xl mb-4 grayscale">🍃</p>
              <p className="font-medium text-lg">Todo limpio por aquí</p>
              <p className="text-sm">No hay pedidos en &quot;{activeFilter}&quot;</p>
          </div>
        ) : (
          // GRID: grid-cols-1 asegura que en móvil ocupe todo el ancho disponible
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 content-start w-full">
              {pedidosProcesados.map(p => (
              <OrderCard
                  key={p.documentId}
                  pedido={p}
                  repartidores={repartidores}
              />
              ))}
          </div>
        )}
      </div>

      {/* FAB MOBILE */}
      <div className="fixed bottom-6 right-6 z-30 md:hidden animate-in zoom-in duration-300">
         <div className="shadow-2xl shadow-blue-900/50 rounded-xl">
            <CreateOrderModal isMobileFab /> 
         </div>
      </div>
    </div> 
  );
}