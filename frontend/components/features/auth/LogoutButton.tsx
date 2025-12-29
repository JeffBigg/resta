'use client';

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/login' })} // Al salir, te manda al login
      className="text-sm text-red-600 hover:text-red-800 font-medium hover:underline transition-colors"
    >
      Cerrar Sesión
    </button>
  );
}