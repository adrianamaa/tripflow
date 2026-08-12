"use client";

import { useState } from "react";
import type { Gasto } from "@/lib/types.ts";
import { useEstado, useHidratado } from "@/lib/almacen.ts";
import { calcularBalance } from "@/lib/presupuesto.ts";
import { diaLargo } from "@/lib/fechas.ts";
import { Marca } from "./Marca.tsx";
import { IconoIzquierda } from "./iconos.tsx";
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
/**
 * El estado de carga.
 *
 * Existe por una razón concreta: los datos viven en `localStorage`, que en el
 * servidor no existe, así que el primer pintado siempre llega vacío. Sin esto,
 * el tablero interpretaba «vacío» como «no tiene viajes» y dibujaba la
 * bienvenida — de modo que quien abría el link público veía «Crear mi primer
 * viaje» durante un instante, aunque tuviera viajes guardados.
 *
 * Repite la forma exacta de lo que viene después, para que al llegar los datos
 * nada se mueva de sitio. Sin animación: un parpadeo de menos de un cuadro
 * llama más la atención que el silencio.
 */
function Esqueleto() {
  const bloque = "rounded-(--radius-chip) bg-(--color-reposo)";
  return (
    <main
      aria-busy="true"
      aria-label="Cargando tus viajes"
      className="mx-auto w-full max-w-6xl px-5 pt-6 pb-16 sm:px-8 sm:pt-8"
    >
      <div className="mb-6 flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <Marca tamano={24} />
          <div className={`${bloque} h-9 w-44`} />
        </div>
        <div className="flex flex-col gap-2">
          <div className={`${bloque} h-7 w-56`} />
          <div className={`${bloque} h-4 w-72`} />
        </div>
      </div>

      <section className="tarjeta mb-6 sm:p-7">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
          <div className="flex flex-col gap-4">
            <div className={`${bloque} h-3 w-40`} />
            <div className={`${bloque} h-14 w-64`} />
            <div className={`${bloque} h-3 w-full`} />
          </div>
          <div className="flex flex-col gap-3">
            <div className={`${bloque} h-4 w-28`} />
            <div className={`${bloque} h-4 w-full`} />
            <div className={`${bloque} h-4 w-4/5`} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className={`tarjeta flex flex-col gap-4`}>
          <div className={`${bloque} h-3 w-32`} />
          <div className={`${bloque} h-10 w-full`} />
          <div className={`${bloque} h-8 w-3/4`} />
        </div>
        <div className="flex flex-col gap-3">
          <div className={`${bloque} h-3 w-20`} />
          <div className="tarjeta flex flex-col gap-3">
            <div className={`${bloque} h-4 w-full`} />
            <div className={`${bloque} h-4 w-11/12`} />
            <div className={`${bloque} h-4 w-4/5`} />
          </div>
        </div>
      </div>
    </main>
  );
}

export function Tablero() {
  const { viajes, gastos, viajeActivoId } = useEstado();
  const hidratado = useHidratado();
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState<Gasto | null>(null);
  const [ajustando, setAjustando] = useState(false);

  const viaje = viajes.find((v) => v.id === viajeActivoId) ?? viajes[0] ?? null;

  // Antes de hidratar no se sabe si hay viajes: el almacén vive en el
  // navegador. Pintar la bienvenida acá sería afirmar que no hay nada.
  if (!hidratado) return <Esqueleto />;

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
        {/* Volver a la izquierda y la marca a la derecha.
            Estaban al revés, y era una contradicción: una flecha que apunta a
            la izquierda puesta en el borde derecho. En una pantalla de segundo
            nivel el sitio de salida manda, así que se lleva la esquina que el
            ojo lee primero; la marca cede porque acá no es la protagonista. */}
        <div className="mb-7 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setCreando(false)}
            className="ancho-medio -ml-2 flex items-center gap-1.5 rounded-(--radius-accion) px-2.5 py-1.5 text-sm text-(--color-tinta-2) hover:bg-(--color-reposo) hover:text-(--color-tinta)"
          >
            <IconoIzquierda tamano={15} />
            Volver
          </button>
          <Marca tamano={22} />
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
                // El foco vuelve al botón que abrió el panel. Sin esto se
                // quedaba en `body` al cerrar, y quien navega con teclado tenía
                // que tabular desde el principio del documento.
                onCerrar={() => {
                  setAjustando(false);
                  requestAnimationFrame(() =>
                    document.getElementById("boton-ajustar")?.focus(),
                  );
                }}
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
