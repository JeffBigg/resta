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
        trendColor="text-green-500"
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
        trendColor="text-red-500"
        isDanger
      />
    </div>
  );
}

// ✅ APLICAMOS LA INTERFAZ AQUÍ (Adiós al 'any')
function KPICard({ title, value, icon, subValue, trend, trendColor, isDanger }: KPICardProps) {
  return (
    <div className={`p-5 rounded-2xl border transition-all hover:shadow-md ${isDanger ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="p-2 bg-white/50 rounded-lg text-xl shadow-sm">{icon}</span>
        {trend && <span className={`text-xs font-bold ${trendColor || 'text-gray-500'} bg-white px-2 py-1 rounded-full shadow-sm`}>{trend}</span>}
      </div>
      <p className="text-gray-500 text-xs font-bold uppercase tracking-wide">{title}</p>
      <h4 className={`text-2xl font-black mt-1 ${isDanger ? 'text-red-600' : 'text-gray-800'}`}>
        {value}
      </h4>
      {subValue && <p className="text-xs text-gray-400 mt-2 font-medium">{subValue}</p>}
    </div>
  );
}