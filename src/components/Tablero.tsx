"use client";

import { useEffect, useRef, useState } from "react";
import type { Balance, Gasto, Viaje } from "@/lib/types.ts";
import { reiniciar, useEstado, useHidratado } from "@/lib/almacen.ts";
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
import { Dialogo } from "./Dialogo.tsx";

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
      className="mx-auto w-full max-w-6xl px-5 pt-4 pb-16 sm:px-8 sm:pt-8"
    >
      <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:gap-5">
        <div className="flex items-center justify-between gap-4">
          <Marca tamano={24} />
          <div className={`${bloque} h-9 w-44`} />
        </div>
        <div className="flex flex-col gap-2">
          <div className={`${bloque} h-7 w-56`} />
          <div className={`${bloque} h-4 w-72`} />
        </div>
      </div>

      <section className="tarjeta mb-4 sm:mb-6 sm:p-7">
        <div className="grid gap-5 sm:gap-7 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-8 lg:gap-12">
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

/**
 * Volver a los datos de ejemplo.
 *
 * La app abre con dos viajes de ejemplo, así que cualquiera que la pruebe va a
 * crear viajes y gastos de mentira — y sin esto cada prueba se le queda en el
 * selector para siempre. `reiniciar()` ya existía en el almacén y ningún
 * control lo exponía. De paso vuelve alcanzable la pantalla de bienvenida.
 *
 * La confirmación es en dos pasos EN EL SITIO, no un `confirm()` del
 * navegador — el mismo criterio del resto de la app: nada dibujado por el
 * sistema operativo. Y el segundo paso dice qué se pierde.
 */
function VolverAlEjemplo() {
  const [confirmando, setConfirmando] = useState(false);

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="ancho-ui rounded-(--radius-accion) px-3 py-1.5 text-[13px] text-(--color-tinta-2) hover:bg-(--color-reposo) hover:text-(--color-tinta)"
      >
        Volver a los datos de ejemplo
      </button>
    );
  }

  return (
    <span className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] text-(--color-tinta-2)">
      Esto borra tus viajes y restaura los dos de ejemplo.
      <button
        type="button"
        // El foco pasa al selector de viajes restaurado vía recarga de estado;
        // el botón desaparece con el estado de confirmación.
        onClick={() => {
          reiniciar();
          setConfirmando(false);
        }}
        className="ancho-medio rounded-(--radius-accion) px-2.5 py-1 text-(--color-excedido) hover:bg-(--color-excedido-fondo)"
      >
        Sí, volver
      </button>
      <button
        type="button"
        onClick={() => setConfirmando(false)}
        className="ancho-ui rounded-(--radius-accion) px-2.5 py-1 hover:bg-(--color-reposo) hover:text-(--color-tinta)"
      >
        Cancelar
      </button>
    </span>
  );
}

/**
 * La banda de resumen, con el panel de ajustar el tope adentro.
 *
 * Es un componente aparte por una razón de seguridad, no de orden: el estado
 * «panel abierto» vive ACÁ, y el Tablero monta esta banda con `key={viaje.id}`.
 * Cambiar de viaje desmonta y remonta la banda, así que el panel se cierra y
 * su formulario nunca puede quedar cargado con el tope del viaje anterior —
 * que era una pérdida de datos: guardar se lo escribía al viaje nuevo.
 *
 * La primera versión de este arreglo limpiaba el estado con un efecto; React
 * tiene nombre para ese antipatrón (`set-state-in-effect`) y su alternativa
 * oficial es esta: si un estado depende de la identidad de un dato, se ata el
 * ciclo de vida del componente a esa identidad con `key`.
 */
