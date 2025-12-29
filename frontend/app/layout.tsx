import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers/Providers"; // <--- IMPORTANTE: Asegúrate de tener este archivo
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FluentOps | Gestión Logística",
  description: "Sistema integral para la gestión de pedidos y flota de repartidores.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 1. Cambiamos a español
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 2. Envolvemos la app con el Proveedor de Sesión */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}