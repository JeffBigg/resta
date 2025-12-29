// lib/api.ts
import { Pedido, Repartidor } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Obtener Pedidos
export async function getPedidos(): Promise<Pedido[]> {
  try {
    const res = await fetch(`${API_URL}/api/pedidos?populate=*`, { 
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Fallo al obtener pedidos');
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

// ACTUALIZACIÓN: Aceptamos un parámetro opcional para filtrar por estado
export async function getRepartidores(estado: string = 'Disponible'): Promise<Repartidor[]> {
  try {
    // Usamos los filtros de Strapi v4/v5
    // Sintaxis: filters[campo][$eq]=valor
    const res = await fetch(`${API_URL}/api/repartidors?filters[estado][$eq]=${estado}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) throw new Error('Fallo al obtener repartidores');
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

// lib/api.ts

export async function asignarRider(pedidoDocumentId: string, riderDocumentId: string): Promise<boolean> {
  try {
    // Paso 1: Intentar marcar al Rider como Ocupado PRIMERO.
    // Es mejor bloquear al recurso (Rider) antes de asignar el trabajo.
    const resRider = await fetch(`${API_URL}/api/repartidors/${riderDocumentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: { estado: 'Ocupado' }
      }),
    });

    if (!resRider.ok) throw new Error('No se pudo bloquear al rider');

    // Paso 2: Asignar el pedido
    const resPedido = await fetch(`${API_URL}/api/pedidos/${pedidoDocumentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          repartidor: riderDocumentId,
          status_entrega: 'En_ruta',
        },
      }),
    });

    // ROLLBACK: Si falla la asignación del pedido, liberamos al rider inmediatamente
    if (!resPedido.ok) {
        console.warn("Fallo asignación pedido, revirtiendo estado del rider...");
        await fetch(`${API_URL}/api/repartidors/${riderDocumentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: { estado: 'Disponible' } }),
        });
        return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error crítico en transacción de asignación:", error);
    return false;
  }
}

// En lib/api.ts

// Actualizamos la definición de los datos que recibe la función
export async function createPedido(datos: { cliente: string; telefono: string; direccion: string; items: string }) {
  try {
    const itemsArray = datos.items.split(',').map(i => i.trim());

    const res = await fetch(`${API_URL}/api/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          cliente_nombre: datos.cliente,
          cliente_telefono: datos.telefono, // <--- Aquí guardamos el dato nuevo
          direccion_entrega: datos.direccion,
          status_entrega: 'Cocina',
          detalle_pedido: { items: itemsArray }
        },
      }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ ERROR DETALLADO DE STRAPI:", JSON.stringify(errorData, null, 2));
        throw new Error(`Fallo Strapi: ${res.status}`);
    }
    
    return true;
  } catch (error) {
    console.error("Error en el catch:", error);
    return false;
  }
}
// lib/api.ts

// ... (tus otras funciones) ...

// 4. Obtener un solo pedido por DocumentId (Para la página de tracking)
export async function getPedidoByDocumentId(documentId: string): Promise<Pedido | null> {
  try {
    const res = await fetch(`${API_URL}/api/pedidos/${documentId}?populate=*`, {
      cache: 'no-store', // Datos frescos siempre
    });
    
    if (!res.ok) return null;
    
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error buscando pedido:", error);
    return null;
  }
}
// lib/api.ts

// ... (tus otras funciones) ...

// 5. Marcar como Entregado (PUT)
export async function completarPedido(pedidoDocumentId: string, riderDocumentId?: string): Promise<boolean> {
  try {
    // 1. Cerramos el PEDIDO
    const resPedido = await fetch(`${API_URL}/api/pedidos/${pedidoDocumentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: { status_entrega: 'Entregado' },
      }),
    });
    
    // 2. Liberamos al RIDER (Si existe)
    if (riderDocumentId) {
       await fetch(`${API_URL}/api/repartidors/${riderDocumentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: { estado: 'Disponible' }
        }),
      });
    }

    if (!resPedido.ok) throw new Error('Error al completar pedido');
    return true;
  } catch (error) {
    console.error("Error completando:", error);
    return false;
  }
}
// En lib/api.ts

export async function cancelarPedido(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/pedidos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          status_entrega: 'Cancelado',
        },
      }),
    });
    return res.ok;
  } catch (error) {
    console.error("Error cancelando:", error);
    return false;
  }
}