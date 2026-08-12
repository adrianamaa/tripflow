"use client";

import type { Gasto, Viaje } from "@/lib/types.ts";
import { formatearMoneda } from "@/lib/moneda.ts";

/**
 * En qué se va la plata.
 *
 * ── Por qué barras y no una dona ───────────────────────────────────────────
 *
 * La pregunta que contesta esta pieza es «¿en qué gasté más?», y eso es
 * comparar magnitudes. Comparar longitudes es inmediato; comparar ángulos no.
 * Cleveland & McGill (1984) lo midieron: una dona para comparar valores
 * cercanos se reemplaza por una barra o por los números.
 *
 * ── Por qué un solo color y no seis ────────────────────────────────────────
 *
 * Porque el color acá no carga identidad: la carga la palabra, que está al
 * lado. Seis matices saturados no agregarían información y sí volverían la
 * pantalla un semáforo.
 *
 * Las barras van ordenadas de mayor a menor, así que el orden ya es la
 * respuesta antes de leer una sola cifra.
 */
export function Desglose({ viaje, gastos }: { viaje: Viaje; gastos: Gasto[] }) {
  if (gastos.length === 0) return null;

  const porCategoria = new Map<string, number>();
  for (const g of gastos) {
    porCategoria.set(g.categoria, (porCategoria.get(g.categoria) ?? 0) + g.monto);
  }

  const filas = [...porCategoria.entries()].sort((a, b) => b[1] - a[1]);
  const mayor = filas[0][1];
  const total = filas.reduce((s, [, v]) => s + v, 0);

  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="rotulo m-0">En qué se va</h2>

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {filas.map(([categoria, monto], i) => (
          <li key={categoria} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="ancho-ui capitalize">{categoria}</span>
              <span className="text-(--color-tinta-2)">
                <span className="cifra text-(--color-tinta)">
                  {formatearMoneda(monto, viaje.moneda)}
                </span>{" "}
                <span className="cifra">{Math.round((monto / total) * 100)}%</span>
              </span>
            </div>
            {/* La escala es contra la categoría más grande, no contra el total:
                así la barra más larga llena el ancho y las demás se comparan
                contra ella, que es la comparación que importa. */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--color-reposo)">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(monto / mayor) * 100}%`,
                  background: "var(--color-tinta)",
                  // La primera es la respuesta; las demás son contexto.
                  opacity: i === 0 ? 1 : 0.45,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
