'use client';

import { useState } from 'react';
import { Pedido, Repartidor } from '../../../types';
import Sidebar from '../../layout/Sidebar'; 
import OrdersView from '../orders/OrdersView';
import AttendanceView from '../attendance/AttendanceView';

interface Props {
  pedidos: Pedido[];
  repartidores: Repartidor[];
}

// Definimos el tipo aquí para usarlo abajo
type ViewState = 'pedidos' | 'asistencia' | 'repartidores';

export default function DashboardClient({ pedidos, repartidores }: Props) {
  // Estado inicial
  const [currentView, setCurrentView] = useState<ViewState>('pedidos');

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* CORRECCIÓN AQUÍ:
          Usamos 'as ViewState' para decirle a TS que el string que llega es seguro.
      */}
      <Sidebar 
        currentView={currentView} 
        onChangeView={(view) => setCurrentView(view as ViewState)} 
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header Dinámico */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
            <h2 className="text-xl font-bold text-gray-800">
                {currentView === 'pedidos' && 'Torre de Control'}
                {currentView === 'asistencia' && 'Registro de Personal'}
                {currentView === 'repartidores' && 'Flota de Riders'}
            </h2>
             <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 hidden sm:block capitalize">
                    {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
            </div>
        </header>

        {/* Contenido (Vistas) */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
            
            {currentView === 'pedidos' && (
                <OrdersView pedidos={pedidos} repartidores={repartidores} />
            )}

            {currentView === 'asistencia' && (
                <AttendanceView />
            )}

             {currentView === 'repartidores' && (
                <div className="flex flex-col items-center justify-center h-96 text-gray-500 bg-white rounded-2xl border border-dashed animate-in fade-in zoom-in">
                    <span className="text-4xl mb-4">🚧</span>
                    <h3 className="text-lg font-bold text-gray-900">Módulo en Construcción</h3>
                    <p>Aquí podrás gestionar la flota, ver horarios y pagos de riders.</p>
                </div>
            )}

        </div>
      </main>
    </div>
  );
}