function ResumenViaje({
  viaje,
  balance,
  gastos,
}: {
  viaje: Viaje;
  balance: Balance;
  gastos: Gasto[];
}) {
  const [ajustando, setAjustando] = useState(false);

  return (
    // La banda se acuesta desde `md`, no desde `lg`. Entre 768 y 1023 quedaba
    // el layout de móvil estirado —tarjetas de 700px en una columna— y en ese
    // rango no solo caen las tabletas: una ventana a media pantalla en un
    // monitor de 1920 da ~960px. A 768 las dos columnas quedan de ~330px, el
    // mismo reparto que ya funciona en escritorio.
    <section className="tarjeta mb-4 sm:mb-6 sm:p-7">
      <div className="grid gap-5 sm:gap-7 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-8 lg:gap-12">
        <div className="flex flex-col gap-4 sm:gap-6">
          <CifraDeControl viaje={viaje} balance={balance} />
          <Medidor viaje={viaje} balance={balance} onAjustar={() => setAjustando(true)} />
        </div>

        {/* Centrada: la columna de palabras es más corta que la de cifras, y
            anclada arriba dejaba un vacío debajo que se leía como algo que
            falta. Centrada, el aire queda repartido y parece decidido. */}
        <div className="flex flex-col justify-center gap-4">
          <Alerta
            viaje={viaje}
            balance={balance}
            gastos={gastos}
            onAjustar={() => setAjustando(true)}
          />
          {ajustando && (
            <AjustarPresupuesto
              viaje={viaje}
              balance={balance}
              // El foco vuelve a un botón que abre el panel. El de la alerta
              // puede haber DESAPARECIDO justo por guardar: si el tope nuevo
              // devuelve el viaje a «vas bien», la alerta ya no ofrece ajustar
              // — el desenlace feliz dejaba el foco en `body`. El del medidor
              // existe siempre, así que es el respaldo.
              onCerrar={() => {
                setAjustando(false);
                requestAnimationFrame(() =>
                  (
                    document.getElementById("boton-ajustar") ??
                    document.getElementById("boton-tope")
                  )?.focus(),
                );
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}

export function Tablero() {
  const { viajes, gastos, viajeActivoId } = useEstado();
  const hidratado = useHidratado();
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState<Gasto | null>(null);

  // Abrir «Nuevo viaje» cambia la pantalla entera, y era la única vista de la
  // app que no gestionaba el foco: quedaba en `body`, así que quien navega con
  // teclado tabulaba desde cero y el lector de pantalla no anunciaba el cambio.
  // El foco cae en el título —que anuncia el contexto— y el primer Tab queda
  // en «Volver».
  const tituloCrear = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (creando) tituloCrear.current?.focus();
  }, [creando]);

  const viaje = viajes.find((v) => v.id === viajeActivoId) ?? viajes[0] ?? null;

  // Antes de hidratar no se sabe si hay viajes: el almacén vive en el
  // navegador. Pintar la bienvenida acá sería afirmar que no hay nada.
  if (!hidratado) return <Esqueleto />;

  if (!viaje && viajes.length === 0 && !creando) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 px-5 sm:px-8">
        <Marca tamano={32} />
        {/* «Anota» deshace el eco gastar/gastes, y «la plata» le pone sujeto
            a «se acabe» — ¿se acababa qué, la plata o el viaje? */}
        <p className="m-0 text-lg leading-relaxed text-(--color-tinta-2)">
          Define cuánto puedes gastar en un viaje y anota lo que gastes. La app te avisa antes de que
          se acabe la plata, no después.
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
      <main className="mx-auto w-full max-w-6xl px-5 pt-6 pb-16 sm:px-8 sm:pt-8">
        {/* La marca ancla la MISMA esquina que en el tablero. Antes acá
            saltaba al borde derecho — el ancla de identidad moviéndose de
            esquina entre las dos únicas plantillas de la app. «Volver» sigue
            a la izquierda, que es donde el ojo busca la salida en una
            pantalla de segundo nivel, pero alineado con la columna del
            formulario, que es a donde vuelve la vista. */}
        <div className="mb-7 flex items-center">
          <Marca tamano={24} />
        </div>
        <div className="mx-auto w-full max-w-lg">
          <button
            type="button"
            onClick={() => setCreando(false)}
            className="ancho-medio -ml-2 mb-5 flex items-center gap-1.5 rounded-(--radius-accion) px-2.5 py-1.5 text-sm text-(--color-tinta-2) hover:bg-(--color-reposo) hover:text-(--color-tinta)"
          >
            <IconoIzquierda tamano={15} />
            Volver
          </button>
          <h1
            ref={tituloCrear}
            tabIndex={-1}
            className="ancho-dato m-0 mb-6 text-[26px] outline-none"
          >
            Nuevo viaje
          </h1>
          <div className="tarjeta">
            <CrearViaje onListo={() => setCreando(false)} />
          </div>
        </div>
      </main>
    );
  }

  const delViaje = gastos.filter((g) => g.viajeId === viaje.id);
  const balance = calcularBalance(viaje, delViaje);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pt-4 pb-16 sm:px-8 sm:pt-8">
      {/* El ritmo vertical se aprieta solo en base: en 390×844 el botón de
          registrar quedaba 44px bajo el pliegue, y la acción que el enunciado
          pide «fácil y rápida» necesitaba un scroll para verse completa. */}
      <header className="mb-3 flex flex-col gap-3 sm:mb-6 sm:gap-5">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <Marca tamano={24} />
          <SelectorDeViajes viajes={viajes} activoId={viaje.id} onNuevo={() => setCreando(true)} />
        </div>

        <div>
          <h1 className="ancho-dato m-0 text-[28px] leading-tight">{viaje.nombre}</h1>
          {/* La línea de abajo solo dice lo que el título no dijo. El destino
              guardado es «Cartagena, Colombia»; con «Cartagena» de título, acá
              queda solo «Colombia» — sigue siendo exactamente lo que se
              escribió al crear el viaje, sin la palabra repetida. */}
          <p className="m-0 text-sm text-(--color-tinta-2)">
            {(() => {
              if (!viaje.destino || viaje.destino === viaje.nombre) return null;
              const resto = viaje.destino.startsWith(`${viaje.nombre},`)
                ? viaje.destino.slice(viaje.nombre.length + 1).trim()
                : viaje.destino;
              return resto ? <>{resto} · </> : null;
            })()}
            {diaLargo(viaje.inicio)} al {diaLargo(viaje.fin)}
          </p>
        </div>
      </header>

      {/* ── PLANO 1 · el resumen ─────────────────────────────────────────────
          Cifras a la izquierda, palabras a la derecha. La `key` no es adorno:
          reinicia el estado interno de la banda (el panel de ajustar el tope)
          al cambiar de viaje. */}
      <ResumenViaje key={viaje.id} viaje={viaje} balance={balance} gastos={delViaje} />

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
          {/* Este formulario registra, nunca edita: quiere el tablero a la
              vista para que se vea moverse la cifra al guardar. Editar es otro
              momento y vive en su propio diálogo. */}
          <div className="tarjeta">
            <RegistrarGasto key={`nuevo-${viaje.id}`} viaje={viaje} />
          </div>

          {/* Sin gastos el desglose no devuelve nada, y su tarjeta quedaría
              como un rectángulo blanco vacío en mitad de la columna. */}
          {delViaje.length > 0 && (
            <div className="tarjeta">
              <Desglose viaje={viaje} gastos={delViaje} estado={balance.estado} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {/* Enfocable a propósito: es a dónde vuelve el foco después de
              deshacer un borrado, cuando el botón que lo tenía desaparece. */}
          <h2 id="titulo-gastos" tabIndex={-1} className="rotulo m-0">
            Gastos
          </h2>
          <ListaDeGastos viaje={viaje} gastos={delViaje} onEditar={setEditando} />
        </div>
      </div>

      <footer className="mt-12 flex justify-center">
        <VolverAlEjemplo />
      </footer>

      {/* El diálogo se monta con el gasto dentro y `key` lo reinicia al cambiar
          de gasto, así que abrir dos gastos distintos no arrastra el estado del
          anterior. */}
      <Dialogo
        titulo="Editar gasto"
        abierto={editando !== null}
        onCerrar={() => setEditando(null)}
      >
        {editando && (
          <RegistrarGasto
            key={editando.id}
            viaje={viaje}
            editando={editando}
            onListo={() => setEditando(null)}
          />
        )}
      </Dialogo>
    </main>
  );
}
