import { getPedidos, getRepartidores } from '@/lib/api';
import OrdersView from '@/components/features/orders/OrdersView';

// Al ser un componente asíncrono, Next.js espera a tener los datos antes de mostrar la página
export default async function PedidosPage() {
  console.log("⚡ Cargando datos de pedidos en el servidor...");
  
  // Ejecutamos ambas peticiones en paralelo para mayor velocidad
  const [pedidos, repartidores] = await Promise.all([
    getPedidos(),
    getRepartidores()
  ]);

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Torre de Control</h2>
        <p className="text-gray-500 text-sm">Gestiona los pedidos entrantes y la flota en tiempo real.</p>
      </div>

      {/* Le pasamos la data inicial al componente cliente */}
      <OrdersView pedidos={pedidos} repartidores={repartidores} />
    </>
  );
}