'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAsistencias, Asistencia, Empleado } from '@/lib/api';
import { procesarReporte, RangoFecha } from '@/lib/attendance-utils';

import AttendanceHeader from './AttendanceHeader';
import AttendanceMobileGrid from './AttendanceMobileGrid';
import AttendanceTable from './AttendanceTable';

export default function AttendanceView() {
  const [data, setData] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);
  
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

  const datosReporte = useMemo(() => {
    return procesarReporte(data, rangoFecha).filter(f => f.empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [data, rangoFecha, searchTerm]);

  const datosHistorial = useMemo(() => {
    return data.filter(d => {
        const emp = d.empleado as unknown as Empleado | null;
        return (emp?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm]);

  return (
    // Se añade dark:bg-slate-950 y min-h-screen
    <div className="space-y-6 animate-in fade-in pb-24 md:pb-10 min-h-screen dark:bg-slate-950 transition-colors">
      
      {/* FONDO DECORATIVO (Opcional, igual que en OrdersView) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] bg-size-[24px_24px] opacity-40"></div>
      </div>

      <div className="relative z-10 space-y-6">
          <AttendanceHeader 
            vista={vista} setVista={setVista}
            rangoFecha={rangoFecha} setRangoFecha={setRangoFecha}
            datosReporte={datosReporte}
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          />

          <AttendanceMobileGrid 
            loading={loading} 
            vista={vista} 
            datosReporte={datosReporte} 
            datosHistorial={datosHistorial} 
          />

          <AttendanceTable 
            loading={loading} 
            vista={vista} 
            datosReporte={datosReporte} 
            datosHistorial={datosHistorial} 
          />
      </div>

    </div>
  );
}