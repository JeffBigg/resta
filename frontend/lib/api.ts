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

// Obtener Repartidores
export async function getRepartidores(): Promise<Repartidor[]> {
  try {
    const res = await fetch(`${API_URL}/api/repartidors`, {
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

// MODIFICADA: Ahora marca al rider como 'Ocupado' al asignar
export async function asignarRider(pedidoDocumentId: string, riderDocumentId: string): Promise<boolean> {
  try {
    // 1. Actualizamos el PEDIDO
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

    // 2. Actualizamos al RIDER a 'Ocupado'
    const resRider = await fetch(`${API_URL}/api/repartidors/${riderDocumentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: { estado: 'Ocupado' }
      }),
    });
    
    return resPedido.ok && resRider.ok;
  } catch (error) {
    console.error("Error al asignar:", error);
    return false;
  }
}

// ... (tus funciones anteriores) ...

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