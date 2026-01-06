// types/index.ts

// --- PEDIDOS & LOGÍSTICA ---
export interface ItemPedido {
  nombre: string;
  cantidad: number;
}

export interface Repartidor {
  id: number;
  documentId: string;
  nombre: string;
  apellido: string;
  pin_code: string;
  estado: 'Disponible' | 'Ocupado' | 'Desconectado';
  telefono?: string;
  asistencias?: { data: Asistencia[] } | Asistencia[];
}

export interface Pedido {
  id: number;
  documentId: string;
  cliente_nombre: string;
  cliente_telefono: string;
  direccion_entrega: string;
  status_entrega: 'Cocina' | 'Listo_para_recoger' | 'En_ruta' | 'Entregado' | 'Cancelado';
  detalle_pedido: {
    items: string[] | ItemPedido[];
  };
  repartidor?: Repartidor;
  createdAt: string;
  updatedAt: string;
}

// --- RRHH (Kiosco & Asistencia) ---
export interface Empleado {
  id?: number;
  documentId?: string;
  nombre: string;
  apellido: string;
  telefono: string;
  rol_operativo: string;
  pin_code: string;
  // Referencia circular opcional para la API
  asistencias?: { data: Asistencia[] } | Asistencia[];
}

export interface Asistencia {
  id?: number;
  documentId?: string;
  tipo: 'entrada' | 'salida' | 'inicio_refrigerio' | 'fin_refrigerio';
  fecha_registro: string;
  createdAt?: string;
  empleado?: { data: Empleado } | Empleado;
  repartidor?: { data: Repartidor } | Repartidor;
}