'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUI } from '@/context/UIContext';
import { signOut } from 'next-auth/react'; 

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useUI();

  // Función para determinar estilos activos usando variables semánticas
  const getLinkClass = (path: string) => {
    const isActive = pathname.startsWith(path);
    return `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm relative overflow-hidden outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
      isActive
        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' // Activo: Usa color primario
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground' // Inactivo: Usa colores de acento
    }`;
  };

  return (
    <>
      {/* OVERLAY PARA MÓVIL */}
      <div 
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
      />

      {/* ASIDE PRINCIPAL */}
      <aside
        className={`fixed top-0 left-0 z-60 h-full w-72 bg-card border-r border-border shadow-2xl md:shadow-none transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* --- HEADER DEL SIDEBAR (LOGO) --- */}
        <div className="h-20 flex items-center px-8 border-b border-border">
          <div className="flex items-center gap-3">
            {/* Logo Icono */}
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
            </div>
            {/* Logo Texto */}
            <div className="flex flex-col">
              <span className="text-lg font-bold text-card-foreground tracking-tight leading-none">
                FluentOps
              </span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                Admin Panel
              </span>
            </div>
          </div>
        </div>

        {/* --- NAVEGACIÓN --- */}
        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto no-scrollbar">
          
          {/* GRUPO 1: PRINCIPAL */}
          <div>
            <p className="px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Operaciones
            </p>
            <div className="space-y-1">
              <Link href="/dashboard/pedidos" onClick={closeSidebar} className={getLinkClass('/dashboard/pedidos')}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                <span>Pedidos</span>
                {/* Indicador opcional de actividad */}
                {pathname.startsWith('/dashboard/pedidos') && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary-foreground/50 animate-pulse" />
                )}
              </Link>

              <Link href="/dashboard/analytics" onClick={closeSidebar} className={getLinkClass('/dashboard/analytics')}>
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                </svg>
                <span>Métricas</span>
              </Link>
            </div>
          </div>

          {/* GRUPO 2: GESTIÓN */}
          <div>
            <p className="px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Recursos Humanos
            </p>
            <div className="space-y-1">
              <Link href="/dashboard/riders" onClick={closeSidebar} className={getLinkClass('/dashboard/riders')}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                <span>Riders</span>
              </Link>

              <Link href="/dashboard/asistencia" onClick={closeSidebar} className={getLinkClass('/dashboard/asistencia')}>
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
                <span>Asistencia</span>
              </Link>
                            <Link href="/dashboard/team" onClick={closeSidebar} className={getLinkClass('/dashboard/team')}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
      <span>Equipo / Personal</span>
    </Link>
            </div>
          </div>
        </nav>

        {/* --- FOOTER DEL SIDEBAR (PERFIL) --- */}
        <div className="p-4 border-t border-border bg-muted/20">
          
          {/* Botón Cerrar Sesión */}
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="group flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 transition-transform group-hover:-translate-x-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>

      </aside>
    </>
  );
}