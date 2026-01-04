import { ReporteFila } from '@/lib/attendance-utils';
import { Asistencia, Empleado } from '@/lib/api';
import StatusBadge from '@/components/ui/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import { EventBadge } from '@/components/ui/EventBadge';

interface Props {
    loading: boolean;
    vista: 'historial' | 'reporte';
    datosReporte: ReporteFila[];
    datosHistorial: Asistencia[];
}

const formatHora = (date: Date | null) => date ? date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--';

export default function AttendanceMobileGrid({ loading, vista, datosReporte, datosHistorial }: Props) {
    if (loading) return <div className="p-8 text-center text-slate-400 dark:text-slate-500">Cargando datos...</div>;
    
    const dataToShow = vista === 'reporte' ? datosReporte : datosHistorial;
    
    if (dataToShow.length === 0) {
        return (
            <div className="p-10 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 dashed transition-colors">
                <p>🍃 No se encontraron registros.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-3 md:hidden">
            {vista === 'reporte' 
                ? (datosReporte).map((row) => <MobileReportCard key={row.id} row={row} />)
                : (datosHistorial).map((row) => <MobileHistoryCard key={row.documentId || String(row.id)} row={row} />)
            }
        </div>
    );
}

function MobileReportCard({ row }: { row: ReporteFila }) {
    const statusString = row.esTarde ? 'Tarde' : row.estado;

    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3 active:scale-[0.99] transition-all">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <Avatar nombre={row.empleado.nombre} />
                    <div>
                        <p className="font-bold text-slate-800 dark:text-white">{row.empleado.nombre}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{row.fecha}</p>
                    </div>
                </div>
                <StatusBadge status={statusString} />
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors">
                <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Entrada</span>
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 block text-center">
                        {formatHora(row.horaEntrada)}
                    </span>
                </div>
                <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Salida</span>
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 block text-center">
                        {formatHora(row.horaSalida)}
                    </span>
                </div>
                <div className="col-span-2 pt-2 mt-1 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Horas Efectivas</span>
                    <span className="font-bold text-slate-800 dark:text-blue-100 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded text-xs border border-blue-100 dark:border-blue-800">
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
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between active:scale-[0.99] transition-all">
            <div className="flex items-center gap-3">
                <Avatar nombre={nombre} />
                <div>
                    <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{nombre}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(row.fecha_registro).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
                <EventBadge tipo={row.tipo} />
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-transparent dark:border-slate-700">
                    {formatHora(new Date(row.fecha_registro))}
                </span>
            </div>
        </div>
    );
}