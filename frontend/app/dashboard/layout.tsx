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
      {/* 🔥 CORRECCIÓN CLAVE: 
          Cambiamos 'bg-slate-50' por 'bg-background text-foreground'.
          Ahora el fondo reacciona automáticamente al tema (claro/oscuro).
      */}
      <div className="flex h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
        
        {/* Sidebar Fijo */}
        <Sidebar />

        {/* Columna Derecha */}
        <div className="flex-1 flex flex-col h-full relative">
          
          <Header />

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