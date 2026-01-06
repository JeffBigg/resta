'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  getEmpleados, createEmpleado, updateEmpleado, deleteEmpleado, 
  getRepartidores, createRepartidor, updateRepartidor, deleteRepartidor 
} from '@/lib/api';
import { Empleado, Repartidor } from '@/types';

import TeamHeader from './TeamHeader';
import TeamTable from './TeamTable';
import TeamMobileGrid from './TeamMobileGrid';

type TabOption = 'staff' | 'riders';

export default function EmployeesView() {
  const [activeTab, setActiveTab] = useState<TabOption>('staff');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // ✅ NUEVO ESTADO: ID del que estamos editando
  const [editingId, setEditingId] = useState<string | null>(null);

  const [employees, setEmployees] = useState<Empleado[]>([]);
  const [riders, setRiders] = useState<Repartidor[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Empleado[]>([]);
  const [filteredRiders, setFilteredRiders] = useState<Repartidor[]>([]);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    rol_operativo: 'Mesero',
    pin_code: '',
    telefono: ''
  });

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    try {
      const [empData, riderData] = await Promise.all([
        getEmpleados(),
        getRepartidores()
      ]);
      setEmployees(empData);
      setRiders(riderData);
    } catch {
      toast.error("Error cargando datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    if (activeTab === 'staff') {
        setFilteredEmployees(employees.filter(e => 
            e.nombre.toLowerCase().includes(term) || 
            (e.apellido && e.apellido.toLowerCase().includes(term)) ||
            e.rol_operativo.toLowerCase().includes(term)
        ));
    } else {
        setFilteredRiders(riders.filter(r => 
            r.nombre.toLowerCase().includes(term) || 
            (r.apellido && r.apellido.toLowerCase().includes(term))
        ));
    }
  }, [searchTerm, employees, riders, activeTab]);

  // ✅ NUEVO: Función para iniciar la edición
  const handleEdit = (item: Empleado | Repartidor) => {
    setEditingId(item.documentId || String(item.id));
    setFormData({
      nombre: item.nombre,
      apellido: item.apellido || '',
      telefono: item.telefono || '',
      pin_code: item.pin_code || '',
      rol_operativo: (item as Empleado).rol_operativo || 'Mesero'
    });
    setIsFormOpen(true);
    // Scrollear al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ nombre: '', apellido: '', rol_operativo: 'Mesero', pin_code: '', telefono: '' });
    setIsFormOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.pin_code.length !== 4) {
      toast.error('El PIN debe tener 4 dígitos exactos');
      return;
    }
    if (!formData.telefono) {
      toast.error('El teléfono es obligatorio');
      return;
    }

    let success = false;
    
    // ✅ LÓGICA DE EDICIÓN VS CREACIÓN
    if (activeTab === 'staff') {
      if (editingId) {
        success = await updateEmpleado(editingId, {
            nombre: formData.nombre,
            apellido: formData.apellido,
            telefono: formData.telefono,
            rol_operativo: formData.rol_operativo,
            pin_code: formData.pin_code
        });
      } else {
        success = await createEmpleado({
            nombre: formData.nombre,
            apellido: formData.apellido,
            telefono: formData.telefono,
            rol_operativo: formData.rol_operativo,
            pin_code: formData.pin_code
        });
      }
      handleResult(success, 'Colaborador', !!editingId);
    } else {
      if (editingId) {
        success = await updateRepartidor(editingId, {
            nombre: formData.nombre,
            apellido: formData.apellido,
            telefono: formData.telefono,
            pin_code: formData.pin_code
        });
      } else {
        success = await createRepartidor({
            nombre: formData.nombre,
            apellido: formData.apellido,
            telefono: formData.telefono,
            pin_code: formData.pin_code
        });
      }
      handleResult(success, 'Motorizado', !!editingId);
    }
  };

  const handleResult = (success: boolean, type: string, isEdit: boolean) => {
    if (success) {
      toast.success(`${type} ${isEdit ? 'actualizado' : 'registrado'} correctamente`);
      handleCancel();
      loadData(true);
    } else {
      toast.error(`Error al ${isEdit ? 'actualizar' : 'registrar'}`);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('¿Eliminar este registro permanentemente?')) return;
    const success = activeTab === 'staff' 
      ? await deleteEmpleado(documentId)
      : await deleteRepartidor(documentId);
    
    if (success) {
      toast.success('Eliminado correctamente');
      loadData(true);
    } else {
      toast.error('Error al eliminar');
    }
  };

  return (
    <div className="max-w-350 mx-auto pb-20 p-4 md:p-6 space-y-6">
      
      <TeamHeader 
        activeTab={activeTab} 
        setActiveTab={(t) => { setActiveTab(t); handleCancel(); }}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isFormOpen={isFormOpen}
        setIsFormOpen={(v) => { if(!v) handleCancel(); else setIsFormOpen(true); }}
      />

      {isFormOpen && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg animate-in slide-in-from-top-2">
            <h3 className="font-bold text-foreground mb-4 pb-2 border-b border-border flex justify-between items-center">
                <span>
                   {editingId ? '✏️ Editando' : '➕ Registrando'} {activeTab === 'staff' ? 'Personal' : 'Motorizado'}
                </span>
                {editingId && <span className="text-xs text-muted-foreground font-normal">Editando ID: {editingId}</span>}
            </h3>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Nombre</label>
                    <input type="text" required className="w-full bg-secondary/30 border border-input rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                        value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} placeholder="Ej. Juan" />
                </div>
                <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Apellido</label>
                    <input type="text" required className="w-full bg-secondary/30 border border-input rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                        value={formData.apellido} onChange={(e) => setFormData({...formData, apellido: e.target.value})} placeholder="Ej. Pérez" />
                </div>
                <div>
                     <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Teléfono</label>
                     <input type="tel" required className="w-full bg-secondary/30 border border-input rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-mono"
                         value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} placeholder="999..." />
                </div>
                <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">PIN Acceso (4)</label>
                    <input type="number" required maxLength={4} className="w-full bg-secondary/30 border border-input rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-mono tracking-widest"
                        value={formData.pin_code} onChange={(e) => setFormData({...formData, pin_code: e.target.value.slice(0, 4)})} placeholder="0000" />
                </div>

                {activeTab === 'staff' && (
                    <div className="md:col-span-4">
                        <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Rol Operativo</label>
                        <select className="w-full bg-secondary/30 border border-input rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                            value={formData.rol_operativo} onChange={(e) => setFormData({...formData, rol_operativo: e.target.value})}>
                            <option value="Mesero">Mesero</option>
                            <option value="Cocina">Cocina</option>
                            <option value="Caja">Caja</option>
                            <option value="Administrador">Administrador</option>
                        </select>
                    </div>
                )}

                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-sm shadow transition-colors md:col-span-4 h-10 mt-2">
                    {editingId ? 'Actualizar Datos' : 'Guardar Registro'}
                </button>
            </form>
        </div>
      )}

      {/* 3. Tabla Desktop - Pasamos onEdit */}
      <TeamTable 
        loading={loading}
        activeTab={activeTab}
        employees={filteredEmployees}
        riders={filteredRiders}
        onDelete={handleDelete}
        onEdit={handleEdit} 
      />

      {/* 4. Grid Mobile - Pasamos onEdit */}
      <TeamMobileGrid 
        loading={loading}
        activeTab={activeTab}
        employees={filteredEmployees}
        riders={filteredRiders}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </div>
  );
}