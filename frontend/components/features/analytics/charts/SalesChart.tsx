'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Pedido } from '@/types';
import { TimeRange } from '../AnalyticsView'; 

// ✅ SOLUCIÓN: Interfaz tipada
interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  // Verificamos que payload exista y tenga elementos
  if (active && payload && payload.length > 0) {
    const value = payload[0].value;
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 min-w-30">
        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">{label}</p>
        <div className="flex flex-col gap-1">
             <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300 text-xs">Pedidos:</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">{value}</span>
             </div>
             <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-700 mt-1">
                <span className="text-slate-600 dark:text-slate-300 text-xs">Venta:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">S/ {value * 45}</span>
             </div>
        </div>
      </div>
    );
  }
  return null;
};

interface Props {
  pedidos: Pedido[];
  range: TimeRange;
}

export default function SalesChart({ pedidos, range }: Props) {
  
  const data = useMemo(() => {
    if (range === 'anio' || range === 'todo') {
       const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
       const counts = new Array(12).fill(0);
       pedidos.forEach(p => { const d = new Date(p.createdAt); counts[d.getMonth()] += 1; });
       return months.map((m, i) => ({ name: m, pedidos: counts[i] }));
    }
    if (range === 'mes') {
       const daysInMonth = 31; const counts = new Array(daysInMonth).fill(0);
       pedidos.forEach(p => { const d = new Date(p.createdAt); const day = d.getDate(); counts[day - 1] += 1; });
       return Array.from({ length: daysInMonth }, (_, i) => ({ name: `${i + 1}`, pedidos: counts[i] })).filter((_, i) => i % 2 === 0);
    }
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']; const counts = new Array(7).fill(0);
    pedidos.forEach(p => { const d = new Date(p.createdAt); counts[d.getDay()] += 1; });
    return days.map((day, index) => ({ name: day, pedidos: counts[index] }));
  }, [pedidos, range]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748b" strokeOpacity={0.2} />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} interval={0} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
        
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#3b82f6', opacity: 0.1 }} />
        
        <Bar dataKey="pedidos" radius={[4, 4, 0, 0]} maxBarSize={50}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.pedidos > 0 ? '#3b82f6' : '#1e293b'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}