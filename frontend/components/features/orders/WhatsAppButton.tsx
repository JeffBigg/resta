import React from 'react';

interface Props {
  phone: string;
  trackingId: string;
  cliente: string;
}

export default function WhatsAppButton({ phone, trackingId, cliente }: Props) {
  // TODO: Cuando subas a producción, cambia 'http://localhost:3000' por tu dominio real
  // O usa una variable de entorno: process.env.NEXT_PUBLIC_BASE_URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const trackingLink = `${baseUrl}/tracking/${trackingId}`;
  
  const message = `Hola ${cliente}, tu pedido está confirmado. Sigue el estado aquí: ${trackingLink}`;
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noreferrer" 
      className="text-xs text-green-600 font-bold hover:text-green-700 hover:underline flex items-center gap-1 mt-1 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
      <span>Enviar Tracking</span>
    </a>
  );
}