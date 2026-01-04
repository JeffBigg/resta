'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { createPedido } from '@/lib/api';

// Props opcionales para cambiar el estilo del botón disparador
interface Props {
  isMobileFab?: boolean;
  onOrderCreated?: () => void;
}

export default function CreateOrderModal({ isMobileFab = false, onOrderCreated }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Estado para controlar si estamos en el cliente
  const [mounted, setMounted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    cliente: '',
    telefono: '',
    direccion: '',
    items: ''
  });

  // Solución al error de hidratación
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Bloquear Scroll del Body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Manejo de tecla ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanPhone = formData.telefono.replace(/\D/g, '');
    if (cleanPhone.length !== 9) {
      alert('⚠️ El número de celular debe tener exactamente 9 dígitos.');
      setLoading(false);
      return;
    }

    const success = await createPedido({
      cliente: formData.cliente,
      direccion: formData.direccion,
      items: formData.items,
      telefono: `+51${cleanPhone}`
    });

    if (success) {
      setIsOpen(false);
      setFormData({ cliente: '', telefono: '', direccion: '', items: '' });
      
      if (onOrderCreated) {
        onOrderCreated();
      } else {
        router.refresh();
      }

    } else {
      alert('❌ Error al guardar pedido.');
    }
    setLoading(false);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 9) setFormData({ ...formData, telefono: val });
  };

  // --- BOTÓN DISPARADOR (TRIGGER) ---
  const triggerButton = isMobileFab ? (
    <button
      onClick={() => setIsOpen(true)}
      className="flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-600/30 dark:shadow-blue-900/40 active:scale-90 transition-all"
      aria-label="Crear nuevo pedido"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </button>
  ) : (
    <button
      onClick={() => setIsOpen(true)}
      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 dark:shadow-blue-900/40 transition-all duration-200 font-semibold flex items-center gap-2 active:scale-95"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      Nuevo Pedido
    </button>
  );

  // --- CONTENIDO DEL MODAL ---
  const modalContent = (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop oscuro */}
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Ventana Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl dark:shadow-black/50 w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 z-10 transition-colors">
        
        {/* Cabecera */}
        <div className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center transition-colors">
          <div>
            <h3 className="font-bold text-xl text-slate-900 dark:text-white">Nueva Orden</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ingresa los datos para cocina</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200 p-2 rounded-full transition-all"
          >
            ✖
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Cliente</label>
            <input 
              required autoFocus type="text" placeholder="Nombre completo"
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 focus:border-transparent outline-none transition-all"
              value={formData.cliente} onChange={(e) => setFormData({...formData, cliente: e.target.value})} 
            />
          </div>

          <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">WhatsApp</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 dark:text-slate-400 font-medium">🇵🇪 +51</span>
                <input 
                  required type="tel" inputMode="numeric" placeholder="999 888 777"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg pl-16 pr-4 py-2.5 font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 focus:border-transparent outline-none transition-all"
                  value={formData.telefono} onChange={handlePhoneChange} 
                />
              </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Dirección</label>
            <input 
              required type="text" placeholder="Dirección de entrega"
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 focus:border-transparent outline-none transition-all"
              value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Pedido</label>
            <textarea 
              required rows={3} placeholder="Detalle de items..."
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 focus:border-transparent outline-none resize-none transition-all"
              value={formData.items} onChange={(e) => setFormData({...formData, items: e.target.value})} 
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button 
                type="button" 
                onClick={() => setIsOpen(false)} 
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
                Cancelar
            </button>
            <button 
                type="submit" 
                disabled={loading} 
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              {loading ? 'Guardando...' : 'Crear Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {triggerButton}
      {isOpen && mounted && createPortal(modalContent, document.body)}
    </>
  );
}