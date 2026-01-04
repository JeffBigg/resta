import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { UIProvider } from '@/context/UIContext'; 

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UIProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        
        {/* Sidebar Fijo */}
        <Sidebar />

        {/* Columna Derecha */}
        <div className="flex-1 flex flex-col h-full relative">
          
          <Header />

          {/* CORRECCIÓN CLAVE AQUÍ:
             1. Quitamos 'p-4 md:p-8' para permitir diseños full-width.
             2. Mantenemos 'overflow-y-auto' para el scroll.
          */}
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