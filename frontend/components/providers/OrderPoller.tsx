'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getPedidos } from '@/lib/api'; 
import { Pedido } from '@/types';       

const POLLING_INTERVAL = 10000; // 10 segundos

export default function OrderPoller() {
  const router = useRouter();
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Cargar sonido
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/notification.wav'); 
      audioRef.current.load();
    }
  }, []);

  // 2. Reproducir
  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ignoramos errores de autoplay si el usuario no ha interactuado
      });
    }
  }, []);

  // 3. Notificar
  const showToast = useCallback((pedido: Pedido) => {
    toast.message('🔔 ¡Nuevo Pedido!', {
      description: `${pedido.cliente_nombre} ha realizado un pedido.`,
      duration: Infinity, 
      action: {
        label: 'Ver',
        onClick: () => router.push('/dashboard/pedidos'),
      },
      style: {
        background: '#1e293b', 
        color: '#fff', 
        border: '1px solid #3b82f6'
      }
    });
  }, [router]);

  // 4. Ciclo de Vigilancia
  useEffect(() => {
    const check = async () => {
      try {
        // Obtenemos el último pedido (gracias al sort:desc en la API)
        const pedidos = await getPedidos();
        
        if (!pedidos || pedidos.length === 0) return;

        const masReciente = pedidos[0];
        const currentId = masReciente.documentId || String(masReciente.id);

        // Primera carga: sincronizamos sin sonar
        if (!lastOrderId) {
          setLastOrderId(currentId);
          return;
        }

        // Cambio detectado: Sonamos
        if (currentId !== lastOrderId) {
          setLastOrderId(currentId);
          playSound();
          showToast(masReciente);
          router.refresh();
        }
      } catch {
        // Fallo silencioso (para no molestar en consola)
      }
    };

    // Iniciamos intervalo
    const interval = setInterval(check, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [lastOrderId, playSound, showToast, router]);

  return null; // Invisible y limpio
}