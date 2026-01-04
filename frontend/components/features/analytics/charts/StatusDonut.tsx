'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Pedido } from '@/types';

const COLORS = {
  Entregado: '#10b981', 
  Cancelado: '#ef4444', 
  Pendiente: '#3b82f6', 
};

// ✅ SOLUCIÓN: Definimos la estructura del payload específico para el Donut
interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    name: string;
    value: number;
    payload: {
      color: string; // Necesitamos esto para pintar la bolita del color correcto
    };
  }[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-black/50">
         <div className="flex items-center gap-2 mb-1">
             {/* Accedemos al color original desde payload.payload */}
             <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }}></div>
             <p className="text-slate-700 dark:text-slate-200 font-bold text-sm">{data.name}</p>
         </div>
         <p className="text-2xl font-black text-slate-800 dark:text-white pl-4">
            {data.value}
         </p>
      </div>
    );
  }
  return null;
};

export default function StatusDonut({ pedidos }: { pedidos: Pedido[] }) {
  
  const data = useMemo(() => {
    let entregados = 0; let cancelados = 0; let pendientes = 0;
    pedidos.forEach(p => {
      if (p.status_entrega === 'Entregado') entregados++;
      else if (p.status_entrega === 'Cancelado') cancelados++;
      else pendientes++;
    });
    return [
      { name: 'Entregado', value: entregados, color: COLORS.Entregado },
      { name: 'Pendiente', value: pendientes, color: COLORS.Pendiente },
      { name: 'Cancelado', value: cancelados, color: COLORS.Cancelado },
    ].filter(item => item.value > 0); 
  }, [pedidos]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => (<span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">{value}</span>)} />
      </PieChart>
    </ResponsiveContainer>
  );
}