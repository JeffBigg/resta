'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAsistencias, Asistencia, Empleado } from '@/lib/api';
import { procesarReporte, ReporteFila, RangoFecha, descargarExcel } from '@/lib/attendance-utils';

export default function AsistenciaPage() {
  const [data, setData] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [vista, setVista] = useState<'historial' | 'reporte'>('historial');
  const [rangoFecha, setRangoFecha] = useState<RangoFecha>('hoy');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const res = await getAsistencias();
        setData(res as Asistencia[]);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    init();
  }, []);

  // --- LÓGICA DE DATOS ---
  const datosReporte = useMemo(() => {
    return procesarReporte(data, rangoFecha).filter(f => f.empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [data, rangoFecha, searchTerm]);

  const datosHistorial = useMemo(() => {
    return data.filter(d => {
        const emp = d.empleado as unknown as Empleado | null;
        return (emp?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm]);

  // Selección de datos a mostrar
  const dataToShow = vista === 'reporte' ? datosReporte : datosHistorial;

  return (
    <div className="space-y-6 animate-in fade-in pb-24 md:pb-10">
      
      {/* =======================================================
          HEADER MEJORADO Y RESPONSIVE 
         ======================================================= */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4">
        
        {/* TÍTULO Y DESCRIPCIÓN */}
        <div className="mb-2 xl:mb-0">
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight hidden md:block">
              {vista === 'reporte' ? 'Reporte de Gestión' : 'Monitor de Asistencia'}
           </h1>
           <p className="text-slate-500 text-sm font-medium">
              Control de horas y marcaciones en tiempo real.
           </p>
        </div>

        {/* BARRA DE HERRAMIENTAS MODERNA */}
        {/* Usamos flex-wrap para que en móviles pequeños bajen ordenadamente */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            
            {/* 1. BOTÓN EXCEL (Solo Reporte) */}
            {vista === 'reporte' && datosReporte.length > 0 && (
                <button
                    onClick={() => descargarExcel(datosReporte)}
                    className="group bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2 border border-emerald-600"
                    title="Descargar Reporte Excel"
                >
                    {/* Icono Excel Simple */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="hidden sm:inline">Exportar</span>
                </button>
            )}

            {/* 2. FILTRO DE RANGO (Estilo Segmented Control) */}
            {vista === 'reporte' && (
                <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 shadow-inner overflow-x-auto max-w-full">
                    {(['hoy', 'semana', 'mes'] as RangoFecha[]).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRangoFecha(r)}
                            className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold capitalize transition-all duration-200 whitespace-nowrap ${
                                rangoFecha === r 
                                ? 'bg-white text-slate-800 shadow-sm ring-1 ring-black/5 scale-[1.02]' 
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            )}

            {/* SEPARADOR VERTICAL (Solo Desktop) */}
            <div className="hidden xl:block w-px h-8 bg-slate-200 mx-1"></div>

            {/* 3. SWITCH VISTA (Historial / Reporte) */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 w-full sm:w-auto">
                <button 
                    onClick={() => setVista('historial')} 
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                        vista === 'historial' 
                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <span>📋</span> <span className="sm:inline">Historial</span>
                </button>
                <button 
                    onClick={() => setVista('reporte')} 
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                        vista === 'reporte' 
                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <span>📊</span> <span className="sm:inline">Reporte</span>
                </button>
            </div>
        </div>
      </div>

      {/* BUSCADOR ESTILIZADO */}
      <div className="relative group">
         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">🔍</span>
         <input 
           type="text" 
           placeholder="Buscar empleado..." 
           className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white transition-all"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
         />
      </div>

      {/* --- CONTENIDO RESPONSIVE (Tarjetas Móvil / Tabla PC) --- */}

      {/* VISTA MÓVIL (GRID TARJETAS) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
         {loading ? (
             <div className="p-8 text-center text-slate-400">Cargando datos...</div>
         ) : dataToShow.length === 0 ? (
             <div className="p-10 text-center text-slate-400 bg-white rounded-xl border border-slate-200 dashed">
                <p>🍃 No se encontraron registros.</p>
             </div>
         ) : (
             vista === 'reporte' 
             ? (datosReporte).map((row) => <MobileReportCard key={row.id} row={row} />)
             : (datosHistorial).map((row) => <MobileHistoryCard key={row.documentId || String(row.id)} row={row} />)
         )}
      </div>

      {/* VISTA DESKTOP (TABLA) */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Empleado</th>
                        {vista === 'reporte' ? (
                            <>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Horario</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                            </>
                        ) : (
                            <>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Evento</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Hora</th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loading ? (
                         <tr><td colSpan={6} className="p-8 text-center text-slate-500">Cargando información...</td></tr>
                    ) : dataToShow.length === 0 ? (
                        <tr><td colSpan={6} className="p-10 text-center text-slate-400">Sin registros para mostrar.</td></tr>
                    ) : (
                        vista === 'reporte' 
                        ? (datosReporte).map((row) => <DesktopReportRow key={row.id} row={row} />)
                        : (datosHistorial).map((row) => <DesktopHistoryRow key={row.documentId || String(row.id)} row={row} />)
                    )}
                </tbody>
            </table>
         </div>
      </div>

    </div>
  );
}

// =======================================================
// 📱 COMPONENTES AUXILIARES (Sin Cambios)
// =======================================================

function MobileReportCard({ row }: { row: ReporteFila }) {
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-3 active:scale-[0.99] transition-transform">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <Avatar nombre={row.empleado.nombre} />
                    <div>
                        <p className="font-bold text-slate-800">{row.empleado.nombre}</p>
                        <p className="text-xs text-slate-400">{row.fecha}</p>
                    </div>
                </div>
                <BadgeEstado estado={row.estado} esTarde={row.esTarde} />
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Entrada</span>
                    <span className="font-mono font-medium text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                        {formatHora(row.horaEntrada)}
                    </span>
                </div>
                <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Salida</span>
                    <span className="font-mono font-medium text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                        {formatHora(row.horaSalida)}
                    </span>
                </div>
                <div className="col-span-2 pt-2 mt-1 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-medium">Horas Efectivas</span>
                    <span className="font-bold text-slate-800 bg-blue-50 px-2 py-0.5 rounded text-xs border border-blue-100">
                        {row.tiempoTrabajadoNeto}
                    </span>
                </div>
            </div>
        </div>
    );
}

function MobileHistoryCard({ row }: { row: Asistencia }) {
    const emp = row.empleado as unknown as Empleado | null;
    const nombre = emp?.nombre || 'S/N';

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform">
            <div className="flex items-center gap-3">
                <Avatar nombre={nombre} />
                <div>
                    <p className="font-bold text-slate-700 text-sm">{nombre}</p>
                    <p className="text-xs text-slate-400">{new Date(row.fecha_registro).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
                <BadgeEvento tipo={row.tipo} />
                <span className="font-mono text-xs text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">
                    {formatHora(new Date(row.fecha_registro))}
                </span>
            </div>
        </div>
    );
}

// =======================================================
// 💻 COMPONENTES TABLA (Sin Cambios)
// =======================================================

function DesktopReportRow({ row }: { row: ReporteFila }) {
    return (
        <tr className="hover:bg-slate-50 transition-colors group">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <Avatar nombre={row.empleado.nombre} />
                    <div>
                        <p className="font-semibold text-slate-700">{row.empleado.nombre}</p>
                        <p className="text-xs text-slate-400">{row.empleado.rol}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-slate-600">{row.fecha}</td>
            <td className="px-6 py-4 text-sm font-mono">
                <div className="flex flex-col gap-1">
                    <span className="text-green-600 text-xs font-medium">IN : {formatHora(row.horaEntrada)}</span>
                    <span className="text-red-600 text-xs font-medium">OUT: {formatHora(row.horaSalida)}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md text-xs border border-slate-200">
                    {row.tiempoTrabajadoNeto}
                </span>
            </td>
            <td className="px-6 py-4">
                <BadgeEstado estado={row.estado} esTarde={row.esTarde} />
            </td>
        </tr>
    );
}

function DesktopHistoryRow({ row }: { row: Asistencia }) {
    const emp = row.empleado as unknown as Empleado | null;
    const nombre = emp?.nombre || 'S/N';
    return (
        <tr className="hover:bg-slate-50 transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <Avatar nombre={nombre} />
                    <span className="font-medium text-slate-700">{nombre}</span>
                </div>
            </td>
            <td className="px-6 py-4"><BadgeEvento tipo={row.tipo} /></td>
            <td className="px-6 py-4 font-mono text-slate-600">
                {formatHora(new Date(row.fecha_registro))}
            </td>
        </tr>
    );
}

// --- HELPERS (Estilizados ligeramente) ---

const formatHora = (date: Date | null) => date ? date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--';

const Avatar = ({ nombre }: { nombre: string }) => (
    <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200 shadow-sm">
        {nombre.charAt(0).toUpperCase()}
    </div>
);

const BadgeEstado = ({ estado, esTarde }: { estado: string, esTarde: boolean }) => {
    let classes = 'bg-gray-100 text-gray-600 border-gray-200';
    if (esTarde) classes = 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-100';
    else if (estado === 'Puntual') classes = 'bg-green-50 text-green-700 border-green-200 ring-1 ring-green-100';
    else if (estado === 'Falta Salida') classes = 'bg-yellow-50 text-yellow-700 border-yellow-200 ring-1 ring-yellow-100';

    return <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wide font-bold border ${classes}`}>{esTarde ? 'TARDE' : estado}</span>;
};

const BadgeEvento = ({ tipo }: { tipo: string }) => {
    const map: Record<string, string> = { 
        entrada: '🔵 Entrada', 
        salida: '🔴 Salida', 
        inicio_refrigerio: '🍔 Refri', 
        fin_refrigerio: '▶️ Vuelve' 
    };
    return <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-full shadow-sm">{map[tipo] || tipo}</span>;
};