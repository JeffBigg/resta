'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Pedido } from '@/types';

export default function RiderPerformanceChart({ pedidos }: { pedidos: Pedido[] }) {
  
  const data = useMemo(() => {
    const riderCount: Record<string, number> = {};

    pedidos.forEach(p => {
      // Solo contamos pedidos que realmente se completaron
      if (p.status_entrega === 'Entregado' && p.repartidor) {
        // Usamos el nombre del rider o "Desconocido" si fallara
        const name = p.repartidor.nombre || 'Sin Nombre';
        
        // Cortamos nombres muy largos para que entren en el gráfico
        // Ej: "Juan Carlos Perez" -> "Juan Carlos..."
        const shortName = name.length > 12 ? name.substring(0, 12) + '..' : name;

        riderCount[shortName] = (riderCount[shortName] || 0) + 1;
      }
    });

    // Convertir a array, ordenar de mayor a menor y tomar el Top 5
    return Object.entries(riderCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 Riders

  }, [pedidos]);

  if (data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
        <span className="text-4xl mb-2">🛵</span>
        <span className="text-xs">Sin entregas registradas</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={data} 
        layout="vertical" 
        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
        <XAxis type="number" hide />
        <YAxis 
          dataKey="name" 
          type="category" 
          width={90} 
          tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 600 }} 
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
            cursor={{ fill: '#f9fafb' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number | undefined) => [`${value ?? 0} Entregas`, 'Rendimiento']}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
           {data.map((entry, index) => (
              // Top 1: Dorado, Top 2: Plata, Top 3: Bronce, Resto: Azul
              <Cell key={`cell-${index}`} fill={
                  index === 0 ? '#F59E0B' :  // Oro
                  index === 1 ? '#94A3B8' :  // Plata
                  index === 2 ? '#B45309' :  // Bronce
                  '#3b82f6'                  // Azul
              } />
           ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}