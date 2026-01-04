'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Pedido } from '@/types';

// ✅ SOLUCIÓN: Interfaz tipada
interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-black/50">
        <p className="text-slate-800 dark:text-white font-bold text-sm mb-1">{label}</p>
        <div className="flex items-center gap-2">
           <span className="text-xs text-slate-500 dark:text-slate-400">Entregas completadas:</span>
           <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">{payload[0].value}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function RiderPerformanceChart({ pedidos }: { pedidos: Pedido[] }) {
  
  const data = useMemo(() => {
    const riderCount: Record<string, number> = {};

    pedidos.forEach(p => {
      if (p.status_entrega === 'Entregado' && p.repartidor) {
        const name = p.repartidor.nombre || 'Sin Nombre';
        const shortName = name.length > 12 ? name.substring(0, 12) + '..' : name;
        riderCount[shortName] = (riderCount[shortName] || 0) + 1;
      }
    });

    return Object.entries(riderCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); 

  }, [pedidos]);

  if (data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 opacity-60">
        <span className="text-4xl mb-2">🛵</span>
        <span className="text-xs">Sin entregas registradas</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#64748b" strokeOpacity={0.2} />
        <XAxis type="number" hide />
        <YAxis dataKey="name" type="category" width={90} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} />
        
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#3b82f6', opacity: 0.1 }} />
        
        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
           {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? '#F59E0B' : index === 1 ? '#94A3B8' : index === 2 ? '#B45309' : '#3b82f6'} />
           ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}