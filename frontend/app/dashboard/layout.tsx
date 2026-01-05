import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { UIProvider } from '@/context/UIContext';
// IMPORTAMOS EL VIGILANTE
import OrderPoller from '@/components/providers/OrderPoller'; 

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UIProvider>
      <div className="flex h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
        
        {/* Sidebar Fijo */}
        <Sidebar />

        {/* Columna Derecha */}
        <div className="flex-1 flex flex-col h-full relative">
          
          <Header />

          {/* 🔥 AQUÍ INYECTAMOS EL VIGILANTE */}
          {/* Al estar aquí, se ejecuta en segundo plano sin importar qué vista cargue el usuario */}
          <OrderPoller />

          <main className="flex-1 overflow-y-auto scroll-smooth">
            <div className="animate-in fade-in duration-500 min-h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </UIProvider>
  );
}