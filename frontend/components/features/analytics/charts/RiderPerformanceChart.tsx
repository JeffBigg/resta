'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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
      <div className="bg-popover border border-border p-3 rounded-xl shadow-xl shadow-black/5">
        <p className="text-foreground font-bold text-sm mb-1">{label}</p>
        <div className="flex items-center gap-2">
           <span className="text-xs text-muted-foreground">Entregas completadas:</span>
           <span className="text-primary font-bold text-sm">{payload[0].value}</span>
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
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
        <span className="text-4xl mb-2">🛵</span>
        <span className="text-xs">Sin entregas registradas</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" strokeOpacity={0.6} />
        
        <XAxis type="number" hide />
        
        <YAxis 
            dataKey="name" 
            type="category" 
            width={90} 
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }} 
            tickLine={false} 
            axisLine={false} 
        />
        
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
        
        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
           {data.map((entry, index) => (
              // Usamos colores fijos para los metales (Oro, Plata, Bronce) pero el resto usa Primary
              <Cell key={`cell-${index}`} fill={
                  index === 0 ? '#F59E0B' : 
                  index === 1 ? '#94A3B8' : 
                  index === 2 ? '#B45309' : 
                  'var(--primary)'
              } />
           ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}