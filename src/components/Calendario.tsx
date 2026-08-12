"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FechaISO } from "@/lib/types.ts";
import { hoy } from "@/lib/fechas.ts";

/**
 * El selector de fecha.
 *
 * ── Por qué no se usa el nativo, y no es por estética ──────────────────────
 *
 * `<input type="date">` se dibuja con el formato del NAVEGADOR, no del sitio.
 * En un Chrome configurado en inglés —el de casi cualquier persona en
 * tecnología— el 12 de agosto de 2026 sale como `08/12/2026`. Para alguien que
 * lee fechas en Colombia eso es el 8 de diciembre.
 *
 * O sea que el control no se veía sin diseñar: mostraba una fecha equivocada a
 * la mitad de quienes lo abrieran, en una app donde la fecha decide el cálculo
 * del ritmo diario. Ese es el motivo real para construirlo.
 *
 * ── La decisión que quita el problema de raíz ──────────────────────────────
 *
 * El campo no muestra `12/08/2026` ni `08/12/2026`: muestra «12 ago 2026». Con
 * el mes escrito no hay ambigüedad posible en ningún país ni en ningún idioma,
 * y de paso se lee más rápido que tres números separados por rayas.
 *
 * ── Lo que se mantuvo del nativo ───────────────────────────────────────────
 *
 * Lo que hace bueno al control nativo es el teclado, y eso se conserva: flechas
 * para moverse día a día, arriba y abajo para saltar semana, Re Pág y Av Pág
 * para cambiar de mes, Enter para elegir, Esc para salir devolviendo el foco.
 * Un calendario que solo funciona con el mouse es peor que el nativo, no mejor.
 */

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const MESES_CORTOS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];
/** La semana arranca en lunes, como el calendario de acá. */
const DIAS_CORTOS = ["lu", "ma", "mi", "ju", "vi", "sá", "do"];

function partes(fecha: FechaISO) {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return { anio, mes: mes - 1, dia };
}

