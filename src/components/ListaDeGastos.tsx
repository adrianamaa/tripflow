"use client";

import { useEffect, useRef, useState } from "react";
import type { Gasto, Viaje } from "@/lib/types.ts";
import { formatearMoneda } from "@/lib/moneda.ts";
import { diaCorto } from "@/lib/fechas.ts";
import { borrarGastoConDeshacer } from "@/lib/almacen.ts";

/**
 * La lista de gastos.
 *
 * ── Por qué cada día es su propia tarjeta ──────────────────────────────────
 *
 * Antes era UNA tarjeta blanca con trece filas dentro. Dos problemas, y el
 * segundo no es de estilo:
 *
 * 1. Una losa de 800px al lado de una columna de 550px deja un desnivel que se
 *    lee como un hueco en la página.
 * 2. Los encabezados de día quedaban dibujados DENTRO de la misma superficie
 *    que las filas, así que pesaban lo mismo. El agrupamiento existía en el
 *    código y no en la pantalla.
 *
 * Separando por tarjeta, el grupo lo hace la superficie —no una línea— y el
 * borde inferior de la columna deja de ser un corte y pasa a ser un final.
 *
 * NN/g mostró con seguimiento ocular que una lista sin encabezados fuerza el
 * patrón F, el peor para escanear, y que agrupar produce el patrón «pastel de
 * capas», el más efectivo. Eso solo funciona si el encabezado se ve como
 * encabezado.
 *
 * ── Por qué editar y borrar ya no viven en la fila ─────────────────────────
 *
 * Trece filas por dos enlaces son veintiséis controles compitiendo con los
 * montos, que es lo que la gente vino a leer. Ningún tablero financiero serio
 * pone las acciones dentro de la fila.
 *
 * Pero esconderlas hasta pasar el puntero deja la función inexistente en un
 * teléfono. La regla de CSS lo resuelve mirando el dispositivo y no el ancho:
 * donde hay puntero fino se revelan al acercarse o al llegar con el teclado;
 * donde se toca con el dedo están siempre puestas.
 *
 * ── Por qué la categoría dejó de ir en mayúscula ───────────────────────────
 *
 * Iba estrecha y en versalita para distinguirla de la fecha, que compartía
 * línea con ella. Al agrupar por día, la fecha salió de la fila y esa
 * distinción se quedó sin trabajo. Una etiqueta diminuta en mayúscula que ya no
 * separa nada solo cuesta legibilidad.
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
  // Sin el ref, borrar dos gastos seguidos dejaba el temporizador del primero
  // vivo, y ese apagaba el aviso del segundo antes de tiempo.
  const reloj = useRef<ReturnType<typeof setTimeout> | null>(null);
  const botonDeshacer = useRef<HTMLButtonElement>(null);
  // Se pide el foco después de borrar, no siempre: mover el foco solo porque
  // apareció un aviso interrumpiría a quien está escribiendo.
  const irADeshacer = useRef(false);

  useEffect(() => () => { if (reloj.current) clearTimeout(reloj.current); }, []);

  /**
   * Después de borrar, el foco se va con la fila.
   *
   * El botón «Borrar» vive dentro del `<li>` que desaparece en el mismo pintado,
   * así que quien navega con teclado terminaba en `<body>` y la única forma de
   * llegar al deshacer era tabular desde el principio del documento — con diez
   * segundos de plazo. Se lleva el foco al único sitio que importa en ese
   * momento.
   */
  useEffect(() => {
    if (!irADeshacer.current) return;
    irADeshacer.current = false;
    botonDeshacer.current?.focus();
  }, [deshacer]);

  function borrar(g: Gasto) {
    const fn = borrarGastoConDeshacer(g.id);
    if (!fn) return;
    if (reloj.current) clearTimeout(reloj.current);
    irADeshacer.current = true;
    setDeshacer({ fn, que: g.descripcion });
    reloj.current = setTimeout(() => setDeshacer(null), 10000);
  }

  /**
   * El aviso de deshacer se arma antes de decidir qué pintar.
   *
   * Estaba escrito solo dentro del camino «hay gastos», así que borrar el ÚNICO
   * gasto de un viaje entraba al estado vacío y el botón de deshacer no llegaba
   * a existir: la acción destructiva se quedaba sin vuelta atrás justo en el
   * caso donde más falta hace, y el `role="status"` tampoco anunciaba nada.
   */
  const avisoDeshacer = deshacer && (
    <div
      role="status"
      className="flex items-center gap-3 rounded-(--radius-caja) bg-(--color-tinta) px-4 py-2.5 text-sm text-(--color-tarjeta)"
    >
      <span className="min-w-0 truncate">
        Borraste <span className="ancho-medio">{deshacer.que}</span>
      </span>
      <button
        type="button"
        ref={botonDeshacer}
        onClick={() => {
          deshacer.fn();
          setDeshacer(null);
        }}
        className="ancho-medio ml-auto shrink-0 rounded-(--radius-accion) border border-(--color-tarjeta) px-3 py-1 hover:bg-(--color-tarjeta) hover:text-(--color-tinta)"
      >
        Deshacer
      </button>
    </div>
  );

  if (gastos.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        {avisoDeshacer}
        <div className="tarjeta flex flex-col items-start gap-1 sm:p-7">
          <p className="ancho-medio m-0">Todavía no has registrado nada</p>
          <p className="m-0 max-w-[42ch] text-sm leading-relaxed text-(--color-tinta-2)">
            El primer gasto que anotes empieza a construir tu ritmo diario. Hasta entonces la app no
            puede decirte si vas bien.
          </p>
        </div>
      </div>
    );
  }

  // Agrupar por día, del más reciente al más viejo.
  const porDia = new Map<string, Gasto[]>();
  for (const g of [...gastos].sort((a, b) => b.fecha.localeCompare(a.fecha))) {
    porDia.set(g.fecha, [...(porDia.get(g.fecha) ?? []), g]);
  }

  return (
    <div className="flex flex-col gap-3">
      {avisoDeshacer}

      {[...porDia.entries()].map(([fecha, delDia]) => {
        const total = delDia.reduce((s, g) => s + g.monto, 0);
        return (
          <section key={fecha} className="tarjeta py-4">
            <div className="mb-1 flex items-baseline justify-between gap-4 border-b border-(--color-filete) pb-2.5">
              <h3 className="ancho-medio m-0 text-[15px] first-letter:uppercase">
                {diaCorto(fecha)}
              </h3>
              <span className="cifra text-[13px] text-(--color-tinta-2)">
                {formatearMoneda(total, viaje.moneda)}
              </span>
            </div>

            <ul className="m-0 flex list-none flex-col p-0">
              {/* En móvil son dos columnas y las acciones bajan a su propia
                  línea; en escritorio son tres y todo va en una.

                  Con las tres columnas siempre en línea, en un teléfono de
                  320px la descripción se quedaba con 42px —«Tour a Islas del
                  Rosario» se leía «Tour…»— porque las acciones reservan 104px
                  fijos y en pantalla táctil están siempre visibles. */}
              {delDia.map((g) => (
                <li
                  key={g.id}
                  className="fila -mx-2.5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-2.5 py-2 sm:grid-cols-[minmax(0,1fr)_auto_104px]"
                >
                  <div className="min-w-0">
                    <p className="ancho-ui m-0 truncate text-[15px]">{g.descripcion}</p>
                    <p className="m-0 truncate text-[13px] text-(--color-tinta-2) capitalize">
                      {g.categoria}
                      {g.fueraDelRitmo && " · pago único"}
                    </p>
                  </div>

                  {/* A la derecha, como en cualquier hoja de cálculo: permite
                      comparar magnitudes por dónde empieza el número. */}
                  <span className="cifra text-right text-[15px]">
                    {formatearMoneda(g.monto, viaje.moneda)}
                  </span>

                  {/* Ancho fijo en escritorio: si aparecieran y desaparecieran
                      ocupando espacio, el monto se correría cada vez que el
                      puntero pasa por encima y la columna de cifras temblaría. */}
                  <div className="acciones-fila col-span-2 flex justify-end gap-1 sm:col-span-1">
                    <button
                      type="button"
                      onClick={() => onEditar(g)}
                      aria-label={`Editar ${g.descripcion}`}
                      className="ancho-ui rounded-(--radius-accion) px-2.5 py-1 text-xs text-(--color-tinta-2) hover:bg-(--color-reposo) hover:text-(--color-tinta)"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => borrar(g)}
                      aria-label={`Borrar ${g.descripcion}`}
                      className="ancho-ui rounded-(--radius-accion) px-2.5 py-1 text-xs text-(--color-tinta-2) hover:bg-(--color-excedido) hover:text-(--color-tarjeta)"
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
