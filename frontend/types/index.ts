// types/index.ts

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
    // ACTUALIZACIÓN AQUÍ: Agregamos 'Cancelado'
    status_entrega: 'Cocina' | 'Listo_para_recoger' | 'En_ruta' | 'Entregado' | 'Cancelado' | string; 
    detalle_pedido: {
        items: string[];
    };
    repartidor?: Repartidor; 
    
    createdAt: string; // Strapi lo llena automático (Hora pedido)
    updatedAt: string; // Strapi lo llena automático (Hora entrega aprox)
}