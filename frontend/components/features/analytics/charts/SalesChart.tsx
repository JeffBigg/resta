'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Pedido } from '@/types';
import { TimeRange } from '../AnalyticsView'; // Importamos el tipo del archivo anterior

interface Props {
  pedidos: Pedido[];
  range: TimeRange;
}

export default function SalesChart({ pedidos, range }: Props) {
  
  // Agrupar datos dinámicamente según el rango
  const data = useMemo(() => {
    // CASO 1: VISTA ANUAL (Agrupar por MESES)
    if (range === 'anio' || range === 'todo') {
       const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
       const counts = new Array(12).fill(0);

       pedidos.forEach(p => {
          const d = new Date(p.createdAt);
          counts[d.getMonth()] += 1;
       });

       return months.map((m, i) => ({ name: m, pedidos: counts[i] }));
    }

    // CASO 2: VISTA MENSUAL (Agrupar por DÍA DEL MES: 1, 2, 3... 31)
    if (range === 'mes') {
       // Creamos un array del 1 al 31 (simplificado)
       const daysInMonth = 31; 
       const counts = new Array(daysInMonth).fill(0);

       pedidos.forEach(p => {
          const d = new Date(p.createdAt);
          const day = d.getDate(); // 1..31
          counts[day - 1] += 1; // Ajuste de índice
       });

       return Array.from({ length: daysInMonth }, (_, i) => ({
          name: `${i + 1}`, // Etiqueta "1", "2", "3"...
          pedidos: counts[i]
       })).filter((_, i) => i % 2 === 0); // Truco: filtramos etiquetas impares para que no se amontonen si hay poco espacio
    }

    // CASO 3: VISTA SEMANAL / HOY (Agrupar por DÍA DE LA SEMANA)
    // Default: Dom - Sáb
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const counts = new Array(7).fill(0);

    pedidos.forEach(p => {
       const d = new Date(p.createdAt);
       counts[d.getDay()] += 1;
    });

    return days.map((day, index) => ({ name: day, pedidos: counts[index] }));

  }, [pedidos, range]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#9ca3af', fontSize: 11 }} 
          dy={10}
          interval={0} // Intentar mostrar todas las etiquetas posibles
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#9ca3af', fontSize: 12 }} 
          allowDecimals={false} // No mostrar "1.5 pedidos"
        />
        <Tooltip 
          cursor={{ fill: '#f9fafb' }}
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Bar dataKey="pedidos" radius={[4, 4, 0, 0]} maxBarSize={50}>
          {data.map((entry, index) => (
            // Color diferente si es el día con más ventas
            <Cell key={`cell-${index}`} fill={entry.pedidos > 0 ? '#3b82f6' : '#e5e7eb'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}