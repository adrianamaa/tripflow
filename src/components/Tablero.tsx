"use client";

import { useState } from "react";
import type { Gasto } from "@/lib/types.ts";
import { useEstado } from "@/lib/almacen.ts";
import { calcularBalance } from "@/lib/presupuesto.ts";
import { diaLargo } from "@/lib/fechas.ts";
import { Marca } from "./Marca.tsx";
import { CifraDeControl } from "./CifraDeControl.tsx";
import { Medidor } from "./Medidor.tsx";
import { Desglose } from "./Desglose.tsx";
import { SelectorDeViajes } from "./SelectorDeViajes.tsx";
import { Alerta } from "./Alerta.tsx";
import { RegistrarGasto } from "./RegistrarGasto.tsx";
import { ListaDeGastos } from "./ListaDeGastos.tsx";
import { CrearViaje } from "./CrearViaje.tsx";
import { AjustarPresupuesto } from "./AjustarPresupuesto.tsx";

/**
 * El tablero.
 *
 * ══ CÓMO SE REPARTE LA INFORMACIÓN ════════════════════════════════════════
 *
 * La primera versión tenía cuatro tarjetas iguales —mismo blanco, mismo radio,
 * mismo relleno— repartidas en dos columnas. Eso no es jerarquía: es una sola
 * capa con cuatro cajas, y el ojo no tiene dónde caer primero.
 *
 * Ahora hay DOS PLANOS, y se distinguen por ancho y posición, no por adorno:
 *
 *   PLANO 1 · el resumen — una banda de ancho completo. Responde «¿cómo voy?».
 *   PLANO 2 · el detalle — dos columnas debajo. Responden «¿qué hago?» y
 *             «¿qué he hecho?».
 *
 * ── Tres decisiones que cambiaron la pantalla ─────────────────────────────
 *
 * 1. LA BANDA DE RESUMEN SE ACUESTA. En escritorio no apila la cifra sobre el
 *    medidor sobre la alerta: usa el ancho. A la izquierda las CIFRAS, a la
 *    derecha las PALABRAS. Apilar en una columna angosta y dejar aire gris a
 *    los lados es exactamente el gesto que delata una pantalla de teléfono
 *    estirada, y es lo que hay que evitar acá.
 *
 *    Que las palabras tengan columna propia no es estética: la investigación
 *    dice que la gente quiere que la app le HABLE, no solo que le muestre. Si
 *    la frase va de pie de foto debajo de un número, se lee como leyenda.
 *
 * 2. REGISTRAR SUBIÓ. Antes el formulario era lo último de la columna
 *    izquierda: en una pantalla de 1440×900 quedaba DEBAJO DEL PLIEGUE. La
 *    acción principal de la app —la que el enunciado pide que sea «fácil y
 *    rápida»— no se veía sin desplazar. Ahora es lo primero del plano 2, y en
 *    móvil queda justo debajo del resumen, al alcance del pulgar.
 *
 * 3. LA LISTA DEJÓ DE SER UNA LOSA. Antes eran trece filas dentro de una sola
 *    tarjeta blanca altísima que no terminaba a la misma altura que la columna
 *    de al lado, y el desnivel se leía como un hueco. Ahora cada día es su
 *    propia tarjeta: se agrupa de verdad, y la columna termina en un borde que
 *    parece decidido en vez de cortado.
 *
 * Los planos se separan con ESPACIO, no con líneas. Es lo que hacen los
 * tableros que se revisaron: la métrica principal se despega del resto por
 * distancia, y las reglas se guardan para dentro de un bloque.
 */
