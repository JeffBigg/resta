export const EventBadge = ({ tipo }: { tipo: string }) => {
    const map: Record<string, string> = { 
        entrada: '🔵 Entrada', 
        salida: '🔴 Salida', 
        inicio_refrigerio: '🍔 Refri', 
        fin_refrigerio: '▶️ Vuelve' 
    };
    return <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-full shadow-sm">{map[tipo] || tipo}</span>;
};