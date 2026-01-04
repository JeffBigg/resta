import React from 'react';

interface Props {
  status: string;
  className?: string; // Agregado para flexibilidad extra si se necesita
}

const STYLES: Record<string, string> = {
  // Pedidos
  'En_ruta': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Entregado': 'bg-green-100 text-green-800 border-green-200',
  'Cocina': 'bg-red-100 text-red-800 border-red-200',
  'Listo_para_recoger': 'bg-blue-100 text-blue-800 border-blue-200',
  'Cancelado': 'bg-gray-100 text-gray-500 border-gray-200 line-through',
  
  // Riders
  'Disponible': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Ocupado': 'bg-orange-100 text-orange-800 border-orange-200',

  // Asistencia (NUEVOS) 🕒
  'Puntual': 'bg-green-50 text-green-700 border-green-200 ring-1 ring-green-100',
  'Tarde': 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-100',
  'Falta Salida': 'bg-yellow-50 text-yellow-700 border-yellow-200 ring-1 ring-yellow-100',
};

export default function StatusBadge({ status, className = '' }: Props) {
  const cleanStatus = status?.replace(/_/g, ' ') || 'PENDIENTE';
  const styleClass = STYLES[status] || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${styleClass} ${className}`}>
      {cleanStatus}
    </span>
  );
}