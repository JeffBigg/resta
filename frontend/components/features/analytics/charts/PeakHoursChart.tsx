'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Pedido } from '@/types';

export default function PeakHoursChart({ pedidos }: { pedidos: Pedido[] }) {
  
  const data = useMemo(() => {
    // Array de 0 a 23 horas
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));

    pedidos.forEach(p => {
      const date = new Date(p.createdAt);
      const h = date.getHours();
      hours[h].count += 1;
    });

    // Formatear para mostrar "1 PM", "2 PM"
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
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#9ca3af', fontSize: 10 }} 
          interval={3} // Mostrar cada 3 horas para no saturar
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
        <Area 
            type="monotone" 
            dataKey="pedidos" 
            stroke="#8b5cf6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorPedidos)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}