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
  color: string;
  onClick: () => void;
  isLoading?: boolean;
}

type StatusType = 'fuera' | 'trabajando' | 'refrigerio';

export default function KioskPage() {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [currentStatus, setCurrentStatus] = useState<StatusType>('fuera');

  // --- CORRECCIÓN DEFINITIVA DEL RELOJ ---
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // 1. Definimos la función que actualiza la hora
    const updateTime = () => setTime(new Date());

    // 2. Iniciamos el intervalo (se ejecutará cada 1000ms)
    const timer = setInterval(updateTime, 1000);

    // 3. SOLUCIÓN AL ERROR: "Calling setState synchronously..."
    // Usamos setTimeout con 0ms. Esto mueve la primera actualización
    // al final de la cola de ejecución ("next tick"), permitiendo que
    // React termine de renderizar antes de actualizar el estado.
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
  // Esto es crucial para evitar errores de hidratación (servidor vs cliente)
  if (!time) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        {/* Un spinner o texto de carga simple */}
        <div className="flex flex-col items-center gap-2">
           <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
           <span className="text-slate-500 text-sm font-medium">Iniciando sistema...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative">
      <Toaster position="top-center" richColors theme="dark" />

      <div className="w-full max-w-md bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-700">
        
        {/* HEADER */}
        <div className="bg-slate-950 p-8 text-center border-b border-slate-700">
           <h1 className="text-5xl font-black text-white tracking-tight tabular-nums">
             {time.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
           </h1>
           <p className="text-slate-400 font-medium mt-2 uppercase tracking-widest text-xs">
             {time.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
           </p>
        </div>

        <div className="p-8">
          {!employee ? (
            // VISTA PIN
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
              <div className="text-center">
                <p className="text-slate-300 mb-4 font-medium">Ingresa tu código de acceso</p>
                <div className="flex justify-center gap-4 mb-6">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={`w-4 h-4 rounded-full transition-all ${i < pin.length ? 'bg-blue-500 scale-110' : 'bg-slate-700'}`} />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <button key={n} onClick={() => handleNumClick(n.toString())} className="h-16 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white text-2xl font-bold transition-all active:scale-95 shadow-lg shadow-slate-900/50">
                    {n}
                  </button>
                ))}
                <button onClick={handleClear} className="h-16 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold transition-all">C</button>
                <button onClick={() => handleNumClick('0')} className="h-16 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white text-2xl font-bold shadow-lg">0</button>
                <button onClick={handleLogin} disabled={pin.length < 4 || loading} className="h-16 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-2xl">
                   {loading ? <span className="animate-spin text-sm">⏳</span> : '➜'}
                </button>
              </div>
            </div>
          ) : (
            // VISTA ACCIONES
            <div className="text-center animate-in zoom-in duration-300">
               <div className="mb-6">
                 <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-bold text-white uppercase">
                    {employee.nombre.charAt(0)}
                 </div>
                 <h2 className="text-2xl font-bold text-white">Hola, {employee.nombre.split(' ')[0]}</h2>
                 <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-md uppercase font-bold mt-2 inline-block">
                    {employee.rol_operativo}
                 </span>
               </div>

               <div className="grid grid-cols-1 gap-4">
                 {currentStatus === 'fuera' && (
                    <ActionButton 
                      label="Marcar Entrada" icon="☀️" color="bg-green-600 hover:bg-green-500" 
                      onClick={() => handleAction('entrada')} isLoading={loading}
                    />
                 )}

                 {currentStatus === 'trabajando' && (
                    <>
                      <ActionButton 
                        label="Salir a Refrigerio" icon="🍔" color="bg-yellow-600 hover:bg-yellow-500" 
                        onClick={() => handleAction('inicio_refrigerio')} isLoading={loading}
                      />
                      <ActionButton 
                        label="Marcar Salida" icon="👋" color="bg-red-600 hover:bg-red-500" 
                        onClick={() => handleAction('salida')} isLoading={loading}
                      />
                    </>
                 )}

                 {currentStatus === 'refrigerio' && (
                    <ActionButton 
                      label="Regresar de Refrigerio" icon="⚡" color="bg-blue-600 hover:bg-blue-500" 
                      onClick={() => handleAction('fin_refrigerio')} isLoading={loading}
                    />
                 )}
               </div>

               <button 
                 onClick={() => { setEmployee(null); setPin(''); }}
                 className="mt-8 text-slate-500 text-sm hover:text-white transition-colors underline"
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

// Botón reutilizable
function ActionButton({ label, icon, color, onClick, isLoading }: ActionButtonProps & { isLoading?: boolean }) {
  return (
    <button 
        onClick={onClick} 
        disabled={isLoading}
        className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 text-white font-bold text-lg shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${color}`}
    >
       {isLoading ? (
           <span className="animate-spin">⏳</span>
       ) : (
           <><span className="text-2xl">{icon}</span> {label}</>
       )}
    </button>
  );
}