'use client';

import { useEffect, useState, useMemo } from 'react';
import { Pedido, Repartidor } from '@/types';
import { getPedidos, getRepartidores } from '@/lib/api'; 
import OrderCard from './OrderCard';
import CreateOrderModal from './CreateOrderModal';

interface Props {
  pedidos: Pedido[];
  repartidores: Repartidor[];
}

type FilterType = 'todos' | 'pendientes' | 'entregados' | 'cancelados';

export default function OrdersView({ pedidos: initialPedidos, repartidores: initialRepartidores }: Props) {
  const [listaPedidos, setListaPedidos] = useState<Pedido[]>(initialPedidos || []);
  const [listaRepartidores, setListaRepartidores] = useState<Repartidor[]>(initialRepartidores || []);
  const [activeFilter, setActiveFilter] = useState<FilterType>('todos');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    try {
      const [nuevosPedidos, nuevosRepartidores] = await Promise.all([
        getPedidos(),
        getRepartidores()
      ]);
      if (Array.isArray(nuevosPedidos)) setListaPedidos(nuevosPedidos);
      if (Array.isArray(nuevosRepartidores)) setListaRepartidores(nuevosRepartidores);
    } catch (error) {
      console.error("Error actualizando dashboard:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(refreshData, 15000);
    return () => clearInterval(interval);
  }, []);

  const pedidosProcesados = useMemo(() => {
    const safeList = Array.isArray(listaPedidos) ? listaPedidos : [];
    const getPriority = (status: string) => {
      if (['Cocina', 'Listo_para_recoger', 'En_ruta'].includes(status)) return 1;
      if (status === 'Entregado') return 2;
      if (status === 'Cancelado') return 3;
      return 4;
    };

    return safeList
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
  }, [listaPedidos, activeFilter]); 

  const counts = useMemo(() => {
    const safeList = Array.isArray(listaPedidos) ? listaPedidos : [];
    return {
        todos: safeList.length,
        pendientes: safeList.filter(p => ['Cocina', 'Listo_para_recoger', 'En_ruta'].includes(p.status_entrega)).length,
        entregados: safeList.filter(p => p.status_entrega === 'Entregado').length,
        cancelados: safeList.filter(p => p.status_entrega === 'Cancelado').length,
    };
  }, [listaPedidos]);

  const TABS: { key: FilterType; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'pendientes', label: 'En Proceso' },
    { key: 'entregados', label: 'Historial' },
    { key: 'cancelados', label: 'Anulados' },
  ];

  return (
    // Agregamos dark:bg-slate-950 para el fondo principal
    <div className="flex flex-col min-h-screen relative w-full max-w-[100vw] overflow-x-hidden dark:bg-slate-950 transition-colors duration-300">
      
      {/* FONDO DECORATIVO */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Ajustamos el gradiente de los puntos para que sean visibles pero sutiles en modo oscuro */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] bg-size-[24px_24px] opacity-40"></div>
      </div>

      <div className="relative z-10 flex flex-col gap-6 pb-28 md:pb-10 w-full">
        
        {/* === BARRA FLOTANTE (STICKY) === */}
        <div className="sticky top-0 z-30 pt-2 pb-2 pointer-events-none w-full"> 
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pointer-events-auto max-w-full">
            
            {/* 1. CÁPSULA FILTROS */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/60 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-black/20 rounded-2xl p-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[92vw] md:max-w-none mx-auto md:mx-0 transition-colors">
               {TABS.map(({ key, label }) => {
                 const isActive = activeFilter === key;
                 return (
                   <button
                     key={key}
                     onClick={() => setActiveFilter(key)}
                     className={`
                       relative px-3 py-2 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 flex items-center gap-2 select-none
                       ${isActive 
                         ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                         : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-700/50'
                       }
                     `}
                   >
                     {label}
                     <span className={`
                       h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full text-[10px] transition-colors
                       ${isActive 
                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100' 
                            : 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-500'}
                     `}>
                       {counts[key]}
                     </span>
                   </button>
                 );
               })}
            </div>

            {/* 2. CÁPSULA ACCIONES */}
            <div className="hidden md:flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/60 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-black/20 rounded-2xl p-1.5 transition-colors">
                <button 
                  onClick={() => { setIsRefreshing(true); refreshData(); }}
                  disabled={isRefreshing}
                  className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-slate-700 rounded-xl transition-all active:scale-95"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" 
                    className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </button>
                
                {/* Divisor */}
                <div className="w-px h-6 bg-slate-300/50 dark:bg-slate-700/50"></div>
                
                <div className="hidden md:block">
                  <CreateOrderModal onOrderCreated={refreshData} />
                </div>
            </div>

          </div>
        </div>

        {/* === GRID DE TARJETAS === */}
        <div className="w-full min-h-[50vh]"> 
          {pedidosProcesados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 animate-in fade-in zoom-in duration-500 opacity-60 px-4 text-center">
                <div className="w-20 h-20 bg-linear-to-tr from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 rounded-full flex items-center justify-center mb-4 shadow-sm border border-white dark:border-slate-700 transition-colors">
                   <span className="text-3xl">🍃</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">No hay pedidos en esta vista.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 w-full">
                {pedidosProcesados.map((p, index) => (
                <div 
                   key={p.documentId} 
                   className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards w-full h-full"
                   style={{ animationDelay: `${index * 50}ms` }}
                >
                  <OrderCard
                      pedido={p}
                      repartidores={listaRepartidores}
                      onUpdate={refreshData} 
                  />
                </div>
                ))}
            </div>
          )}
        </div>

      </div>

      {/* FAB MOBILE */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden animate-in zoom-in duration-300 flex flex-col gap-3 items-end">
         <button 
            onClick={() => { setIsRefreshing(true); refreshData(); }}
            className={`w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
         >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
         </button>
         <div className="shadow-2xl shadow-blue-600/30 dark:shadow-blue-900/30 rounded-full">
            <CreateOrderModal isMobileFab onOrderCreated={refreshData} /> 
         </div>
      </div>

    </div> 
  );
}