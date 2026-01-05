'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useUI } from '@/context/UIContext';
import dynamic from 'next/dynamic';

const ThemeToggle = dynamic(() => import('@/components/ui/ThemeToggle'), {
  ssr: false,
  loading: () => <div className="w-9 h-9" />,
});

// --- CONFIGURACIÓN DE TÍTULOS E ICONOS ---
const getPageConfig = (path: string) => {
  const configs: Record<string, { title: string; icon: React.ReactNode }> = {
    '/dashboard/pedidos': { 
      title: 'Torre de Control', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      )
    },
    '/dashboard/analytics': { 
      title: 'Panel de Métricas', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
        </svg>
      )
    },
    '/dashboard/riders': { 
      title: 'Gestión de Flota', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      )
    },
    '/dashboard/asistencia': { 
      title: 'Control de Asistencia', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    '/dashboard/perfil': { 
      title: 'Mi Perfil', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  };

  return configs[path] || { 
    title: 'Panel de Control', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ) 
  };
};

export default function Header() {
  const { toggleSidebar } = useUI();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dateString, setDateString] = useState<string>('');

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const fecha = now.toLocaleDateString('es-PE', options);
      setDateString(fecha.charAt(0).toUpperCase() + fecha.slice(1));
    };
    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  const currentInfo = getPageConfig(pathname);

  const user = session?.user || {
    name: 'Invitado',
    email: 'invitado@fluentops.com',
    image: null
  };
  const userImage = user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}&backgroundColor=2563eb&textColor=ffffff`;

  return (
    // 🔥 CORREGIDO: Cambiado 'bg-background' por 'bg-card' para coincidir con el Sidebar
    <header className="h-20 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 bg-card border-b border-border transition-colors duration-300">
      
      {/* --- IZQUIERDA --- */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden focus:outline-none active:scale-95 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-accent text-primary border border-border shadow-sm">
             {currentInfo.icon}
          </div>
          <div className="flex flex-col">
             <h1 className="font-bold text-foreground text-lg md:text-xl tracking-tight leading-none">
               {currentInfo.title}
             </h1>
             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden md:block mt-1">
               FluentOps Dashboard
             </span>
          </div>
        </div>
      </div>

      {/* --- DERECHA --- */}
      <div className="flex items-center gap-4 md:gap-6">
        
        <div className="hidden lg:flex flex-col items-end text-right border-r border-border pr-6 h-10 justify-center">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Hoy
            </span>
            <span className="text-sm font-semibold text-foreground capitalize">
                {dateString || 'Cargando...'}
            </span>
        </div>

        <ThemeToggle />

        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-1 pl-3 rounded-full hover:bg-accent border border-transparent hover:border-border transition-all focus:outline-none group"
          >
            <div className="text-right hidden md:block">
              {status === 'loading' ? (
                <div className="h-8 w-24 bg-muted rounded animate-pulse" />
              ) : (
                <>
                  <p className="text-sm font-bold text-foreground leading-none group-hover:text-primary transition-colors">
                    {user.name}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Online</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="h-10 w-10 rounded-full p-0.5 bg-linear-to-tr from-blue-500 to-indigo-500 shadow-md group-hover:shadow-primary/25 transition-all">
               <div className="h-full w-full rounded-full overflow-hidden bg-card border-2 border-card">
                 <img 
                   src={userImage}  
                   alt="User" 
                   className="h-full w-full object-cover"
                 />
               </div>
            </div>
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30 cursor-default" onClick={() => setIsDropdownOpen(false)} />
              
              <div className="absolute right-0 mt-3 w-72 bg-popover text-popover-foreground rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/50 border border-border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                
                <div className="px-6 py-5 border-b border-border bg-muted/30">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Conectado como</p>
                  <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">{user.email}</p>
                </div>

                <div className="p-2">
                  <Link 
                    href="/dashboard/perfil" 
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground rounded-xl hover:bg-accent hover:text-primary transition-colors"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      Mi Perfil
                  </Link>
                  
                  <div className="my-1 border-t border-border mx-2" />

                  <button 
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10 rounded-xl transition-colors group"
                  >
                    <div className="p-1.5 bg-destructive/10 text-destructive rounded-lg group-hover:bg-destructive/20 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                      </svg>
                    </div>
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