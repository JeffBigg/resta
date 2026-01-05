interface Metrics {
  total: number;
  entregados: number;
  cancelados: number;
  successRate: string;
  ventasTotales: number;
}

interface KPICardProps {
  title: string;
  value: string | number;
  icon: string;
  subValue?: string;
  trend?: string;
  trendColor?: string;
  isDanger?: boolean;
}

export default function StatsGrid({ metrics }: { metrics: Metrics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      
      <KPICard 
        title="Ventas Estimadas" 
        value={`S/ ${metrics.ventasTotales.toLocaleString()}`} 
        icon="💰" 
        trend="+12% vs ayer"
        trendColor="text-emerald-600 dark:text-emerald-400"
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
        // Usamos variables semánticas para error (destructive)
        trendColor="text-destructive"
        isDanger
      />
    </div>
  );
}

function KPICard({ title, value, icon, subValue, trend, trendColor, isDanger }: KPICardProps) {
  return (
    <div className={`
      p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg
      ${isDanger 
        ? 'bg-destructive/5 border-destructive/20 hover:shadow-destructive/10' // Estado Peligro (Rojo suave)
        : 'bg-card border-border hover:shadow-black/5 dark:hover:shadow-black/20' // Estado Normal
      }
    `}>
      <div className="flex justify-between items-start mb-3">
        <span className={`
            p-2.5 rounded-xl text-xl shadow-sm transition-colors
            ${isDanger 
                ? 'bg-background text-destructive' 
                : 'bg-primary/10 text-primary' // Icono usa color primario suave
            }
        `}>
            {icon}
        </span>
        
        {trend && (
            <span className={`
                text-xs font-bold px-2.5 py-1 rounded-full shadow-sm transition-colors
                ${trendColor || 'text-muted-foreground'} 
                bg-background border border-border
            `}>
                {trend}
            </span>
        )}
      </div>
      
      <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider transition-colors">
        {title}
      </p>
      
      <h4 className={`
        text-2xl font-black mt-1 transition-colors
        ${isDanger 
            ? 'text-destructive' 
            : 'text-card-foreground'
        }
      `}>
        {value}
      </h4>
      
      {subValue && (
        <p className="text-xs text-muted-foreground/80 mt-2 font-medium transition-colors">
            {subValue}
        </p>
      )}
    </div>
  );
}