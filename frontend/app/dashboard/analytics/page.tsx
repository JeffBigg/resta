import { Metadata } from 'next';
import { getPedidos } from '@/lib/api'; 
import AnalyticsView from '@/components/features/analytics/AnalyticsView';

export const metadata: Metadata = {
  title: 'FluentOps | Analytics',
  description: 'Métricas de rendimiento y ventas.',
};

export default async function AnalyticsPage() {

  const pedidos = await getPedidos();

  return (
    <>
      <AnalyticsView pedidos={pedidos} />
    </>
  );
}