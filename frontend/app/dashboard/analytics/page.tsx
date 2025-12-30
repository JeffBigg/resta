import { Metadata } from 'next';
import { getPedidos } from '@/lib/api'; // Reutilizamos tu API existente
import AnalyticsView from '@/components/features/analytics/AnalyticsView';

export const metadata: Metadata = {
  title: 'FluentOps | Analytics',
  description: 'Métricas de rendimiento y ventas.',
};

export default async function AnalyticsPage() {
  // Obtenemos todos los pedidos para calcular las estadísticas
  // NOTA: En un futuro, si tienes miles de pedidos, crearás un endpoint específico en Strapi
  // tipo "/api/analytics/summary" para que el backend haga el cálculo.
  const pedidos = await getPedidos();

  return (
    <>
      <AnalyticsView pedidos={pedidos} />
    </>
  );
}