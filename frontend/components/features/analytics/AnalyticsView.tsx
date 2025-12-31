'use client';

import { useMemo, useState } from 'react';
import { Pedido } from '@/types';
import StatsGrid from './StatsGrid';
import SalesChart from './charts/SalesChart';
import StatusDonut from './charts/StatusDonut';
import PeakHoursChart from './charts/PeakHoursChart';
import RiderPerformanceChart from './charts/RiderPerformanceChart';

interface Props {
  pedidos: Pedido[];
}

export type TimeRange = 'hoy' | 'semana' | 'mes' | 'anio' | 'todo';

export default function AnalyticsView({ pedidos }: Props) {
  const [range, setRange] = useState<TimeRange>('semana');

  // 1. FILTRADO
  const pedidosFiltrados = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return pedidos.filter(p => {
      const pDate = new Date(p.createdAt);
      switch (range) {
        case 'hoy': return pDate >= todayStart;
        case 'semana': 
          const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7); return pDate >= weekAgo;
        case 'mes': 
          const monthAgo = new Date(now); monthAgo.setMonth(now.getMonth() - 1); return pDate >= monthAgo;
        case 'anio': 
          const yearAgo = new Date(now); yearAgo.setFullYear(now.getFullYear() - 1); return pDate >= yearAgo;
        default: return true;
      }
    });
  }, [pedidos, range]);
  
  // 2. MÉTRICAS GENERALES
  const metrics = useMemo(() => {
    const totalPedidos = pedidosFiltrados.length;
    const entregados = pedidosFiltrados.filter(p => p.status_entrega === 'Entregado').length;
    const cancelados = pedidosFiltrados.filter(p => p.status_entrega === 'Cancelado').length;
    const successRate = totalPedidos > 0 ? ((entregados / totalPedidos) * 100).toFixed(1) : '0';
    const ventasTotales = entregados * 45; 

    return { total: totalPedidos, entregados, cancelados, successRate, ventasTotales };
  }, [pedidosFiltrados]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER DE FILTROS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
         <div className="px-2">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Periodo de Análisis</h3>
            <p className="text-xs text-gray-500">Filtrando por fecha de creación</p>
         </div>
         <div className="flex p-1 bg-gray-100 rounded-xl overflow-x-auto no-scrollbar max-w-full w-full sm:w-auto">
            <div className="flex min-w-max sm:min-w-0">
               <TimeFilterButton label="Hoy" active={range === 'hoy'} onClick={() => setRange('hoy')} />
               <TimeFilterButton label="7 Días" active={range === 'semana'} onClick={() => setRange('semana')} />
               <TimeFilterButton label="30 Días" active={range === 'mes'} onClick={() => setRange('mes')} />
               <TimeFilterButton label="Año" active={range === 'anio'} onClick={() => setRange('anio')} />
               <TimeFilterButton label="Todo" active={range === 'todo'} onClick={() => setRange('todo')} />
            </div>
         </div>
      </div>

      {/* KPI CARDS */}
      <StatsGrid metrics={metrics} />

      {/* FILA 1: VENTAS Y DONUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800">Tendencia de Ingresos</h3>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md border border-blue-100 font-bold uppercase">
                 {range}
              </span>
           </div>
           <div className="h-72 w-full">
              <SalesChart pedidos={pedidosFiltrados} range={range} />
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
           <h3 className="font-bold text-gray-800 mb-2">Estado de Órdenes</h3>
           <div className="flex-1 w-full min-h-75 lg:min-h-0">
              {pedidosFiltrados.length > 0 ? (
                 <StatusDonut pedidos={pedidosFiltrados} />
              ) : (
                 <div className="h-full flex items-center justify-center text-gray-400 text-xs">Sin datos</div>
              )}
           </div>
        </div>
      </div>

      {/* FILA 2: HORAS PICO Y TOP RIDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         

         {/* GRÁFICO 4: HORAS PICO */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-1">🔥 Horas de Mayor Demanda</h3>
            <p className="text-xs text-gray-400 mb-4">Concentración de pedidos por hora</p>
            <div className="h-64 w-full">
               <PeakHoursChart pedidos={pedidosFiltrados} />
            </div>
         </div>

         {/* GRÁFICO 4: TOP RIDERS (RRHH / Incentivos) - NUEVO 🔥 */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-1">🏍️ Top Repartidores</h3>
            <p className="text-xs text-gray-400 mb-4">Mayor cantidad de entregas completadas</p>
            <div className="h-64 w-full">
               {/* Usamos el nuevo componente */}
               <RiderPerformanceChart pedidos={pedidosFiltrados} />
            </div>
         </div>

      </div>
    </div>
  );
}

function TimeFilterButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
   return (
      <button 
         onClick={onClick}
         className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
            active 
             ? 'bg-white text-blue-600 shadow-sm border border-gray-200' 
             : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
         }`}
      >
         {label}
      </button>
   );
}