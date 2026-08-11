import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tripflow",
  description:
    "Controla el presupuesto de tu viaje: define un tope, registra lo que gastas y entérate antes de que se acabe.",
};

export const viewport: Viewport = {
  // La app se usa con una mano mientras se paga algo. Bloquear el zoom sería
  // hostil, así que solo se fija el ancho.
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