export function Tablero() {
  const { viajes, gastos, viajeActivoId } = useEstado();
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState<Gasto | null>(null);
  const [ajustando, setAjustando] = useState(false);

  const viaje = viajes.find((v) => v.id === viajeActivoId) ?? viajes[0] ?? null;

  // Primer pintado en el servidor: todavía no hay datos.
  if (!viaje && viajes.length === 0 && !creando) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 px-5 sm:px-8">
        <Marca tamano={32} />
        <p className="m-0 text-lg leading-relaxed text-(--color-tinta-2)">
          Define cuánto puedes gastar en un viaje y registra lo que gastes. La app te avisa antes de
          que se acabe, no después.
        </p>
        <button
          type="button"
          onClick={() => setCreando(true)}
          className="ancho-medio self-start rounded-(--radius-accion) bg-(--color-acento) px-5 py-2.5 text-(--color-sobre-acento) hover:brightness-95"
        >
          Crear mi primer viaje
        </button>
      </main>
    );
  }

  if (creando || !viaje) {
    return (
      <main className="mx-auto w-full max-w-lg px-5 pt-8 pb-16 sm:px-8 sm:pt-12">
        <div className="mb-7 flex items-center justify-between gap-4">
          <Marca tamano={24} />
          <button
            type="button"
            onClick={() => setCreando(false)}
            className="ancho-ui rounded-(--radius-accion) px-3 py-1.5 text-sm text-(--color-tinta-2) hover:bg-(--color-reposo) hover:text-(--color-tinta)"
          >
            ← Volver
          </button>
        </div>
        <h1 className="ancho-dato m-0 mb-6 text-[26px]">Nuevo viaje</h1>
        <div className="tarjeta">
          <CrearViaje onListo={() => setCreando(false)} />
        </div>
      </main>
    );
  }

  const delViaje = gastos.filter((g) => g.viajeId === viaje.id);
  const balance = calcularBalance(viaje, delViaje);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pt-6 pb-16 sm:px-8 sm:pt-8">
      <header className="mb-6 flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <Marca tamano={24} />
          <SelectorDeViajes viajes={viajes} activoId={viaje.id} onNuevo={() => setCreando(true)} />
        </div>

        <div>
          <h1 className="ancho-dato m-0 text-[28px] leading-tight">{viaje.nombre}</h1>
          <p className="m-0 text-sm text-(--color-tinta-2)">
            {viaje.destino} · {diaLargo(viaje.inicio)} al {diaLargo(viaje.fin)}
          </p>
        </div>
      </header>

      {/* ── PLANO 1 · el resumen ─────────────────────────────────────────────
          Cifras a la izquierda, palabras a la derecha. */}
      <section className="tarjeta mb-6 sm:p-7">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
          <div className="flex flex-col gap-6">
            <CifraDeControl viaje={viaje} balance={balance} />
            <Medidor viaje={viaje} balance={balance} />
          </div>

          {/* Centrada: la columna de palabras es más corta que la de cifras, y
              anclada arriba dejaba un vacío debajo que se leía como algo que
              falta. Centrada, el aire queda repartido y parece decidido. */}
          <div className="flex flex-col justify-center gap-4">
            <Alerta
              viaje={viaje}
              balance={balance}
              gastos={delViaje}
              onAjustar={() => setAjustando(true)}
            />
            {ajustando && (
              <AjustarPresupuesto
                viaje={viaje}
                balance={balance}
                onCerrar={() => setAjustando(false)}
              />
            )}
          </div>
        </div>
      </section>

      {/* ── PLANO 2 · el detalle ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Pegajosa en escritorio.
            La lista de gastos crece sin techo y la columna de al lado no, así
            que el desnivel entre las dos no se puede resolver rellenando: se
            resuelve decidiendo qué hace ese espacio. Acá lo hace el formulario,
            que queda a la vista mientras se recorren los gastos — que es justo
            cuando uno se acuerda de lo que no anotó. El hueco deja de ser un
            sobrante y pasa a ser el sitio donde vive la acción principal. */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-6">
          <div id="formulario-gasto" className="tarjeta">
            <RegistrarGasto
              key={editando?.id ?? `nuevo-${viaje.id}`}
              viaje={viaje}
              editando={editando}
              onListo={() => setEditando(null)}
            />
          </div>

          {/* Sin gastos el desglose no devuelve nada, y su tarjeta quedaría
              como un rectángulo blanco vacío en mitad de la columna. */}
          {delViaje.length > 0 && (
            <div className="tarjeta">
              <Desglose viaje={viaje} gastos={delViaje} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="rotulo m-0">Gastos</h2>
          <ListaDeGastos
            viaje={viaje}
            gastos={delViaje}
            onEditar={(g) => {
              setEditando(g);
              // Sin esto, tocar «Editar» cambia un formulario que en móvil está
              // fuera de pantalla: parece que el botón no hizo nada.
              requestAnimationFrame(() =>
                document
                  .getElementById("formulario-gasto")
                  ?.scrollIntoView({ behavior: "smooth", block: "center" }),
              );
            }}
          />
        </div>
      </div>
    </main>
  );
}
