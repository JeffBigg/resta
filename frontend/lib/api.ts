// lib/api.ts
import { Pedido, Repartidor } from '../types';

// ==========================================
// 1. HELPER DE URL
// ==========================================
const getApiUrl = (endpoint: string) => {
  let base = process.env.NEXT_PUBLIC_API_URL || "";
  base = base.trim().replace(/\/$/, ""); 
  if (!base.endsWith("/api")) {
    base = `${base}/api`;
  }
  return `${base}/${endpoint}`;
};

// ==========================================
// 2. INTERFACES Y TIPOS
// ==========================================
export interface Empleado {
  id?: number;
  documentId?: string;
  nombre: string;
  rol_operativo: string;
  pin_code: string;
  asistencias?: { data: Asistencia[] } | Asistencia[];
}

export interface Asistencia {
  id?: number;
  documentId?: string;
  tipo: 'entrada' | 'salida' | 'inicio_refrigerio' | 'fin_refrigerio';
  fecha_registro: string; // El frontend espera esto, lo llenaremos con createdAt
  createdAt?: string;     // Campo nativo de Strapi
  empleado?: { data: Empleado } | Empleado;
}

interface StrapiWrapper<T> {
  id?: number;
  documentId?: string;
  attributes?: T;
  [key: string]: unknown;
}

interface StrapiResponse<T> {
  data: StrapiWrapper<T>[] | StrapiWrapper<T>;
  meta?: unknown;
}

// ==========================================
// 3. NORMALIZADORES (TRUCO MAESTRO AQUÍ)
// ==========================================
function normalize<T>(input: unknown): T {
  if (!input || typeof input !== 'object') return {} as T;
  const data = input as StrapiWrapper<T>;
  
  let result: Record<string, unknown> = {};

  // Caso Strapi v4 (tiene attributes)
  if ('attributes' in data && data.attributes) {
    result = { id: data.id, documentId: data.documentId, ...data.attributes };
  } else {
    // Caso Strapi v5 (plano)
    result = data;
  }

  // --- CORRECCIÓN AUTOMÁTICA DE FECHA ---
  // Si no existe 'fecha_registro' manual, usamos 'createdAt' del sistema
  if (!result.fecha_registro && result.createdAt) {
    result.fecha_registro = result.createdAt;
  }

  return result as T;
}

function extractRelation<T>(input: unknown): T[] {
  if (!input) return [];
  const wrapper = input as { data: unknown[] };
  if (wrapper.data && Array.isArray(wrapper.data)) {
    return wrapper.data.map((item) => normalize<T>(item));
  }
  if (Array.isArray(input)) {
    return input.map((item) => normalize<T>(item));
  }
  return [];
}

// ==========================================
// 4. FUNCIONES DE NEGOCIO
// ==========================================

// --- PEDIDOS ---
export async function getPedidos(): Promise<Pedido[]> {
  try {
    const res = await fetch(getApiUrl("pedidos?populate=*"), { cache: 'no-store' });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getPedidoByDocumentId(documentId: string): Promise<Pedido | null> {
  try {
    const res = await fetch(getApiUrl(`pedidos/${documentId}?populate=*`), { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null;
  }
}

export async function createPedido(datos: { cliente: string; telefono: string; direccion: string; items: string }) {
  try {
    const itemsArray = datos.items.split(',').map(i => i.trim());
    const res = await fetch(getApiUrl("pedidos"), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          cliente_nombre: datos.cliente,
          cliente_telefono: datos.telefono,
          direccion_entrega: datos.direccion,
          status_entrega: 'Cocina',
          detalle_pedido: { items: itemsArray }
        },
      }),
    });
    return res.ok;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
}

export async function completarPedido(pedidoDocumentId: string, riderDocumentId?: string): Promise<boolean> {
  try {
    const resPedido = await fetch(getApiUrl(`pedidos/${pedidoDocumentId}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { status_entrega: 'Entregado' } }),
    });
    
    if (riderDocumentId) {
       await fetch(getApiUrl(`repartidors/${riderDocumentId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { estado: 'Disponible' } }),
      });
    }
    return resPedido.ok;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
}

