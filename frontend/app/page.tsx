import { Metadata } from 'next';
import { getPedidos, getRepartidores } from '../lib/api';
import DashboardClient from '../components/features/dashboard/DashboardClient';

export const metadata: Metadata = {
  title: 'FluentOps | Gestión Empresarial',
  description: 'Panel de control de operaciones y logística.',
};

export default async function DashboardPage() {
  // Obtenemos los datos frescos del servidor
  // Nota: Strapi cachea por defecto, si quieres datos 'en vivo' siempre, Next hace el trabajo con revalidate
  const [pedidos, repartidores] = await Promise.all([
    getPedidos(),
    getRepartidores()
  ]);

  // Renderizamos el Componente Cliente (El diseño con sidebar)
  return (
    <DashboardClient 
        pedidos={pedidos} 
        repartidores={repartidores} 
    />
  );
}