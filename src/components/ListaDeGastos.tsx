"use client";

import { useState } from "react";
import type { Gasto, Viaje } from "@/lib/types.ts";
import { formatearMoneda } from "@/lib/moneda.ts";
import { diaCorto } from "@/lib/fechas.ts";
import { borrarGastoConDeshacer } from "@/lib/almacen.ts";

/**
 * La lista de gastos.
 *
 * Cada fila se puede editar y borrar. No es un lujo: en una app cuyo argumento
 * es registrar rápido y sin mirar, escribir 450.000 en vez de 45.000 pasa, y no
 * poder corregirlo dañaría la cifra principal para siempre.
 *
 * Borrar ofrece deshacer durante unos segundos en vez de preguntar «¿seguro?».
 * Una confirmación castiga a todo el mundo por si acaso; deshacer solo cuesta
 * cuando de verdad hubo un error.
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

  const ordenados = [...gastos].sort(
    (a, b) => b.fecha.localeCompare(a.fecha) || b.creadoEn - a.creadoEn,
  );

  function borrar(g: Gasto) {
    const fn = borrarGastoConDeshacer(g.id);
    if (!fn) return;
    setDeshacer({ fn, que: g.descripcion });
    setTimeout(() => setDeshacer(null), 6000);
  }

  if (ordenados.length === 0) {
    return (
      <div className="rounded-(--radius-caja) border border-dashed border-(--color-filete) p-6 text-center">
        <p className="m-0 font-medium">Todavía no has registrado nada</p>
        <p className="m-0 mt-1 text-sm text-(--color-tinta-2)">
          El primer gasto que anotes empieza a construir tu ritmo diario.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {deshacer && (
        <div
          role="status"
          className="mb-2 flex items-center gap-3 rounded-(--radius-caja) bg-(--color-tinta) px-3 py-2 text-sm text-(--color-lienzo)"
        >
          <span>Borraste «{deshacer.que}»</span>
          <button
            type="button"
            onClick={() => {
              deshacer.fn();
              setDeshacer(null);
            }}
            className="ml-auto underline underline-offset-2"
          >
            Deshacer
          </button>
        </div>
      )}

      <ul className="m-0 flex list-none flex-col p-0">
        {ordenados.map((g) => (
          <li
            key={g.id}
            className="group flex items-center gap-3 border-b border-(--color-filete) py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate text-sm font-medium">{g.descripcion}</p>
              <p className="m-0 text-xs text-(--color-tinta-2)">
                {g.categoria} · {diaCorto(g.fecha)}
                {g.fueraDelRitmo && " · no cuenta para el ritmo"}
              </p>
            </div>

            <span className="shrink-0 text-sm font-semibold tabular-nums">
              {formatearMoneda(g.monto, viaje.moneda)}
            </span>

            {/* Visibles siempre en táctil; en escritorio aparecen al acercarse.
                Un control que solo existe al pasar el mouse no existe en un
                teléfono, así que la opacidad solo baja donde hay puntero. */}
            <div className="flex shrink-0 gap-1 sm:opacity-0 sm:transition-opacity sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
              <button
                type="button"
                onClick={() => onEditar(g)}
                aria-label={`Editar ${g.descripcion}`}
                className="rounded-(--radius-accion) px-2 py-1 text-xs underline underline-offset-2"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => borrar(g)}
                aria-label={`Borrar ${g.descripcion}`}
                className="rounded-(--radius-accion) px-2 py-1 text-xs text-(--color-excedido) underline underline-offset-2"
              >
                Borrar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
