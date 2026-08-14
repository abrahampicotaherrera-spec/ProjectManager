import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ALPH · Gestor de Proyectos",
  description: "Seguimiento de proyectos y servicios de clientes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-sans">{children}</body>
    </html>
  );
}
