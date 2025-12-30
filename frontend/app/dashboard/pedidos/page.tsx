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
      {/* Le pasamos la data inicial al componente cliente */}
      <OrdersView pedidos={pedidos} repartidores={repartidores} />
    </>
  );
}