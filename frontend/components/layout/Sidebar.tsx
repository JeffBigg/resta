'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUI } from '@/context/UIContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useUI();

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
      {/* CORRECCIÓN DE CAPAS (Z-INDEX):
         Antes: z-20 -> Ahora: z-50
         Esto asegura que el fondo oscuro tape el Header (z-40), el FAB (z-30) y los Filtros (z-20).
      */}
      <div 
        className={`fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
      />

      {/* SIDEBAR REAL:
         Antes: z-30 -> Ahora: z-[60] (Un nivel más arriba que el overlay)
         Esto asegura que el menú esté encima de su propio fondo oscuro.
      */}
      <aside
        className={`fixed top-0 left-0 z-60 h-full w-72 bg-white border-r border-gray-100 shadow-2xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:shadow-none flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-8 border-b border-gray-50 bg-white">
          <span className="text-2xl font-black bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            FluentOps
          </span>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto bg-white">
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Principal</p>
          
          <Link href="/dashboard/pedidos" onClick={closeSidebar} className={getLinkClass('/dashboard/pedidos')}>
            <span className="text-xl">🥡</span>
            <span>Pedidos</span>
          </Link>
          
          <Link href="/dashboard/analytics" onClick={closeSidebar} className={getLinkClass('/dashboard/analytics')}>
             <span className="text-xl">📊</span>
             <span>Métricas</span>
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
        <div className="p-4 border-t border-gray-50 bg-white">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium">
            <span className="text-xl">🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}