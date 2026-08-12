"use client";

import { useState } from "react";
import type { Gasto } from "@/lib/types.ts";
import { useEstado } from "@/lib/almacen.ts";
import { calcularBalance } from "@/lib/presupuesto.ts";
import { diaLargo } from "@/lib/fechas.ts";
import { CifraDeControl } from "./CifraDeControl.tsx";
import { Medidor } from "./Medidor.tsx";
import { Desglose } from "./Desglose.tsx";
import { SelectorDeViajes } from "./SelectorDeViajes.tsx";
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
        <h1 className="ancho-dato m-0 text-3xl">Tripflow</h1>
        <p className="m-0 text-(--color-tinta-2)">
          Define cuánto puedes gastar en un viaje y registra lo que gastes. La app te avisa antes de
          que se acabe, no después.
        </p>
        <button
          type="button"
          onClick={() => setCreando(true)}
          className="self-start rounded-(--radius-accion) bg-(--color-acento) px-5 py-2 font-medium text-(--color-sobre-acento)"
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
        <h1 className="ancho-dato m-0 mb-5 text-2xl">Nuevo viaje</h1>
        <CrearViaje onListo={() => setCreando(false)} />
      </main>
    );
  }

  const delViaje = gastos.filter((g) => g.viajeId === viaje.id);
  const balance = calcularBalance(viaje, delViaje);

  return (
    <main className="mx-auto w-full max-w-6xl p-(--spacing-borde)">
      <header className="mb-7 flex flex-col gap-3">
        <SelectorDeViajes
          viajes={viajes}
          activoId={viaje.id}
          onNuevo={() => setCreando(true)}
        />
        <div>
          <h1 className="ancho-dato m-0 text-[28px] leading-tight">{viaje.nombre}</h1>
          <p className="m-0 text-sm text-(--color-tinta-2)">
            {viaje.destino} · {diaLargo(viaje.inicio)} al {diaLargo(viaje.fin)}
          </p>
        </div>
      </header>

      {/* ── Dos columnas en escritorio, una en móvil ─────────────────────── */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section className="flex flex-col gap-4">
          <div className="tarjeta flex flex-col gap-5">
            <CifraDeControl viaje={viaje} balance={balance} />
            <Medidor viaje={viaje} balance={balance} />
            <Alerta
            viaje={viaje}
            balance={balance}
            gastos={delViaje}
              onAjustar={() => document.getElementById("monto")?.focus()}
            />
          </div>

          <div className="tarjeta">
            <RegistrarGasto
              key={editando?.id ?? `nuevo-${viaje.id}`}
              viaje={viaje}
              editando={editando}
              onListo={() => setEditando(null)}
            />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="tarjeta">
            <Desglose viaje={viaje} gastos={delViaje} />
          </div>
          <div className="tarjeta">
            <h2 className="rotulo m-0 mb-3">Gastos</h2>
            <ListaDeGastos viaje={viaje} gastos={delViaje} onEditar={setEditando} />
          </div>
        </section>
      </div>
    </main>
  );
}
