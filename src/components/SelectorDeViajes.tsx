"use client";

import type { Viaje } from "@/lib/types.ts";
import { activarViaje } from "@/lib/almacen.ts";

/**
 * Cambiar de viaje.
 *
 * Antes era un `<select>` nativo, y el problema no era el estilo: era que no se
 * veía que existieran varios viajes hasta hacer clic. Un desplegable esconde el
 * conjunto, y esconder navegación cuesta descubrimiento.
 *
 * Ahora los viajes están todos a la vista como botones. Se ve de entrada cuántos
 * hay y en cuál se está — y de paso desaparece el aspecto de formulario de 1998
 * que tiene un `select` sin estilo.
 *
 * Por encima de seis viajes esto se vuelve una fila larga y habría que volver a
 * un menú; con la cantidad que maneja una persona, verlos todos gana.
 */
export function SelectorDeViajes({
  viajes,
  activoId,
  onNuevo,
}: {
  viajes: Viaje[];
  activoId: string | null;
  onNuevo: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {viajes.map((v) => {
        const activo = v.id === activoId;
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => activarViaje(v.id)}
            aria-pressed={activo}
            className={
              activo
                ? "ancho-medio rounded-(--radius-accion) bg-(--color-tinta) px-4 py-2 text-sm text-(--color-tarjeta)"
                : "ancho-ui rounded-(--radius-accion) bg-(--color-tarjeta) px-4 py-2 text-sm text-(--color-tinta-2) hover:bg-(--color-reposo) hover:text-(--color-tinta)"
            }
          >
            {v.nombre}
          </button>
        );
      })}

      <button
        type="button"
        onClick={onNuevo}
        className="ancho-ui ml-1 rounded-(--radius-accion) px-3 py-2 text-sm text-(--color-tinta-2) hover:text-(--color-tinta)"
      >
        + Nuevo viaje
      </button>
    </div>
  );
}
