'use client';

import { Empleado, Repartidor } from '@/types';

interface Props {
  loading: boolean;
  activeTab: 'staff' | 'riders';
  employees: Empleado[];
  riders: Repartidor[];
  onDelete: (id: string) => void;
  onEdit: (item: Empleado | Repartidor) => void; // ✅ NUEVA PROP
}

export default function TeamMobileGrid({ loading, activeTab, employees, riders, onDelete, onEdit }: Props) {
  
  if (loading) return <div className="md:hidden p-8 text-center text-muted-foreground">Cargando...</div>;

  const isEmpty = activeTab === 'staff' ? employees.length === 0 : riders.length === 0;
  if (isEmpty) return <div className="md:hidden p-10 text-center text-muted-foreground bg-card rounded-xl border border-dashed border-border">No hay registros.</div>;

  return (
    <div className="grid grid-cols-1 gap-3 md:hidden">
      {activeTab === 'staff' 
        ? employees.map(emp => <MobileStaffCard key={emp.id} emp={emp} onDelete={onDelete} onEdit={onEdit} />)
        : riders.map(rider => <MobileRiderCard key={rider.id} rider={rider} onDelete={onDelete} onEdit={onEdit} />)
      }
    </div>
  );
}

function MobileStaffCard({ emp, onDelete, onEdit }: { emp: Empleado, onDelete: (id: string) => void, onEdit: (e: Empleado) => void }) {
  return (
    <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col gap-3 active:scale-[0.99] transition-all">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
                {emp.nombre.charAt(0)}{emp.apellido ? emp.apellido.charAt(0) : ''}
            </div>
            <div>
                <p className="font-bold text-foreground">{emp.nombre} {emp.apellido}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs bg-secondary px-1.5 py-0.5 rounded border border-border">{emp.rol_operativo}</span>
                    <span className="text-xs text-muted-foreground font-mono">{emp.telefono}</span>
                </div>
            </div>
        </div>
        <div className="flex gap-2">
            <button onClick={() => onEdit(emp)} className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded">✏️</button>
            <button onClick={() => onDelete(emp.documentId || String(emp.id))} className="text-xs text-destructive font-medium bg-destructive/10 px-2 py-1 rounded">🗑️</button>
        </div>
      </div>
    </div>
  );
}

function MobileRiderCard({ rider, onDelete, onEdit }: { rider: Repartidor, onDelete: (id: string) => void, onEdit: (r: Repartidor) => void }) {
  return (
    <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col gap-3 active:scale-[0.99] transition-all">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                {rider.nombre.charAt(0)}{rider.apellido ? rider.apellido.charAt(0) : ''}
            </div>
            <div>
                <p className="font-bold text-foreground">{rider.nombre} {rider.apellido}</p>
                <p className="text-xs font-mono text-muted-foreground">{rider.telefono}</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button onClick={() => onEdit(rider)} className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded">✏️</button>
            <button onClick={() => onDelete(rider.documentId || String(rider.id))} className="text-xs text-destructive font-medium bg-destructive/10 px-2 py-1 rounded">🗑️</button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
         <div className={`px-2 py-1.5 rounded-md text-xs font-bold border text-center flex items-center justify-center ${
            rider.estado === 'Disponible' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
            rider.estado === 'Ocupado' ? 'bg-amber-100 text-amber-700 border-amber-200' :
            'bg-slate-100 text-slate-500 border-slate-200'
        }`}>
            {rider.estado}
         </div>
         <div className="flex items-center justify-between px-3 py-1.5 rounded-md text-xs border border-border bg-muted/30">
             <span className="text-muted-foreground">PIN</span>
             <span className="font-mono font-bold tracking-widest">****</span>
         </div>
      </div>
    </div>
  );
}