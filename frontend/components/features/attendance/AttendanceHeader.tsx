import { ReporteFila, RangoFecha, descargarExcel } from '@/lib/attendance-utils';

interface Props {
    vista: 'historial' | 'reporte';
    setVista: (v: 'historial' | 'reporte') => void;
    rangoFecha: RangoFecha;
    setRangoFecha: (r: RangoFecha) => void;
    datosReporte: ReporteFila[];
    searchTerm: string;
    setSearchTerm: (s: string) => void;
}

export default function AttendanceHeader({ vista, setVista, rangoFecha, setRangoFecha, datosReporte, searchTerm, setSearchTerm }: Props) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4">
                
                <div className="mb-2 xl:mb-0">
                    <h1 className="text-2xl font-bold text-foreground tracking-tight hidden md:block">
                        {vista === 'reporte' ? 'Reporte de Gestión' : 'Monitor de Asistencia'}
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">
                        Control de horas y marcaciones en tiempo real.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    
                    {vista === 'reporte' && datosReporte.length > 0 && (
                        <button
                            onClick={() => descargarExcel(datosReporte)}
                            className="group bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
                            title="Descargar Reporte Excel"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span className="hidden sm:inline">Exportar</span>
                        </button>
                    )}

                    {vista === 'reporte' && (
                        <div className="bg-muted border border-border p-1 rounded-xl flex items-center shadow-inner overflow-x-auto max-w-full transition-colors">
                            {(['hoy', 'semana', 'mes'] as RangoFecha[]).map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRangoFecha(r)}
                                    className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold capitalize transition-all duration-200 whitespace-nowrap ${
                                        rangoFecha === r 
                                        ? 'bg-background text-foreground shadow-sm ring-1 ring-border scale-[1.02]' 
                                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="hidden xl:block w-px h-8 bg-border mx-1"></div>

                    <div className="bg-muted border border-border p-1 rounded-xl flex items-center w-full sm:w-auto transition-colors">
                        <button 
                            onClick={() => setVista('historial')} 
                            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                                vista === 'historial' 
                                ? 'bg-background text-primary shadow-sm ring-1 ring-border' 
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <span>📋</span> <span className="sm:inline">Historial</span>
                        </button>
                        <button 
                            onClick={() => setVista('reporte')} 
                            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                                vista === 'reporte' 
                                ? 'bg-background text-primary shadow-sm ring-1 ring-border' 
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <span>📊</span> <span className="sm:inline">Reporte</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">🔍</span>
                <input 
                   type="text" 
                   placeholder="Buscar empleado..." 
                   className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-card text-foreground placeholder-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
    );
}