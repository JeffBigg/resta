interface Metrics {
  total: number;
  entregados: number;
  cancelados: number;
  successRate: string;
  ventasTotales: number;
}

// ✅ NUEVA INTERFAZ: Definimos exactamente qué recibe cada tarjeta
interface KPICardProps {
  title: string;
  value: string | number; // Puede ser texto ("S/ 100") o número (15)
  icon: string;
  subValue?: string;      // ? significa Opcional
  trend?: string;         // ? Opcional
  trendColor?: string;    // ? Opcional
  isDanger?: boolean;     // ? Opcional
}

export default function StatsGrid({ metrics }: { metrics: Metrics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <KPICard 
        title="Ventas Estimadas" 
        value={`S/ ${metrics.ventasTotales.toLocaleString()}`} 
        icon="💰" 
        trend="+12% vs ayer"
        trendColor="text-green-500 dark:text-green-400"
      />
      
      <KPICard 
        title="Pedidos Totales" 
        value={metrics.total} 
        icon="📦" 
      />

      <KPICard 
        title="Entregas Exitosas" 
        value={metrics.entregados} 
        icon="🚀" 
        subValue={`${metrics.successRate}% tasa de éxito`}
      />

      <KPICard 
        title="Cancelados" 
        value={metrics.cancelados} 
        icon="⚠️" 
        trendColor="text-red-500 dark:text-red-400"
        isDanger
      />
    </div>
  );
}

// ✅ APLICAMOS LA INTERFAZ AQUÍ (Adiós al 'any')
function KPICard({ title, value, icon, subValue, trend, trendColor, isDanger }: KPICardProps) {
  return (
    <div className={`
      p-5 rounded-2xl border transition-all hover:shadow-md 
      ${isDanger 
        ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' 
        : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800'
      }
    `}>
      <div className="flex justify-between items-start mb-2">
        <span className={`
            p-2 rounded-lg text-xl shadow-sm transition-colors
            ${isDanger 
                ? 'bg-white/50 dark:bg-red-900/20' 
                : 'bg-white/50 dark:bg-slate-800'
            }
        `}>
            {icon}
        </span>
        
        {trend && (
            <span className={`
                text-xs font-bold px-2 py-1 rounded-full shadow-sm transition-colors
                ${trendColor || 'text-gray-500 dark:text-slate-400'} 
                bg-white dark:bg-slate-800
            `}>
                {trend}
            </span>
        )}
      </div>
      
      <p className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wide transition-colors">
        {title}
      </p>
      
      <h4 className={`
        text-2xl font-black mt-1 transition-colors
        ${isDanger 
            ? 'text-red-600 dark:text-red-400' 
            : 'text-gray-800 dark:text-white'
        }
      `}>
        {value}
      </h4>
      
      {subValue && (
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 font-medium transition-colors">
            {subValue}
        </p>
      )}
    </div>
  );
}