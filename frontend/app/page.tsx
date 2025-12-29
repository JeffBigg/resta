import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FluentOps | Gestión Empresarial',
  description: 'Redirigiendo al panel de control...',
};

export default function Home() {
  // 🚀 LÓGICA NUEVA:
  // Ya no cargamos datos aquí. Los datos se cargan en 'app/dashboard/pedidos/page.tsx'.
  // Simplemente redirigimos al usuario a la nueva ruta principal.
  redirect('/dashboard/pedidos');
}