'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPedido } from '@/lib/api'; // Ajusta la ruta a tu alias

export default function CreateOrderModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    cliente: '',
    telefono: '', 
    direccion: '',
    items: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // 1. LIMPIEZA Y VALIDACIÓN ESTRICTA
    // Aseguramos que solo haya números
    const cleanPhone = formData.telefono.replace(/\D/g, '');

    if (cleanPhone.length !== 9) {
        alert('⚠️ El número de celular debe tener exactamente 9 dígitos para enviar el Tracking por WhatsApp.');
        setLoading(false);
        return; // Detenemos el envío
    }
    
    // 2. PREPARACIÓN DE DATOS
    const datosParaEnviar = {
        cliente: formData.cliente,
        direccion: formData.direccion,
        items: formData.items,
        // Agregamos el código de país Perú (+51)
        telefono: `+51${cleanPhone}` 
    };

    // 3. ENVÍO AL SERVIDOR
    const success = await createPedido(datosParaEnviar);
    
    if (success) {
      setIsOpen(false);
      setFormData({ cliente: '', telefono: '', direccion: '', items: '' });
      router.refresh(); // Recarga los datos en segundo plano
      
      // Feedback visual sutil (Opcional: podrías usar una librería de Toast aquí)
      // setTimeout(() => alert('✅ Pedido enviado a cocina'), 300);
    } else {
      alert('❌ Hubo un error al conectar con el servidor.');
    }
    setLoading(false);
  };

  // Función para manejar el input de teléfono
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, ''); // Solo permite números
      if (val.length <= 9) { // No permite escribir más de 9
          setFormData({ ...formData, telefono: val });
      }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200 font-semibold flex items-center gap-2 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Nuevo Pedido
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
            
            {/* Cabecera */}
            <div className="bg-white px-8 py-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xl text-gray-900">Crear Nueva Orden</h3>
                <p className="text-sm text-gray-500 mt-0.5">Ingresa los detalles para cocina</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                ✖
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              
              {/* Cliente */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre del Cliente</label>
                <input 
                  required 
                  autoFocus
                  type="text" 
                  placeholder="Ej: Juan Pérez"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  value={formData.cliente} 
                  onChange={(e) => setFormData({...formData, cliente: e.target.value})} 
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp (Solo 9 dígitos)</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <span className="text-gray-500 font-medium border-r border-gray-300 pr-3 mr-1 flex items-center gap-1">
                            🇵🇪 +51
                        </span>
                    </div>
                    <input 
                      required 
                      type="tel" 
                      inputMode="numeric"
                      placeholder="999 888 777"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-[5.5rem] pr-4 py-3 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={formData.telefono} 
                      onChange={handlePhoneChange} 
                    />
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Dirección de Entrega</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Calle / Av. / Referencia"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.direccion} 
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})} 
                />
              </div>

              {/* Items */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Detalle del Pedido</label>
                <textarea 
                  required 
                  rows={3} 
                  placeholder="Ej: 1 Pollo a la brasa, 2 Inka Kolas..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  value={formData.items} 
                  onChange={(e) => setFormData({...formData, items: e.target.value})} 
                />
                <p className="text-xs text-gray-400 mt-1 text-right">Separa los productos por coma</p>
              </div>

              {/* Botones */}
              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="flex-1 bg-white border border-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Guardando...' : 'Crear Pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}