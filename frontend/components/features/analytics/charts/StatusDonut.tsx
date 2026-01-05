'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Pedido } from '@/types';

// Los colores del Donut suelen ser semánticos fijos (Verde=Bien, Rojo=Mal), 
// pero podemos usar variables para el "Pendiente" (Azul) para que coincida con el tema.
const COLORS = {
  Entregado: '#10b981', // Emerald
  Cancelado: '#ef4444', // Red
  Pendiente: 'var(--primary)', // Blue del tema
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    name: string;
    value: number;
    payload: {
      color: string;
    };
  }[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    
    return (
      <div className="bg-popover border border-border p-3 rounded-xl shadow-xl shadow-black/5">
         <div className="flex items-center gap-2 mb-1">
             <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }}></div>
             <p className="text-muted-foreground font-bold text-sm">{data.name}</p>
         </div>
         <p className="text-2xl font-black text-foreground pl-4">
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
        <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle" 
            formatter={(value) => (
                <span className="text-xs text-muted-foreground font-medium ml-1">
                    {value}
                </span>
            )} 
        />
      </PieChart>
    </ResponsiveContainer>
  );
}