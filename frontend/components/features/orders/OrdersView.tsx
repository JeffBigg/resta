'use client';

import { useEffect, useState, useMemo } from 'react';
import { Pedido, Repartidor } from '@/types';
import { getPedidos, getRepartidores } from '@/lib/api'; // 👈 IMPORTANTE: Importamos la API
import OrderCard from './OrderCard';
import CreateOrderModal from './CreateOrderModal';

interface Props {
  pedidos: Pedido[];
  repartidores: Repartidor[];
}

type FilterType = 'todos' | 'pendientes' | 'entregados' | 'cancelados';

export default function OrdersView({ pedidos: initialPedidos, repartidores: initialRepartidores }: Props) {
  // 1. ESTADO LOCAL (Para que la pantalla cambie sin recargar)
  const [listaPedidos, setListaPedidos] = useState<Pedido[]>(initialPedidos);
  const [listaRepartidores, setListaRepartidores] = useState<Repartidor[]>(initialRepartidores);
  const [activeFilter, setActiveFilter] = useState<FilterType>('todos');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 2. FUNCIÓN PARA CARGAR DATOS (Se usa en automático y manual)
  const refreshData = async () => {
    try {
      // setIsRefreshing(true); // Opcional: Descomentar si quieres ver el spinner cada 15s
      const nuevosPedidos = await getPedidos();
      const nuevosRepartidores = await getRepartidores();
      setListaPedidos(nuevosPedidos);
      setListaRepartidores(nuevosRepartidores);
    } catch (error) {
      console.error("Error actualizando dashboard:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 3. AUTO-REFRESH (POLLING) - Conexión con n8n
  useEffect(() => {
    // Cada 15 segundos buscamos cambios en la base de datos
    const interval = setInterval(refreshData, 15000);
    return () => clearInterval(interval);
  }, []);

  // 4. LÓGICA DE FILTRADO Y ORDEN (Usamos listaPedidos en lugar de props)
  const pedidosProcesados = useMemo(() => {
    const getPriority = (status: string) => {
      if (['Cocina', 'Listo_para_recoger', 'En_ruta'].includes(status)) return 1;
      if (status === 'Entregado') return 2;
      if (status === 'Cancelado') return 3;
      return 4;
    };

    return listaPedidos
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
  }, [listaPedidos, activeFilter]); // 👈 Dependencia cambiada a listaPedidos

  // 5. CONTADORES (Usamos listaPedidos)
  const counts = useMemo(() => ({
    todos: listaPedidos.length,
    pendientes: listaPedidos.filter(p => ['Cocina', 'Listo_para_recoger', 'En_ruta'].includes(p.status_entrega)).length,
    entregados: listaPedidos.filter(p => p.status_entrega === 'Entregado').length,
    cancelados: listaPedidos.filter(p => p.status_entrega === 'Cancelado').length,
  }), [listaPedidos]);

  const TABS: { key: FilterType; label: string; color: string }[] = [
    { key: 'todos', label: 'Todos', color: 'bg-gray-800 text-white' },
    { key: 'pendientes', label: 'Pendientes', color: 'bg-blue-600 text-white' },
    { key: 'entregados', label: 'Entregados', color: 'bg-emerald-600 text-white' },
    { key: 'cancelados', label: 'Cancelados', color: 'bg-rose-500 text-white' },
  ];

  return (
    <div className="flex flex-col min-h-[85vh] space-y-4 pb-28 md:pb-10 animate-in fade-in duration-300">

      {/* HEADER DE FILTROS (STICKY) */}
      <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-md py-2 -mx-4 px-4 shadow-sm md:static md:bg-transparent md:shadow-none md:mx-0 md:p-0 md:mb-6 transition-all max-w-[100vw]">
        
        <div className="flex items-center justify-between gap-4">

          <div className="overflow-x-auto no-scrollbar flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-max pb-1 pr-4"> 
              {/* Tabs de Filtros */}
              {TABS.map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`relative shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-100 ${
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

              {/* Botón de Refrescar Manual (Pequeño y sutil) */}
              <button 
                onClick={() => { setIsRefreshing(true); refreshData(); }}
                disabled={isRefreshing}
                className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors"
                title="Actualizar datos ahora"
              >
                <span className={`block ${isRefreshing ? 'animate-spin' : ''}`}>↻</span>
              </button>
            </div>
          </div>

          {/* Botón Create Desktop */}
          <div className="hidden md:block shrink-0">
            <CreateOrderModal />
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="grow w-full min-w-0"> 
        {pedidosProcesados.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-20 text-gray-400 opacity-60">
              <p className="text-5xl mb-4 grayscale">🍃</p>
              <p className="font-medium text-lg">Todo limpio por aquí</p>
              <p className="text-sm">No hay pedidos en &quot;{activeFilter}&quot;</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 content-start w-full">
              {pedidosProcesados.map(p => (
              <OrderCard
                  key={p.documentId}
                  pedido={p}
                  repartidores={listaRepartidores} // Pasamos la lista actualizada
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