"use client";

import type { Gasto, Viaje } from "@/lib/types.ts";
import { formatearMoneda } from "@/lib/moneda.ts";

/**
 * En qué se va la plata.
 *
 * ── Por qué barras y no una dona ───────────────────────────────────────────
 *
 * La pregunta es «¿en qué gasté más?», y eso es comparar magnitudes. Comparar
 * longitudes es inmediato; comparar ángulos no. Cleveland & McGill (1984) lo
 * dice sin rodeos: una dona para comparar valores cercanos se reemplaza por
 * una barra.
 *
 * ── Por qué un solo tono y no seis ─────────────────────────────────────────
 *
 * Porque acá el color no tiene trabajo. La identidad la carga la palabra, que
 * está al lado; la magnitud la carga la longitud. Un color por categoría solo
 * serviría para reconocer la misma categoría a través de varias pantallas, y
 * no es el caso. Seis matices saturados no agregarían información y volverían
 * la pantalla un semáforo — que es justo lo que hay que evitar.
 *
 * ⚠️ Hubo una ESCALERA de grises —cada barra un paso más clara que la anterior—
 * y se quitó. Codificaba el mismo dato dos veces: la longitud ya dice cuál es
 * mayor, así que el tono no aportaba nada y el ojo lo leía como si significara
 * otra cosa. Cinco grises seguidos se sienten confusos justamente porque
 * parecen una categoría más.
 *
 * Lo que se hace en su lugar es lo que recomienda Datawrapper para bajar la
 * cuenta de colores: UN color para la categoría que más pesa y gris para todas
 * las demás. Así el color sí dice algo —«esta es la que se está comiendo tu
 * viaje»— en vez de repetir lo que la barra ya dijo.
 *
 * Medido sobre la pista: la marca da 8.33:1 y el gris 4.29:1, los dos por
 * encima del 3:1 que pide un elemento gráfico.
 *
 * ── Por qué no hay porcentaje ──────────────────────────────────────────────
 *
 * Porque la barra ya es el porcentaje. Monto, longitud y porcentaje son la
 * misma información tres veces, y el resultado es que ninguna se lee.
 */
export function Desglose({ viaje, gastos }: { viaje: Viaje; gastos: Gasto[] }) {
  if (gastos.length === 0) return null;

  const porCategoria = new Map<string, number>();
  for (const g of gastos) {
    porCategoria.set(g.categoria, (porCategoria.get(g.categoria) ?? 0) + g.monto);
  }

  const filas = [...porCategoria.entries()].sort((a, b) => b[1] - a[1]);
  const mayor = filas[0][1];

  return (
    <section className="flex flex-col gap-3">
      <h2 className="rotulo m-0">En qué se va</h2>

      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {filas.map(([categoria, monto], i) => (
          <li key={categoria} className="flex flex-col gap-1.5">
            {/* Dos anclas, una en cada extremo: qué fue y cuánto. Nada compite
                en el medio. */}
            <div className="flex items-baseline justify-between gap-4">
              <span className="ancho-ui text-sm capitalize">{categoria}</span>
              <span className="cifra text-sm">{formatearMoneda(monto, viaje.moneda)}</span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-(--color-reposo)">
              <div
                className={`h-full rounded-full ${
                  i === 0 ? "bg-(--color-marca)" : "bg-(--color-tinta-2)"
                }`}
                style={{ width: `${(monto / mayor) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
