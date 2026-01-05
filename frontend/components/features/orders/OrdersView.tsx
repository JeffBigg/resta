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
    // 1. FONDO ESCALABLE: bg-background
    <div className="flex flex-col min-h-screen relative w-full max-w-[100vw] overflow-x-hidden bg-background text-foreground transition-colors duration-300">
      
      {/* FONDO DECORATIVO */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Usamos currentColor con opacidad para que los puntos se adapten al color de texto del tema */}
          <div className="absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1px)] bg-size-[24px_24px] opacity-[0.03]"></div>
      </div>

      <div className="relative z-10 flex flex-col gap-6 pb-28 md:pb-10 w-full">
        
        {/* === BARRA FLOTANTE (STICKY) === */}
        {/* Agregamos px-4 md:px-8 aquí también para alinear con el grid */}
        <div className="sticky top-0 z-30 pt-4 pb-2 pointer-events-none w-full px-4 md:px-8"> 
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pointer-events-auto max-w-full">
            
            {/* 1. CÁPSULA FILTROS */}
            <div className="bg-card/80 backdrop-blur-md border border-border shadow-lg shadow-black/5 rounded-2xl p-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full mx-auto md:mx-0 transition-colors">
               {TABS.map(({ key, label }) => {
                 const isActive = activeFilter === key;
                 return (
                   <button
                     key={key}
                     onClick={() => setActiveFilter(key)}
                     className={`
                       relative px-3 py-2 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 flex items-center gap-2 select-none
                       ${isActive 
                         ? 'bg-background text-foreground shadow-sm ring-1 ring-border' 
                         : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                       }
                     `}
                   >
                     {label}
                     <span className={`
                       h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full text-[10px] transition-colors
                       ${isActive 
                            ? 'bg-muted text-foreground' 
                            : 'bg-muted/50 text-muted-foreground'}
                     `}>
                       {counts[key]}
                     </span>
                   </button>
                 );
               })}
            </div>

            {/* 2. CÁPSULA ACCIONES */}
            <div className="hidden md:flex items-center gap-3 bg-card/80 backdrop-blur-md border border-border shadow-lg shadow-black/5 rounded-2xl p-1.5 transition-colors">
                <button 
                  onClick={() => { setIsRefreshing(true); refreshData(); }}
                  disabled={isRefreshing}
                  className="w-10 h-10 flex items-center justify-center bg-background text-muted-foreground hover:text-primary hover:shadow-sm border border-transparent hover:border-border rounded-xl transition-all active:scale-95"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" 
                    className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-primary' : ''}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </button>
                
                {/* Divisor */}
                <div className="w-px h-6 bg-border"></div>
                
                <div className="hidden md:block">
                  <CreateOrderModal onOrderCreated={refreshData} />
                </div>
            </div>

          </div>
        </div>

        {/* === GRID DE TARJETAS === */}
        {/* 2. ESPACIADO SOLUCIONADO: px-4 md:px-8 para que no pegue a los bordes */}
        <div className="w-full min-h-[50vh] px-4 md:px-8"> 
          {pedidosProcesados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 animate-in fade-in zoom-in duration-500 opacity-60 px-4 text-center">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4 shadow-sm border border-border transition-colors">
                   <span className="text-4xl">🍃</span>
                </div>
                <h3 className="text-lg font-bold text-foreground">Todo tranquilo por aquí</h3>
                <p className="text-muted-foreground font-medium transition-colors">No hay pedidos en esta vista.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 xl:gap-6 w-full">
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
            className={`w-12 h-12 flex items-center justify-center bg-card text-muted-foreground rounded-full shadow-lg border border-border transition-colors ${isRefreshing ? 'animate-spin text-primary' : ''}`}
         >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
         </button>
         <div className="shadow-2xl shadow-primary/30 rounded-full">
            <CreateOrderModal isMobileFab onOrderCreated={refreshData} /> 
         </div>
      </div>

    </div> 
  );
}