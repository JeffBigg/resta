'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useUI } from '@/context/UIContext';

// Configuración de Títulos por Ruta
const PAGE_TITLES: Record<string, { title: string; icon: string }> = {
  '/dashboard/pedidos':     { title: 'Torre de Control', icon: '🥡' },
  '/dashboard/analytics':   { title: 'Panel de Métricas', icon: '📊' },
  '/dashboard/riders':      { title: 'Gestión de Flota', icon: '🛵' },
  '/dashboard/asistencia':  { title: 'Control de Asistencia', icon: '⏰' },
  '/dashboard/perfil':      { title: 'Mi Perfil', icon: '👤' },
  'default':                { title: 'Panel de Control', icon: '⚡' }
};

export default function Header() {
  const { toggleSidebar } = useUI();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // ESTADO PARA LA FECHA
  const [dateString, setDateString] = useState<string>('');

  // LÓGICA DE FECHA AUTOMÁTICA
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      // Formato: "martes, 30 de diciembre de 2025"
      const fecha = now.toLocaleDateString('es-PE', options);
      // Capitalizar la primera letra: "Martes..."
      setDateString(fecha.charAt(0).toUpperCase() + fecha.slice(1));
    };

    updateDate(); // Carga inicial

    // Actualizar cada minuto para asegurar que cambie si pasa la medianoche
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  const currentInfo = PAGE_TITLES[pathname] || PAGE_TITLES['default'];

  const user = session?.user || {
    name: 'Invitado',
    email: 'invitado@fluentops.com',
    image: null
  };
  const userImage = user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`;

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-4 flex items-center justify-between sticky top-0 z-40 md:px-8 shadow-sm transition-all">
      
      {/* --- IZQUIERDA: HAMBURGUESA + TÍTULO --- */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 md:hidden focus:outline-none active:scale-95 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
          <span className="text-xl md:text-2xl">{currentInfo.icon}</span>
          <h1 className="font-bold text-gray-800 text-lg md:text-xl tracking-tight">
            {currentInfo.title}
          </h1>
        </div>
      </div>

      {/* --- DERECHA: FECHA + PERFIL --- */}
      <div className="flex items-center gap-4 md:gap-6">
        
        {/* FECHA DINÁMICA (Oculta en móviles muy pequeños) */}
        <div className="hidden lg:flex flex-col items-end text-right border-r border-gray-100 pr-6">

            <span className="text-sm font-medium text-gray-600 capitalize">
                {dateString || 'Cargando...'}
            </span>
        </div>

        {/* DROPDOWN PERFIL */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-1 pl-3 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all focus:outline-none"
          >
            <div className="text-right hidden md:block">
              {status === 'loading' ? (
                <div className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
              ) : (
                <>
                  <p className="text-sm font-bold text-gray-700 leading-none">{user.name}</p>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5">Conectado</p>
                </>
              )}
            </div>
            
            <div className="h-9 w-9 rounded-full overflow-hidden border border-gray-200 bg-gray-100 shadow-sm relative">
               <img 
                 src={userImage}  
                 alt="User" 
                 className="h-full w-full object-cover"
               />
               {/* Puntito verde de estado online */}
               <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-400"></span>
            </div>
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30 cursor-default" onClick={() => setIsDropdownOpen(false)} />
              
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                  <p className="text-sm font-bold text-gray-900">Sesión Activa</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                </div>

                <div className="py-2">
                  <Link href="/dashboard/perfil" className="flex items-center gap-3 px-6 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                     <span>👤</span> Ver Perfil
                  </Link>
                </div>

                <div className="p-2 border-t border-gray-50">
                  <button 
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}