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

  // Cargar datos
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const res = await getAsistencias();
        setData(res as Asistencia[]);
      } catch (error) {
        console.error("Error cargando asistencias:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // --- LÓGICA DE VISTAS ---
  
  // 1. Datos procesados (Reporte)
  const datosReporte = useMemo((): ReporteFila[] => {
    const procesados = procesarReporte(data, rangoFecha);
    return procesados.filter(f => f.empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [data, rangoFecha, searchTerm]);

  // 2. Datos simples (Historial)
  const datosHistorial = useMemo((): Asistencia[] => {
    return data.filter(d => {
        // TypeScript seguro: casteamos empleado para acceder a nombre
        const emp = d.empleado as unknown as Empleado | null;
        const nombre = emp?.nombre || '';
        return nombre.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      
      {/* HEADER + CONTROLES */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
            <p className="text-slate-500 text-sm">
                Control de asistencia y horas trabajadas.
            </p>
        </div>

        <div className="flex flex-wrap gap-2">
            
            {/* BOTÓN EXCEL (Solo en vista reporte y si hay datos) */}
            {vista === 'reporte' && datosReporte.length > 0 && (
                <button
                    onClick={() => descargarExcel(datosReporte)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                >
                    📥 Excel
                </button>
            )}

            {/* Selector de Rango (Solo visible en reporte) */}
            {vista === 'reporte' && (
                <div className="bg-white border border-slate-200 rounded-lg flex overflow-hidden">
                    {(['hoy', 'semana', 'mes'] as RangoFecha[]).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRangoFecha(r)}
                            className={`px-4 py-2 text-sm font-medium capitalize ${
                                rangoFecha === r ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            )}

            {/* Switch Vista */}
            <div className="bg-slate-100 p-1 rounded-lg flex border border-slate-200">
                <button onClick={() => setVista('historial')} className={`px-4 py-2 rounded text-sm font-bold ${vista === 'historial' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>
                    📋 Historial
                </button>
                <button onClick={() => setVista('reporte')} className={`px-4 py-2 rounded text-sm font-bold ${vista === 'reporte' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>
                    📊 Reporte
                </button>
            </div>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="relative">
         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
         <input 
           type="text" 
           placeholder="Buscar empleado..." 
           className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
         />
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Empleado</th>
                        {vista === 'reporte' ? (
                            <>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Fecha</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Marcaciones</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Refrigerio</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Horas Netas</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estado</th>
                            </>
                        ) : (
                            <>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Evento</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Hora</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Fecha</th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loading ? (
                         <tr><td colSpan={6} className="p-8 text-center">Cargando datos...</td></tr>
                    ) : (vista === 'reporte' ? datosReporte : datosHistorial).length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-400">Sin registros.</td></tr>
                    ) : (
                        // RENDERIZADO CONDICIONAL TIPADO
                        vista === 'reporte' 
                        ? (datosReporte).map((row) => (
                            <ReporteRow key={row.id} row={row} />
                        ))
                        : (datosHistorial).map((row) => (
                            // Usamos row.id o documentId, y aseguramos el fallback
                            <HistorialRow key={row.documentId || String(row.id)} row={row} />
                        ))
                    )}
                </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

// --- SUBCOMPONENTES ESTRICTOS (SIN ANY) ---

function ReporteRow({ row }: { row: ReporteFila }) {
    const tiempoRefri = row.tiempoRefrigerio > 0 
        ? `${Math.floor(row.tiempoRefrigerio / 60000)} min` 
        : '-';

    return (
        <tr className="hover:bg-slate-50">
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
                    <span className="text-green-600 text-xs">IN : {formatHora(row.horaEntrada)}</span>
                    <span className="text-red-600 text-xs">OUT: {formatHora(row.horaSalida)}</span>
                </div>
            </td>
            <td className="px-6 py-4 text-center text-sm text-slate-500">
                {tiempoRefri}
            </td>
            <td className="px-6 py-4">
                <span className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded text-xs">
                    {row.tiempoTrabajadoNeto}
                </span>
            </td>
            <td className="px-6 py-4">
                <BadgeEstado estado={row.estado} esTarde={row.esTarde} />
            </td>
        </tr>
    );
}

function HistorialRow({ row }: { row: Asistencia }) {
    // Extracción segura del empleado
    const emp = row.empleado as unknown as Empleado | null;
    const nombre = emp?.nombre || 'Desconocido';
    const rol = emp?.rol_operativo || 'Sin Rol';

    return (
        <tr className="hover:bg-slate-50">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <Avatar nombre={nombre} />
                    <span className="font-medium text-slate-700">{nombre} ({rol})</span>
                </div>
            </td>
            <td className="px-6 py-4"><BadgeEvento tipo={row.tipo} /></td>
            <td className="px-6 py-4 font-mono text-slate-600">
                {formatHora(new Date(row.fecha_registro))}
            </td>
            <td className="px-6 py-4 text-sm text-slate-500">
                {new Date(row.fecha_registro).toLocaleDateString()}
            </td>
        </tr>
    );
}

// --- HELPERS VISUALES ---

const formatHora = (date: Date | null) => date ? date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--';

const Avatar = ({ nombre }: { nombre: string }) => (
    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
        {nombre.charAt(0).toUpperCase()}
    </div>
);

const BadgeEstado = ({ estado, esTarde }: { estado: string, esTarde: boolean }) => {
    let classes = 'bg-gray-100 text-gray-600 border-gray-200';
    if (esTarde) classes = 'bg-red-100 text-red-700 border-red-200';
    else if (estado === 'Puntual') classes = 'bg-green-100 text-green-700 border-green-200';
    else if (estado === 'Falta Salida') classes = 'bg-yellow-100 text-yellow-700 border-yellow-200';

    return <span className={`px-2 py-1 rounded text-xs font-bold border ${classes}`}>{esTarde ? 'TARDE' : estado}</span>;
};

const BadgeEvento = ({ tipo }: { tipo: string }) => {
    const map: Record<string, string> = { 
        entrada: '🔵 Entrada', 
        salida: '🔴 Salida', 
        inicio_refrigerio: '🍔 Sale Refri', 
        fin_refrigerio: '▶️ Vuelve Refri' 
    };
    return <span className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-full">{map[tipo] || tipo}</span>;
};