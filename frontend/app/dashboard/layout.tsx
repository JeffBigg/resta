import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { UIProvider } from '@/context/UIContext'; // Asegúrate de haber creado este archivo antes

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 1. UIProvider permite que el botón hamburguesa se comunique con el Sidebar
    <UIProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        
        {/* 2. SIDEBAR: Se queda fijo a la izquierda */}
        {/* Nota: El componente Sidebar maneja su propia responsividad (ocultarse en móvil) */}
        <Sidebar />

        {/* 3. ÁREA PRINCIPAL: Columna derecha */}
        <div className="flex-1 flex flex-col h-full relative">
          
          {/* Header arriba */}
          <Header />

          {/* Contenido cambiante (Tus páginas: Pedidos, Riders, etc) */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
            <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
              {children}
            </div>
          </main>
        </div>
      </div>
    </UIProvider>
  );
}