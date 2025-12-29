import { getPedidoByDocumentId } from '../../../lib/api'; 
import Link from 'next/link';

// Definimos los pasos lógicos de una entrega
const STEPS = [
  { status: 'Cocina', label: 'Preparando', icon: '👨‍🍳' },
  { status: 'Listo_para_recoger', label: 'Listo en tienda', icon: '🛍️' },
  { status: 'En_ruta', label: 'En camino', icon: '🛵' },
  { status: 'Entregado', label: 'Entregado', icon: '🎉' }
];

// 1. EL FIX: Definimos el tipo exacto que espera Next.js
// En versiones nuevas, params es una Promesa que devuelve un objeto con el id
interface Props {
  params: Promise<{ id: string }>;
}

export default async function TrackingPage({ params }: Props) {
  // 2. AWAIT: Desempaquetamos la promesa para obtener el ID limpio
  const { id } = await params;
  
  const pedido = await getPedidoByDocumentId(id);

  if (!pedido) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl mb-2">🤷‍♂️</h1>
          <p className="text-gray-500">No encontramos ese pedido.</p>
          <Link href="/" className="text-blue-600 underline mt-4 block">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  // Lógica para saber en qué paso vamos
  const currentStepIndex = STEPS.findIndex(s => s.status === pedido.status_entrega);
  const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  return (
    <main className="min-h-screen bg-white flex flex-col items-center py-12 px-4">
      
      {/* Tarjeta del Tracking */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Cabecera con Mapa Simulado */}
        <div className="h-32 bg-blue-600 flex items-center justify-center relative overflow-hidden">
            {/* Patrón de fondo CSS puro para no depender de imágenes externas que puedan fallar */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <h1 className="text-white text-2xl font-bold z-10 relative">Seguimiento de Pedido</h1>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <p className="text-gray-400 text-sm uppercase tracking-wide">Cliente</p>
            <h2 className="text-2xl font-bold text-gray-800">{pedido.cliente_nombre}</h2>
            <p className="text-gray-500 mt-1">📍 {pedido.direccion_entrega}</p>
          </div>

          {/* BARRA DE PROGRESO VERTICAL */}
          <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 my-10">
            {STEPS.map((step, index) => {
              const isActive = index <= activeIndex;
              const isCurrent = index === activeIndex;

              return (
                <div key={step.status} className="relative pl-8">
                  <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 transition-all duration-500 ${
                    isActive ? 'bg-blue-600 border-blue-600 scale-110' : 'bg-white border-gray-300'
                  }`}></span>

                  <h3 className={`text-lg font-bold transition-colors ${
                    isActive ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {step.label} {isCurrent && <span className="animate-pulse ml-2 text-sm text-blue-600 font-normal">● Actual</span>}
                  </h3>
                  
                  {isCurrent && (
                    <div className="text-4xl mt-2 animate-bounce">{step.icon}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Información del Rider */}
          {pedido.repartidor && (
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 mt-8 border border-gray-200">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                🛵
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Tu Rider</p>
                <p className="font-bold text-gray-900">{pedido.repartidor.nombre}</p>
                {pedido.repartidor.telefono && (
                   <p className="text-xs text-green-600 font-medium">● {pedido.repartidor.telefono}</p>
                )}
              </div>
            </div>
          )}

          {/* Detalle del pedido */}
          <div className="mt-8 border-t pt-6">
            <p className="text-sm font-bold text-gray-900 mb-2">Detalle de la orden:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              {pedido.detalle_pedido.items.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      <p className="mt-8 text-gray-400 text-sm">Powered by FluentOps</p>
    </main>
  );
}