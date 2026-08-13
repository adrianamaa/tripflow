"use client";

import { useEffect, useRef } from "react";
import { IconoMas } from "./iconos.tsx";

/**
 * El diálogo.
 *
 * ── Por qué existe ─────────────────────────────────────────────────────────
 *
 * Editar un gasto rompía el modelo mental: se tocaba «Editar» en una fila de la
 * columna derecha y la respuesta aparecía en un formulario de la columna
 * izquierda, lejos de donde se había tocado. Había que desplazar la página
 * hasta él y un letrero explicaba qué se estaba editando. Que hiciera falta un
 * letrero para explicarlo ya era la señal.
 *
 * Corregir un gasto pasado es un momento distinto a registrar uno nuevo:
 * registrar quiere el tablero a la vista para ver la cifra moverse —por eso ese
 * formulario NO es un diálogo y sigue viviendo en la página—, pero corregir
 * quiere lo contrario, una sola cosa en pantalla hasta terminar.
 *
 * ── Por qué `<dialog>` nativo y no un div flotante ─────────────────────────
 *
 * Porque el navegador ya resolvió lo difícil, y hacerlo a mano es donde se cae
 * la mayoría de los modales:
 *
 * - atrapa el foco dentro mientras está abierto
 * - cierra con Esc sin escuchar teclas
 * - deja inerte todo lo de atrás, así que un lector de pantalla no se pasea por
 *   la página de fondo
 * - dibuja el fondo bloqueante con `::backdrop`
 *
 * ── Móvil y escritorio no son el mismo diálogo ─────────────────────────────
 *
 * En escritorio va centrado. En un teléfono se pega abajo, a ancho completo y
 * con las esquinas superiores redondeadas: ahí llega el pulgar, y un cuadro
 * centrado en una pantalla alta deja los botones donde la mano no alcanza.
 */
export function Dialogo({
  titulo,
  abierto,
  onCerrar,
  children,
}: {
  titulo: string;
  abierto: boolean;
  onCerrar: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  // Abrir y cerrar es una orden al elemento, no un atributo: `showModal()` es
  // lo que enciende el atrapado de foco y la inercia del fondo. `open` a secas
  // lo muestra sin nada de eso.
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) d.showModal();
    if (!abierto && d.open) d.close();
  }, [abierto]);

  // Esc y el botón de cerrar disparan el mismo evento del navegador, así que se
  // escucha uno solo y no hay dos caminos de salida que mantener sincronizados.
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const alCerrar = () => onCerrar();
    d.addEventListener("close", alCerrar);
    return () => d.removeEventListener("close", alCerrar);
  }, [onCerrar]);

  return (
    <dialog
      ref={ref}
      aria-label={titulo}
      className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-(--color-velo)"
    >
      {/* Tocar fuera cierra. Se compara contra el propio contenedor para que un
          clic dentro del panel no se lo lleve por delante. */}
      <div
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) ref.current?.close();
        }}
        className="flex h-full w-full items-end justify-center sm:items-center sm:p-6"
      >
        <div className="w-full max-w-[460px] rounded-t-(--radius-hoja) bg-(--color-tarjeta) p-5 sm:rounded-(--radius-caja) sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="ancho-dato m-0 text-lg">{titulo}</h2>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label="Cerrar"
              className="-mr-1 flex h-8 w-8 items-center justify-center rounded-full text-(--color-tinta-2) hover:bg-(--color-reposo) hover:text-(--color-tinta)"
            >
              {/* La cruz es el «más» girado: un icono menos que dibujar y
                  mantener, con el mismo trazo y la misma retícula del set. */}
              <span className="rotate-45">
                <IconoMas tamano={17} />
              </span>
            </button>
          </div>
          {children}
        </div>
      </div>
    </dialog>
  );
}
