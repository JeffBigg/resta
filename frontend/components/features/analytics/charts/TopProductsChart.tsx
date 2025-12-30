'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Pedido } from '@/types';
import { TimeRange } from '../AnalyticsView';

interface Props {
  pedidos: Pedido[];
  range: TimeRange;
}

export default function TopProductsChart({ pedidos }: Props) {
  
  const data = useMemo(() => {
    const productCount: Record<string, number> = {};

    pedidos.forEach(p => {
      // Asumimos que en el formulario los items se separan por coma
      // Ej: "1 Pollo, 2 Papas, 1 Inka Kola"
      const items = p.detalle_pedido.items || [];
      
      // Si items es un string (por compatibilidad con tu código actual), lo spliteamos
      const itemsArray = Array.isArray(items) ? items : (items as string).split(',');

      itemsArray.forEach((itemRaw: string) => {
         const item = itemRaw.trim().toLowerCase();
         // Lógica simple para agrupar (puedes mejorarla luego con IA o IDs)
         if (item) {
            // Capitalizar primera letra para que se vea bonito
            const cleanName = item.charAt(0).toUpperCase() + item.slice(1);
            productCount[cleanName] = (productCount[cleanName] || 0) + 1;
         }
      });
    });

    // Convertir a array, ordenar y tomar el Top 5
    return Object.entries(productCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Solo los 5 mejores

  }, [pedidos]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
        <XAxis type="number" hide />
        <YAxis 
          dataKey="name" 
          type="category" 
          width={100} 
          tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 600 }} 
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
            cursor={{ fill: '#f9fafb' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
           {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? '#F59E0B' : '#3b82f6'} /> // El Top 1 en Dorado/Ambar
           ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}