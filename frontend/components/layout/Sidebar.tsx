'use client';

import { ReactNode } from 'react'; // Importamos ReactNode para tipar los iconos
import LogoutButton from '../features/auth/LogoutButton';

// 1. Definimos la interfaz para el componente principal Sidebar
interface SidebarProps {
    currentView: string;
    // Definimos que esta función recibe un string y no devuelve nada
    onChangeView: (view: string) => void; 
}

// 2. Definimos la interfaz para los botones individuales
interface SidebarItemProps {
    active: boolean;
    icon: ReactNode | string; // Puede ser un componente SVG o un emoji (string)
    label: string;
    onClick: () => void;
}

export default function Sidebar({ currentView, onChangeView }: SidebarProps) {
    return (
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-gray-100">
                <span className="text-2xl mr-2">📦</span>
                <span className="font-bold text-xl text-gray-800">FluentOps</span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
                <SidebarItem 
                    active={currentView === 'pedidos'} 
                    onClick={() => onChangeView('pedidos')}
                    icon="📋"
                    label="Pedidos & Cocina"
                />
                <SidebarItem 
                    active={currentView === 'asistencia'} 
                    onClick={() => onChangeView('asistencia')}
                    icon="⏰"
                    label="Control Asistencia"
                />
                 <SidebarItem 
                    active={currentView === 'repartidores'} 
                    onClick={() => onChangeView('repartidores')}
                    icon="🛵"
                    label="Gestión Riders"
                />
            </nav>

            <div className="p-4 border-t border-gray-100">
                 <LogoutButton />
            </div>
        </aside>
    );
}

// 3. Aplicamos la interfaz SidebarItemProps aquí para eliminar el 'any'
function SidebarItem({ active, icon, label, onClick }: SidebarItemProps) {
    return (
        <button 
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                active 
                ? 'bg-blue-50 text-blue-700 shadow-sm' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
        >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
        </button>
    )
}