function aISO(anio: number, mes: number, dia: number): FechaISO {
  return `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

/** «12 ago 2026». Sin barras y sin ambigüedad de orden. */
function legible(fecha: FechaISO): string {
  const { anio, mes, dia } = partes(fecha);
  return `${dia} ${MESES_CORTOS[mes]} ${anio}`;
}

/** Corre una fecha N días, en UTC, sin salir nunca del calendario. */
function correr(fecha: FechaISO, dias: number): FechaISO {
  const { anio, mes, dia } = partes(fecha);
  const d = new Date(Date.UTC(anio, mes, dia + dias));
  return aISO(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function correrMes(fecha: FechaISO, meses: number): FechaISO {
  const { anio, mes, dia } = partes(fecha);
  // El día se recorta al último del mes destino: sin esto, del 31 de enero
  // «un mes adelante» se sale a marzo.
  const ultimo = new Date(Date.UTC(anio, mes + meses + 1, 0)).getUTCDate();
  const d = new Date(Date.UTC(anio, mes + meses, Math.min(dia, ultimo)));
  return aISO(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function Calendario({
  id,
  etiqueta,
  valor,
  onCambio,
  minimo,
  alinear = "izquierda",
}: {
  id: string;
  etiqueta: string;
  valor: FechaISO;
  onCambio: (f: FechaISO) => void;
  minimo?: FechaISO;
  alinear?: "izquierda" | "derecha";
}) {
  const [abierto, setAbierto] = useState(false);
  const [enfocado, setEnfocado] = useState<FechaISO>(valor);
  const contenedor = useRef<HTMLDivElement>(null);
  const disparador = useRef<HTMLButtonElement>(null);
  const rejilla = useRef<HTMLDivElement>(null);
  const etiquetaId = useId();

  // El cursor arranca en la fecha que ya está puesta. Se pone al abrir y no
  // con un efecto que vigile `valor`: sincronizar estado dentro de un efecto
  // provoca una segunda pasada de render por cada apertura, y acá no hace falta
  // porque el momento en que hay que ponerlo se conoce exactamente.
  function alternar() {
    if (abierto) {
      setAbierto(false);
      return;
    }
    setEnfocado(valor);
    setAbierto(true);
  }

  // Mover el foco del navegador al día marcado, para que las flechas y el
  // lector de pantalla sigan al cursor.
  useEffect(() => {
    if (!abierto) return;
    rejilla.current?.querySelector<HTMLButtonElement>('[data-enfocado="si"]')?.focus();
  }, [abierto, enfocado]);

  useEffect(() => {
    if (!abierto) return;
    function fuera(e: PointerEvent) {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener("pointerdown", fuera);
    return () => document.removeEventListener("pointerdown", fuera);
  }, [abierto]);

  function cerrarYDevolverFoco() {
    setAbierto(false);
    disparador.current?.focus();
  }

  function elegir(f: FechaISO) {
    onCambio(f);
    cerrarYDevolverFoco();
  }

  function teclas(e: React.KeyboardEvent) {
    const saltos: Record<string, number> = {
      ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7,
    };
    if (e.key in saltos) {
      e.preventDefault();
      setEnfocado((f) => correr(f, saltos[e.key]));
      return;
    }
    if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      setEnfocado((f) => correrMes(f, e.key === "PageUp" ? -1 : 1));
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      cerrarYDevolverFoco();
    }
  }

  const { anio, mes } = partes(enfocado);
  const primero = new Date(Date.UTC(anio, mes, 1));
  // getUTCDay() da 0 en domingo; acá la semana empieza en lunes.
  const desplazamiento = (primero.getUTCDay() + 6) % 7;
  const cuantos = new Date(Date.UTC(anio, mes + 1, 0)).getUTCDate();
  const hoyISO = hoy();

  return (
    <div className="relative flex flex-col gap-1" ref={contenedor}>
      <span id={etiquetaId} className="rotulo">
        {etiqueta}
      </span>

      <button
        id={id}
        ref={disparador}
        type="button"
        onClick={alternar}
        aria-labelledby={`${etiquetaId} ${id}`}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        className="ancho-ui flex w-full items-center justify-between gap-2 border-b border-(--color-filete) bg-transparent pb-1 text-left text-[15px] hover:border-(--color-tinta) aria-expanded:border-(--color-marca)"
      >
        {legible(valor)}
        <IconoCalendario />
      </button>

      {abierto && (
        <div
          role="dialog"
          aria-label={`Elegir ${etiqueta.toLowerCase()}`}
          onKeyDown={teclas}
          /* Un panel flotante es el único sitio donde el cambio de superficie no
             alcanza: queda encima de otra superficie del mismo blanco. Por eso
             acá sí hay filete y sombra, y en ninguna tarjeta del sistema. */
          className={`absolute top-full z-20 mt-2 w-[276px] rounded-(--radius-caja) border border-(--color-filete) bg-(--color-tarjeta) p-3 shadow-[0_8px_24px_-8px_rgba(12,10,8,0.18)] ${
            alinear === "derecha" ? "right-0" : "left-0"
          }`}
        >
          <div className="mb-2 flex items-center justify-between gap-1">
            <FlechaMes
              hacia={-1}
              onClick={() => setEnfocado((f) => correrMes(f, -1))}
              titulo="Mes anterior"
            />
            <span className="ancho-medio text-sm capitalize" aria-live="polite">
              {MESES[mes]} {anio}
            </span>
            <FlechaMes
              hacia={1}
              onClick={() => setEnfocado((f) => correrMes(f, 1))}
              titulo="Mes siguiente"
            />
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0.5" aria-hidden="true">
            {DIAS_CORTOS.map((d) => (
              <span
                key={d}
                className="ancho-densa flex h-7 items-center justify-center text-[11px] text-(--color-tinta-2)"
              >
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5" ref={rejilla}>
            {Array.from({ length: desplazamiento }, (_, i) => (
              <span key={`hueco-${i}`} />
            ))}

            {Array.from({ length: cuantos }, (_, i) => {
              const dia = i + 1;
              const f = aISO(anio, mes, dia);
              const elegido = f === valor;
              const esHoy = f === hoyISO;
              const bloqueado = minimo !== undefined && f < minimo;

              return (
                <button
                  key={f}
                  type="button"
                  disabled={bloqueado}
                  data-enfocado={f === enfocado ? "si" : undefined}
                  // Un solo día alcanzable con Tab: dentro de la rejilla se
                  // navega con flechas, no tabulando 31 veces.
                  tabIndex={f === enfocado ? 0 : -1}
                  aria-current={esHoy ? "date" : undefined}
                  aria-pressed={elegido}
                  onClick={() => elegir(f)}
                  className={[
                    "cifra flex h-8 items-center justify-center rounded-(--radius-chip) text-[13px]",
                    bloqueado
                      ? "cursor-not-allowed text-(--color-filete)"
                      : elegido
                        ? "bg-(--color-marca) text-(--color-sobre-marca)"
                        : "hover:bg-(--color-reposo)",
                    // Hoy se marca con un anillo, no con relleno: el relleno ya
                    // significa «elegido» y dos rellenos distintos compiten.
                    esHoy && !elegido ? "ring-1 ring-(--color-marca) ring-inset" : "",
                  ].join(" ")}
                >
                  {dia}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between gap-2 border-t border-(--color-filete) pt-2">
            <button
              type="button"
              onClick={() => elegir(hoyISO)}
              disabled={minimo !== undefined && hoyISO < minimo}
              className="ancho-ui rounded-(--radius-accion) px-2.5 py-1 text-xs text-(--color-tinta-2) hover:bg-(--color-reposo) hover:text-(--color-tinta) disabled:opacity-40"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={cerrarYDevolverFoco}
              className="ancho-ui rounded-(--radius-accion) px-2.5 py-1 text-xs text-(--color-tinta-2) hover:bg-(--color-reposo) hover:text-(--color-tinta)"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function IconoCalendario() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
      <rect x="1.75" y="3.25" width="12.5" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.75 6.5h12.5M5.25 1.75v2.5M10.75 1.75v2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function FlechaMes({
  hacia,
  onClick,
  titulo,
}: {
  hacia: -1 | 1;
  onClick: () => void;
  titulo: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={titulo}
      className="flex h-7 w-7 items-center justify-center rounded-(--radius-chip) text-(--color-tinta-2) hover:bg-(--color-reposo) hover:text-(--color-tinta)"
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d={hacia === -1 ? "M10 3.5 5.5 8l4.5 4.5" : "M6 3.5 10.5 8 6 12.5"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
