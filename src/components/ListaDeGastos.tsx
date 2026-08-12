"use client";

import { useState } from "react";
import type { Gasto, Viaje } from "@/lib/types.ts";
import { formatearMoneda } from "@/lib/moneda.ts";
import { diaCorto } from "@/lib/fechas.ts";
import { borrarGastoConDeshacer } from "@/lib/almacen.ts";

/**
 * La lista de gastos.
 *
 * ── Lo que se arregló acá, y por qué ───────────────────────────────────────
 *
 * La primera versión tenía once filas idénticas: descripción, una línea gris
 * diminuta con la categoría y la fecha, y el monto. Todo con el mismo peso. El
 * ojo no tenía dónde caer y la categoría no se distinguía de la fecha.
 *
 * Tres cambios, y ninguno agrega color:
 *
 * 1. Los gastos se agrupan por día, con la fecha como encabezado y su total.
 *    Once filas sueltas son una pila; agrupadas son tres días de un viaje, que
 *    es como la gente recuerda lo que gastó.
 * 2. La categoría se separa de la fecha usando el eje de ancho: va estrecha y
 *    en mayúscula, así que se lee como etiqueta y no como más texto gris.
 * 3. Editar y borrar están SIEMPRE visibles. Aparecer al pasar el mouse no
 *    existe en un teléfono y es difícil de descubrir hasta en escritorio.
 */
export function ListaDeGastos({
  viaje,
  gastos,
  onEditar,
}: {
  viaje: Viaje;
  gastos: Gasto[];
  onEditar: (g: Gasto) => void;
}) {
  const [deshacer, setDeshacer] = useState<{ fn: () => void; que: string } | null>(null);

  function borrar(g: Gasto) {
    const fn = borrarGastoConDeshacer(g.id);
    if (!fn) return;
    setDeshacer({ fn, que: g.descripcion });
    setTimeout(() => setDeshacer(null), 8000);
  }

  if (gastos.length === 0) {
    return (
      <div className="rounded-(--radius-caja) border border-dashed border-(--color-filete) p-6 text-center">
        <p className="ancho-medio m-0">Todavía no has registrado nada</p>
        <p className="m-0 mt-1 text-sm text-(--color-tinta-2)">
          El primer gasto que anotes empieza a construir tu ritmo diario.
        </p>
      </div>
    );
  }

  // Agrupar por día, del más reciente al más viejo.
  const porDia = new Map<string, Gasto[]>();
  for (const g of [...gastos].sort((a, b) => b.fecha.localeCompare(a.fecha))) {
    porDia.set(g.fecha, [...(porDia.get(g.fecha) ?? []), g]);
  }

  return (
    <div className="flex flex-col">
      {deshacer && (
        <div
          role="status"
          className="mb-3 flex items-center gap-3 rounded-(--radius-caja) bg-(--color-tinta) px-3 py-2 text-sm text-(--color-lienzo)"
        >
          <span>
            Borraste <span className="ancho-medio">{deshacer.que}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              deshacer.fn();
              setDeshacer(null);
            }}
            className="ancho-medio ml-auto rounded-(--radius-accion) border border-(--color-lienzo) px-3 py-1"
          >
            Deshacer
          </button>
        </div>
      )}

      {[...porDia.entries()].map(([fecha, delDia]) => {
        const total = delDia.reduce((s, g) => s + g.monto, 0);
        return (
          <section key={fecha} className="mb-5">
            <div className="mb-1 flex items-baseline justify-between border-b border-(--color-tinta) pb-1">
              <h3 className="ancho-medio m-0 text-sm">{diaCorto(fecha)}</h3>
              <span className="cifra text-sm text-(--color-tinta-2)">
                {formatearMoneda(total, viaje.moneda)}
              </span>
            </div>

            <ul className="m-0 flex list-none flex-col p-0">
              {delDia.map((g) => (
                <li
                  key={g.id}
                  className="flex items-baseline gap-3 border-b border-(--color-filete) py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="ancho-ui m-0 truncate text-[15px]">{g.descripcion}</p>
                    <p className="ancho-densa m-0 text-[10.5px] tracking-[0.09em] text-(--color-tinta-2) uppercase">
                      {g.categoria}
                      {g.fueraDelRitmo && " · pago único"}
                    </p>
                  </div>

                  {/* A la derecha, como en cualquier hoja de cálculo: permite
                      comparar magnitudes por dónde empieza el número. */}
                  <span className="cifra shrink-0 text-right text-[15px] tabular-nums">
                    {formatearMoneda(g.monto, viaje.moneda)}
                  </span>

                  <div className="flex shrink-0 gap-2 text-(--color-tinta-2)">
                    <button
                      type="button"
                      onClick={() => onEditar(g)}
                      aria-label={`Editar ${g.descripcion}`}
                      className="text-xs underline underline-offset-2 hover:text-(--color-tinta)"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => borrar(g)}
                      aria-label={`Borrar ${g.descripcion}`}
                      className="text-xs underline underline-offset-2 hover:text-(--color-excedido)"
                    >
                      Borrar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
