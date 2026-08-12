import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

/**
 * Una sola familia para toda la app.
 *
 * Archivo, de Omnibus-Type (Héctor Gatti, Argentina), licencia SIL OFL. Es
 * variable y trae dos ejes en un solo archivo: peso y ANCHO.
 *
 * Ese segundo eje es la decisión de sistema: **la jerarquía la carga el ancho,
 * no el peso ni el tamaño**. Tres anchos —78, 100, 118— dan escalones
 * intermedios sin sumar tamaños ni pesos, que es justo lo que le falta a una
 * pantalla donde todo compite en el mismo plano.
 *
 * Y para el dinero está verificada en el binario: su `tnum` deja los diez
 * dígitos del mismo ancho, y —esto es lo decisivo acá— **no ensancha el punto
 * ni la coma**, así que `$ 2.450.000` se mantiene compacto en formato colombiano.
 *
 * ⚠️ El eje `wdth` hay que declararlo explícitamente. Si no, next/font sirve
 * solo el peso y el sistema entero se cae en silencio.
 */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--fuente",
});

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
    <html lang="es" className={archivo.variable}>
      <body>{children}</body>
    </html>
  );
}
