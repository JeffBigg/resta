'use client';

export default function AttendanceView() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Cabecera Responsive: Se apila en móvil (flex-col) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Registro de Hoy</h3>
                    <p className="text-gray-500 text-sm">Entradas y salidas.</p>
                </div>
                {/* Botones expandidos en móvil */}
                <div className="flex w-full sm:w-auto gap-3">
                    <button className="flex-1 sm:flex-none px-4 py-2 bg-green-50 text-green-700 font-bold rounded-lg hover:bg-green-100 transition-colors">
                        📷 Entrada
                    </button>
                    <button className="flex-1 sm:flex-none px-4 py-2 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 transition-colors">
                        👋 Salida
                    </button>
                </div>
            </div>

            {/* Placeholder Responsive */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-8 flex flex-col items-center justify-center text-center">
                <div className="text-4xl mb-2">📅</div>
                <p className="text-gray-500 font-medium">Tabla de asistencia cargando...</p>
                <p className="text-xs text-gray-400 mt-1">Conectando con el servidor</p>
            </div>
        </div>
    )
}