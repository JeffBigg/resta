import React from 'react';

interface Props {
  status: string;
}

const STYLES: Record<string, string> = {
  'En_ruta': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Entregado': 'bg-green-100 text-green-800 border-green-200',
  'Cocina': 'bg-red-100 text-red-800 border-red-200',
  'Listo_para_recoger': 'bg-blue-100 text-blue-800 border-blue-200',
  'Cancelado': 'bg-gray-100 text-gray-500 border-gray-200 line-through',
  'Disponible': 'bg-emerald-100 text-emerald-800 border-emerald-200', // Agregado para riders
  'Ocupado': 'bg-orange-100 text-orange-800 border-orange-200',       // Agregado para riders
};

export default function StatusBadge({ status }: Props) {
  const cleanStatus = status?.replace(/_/g, ' ') || 'PENDIENTE';
  const styleClass = STYLES[status] || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${styleClass}`}>
      {cleanStatus}
    </span>
  );
}