'use client';

import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { validarEmpleadoPorPin, registrarAsistencia } from '@/lib/api'; 

// --- TIPOS ---
interface Employee {
  documentId: string;
  nombre: string;
  rol_operativo: string;
}

interface ActionButtonProps {
  label: string;
  icon: string;
  className?: string; // Cambiamos 'color' por 'className' para mayor flexibilidad
  onClick: () => void;
  isLoading?: boolean;
}

type StatusType = 'fuera' | 'trabajando' | 'refrigerio';

export default function KioskPage() {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [currentStatus, setCurrentStatus] = useState<StatusType>('fuera');

  // --- RELOJ ---
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const updateTime = () => setTime(new Date());
    const timer = setInterval(updateTime, 1000);
    const initialLoad = setTimeout(updateTime, 0);

    return () => {
      clearInterval(timer);
      clearTimeout(initialLoad);
    };
  }, []);

  // Teclado y lógica
  const handleNumClick = (num: string) => { if (pin.length < 4) setPin(prev => prev + num); };
  const handleClear = () => setPin('');

  // --- LOGIN ---
  const handleLogin = async () => {
    if (pin.length < 4) return;
    setLoading(true);

    const result = await validarEmpleadoPorPin(pin);

    if (result) {
      setEmployee(result.empleado);
      setCurrentStatus(result.status);
      toast.success(`Hola, ${result.empleado.nombre.split(' ')[0]}`);
    } else {
      toast.error('PIN no reconocido', { description: 'Intenta nuevamente.' });
      setPin('');
    }
    setLoading(false);
  };

  // --- ACCIONES ---
  const handleAction = async (tipo: 'entrada' | 'inicio_refrigerio' | 'fin_refrigerio' | 'salida') => {
    if (!employee) return;
    setLoading(true);

    const success = await registrarAsistencia(employee.documentId, tipo);

    if (success) {
        const mensajes = {
            entrada: '¡Bienvenido! ☀️',
            inicio_refrigerio: 'Buen provecho 🍔',
            fin_refrigerio: 'A seguir trabajando ⚡',
            salida: '¡Descansa! 👋'
        };
        
        toast.success('Registrado Correctamente', { description: mensajes[tipo] });

        setTimeout(() => {
            setPin('');
            setEmployee(null);
            setCurrentStatus('fuera');
            setLoading(false);
        }, 2000);
    } else {
        toast.error('Error de Conexión');
        setLoading(false);
    }
  };

  // --- RENDERIZADO CONDICIONAL (LOADING STATE) ---
  if (!time) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
           {/* Spinner usando color primario */}
           <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
           <span className="text-muted-foreground text-sm font-medium">Iniciando sistema...</span>
        </div>
      </div>
    );
  }

  return (
    // 1. FONDO PRINCIPAL: bg-background
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative transition-colors duration-300">
      <Toaster position="top-center" richColors theme="system" />

      {/* 2. TARJETA PRINCIPAL: bg-card + border-border */}
      <div className="w-full max-w-md bg-card rounded-3xl shadow-2xl overflow-hidden border border-border">
        
        {/* HEADER */}
        <div className="bg-muted/30 p-8 text-center border-b border-border">
           <h1 className="text-5xl font-black text-foreground tracking-tight tabular-nums">
             {time.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
           </h1>
           <p className="text-muted-foreground font-medium mt-2 uppercase tracking-widest text-xs">
             {time.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
           </p>
        </div>

        <div className="p-8">
          {!employee ? (
            // VISTA PIN
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
              <div className="text-center">
                <p className="text-muted-foreground mb-4 font-medium">Ingresa tu código de acceso</p>
                
                {/* Indicadores de PIN */}
                <div className="flex justify-center gap-4 mb-6">
                  {[0, 1, 2, 3].map((i) => (
                    <div 
                        key={i} 
                        className={`w-4 h-4 rounded-full transition-all duration-200 ${
                            i < pin.length 
                            ? 'bg-primary scale-110' // Activo: Color Primario
                            : 'bg-muted'             // Inactivo: Color Muted
                        }`} 
                    />
                  ))}
                </div>
              </div>

              {/* Teclado Numérico */}
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <button 
                    key={n} 
                    onClick={() => handleNumClick(n.toString())} 
                    // Teclas: bg-secondary (se adapta a light/dark)
                    className="h-16 rounded-2xl bg-secondary hover:bg-secondary/80 text-secondary-foreground text-2xl font-bold transition-all active:scale-95 shadow-sm border border-border"
                  >
                    {n}
                  </button>
                ))}
                
                {/* Botón Borrar: Destructive */}
                <button 
                    onClick={handleClear} 
                    className="h-16 rounded-2xl bg-destructive/10 hover:bg-destructive/20 text-destructive font-bold transition-all active:scale-95 border border-transparent hover:border-destructive/20"
                >
                    C
                </button>
                
                <button 
                    onClick={() => handleNumClick('0')} 
                    className="h-16 rounded-2xl bg-secondary hover:bg-secondary/80 text-secondary-foreground text-2xl font-bold transition-all active:scale-95 shadow-sm border border-border"
                >
                    0
                </button>
                
                {/* Botón Entrar: Primary */}
                <button 
                    onClick={handleLogin} 
                    disabled={pin.length < 4 || loading} 
                    className="h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-2xl transition-all shadow-lg shadow-primary/20"
                >
                   {loading ? <span className="animate-spin text-sm">⏳</span> : '➜'}
                </button>
              </div>
            </div>
          ) : (
            // VISTA ACCIONES
            <div className="text-center animate-in zoom-in duration-300">
               <div className="mb-6">
                 {/* Avatar con Primary */}
                 <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-bold text-primary-foreground uppercase shadow-lg shadow-primary/30">
                    {employee.nombre.charAt(0)}
                 </div>
                 <h2 className="text-2xl font-bold text-foreground">Hola, {employee.nombre.split(' ')[0]}</h2>
                 
                 {/* Badge con Muted */}
                 <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md uppercase font-bold mt-2 inline-block border border-border">
                    {employee.rol_operativo}
                 </span>
               </div>

               <div className="grid grid-cols-1 gap-4">
                 {currentStatus === 'fuera' && (
                    <ActionButton 
                      label="Marcar Entrada" icon="☀️" 
                      className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20" 
                      onClick={() => handleAction('entrada')} isLoading={loading}
                    />
                 )}

                 {currentStatus === 'trabajando' && (
                    <>
                      <ActionButton 
                        label="Salir a Refrigerio" icon="🍔" 
                        className="bg-amber-500 hover:bg-amber-400 text-white shadow-amber-500/20" 
                        onClick={() => handleAction('inicio_refrigerio')} isLoading={loading}
                      />
                      <ActionButton 
                        label="Marcar Salida" icon="👋" 
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-destructive/20" 
                        onClick={() => handleAction('salida')} isLoading={loading}
                      />
                    </>
                 )}

                 {currentStatus === 'refrigerio' && (
                    <ActionButton 
                      label="Regresar de Refrigerio" icon="⚡" 
                      className="bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20" 
                      onClick={() => handleAction('fin_refrigerio')} isLoading={loading}
                    />
                 )}
               </div>

               <button 
                 onClick={() => { setEmployee(null); setPin(''); }}
                 className="mt-8 text-muted-foreground text-sm hover:text-foreground transition-colors underline decoration-muted-foreground/50"
                 disabled={loading}
               >
                 Cancelar
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Botón reutilizable actualizado
function ActionButton({ label, icon, className, onClick, isLoading }: ActionButtonProps & { isLoading?: boolean }) {
  return (
    <button 
        onClick={onClick} 
        disabled={isLoading}
        className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-lg shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
       {isLoading ? (
           <span className="animate-spin">⏳</span>
       ) : (
           <><span className="text-2xl">{icon}</span> {label}</>
       )}
    </button>
  );
}