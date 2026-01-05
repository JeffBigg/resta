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

export default function AttendanceTable({ loading, vista, datosReporte, datosHistorial }: Props) {
    if (loading) {
        return (
            <div className="hidden md:block bg-card rounded-xl shadow-sm border border-border p-8 text-center text-muted-foreground transition-colors">
                Cargando información...
            </div>
        );
    }

    const dataToShow = vista === 'reporte' ? datosReporte : datosHistorial;

    if (dataToShow.length === 0) {
        return (
            <div className="hidden md:block bg-card rounded-xl shadow-sm border border-border p-10 text-center text-muted-foreground transition-colors">
                Sin registros para mostrar.
            </div>
        );
    }

    return (
        <div className="hidden md:block bg-card rounded-xl shadow-sm border border-border overflow-hidden transition-colors">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-muted/40 border-b border-border">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Empleado</th>
                            {vista === 'reporte' ? (
                                <>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Horario</th>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Estado</th>
                                </>
                            ) : (
                                <>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Evento</th>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Hora</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {vista === 'reporte' 
                            ? (datosReporte).map((row) => <DesktopReportRow key={row.id} row={row} />)
                            : (datosHistorial).map((row) => <DesktopHistoryRow key={row.documentId || String(row.id)} row={row} />)
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function DesktopReportRow({ row }: { row: ReporteFila }) {
    const statusString = row.esTarde ? 'Tarde' : row.estado;

    return (
        <tr className="hover:bg-muted/50 transition-colors group">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <Avatar nombre={row.empleado.nombre} />
                    <div>
                        <p className="font-semibold text-foreground">{row.empleado.nombre}</p>
                        <p className="text-xs text-muted-foreground">{row.empleado.rol}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-muted-foreground">{row.fecha}</td>
            <td className="px-6 py-4 text-sm font-mono">
                <div className="flex flex-col gap-1">
                    <span className="text-green-600 dark:text-green-400 text-xs font-medium">IN : {formatHora(row.horaEntrada)}</span>
                    <span className="text-destructive text-xs font-medium">OUT: {formatHora(row.horaSalida)}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="font-bold text-foreground bg-muted px-2.5 py-1 rounded-md text-xs border border-border">
                    {row.tiempoTrabajadoNeto}
                </span>
            </td>
            <td className="px-6 py-4">
                <StatusBadge status={statusString} />
            </td>
        </tr>
    );
}

function DesktopHistoryRow({ row }: { row: Asistencia }) {
    const emp = row.empleado as unknown as Empleado | null;
    const nombre = emp?.nombre || 'S/N';
    return (
        <tr className="hover:bg-muted/50 transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <Avatar nombre={nombre} />
                    <span className="font-medium text-foreground">{nombre}</span>
                </div>
            </td>
            <td className="px-6 py-4"><EventBadge tipo={row.tipo} /></td>
            <td className="px-6 py-4 font-mono text-muted-foreground">
                {formatHora(new Date(row.fecha_registro))}
            </td>
        </tr>
    );
}