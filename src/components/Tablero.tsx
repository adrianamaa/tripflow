"use client";

import { useState } from "react";
import type { Gasto } from "@/lib/types.ts";
import { activarViaje, useEstado } from "@/lib/almacen.ts";
import { calcularBalance } from "@/lib/presupuesto.ts";
import { formatearMoneda } from "@/lib/moneda.ts";
import { diaLargo } from "@/lib/fechas.ts";
import { CifraDeControl } from "./CifraDeControl.tsx";
import { Alerta } from "./Alerta.tsx";
import { RegistrarGasto } from "./RegistrarGasto.tsx";
import { ListaDeGastos } from "./ListaDeGastos.tsx";
import { CrearViaje } from "./CrearViaje.tsx";

/**
 * El tablero.
 *
 * ── La decisión de layout, que se tomó antes de dibujar ────────────────────
 *
 * En escritorio son DOS COLUMNAS de verdad: a la izquierda el estado del viaje
 * —la cifra de control, la alerta, el registro— y a la derecha la lista de
 * gastos. No es una columna de móvil centrada con aire gris a los lados; eso
 * es lo que delata a una app pensada solo para teléfono y estirada después.
 *
 * En móvil es una sola columna con la cifra arriba y el registro inmediatamente
 * debajo, al alcance del pulgar, porque registrar un gasto es lo que se hace de
 * pie y con una mano.
 *
 * Las dos formas se decidieron a la vez, no una después de la otra.
 */
export function Tablero() {
  const { viajes, gastos, viajeActivoId } = useEstado();
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState<Gasto | null>(null);

  const viaje = viajes.find((v) => v.id === viajeActivoId) ?? viajes[0] ?? null;

  // Primer pintado en el servidor: todavía no hay datos. Se reserva el alto
  // para que la cifra no salte cuando lleguen.
  if (!viaje && viajes.length === 0 && !creando) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 p-(--spacing-borde)">
        <h1 className="m-0 text-3xl font-semibold tracking-tight">Tripflow</h1>
        <p className="m-0 text-(--color-tinta-2)">
          Define cuánto puedes gastar en un viaje y registra lo que gastes. La app te avisa antes de
          que se acabe, no después.
        </p>
        <button
          type="button"
          onClick={() => setCreando(true)}
          className="self-start rounded-(--radius-accion) bg-(--color-marca) px-5 py-2 font-medium text-(--color-sobre-marca)"
        >
          Crear mi primer viaje
        </button>
      </main>
    );
  }

  if (creando || !viaje) {
    return (
      <main className="mx-auto w-full max-w-lg p-(--spacing-borde)">
        <button
          type="button"
          onClick={() => setCreando(false)}
          className="mb-4 text-sm text-(--color-tinta-2) underline underline-offset-2"
        >
          ← Volver
        </button>
        <h1 className="m-0 mb-5 text-2xl font-semibold tracking-tight">Nuevo viaje</h1>
        <CrearViaje onListo={() => setCreando(false)} />
      </main>
    );
  }

  const delViaje = gastos.filter((g) => g.viajeId === viaje.id);
  const balance = calcularBalance(viaje, delViaje);

  return (
    <main className="mx-auto w-full max-w-6xl p-(--spacing-borde)">
      {/* ── Cabecera: selector de viaje ─────────────────────────────────── */}
      <header className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-2 border-b border-(--color-filete) pb-4">
        <div className="flex items-baseline gap-2">
          <h1 className="m-0 text-2xl font-semibold tracking-tight">{viaje.nombre}</h1>
          {viajes.length > 1 && (
            <>
              <label htmlFor="viaje" className="sr-only">Cambiar de viaje</label>
              <select
                id="viaje"
                value={viaje.id}
                onChange={(e) => activarViaje(e.target.value)}
                className="rounded-(--radius-caja) border border-(--color-filete) bg-transparent px-2 py-1 text-sm"
              >
                {viajes.map((v) => (
                  <option key={v.id} value={v.id}>{v.nombre}</option>
                ))}
              </select>
            </>
          )}
        </div>
        <p className="m-0 text-sm text-(--color-tinta-2)">
          {viaje.destino} · {diaLargo(viaje.inicio)} al {diaLargo(viaje.fin)} ·{" "}
          tope {formatearMoneda(viaje.presupuesto, viaje.moneda)}
        </p>
        <button
          type="button"
          onClick={() => setCreando(true)}
          className="ml-auto rounded-(--radius-accion) border border-(--color-tinta) px-3 py-1.5 text-sm"
        >
          Nuevo viaje
        </button>
      </header>

      {/* ── Dos columnas en escritorio, una en móvil ─────────────────────── */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section className="flex flex-col gap-6">
          <CifraDeControl viaje={viaje} balance={balance} />
          <Alerta
            viaje={viaje}
            balance={balance}
            gastos={delViaje}
            onAjustar={() => document.getElementById("monto")?.focus()}
          />
          <div className="rounded-(--radius-caja) border border-(--color-filete) p-4">
            <RegistrarGasto viaje={viaje} editando={editando} onListo={() => setEditando(null)} />
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="m-0 text-[11px] uppercase tracking-[0.13em] text-(--color-tinta-2)">
              Gastos
            </h2>
            <span className="text-sm text-(--color-tinta-2) tabular-nums">
              {formatearMoneda(balance.gastadoTotal, viaje.moneda)} de{" "}
              {formatearMoneda(viaje.presupuesto, viaje.moneda)}
            </span>
          </div>
          <ListaDeGastos viaje={viaje} gastos={delViaje} onEditar={setEditando} />
        </section>
      </div>
    </main>
  );
}
