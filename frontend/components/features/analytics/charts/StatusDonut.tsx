'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Pedido } from '@/types';

const COLORS = {
  Entregado: '#10b981', // Verde Emerald
  Cancelado: '#ef4444', // Rojo
  Pendiente: '#3b82f6', // Azul (Agrupamos Cocina, En Ruta, etc.)
};

export default function StatusDonut({ pedidos }: { pedidos: Pedido[] }) {
  
  const data = useMemo(() => {
    let entregados = 0;
    let cancelados = 0;
    let pendientes = 0;

    pedidos.forEach(p => {
      if (p.status_entrega === 'Entregado') entregados++;
      else if (p.status_entrega === 'Cancelado') cancelados++;
      else pendientes++;
    });

    return [
      { name: 'Entregado', value: entregados, color: COLORS.Entregado },
      { name: 'Pendiente', value: pendientes, color: COLORS.Pendiente },
      { name: 'Cancelado', value: cancelados, color: COLORS.Cancelado },
    ].filter(item => item.value > 0); // Solo mostramos lo que tiene datos
  }, [pedidos]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
             contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
             itemStyle={{ color: '#374151', fontWeight: 'bold' }}
        />
        <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-xs text-gray-500 font-medium ml-1">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}