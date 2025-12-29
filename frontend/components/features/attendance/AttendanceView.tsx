'use client';

export default function AttendanceView() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Registro de Hoy</h3>
                    <p className="text-gray-500 text-sm">Entradas y salidas.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-green-50 text-green-700 font-bold rounded-lg hover:bg-green-100">📷 Entrada</button>
                    <button className="px-4 py-2 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100">👋 Salida</button>
                </div>
            </div>

            {/* Tabla Placeholder */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-6">
                <p className="text-center text-gray-500">Tabla de asistencia cargando...</p>
                {/* Aquí iría tu tabla compleja en el futuro */}
            </div>
        </div>
    )
}