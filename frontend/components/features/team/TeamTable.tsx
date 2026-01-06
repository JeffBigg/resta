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

export default function TeamTable({ loading, activeTab, employees, riders, onDelete, onEdit }: Props) {
  
  if (loading) return <div className="hidden md:block bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">Cargando equipo...</div>;

  const isEmpty = activeTab === 'staff' ? employees.length === 0 : riders.length === 0;

  if (isEmpty) return <div className="hidden md:block bg-card rounded-xl border border-border p-10 text-center text-muted-foreground">No hay registros encontrados.</div>;

  return (
    <div className="hidden md:block bg-card rounded-xl shadow-sm border border-border overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {activeTab === 'staff' ? 'Colaborador' : 'Motorizado'}
              </th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Contacto</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {activeTab === 'staff' ? 'Rol y Acceso' : 'Estado y Acceso'}
              </th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {activeTab === 'staff' 
              ? employees.map(emp => <StaffRow key={emp.id} emp={emp} onDelete={onDelete} onEdit={onEdit} />)
              : riders.map(rider => <RiderRow key={rider.id} rider={rider} onDelete={onDelete} onEdit={onEdit} />)
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StaffRow({ emp, onDelete, onEdit }: { emp: Empleado, onDelete: (id: string) => void, onEdit: (e: Empleado) => void }) {
  return (
    <tr className="hover:bg-muted/50 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs border border-orange-200">
            {emp.nombre.charAt(0)}{emp.apellido ? emp.apellido.charAt(0) : ''}
          </div>
          <div><p className="font-semibold text-foreground">{emp.nombre} {emp.apellido}</p></div>
        </div>
      </td>
      <td className="px-6 py-4"><span className="font-mono text-sm text-muted-foreground">{emp.telefono || '--'}</span></td>
      <td className="px-6 py-4">
         <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
              {emp.rol_operativo}
            </span>
            <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 rounded border border-border">••••</span>
         </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(emp)} className="text-primary hover:bg-primary/10 p-1.5 rounded transition-colors text-xs font-bold">
                ✏️ Editar
            </button>
            <button onClick={() => onDelete(emp.documentId || String(emp.id))} className="text-destructive hover:bg-destructive/10 p-1.5 rounded transition-colors text-xs font-bold">
                🗑️ Borrar
            </button>
        </div>
      </td>
    </tr>
  );
}

function RiderRow({ rider, onDelete, onEdit }: { rider: Repartidor, onDelete: (id: string) => void, onEdit: (r: Repartidor) => void }) {
  return (
    <tr className="hover:bg-muted/50 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
            {rider.nombre.charAt(0)}{rider.apellido ? rider.apellido.charAt(0) : ''}
          </div>
          <p className="font-semibold text-foreground">{rider.nombre} {rider.apellido}</p>
        </div>
      </td>
      <td className="px-6 py-4 font-mono text-sm text-muted-foreground">{rider.telefono || '--'}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                rider.estado === 'Disponible' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                rider.estado === 'Ocupado' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              {rider.estado}
            </span>
            <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 rounded border border-border">••••</span>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(rider)} className="text-primary hover:bg-primary/10 p-1.5 rounded transition-colors text-xs font-bold">
                ✏️ Editar
            </button>
            <button onClick={() => onDelete(rider.documentId || String(rider.id))} className="text-destructive hover:bg-destructive/10 p-1.5 rounded transition-colors text-xs font-bold">
                🗑️ Borrar
            </button>
        </div>
      </td>
    </tr>
  );
}