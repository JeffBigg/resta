// lib/api.ts

import { Pedido, Repartidor, Empleado, Asistencia } from "@/types";

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
// 2. HELPERS TÉCNICOS DE STRAPI
// ==========================================
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
// 3. NORMALIZADORES
// ==========================================
function normalize<T>(input: unknown): T {
  if (!input || typeof input !== "object") return {} as T;
  const data = input as StrapiWrapper<T>;
  let result: Record<string, unknown> = {};
  
  if ("attributes" in data && data.attributes) {
    result = { id: data.id, documentId: data.documentId, ...data.attributes };
  } else {
    result = data;
  }
  
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
// 4. FUNCIONES DE NEGOCIO - PEDIDOS
// ==========================================
export async function getPedidos(): Promise<Pedido[]> {
  try {
    const res = await fetch(getApiUrl("pedidos?populate=*&sort=createdAt:desc"), {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const json = await res.json();
    const rawList = Array.isArray(json.data) ? json.data : [json.data];
    return rawList.map((item: unknown) => normalize<Pedido>(item));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getPedidoByDocumentId(documentId: string): Promise<Pedido | null> {
  try {
    const res = await fetch(getApiUrl(`pedidos/${documentId}?populate=*`), {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return normalize<Pedido>(json.data);
  } catch {
    return null;
  }
}

export async function createPedido(datos: {
  cliente: string;
  telefono: string;
  direccion: string;
  items: string;
}) {
  try {
    const itemsArray = datos.items.split(",").map((i) => i.trim());
    const res = await fetch(getApiUrl("pedidos"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          cliente_nombre: datos.cliente,
          cliente_telefono: datos.telefono,
          direccion_entrega: datos.direccion,
          status_entrega: "Cocina",
          detalle_pedido: { items: itemsArray },
        },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function completarPedido(pedidoDocumentId: string, riderDocumentId?: string): Promise<boolean> {
  try {
    const resPedido = await fetch(getApiUrl(`pedidos/${pedidoDocumentId}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: { status_entrega: "Entregado" } }),
    });
    if (riderDocumentId) {
      await fetch(getApiUrl(`repartidors/${riderDocumentId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { estado: "Disponible" } }),
      });
    }
    return resPedido.ok;
  } catch {
    return false;
  }
}

export async function cancelarPedido(id: string): Promise<boolean> {
  try {
    const res = await fetch(getApiUrl(`pedidos/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: { status_entrega: "Cancelado" } }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function asignarRider(pedidoDocumentId: string, riderDocumentId: string): Promise<boolean> {
  try {
    const resRider = await fetch(getApiUrl(`repartidors/${riderDocumentId}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: { estado: "Ocupado" } }),
    });
    if (!resRider.ok) throw new Error("Error bloqueando rider");
    const resPedido = await fetch(getApiUrl(`pedidos/${pedidoDocumentId}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: { repartidor: riderDocumentId, status_entrega: "En_ruta" },
      }),
    });
    if (!resPedido.ok) {
      await fetch(getApiUrl(`repartidors/${riderDocumentId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { estado: "Disponible" } }),
      });
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// ==========================================
// 5. FUNCIONES DE NEGOCIO - REPARTIDORES
// ==========================================

export async function getRepartidores(estado?: string): Promise<Repartidor[]> {
  try {
    const query = estado 
      ? `repartidors?filters[estado][$eq]=${estado}` 
      : `repartidors?sort=nombre:asc`;

    const res = await fetch(getApiUrl(query), { cache: 'no-store' });
    if (!res.ok) throw new Error();
    const json = await res.json();
    const rawList = Array.isArray(json.data) ? json.data : [json.data];
    return rawList.map((item: unknown) => normalize<Repartidor>(item));
  } catch {
    return [];
  }
}

export async function createRepartidor(datos: { nombre: string; apellido: string; telefono: string; pin_code: string }) {
  try {
    const res = await fetch(getApiUrl("repartidors"), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        data: { 
          ...datos, 
          estado: 'Desconectado' 
        } 
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ✅ NUEVO: Función para EDITAR Repartidor
export async function updateRepartidor(documentId: string, datos: Partial<Repartidor>) {
  try {
    const res = await fetch(getApiUrl(`repartidors/${documentId}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: datos }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteRepartidor(documentId: string): Promise<boolean> {
  try {
    const res = await fetch(getApiUrl(`repartidors/${documentId}`), {
      method: 'DELETE',
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function updateRiderStatus(id: string, estado: string) {
  try {
    await fetch(getApiUrl(`repartidors/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { estado } }),
    });
  } catch (e) { 
    console.error("Error actualizando status rider", e); 
  }
}

// ==========================================
// 6. KIOSCO / EMPLEADOS
// ==========================================

export async function validarEmpleadoPorPin(pin: string) {
  try {
    // 1. Buscamos en EMPLEADOS
    const resEmp = await fetch(getApiUrl(`empleados?populate=asistencias`), { cache: "no-store" });
    const jsonEmp = await resEmp.json();
    const listEmp = Array.isArray(jsonEmp.data) ? jsonEmp.data : [jsonEmp.data];
    
    const empleado = listEmp
      .map((item: unknown) => normalize<Empleado>(item))
      .find((e: Empleado) => String(e.pin_code).trim() === String(pin).trim());

    if (empleado) {
      return processLogin(empleado, 'staff');
    }

    // 2. Buscamos en REPARTIDORES
    const resRider = await fetch(getApiUrl(`repartidors?populate=asistencias`), { cache: "no-store" });
    const jsonRider = await resRider.json();
    const listRider = Array.isArray(jsonRider.data) ? jsonRider.data : [jsonRider.data];
    
    const rider = listRider
      .map((item: unknown) => normalize<Repartidor>(item))
      .find((r: Repartidor) => String(r.pin_code).trim() === String(pin).trim());

    if (rider) {
      return processLogin(rider, 'rider');
    }

    console.warn(`⚠️ PIN no encontrado.`);
    return null;
  } catch (error) {
    console.error("💥 Error:", error);
    return null;
  }
}

function processLogin(persona: Empleado | Repartidor, roleType: 'staff' | 'rider') {
  const historial = extractRelation<Asistencia>(persona.asistencias);
  const lastAttendance = historial.sort(
    (a, b) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime()
  )[0];

  let currentStatus: "fuera" | "trabajando" | "refrigerio" = "fuera";

  if (lastAttendance) {
    if (lastAttendance.tipo === "entrada" || lastAttendance.tipo === "fin_refrigerio") {
      currentStatus = "trabajando";
    } else if (lastAttendance.tipo === "inicio_refrigerio") {
      currentStatus = "refrigerio";
    }
  }

  const docId = persona.documentId || String(persona.id);
  
  return {
    persona: {
      documentId: docId,
      nombre: persona.nombre,
      rol: roleType === 'staff' ? (persona as Empleado).rol_operativo : 'Motorizado',
      type: roleType
    },
    status: currentStatus,
  };
}

interface AsistenciaPayload {
  tipo: string;
  empleado?: string;
  repartidor?: string;
}

export async function registrarAsistencia(idPersona: string, tipo: string, roleType: 'staff' | 'rider' = 'staff') {
  try {
    const payload: AsistenciaPayload = { tipo };
    if (roleType === 'staff') {
      payload.empleado = idPersona;
    } else {
      payload.repartidor = idPersona;
    }

    const res = await fetch(getApiUrl("asistencias"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: payload }),
    });

    if (res.ok && roleType === 'rider') {
       if (tipo === 'entrada') await updateRiderStatus(idPersona, 'Disponible');
       else if (tipo === 'salida') await updateRiderStatus(idPersona, 'Desconectado');
    }

    return res.ok;
  } catch {
    return false;
  }
}

export async function getAsistencias() {
  try {
    const res = await fetch(
      getApiUrl("asistencias?populate=*&sort=createdAt:desc&pagination[limit]=50"),
      { cache: "no-store" }
    );
    const json = (await res.json()) as StrapiResponse<Asistencia>;
    const rawList = Array.isArray(json.data) ? json.data : [json.data];
    
    return rawList.map((item) => {
      const asistencia = normalize<Asistencia>(item);
      let empleadoData: Empleado | null = null;
      
      if (asistencia.empleado) {
        const empRaw = (asistencia.empleado as { data: unknown }).data || asistencia.empleado;
        if (empRaw) empleadoData = normalize<Empleado>(empRaw);
      }

      if (!empleadoData && asistencia.repartidor) {
         const riderRaw = (asistencia.repartidor as { data: unknown }).data || asistencia.repartidor;
         if (riderRaw) {
             const riderNorm = normalize<Repartidor>(riderRaw);
             empleadoData = {
                 id: riderNorm.id,
                 documentId: riderNorm.documentId,
                 nombre: riderNorm.nombre,
                 apellido: riderNorm.apellido,
                 rol_operativo: 'Motorizado',
                 pin_code: riderNorm.pin_code,
                 telefono: riderNorm.telefono || ''
             };
         }
      }
      return { ...asistencia, empleado: empleadoData };
    });
  } catch {
    return [];
  }
}

// ==========================================
// 7. GESTIÓN DE EMPLEADOS (CRUD)
// ==========================================

export async function getEmpleados(): Promise<Empleado[]> {
  try {
    const res = await fetch(getApiUrl("empleados?sort=nombre:asc"), {
      cache: "no-store",
    });
    const json = await res.json();
    const rawList = Array.isArray(json.data) ? json.data : [json.data];
    return rawList.map((item: unknown) => normalize<Empleado>(item));
  } catch {
    return [];
  }
}

export async function createEmpleado(datos: {
  nombre: string;
  apellido: string;
  telefono: string;
  rol_operativo: string;
  pin_code: string;
}) {
  try {
    const res = await fetch(getApiUrl("empleados"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: datos }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ✅ NUEVO: Función para EDITAR Empleado
export async function updateEmpleado(documentId: string, datos: Partial<Empleado>) {
  try {
    const res = await fetch(getApiUrl(`empleados/${documentId}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: datos }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteEmpleado(documentId: string): Promise<boolean> {
  try {
    const res = await fetch(getApiUrl(`empleados/${documentId}`), {
      method: "DELETE",
    });
    return res.ok;
  } catch {
    return false;
  }
}