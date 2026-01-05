import React from 'react';

interface Props {
  phone: string;
  trackingId: string;
  cliente: string;
}

export default function WhatsAppButton({ phone, trackingId, cliente }: Props) {
  // TODO: Recuerda configurar tu variable de entorno en producción
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const trackingLink = `${baseUrl}/tracking/${trackingId}`;
  
  const message = `Hola ${cliente}, tu pedido está confirmado. Sigue el estado aquí: ${trackingLink}`;
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noreferrer" 
      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md py-0.5"
      aria-label={`Enviar tracking por WhatsApp a ${cliente}`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="14" 
        height="14" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
      <span>Enviar Tracking</span>
    </a>
  );
}