// types/index.ts

// Estructura para items que vienen de n8n (WhatsApp)
export interface ItemPedido {
  nombre: string;
  cantidad: number;
}

export interface Repartidor {
  id: number;
  documentId: string;
  nombre: string;
  estado: 'Disponible' | 'Ocupado' | 'Desconectado';
  telefono?: string;
}

export interface Pedido {
  id: number;
  documentId: string;
  cliente_nombre: string;
  cliente_telefono: string;
  direccion_entrega: string;
  status_entrega: 'Cocina' | 'Listo_para_recoger' | 'En_ruta' | 'Entregado' | 'Cancelado';
  detalle_pedido: {
    // 🔥 AQUÍ ESTÁ LA MAGIA: Aceptamos texto simple (Web) U objetos (n8n)
    items: string[] | ItemPedido[];
  };
  repartidor?: Repartidor;
  createdAt: string;
  updatedAt: string;
}