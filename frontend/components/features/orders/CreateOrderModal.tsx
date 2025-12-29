'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPedido } from '../../../lib/api';

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
    
    // Concatenamos el +51 automáticamente antes de enviar
    const datosParaEnviar = {
        ...formData,
        telefono: `+51${formData.telefono}` // Asegura el formato internacional
    };

    const success = await createPedido(datosParaEnviar);
    
    if (success) {
      setIsOpen(false);
      setFormData({ cliente: '', telefono: '', direccion: '', items: '' });
      router.refresh();
      // Usamos un pequeño timeout para que la alerta no corte la animación de cierre
      setTimeout(() => alert('✅ Pedido creado con éxito'), 100);
    } else {
      alert('❌ Error al crear. Revisa la consola.');
    }
    setLoading(false);
  };

  return (
    <>
      {/* Botón Principal Moderno */}
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200 font-semibold flex items-center gap-2 transform hover:-translate-y-0.5"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Nuevo Pedido
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 transform transition-all scale-100">
            
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
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              
              {/* Cliente */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre del Cliente</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Ej: Juan Pérez"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  value={formData.cliente} 
                  onChange={(e) => setFormData({...formData, cliente: e.target.value})} 
                />
              </div>

              {/* Teléfono con Prefijo Fijo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp</label>
                <div className="relative">
                    {/* El prefijo visual */}
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <span className="text-gray-500 font-medium border-r border-gray-300 pr-3 mr-1 flex items-center gap-1">
                            🇵🇪 +51
                        </span>
                    </div>
                    {/* El input real */}
                    <input 
                      required 
                      type="tel" 
                      maxLength={9} // Limita a 9 dígitos Perú
                      placeholder="999 888 777"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-[5.5rem] pr-4 py-3 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono"
                      value={formData.telefono} 
                      onChange={(e) => {
                          // Solo permite números
                          const val = e.target.value.replace(/\D/g, '');
                          setFormData({...formData, telefono: val});
                      }} 
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
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
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
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  value={formData.items} 
                  onChange={(e) => setFormData({...formData, items: e.target.value})} 
                />
                <p className="text-xs text-gray-500 mt-1 text-right">Separa los items por coma</p>
              </div>

              {/* Botones */}
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="flex-1 bg-white border border-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all disabled:bg-gray-400 disabled:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </span>
                  ) : 'Crear Pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}