'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Pedido } from '@/types';

// ✅ SOLUCIÓN: Interfaz tipada y Estilos Escalables
interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border p-3 rounded-xl shadow-xl shadow-black/5 transition-all">
        <p className="text-muted-foreground text-xs font-bold mb-1 uppercase tracking-wider">{label}</p>
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-primary"></span>
           <p className="text-foreground font-bold text-sm">
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
            {/* Usamos currentColor o variables CSS para los gradientes */}
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
          </linearGradient>
        </defs>
        
        {/* Grid usando variable de borde escalable */}
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.6} />
        
        {/* Ejes usando variable de texto secundario */}
        <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} 
            interval={3} 
        />
        <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} 
        />
        
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }} />
        
        <Area 
            type="monotone" 
            dataKey="pedidos" 
            stroke="var(--primary)" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorPedidos)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}