export async function cancelarPedido(id: string): Promise<boolean> {
  try {
    const res = await fetch(getApiUrl(`pedidos/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { status_entrega: 'Cancelado' } }),
    });
    return res.ok;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
}

// --- REPARTIDORES ---
export async function getRepartidores(estado: string = 'Disponible'): Promise<Repartidor[]> {
  try {
    const res = await fetch(getApiUrl(`repartidors?filters[estado][$eq]=${estado}`), { cache: 'no-store' });
    if (!res.ok) throw new Error('Error fetching repartidores');
    const json = await res.json();
    return json.data || [];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return [];
  }
}

export async function asignarRider(pedidoDocumentId: string, riderDocumentId: string): Promise<boolean> {
  try {
    const resRider = await fetch(getApiUrl(`repartidors/${riderDocumentId}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { estado: 'Ocupado' } }),
    });

    if (!resRider.ok) throw new Error('Error bloqueando rider');

    const resPedido = await fetch(getApiUrl(`pedidos/${pedidoDocumentId}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: { repartidor: riderDocumentId, status_entrega: 'En_ruta' },
      }),
    });

    if (!resPedido.ok) {
        await fetch(getApiUrl(`repartidors/${riderDocumentId}`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: { estado: 'Disponible' } }),
        });
        return false;
    }
    return true;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
}

// --- KIOSCO / EMPLEADOS ---

export async function validarEmpleadoPorPin(pin: string) {
  try {
    const url = getApiUrl(`empleados?populate=asistencias`);
    console.log("🔍 KIOSCO: Conectando a:", url); 

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) {
        console.error(`❌ Error HTTP ${res.status}`);
        return null;
    }

    const json = (await res.json()) as StrapiResponse<Empleado>;
    const rawList = Array.isArray(json.data) ? json.data : [json.data];
    const empleados = rawList.map((item) => normalize<Empleado>(item));

    const empleadoEncontrado = empleados.find((e) => 
        String(e.pin_code).trim() === String(pin).trim()
    );

    if (!empleadoEncontrado) {
        console.warn(`⚠️ PIN no encontrado.`);
        return null;
    }

    const historial = extractRelation<Asistencia>(empleadoEncontrado.asistencias);
    const lastAttendance = historial.sort((a, b) => 
        new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime()
    )[0];

    let currentStatus: 'fuera' | 'trabajando' | 'refrigerio' = 'fuera';

    if (lastAttendance) {
        if (lastAttendance.tipo === 'entrada' || lastAttendance.tipo === 'fin_refrigerio') {
            currentStatus = 'trabajando';
        } else if (lastAttendance.tipo === 'inicio_refrigerio') {
            currentStatus = 'refrigerio';
        }
    }

    return {
      empleado: {
        documentId: empleadoEncontrado.documentId || String(empleadoEncontrado.id),
        nombre: empleadoEncontrado.nombre,
        rol_operativo: empleadoEncontrado.rol_operativo
      },
      status: currentStatus
    };
  } catch (error) {
    console.error("💥 Error:", error);
    return null;
  }
}

// ✅ CORRECCIÓN AQUÍ: Eliminamos 'fecha_registro' del envío
export async function registrarAsistencia(empleadoId: string, tipo: string) {
  try {
    const res = await fetch(getApiUrl("asistencias"), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          empleado: empleadoId,
          tipo: tipo,
          // ❌ fecha_registro: ELIMINADO (Strapi usa createdAt automático)
        }
      })
    });
    
    if (!res.ok) {
        const errorData = await res.json();
        console.error("Error Strapi:", errorData);
    }
    return res.ok;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
}

export async function getAsistencias() {
  try {
    const res = await fetch(getApiUrl("asistencias?populate=empleado&sort=createdAt:desc&pagination[limit]=50"), {
      cache: 'no-store'
    });
    
    const json = (await res.json()) as StrapiResponse<Asistencia>;
    const rawList = Array.isArray(json.data) ? json.data : [json.data];

    return rawList.map((item) => {
        const asistencia = normalize<Asistencia>(item);
        let empleadoData: Empleado | null = null;
        if (asistencia.empleado) {
           const empRaw = (asistencia.empleado as { data: unknown }).data || asistencia.empleado;
           empleadoData = normalize<Empleado>(empRaw);
        }
        return { ...asistencia, empleado: empleadoData };
    });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return [];
  }
}