'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUI } from '@/context/UIContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useUI();

  // Función para estilizar los links activos vs inactivos
  const getLinkClass = (path: string) => {
    const isActive = pathname.startsWith(path);
    return `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium group ${
      isActive
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
    }`;
  };

  return (
    <>
      {/* 1. OVERLAY (Fondo oscuro en móvil cuando abres menú) */}
      <div 
        className={`fixed inset-0 z-20 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
      />

      {/* 2. EL SIDEBAR REAL */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-72 bg-white border-r border-gray-100 shadow-xl md:shadow-none transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-8 border-b border-gray-50">
          <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            FluentOps
          </span>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Principal</p>
          
          <Link href="/dashboard/pedidos" onClick={closeSidebar} className={getLinkClass('/dashboard/pedidos')}>
            <span className="text-xl">🥡</span>
            <span>Pedidos</span>
          </Link>

          <Link href="/dashboard/tracking" onClick={closeSidebar} className={getLinkClass('/dashboard/tracking')}>
             <span className="text-xl">🗺️</span>
             <span>Tracking</span>
          </Link>

          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-8">Gestión</p>

          <Link href="/dashboard/riders" onClick={closeSidebar} className={getLinkClass('/dashboard/riders')}>
            <span className="text-xl">🛵</span>
            <span>Riders</span>
          </Link>

          <Link href="/dashboard/asistencia" onClick={closeSidebar} className={getLinkClass('/dashboard/asistencia')}>
            <span className="text-xl">⏰</span>
            <span>Asistencia</span>
          </Link>
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-4 border-t border-gray-50">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium">
            <span className="text-xl">🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}