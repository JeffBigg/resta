'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Pedido } from '@/types';

// ✅ SOLUCIÓN: Definimos la interfaz exacta de las props
interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 transition-all">
        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">{label}</p>
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-violet-500"></span>
           <p className="text-slate-800 dark:text-white font-bold text-sm">
             {payload[0].value} Pedidos
           </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function PeakHoursChart({ pedidos }: { pedidos: Pedido[] }) {
  
  const data = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));

    pedidos.forEach(p => {
      const date = new Date(p.createdAt);
      const h = date.getHours();
      hours[h].count += 1;
    });

    return hours.map(h => ({
      name: h.hour === 0 ? '12 AM' : h.hour === 12 ? '12 PM' : h.hour > 12 ? `${h.hour - 12} PM` : `${h.hour} AM`,
      pedidos: h.count
    }));
  }, [pedidos]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPedidos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748b" strokeOpacity={0.2} />
        
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} interval={3} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
        
        {/* TypeScript aceptará nuestro componente personalizado sin problemas */}
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '4 4' }} />
        
        <Area type="monotone" dataKey="pedidos" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorPedidos)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}