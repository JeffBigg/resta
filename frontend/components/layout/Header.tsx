'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUI } from '@/context/UIContext';
import { useSession, signOut } from 'next-auth/react'; // <--- IMPORTANTE

export default function Header() {
  const { toggleSidebar } = useUI();
  const { data: session, status } = useSession(); // <--- Hook para obtener datos reales
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Mientras carga la sesión, mostramos un "skeleton" o nada
  if (status === 'loading') {
    return <header className="h-16 bg-white border-b border-gray-100 sticky top-0 z-40" />;
  }

  // Datos del usuario (Si no hay sesión, usamos valores por defecto o redirigimos)
  const user = session?.user || {
    name: 'Invitado',
    email: 'invitado@fluentops.com',
    image: null
  };

  // Generamos avatar dinámico si el usuario no tiene foto propia
  const userImage = user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`;

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-4 flex items-center justify-between sticky top-0 z-40 md:px-8 shadow-sm">
      
      {/* SECCIÓN IZQUIERDA */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 md:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <h1 className="font-bold text-gray-800 text-lg md:hidden">FluentOps</h1>
      </div>

      {/* SECCIÓN DERECHA */}
      <div className="flex items-center gap-4">
        
        {/* --- DROPDOWN DE PERFIL --- */}
        <div className="relative">
          
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-1 pl-3 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all focus:outline-none"
          >
            <div className="text-right hidden md:block">
              {/* Usamos el nombre real de la sesión */}
              <p className="text-sm font-bold text-gray-700 leading-none">{user.name}</p>
              <p className="text-[10px] text-gray-500 font-medium mt-0.5">Conectado</p>
            </div>
            
            <div className="h-9 w-9 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
               <img 
                 src={userImage} 
                 alt={user.name || 'User'} 
                 className="h-full w-full object-cover"
               />
            </div>
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30 cursor-default" onClick={() => setIsDropdownOpen(false)} />
              
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Email Real */}
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                  <p className="text-sm font-bold text-gray-900">Sesión Activa</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                </div>

                <div className="py-2">
                  <Link href="/dashboard/perfil" className="flex items-center gap-3 px-6 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                     <span>👤</span> Ver Perfil
                  </Link>
                </div>

                {/* BOTÓN CERRAR SESIÓN REAL */}
                <div className="p-2 border-t border-gray-50">
                  <button 
                    onClick={() => signOut({ callbackUrl: '/login' })} // <--- ESTO CIERRA SESIÓN
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