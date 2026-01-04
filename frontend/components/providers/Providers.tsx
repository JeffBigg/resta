'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { UIProvider } from '@/context/UIContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* Configuración del Modo Oscuro:
         - attribute="class": Cambia la clase en el tag <html> (vital para tu Tailwind v4).
         - defaultTheme="system": Respeta la configuración del SO del usuario por defecto.
         - enableSystem: Permite cambiar automáticamente si el usuario cambia su SO.
      */}
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        {/* Contexto de Interfaz (Sidebar, Modales globales, etc) */}
        <UIProvider>
          {children}
        </UIProvider>
      </NextThemesProvider>
    </SessionProvider>
  );
}