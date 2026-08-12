"use client";

import type { Viaje } from "@/lib/types.ts";
import { activarViaje } from "@/lib/almacen.ts";
import { IconoMas } from "./iconos.tsx";

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
            /* El viaje activo va en el color de la marca, no en negro.
               El negro macizo era el elemento más pesado de toda la cabecera:
               pesaba más que el propio logo, que es lo único que debería mandar
               ahí. Y de paso el chip deja de ser un color suelto. */
            className={
              activo
                ? "ancho-medio rounded-(--radius-accion) bg-(--color-marca) px-4 py-2 text-sm text-(--color-sobre-marca)"
                : "ancho-ui rounded-(--radius-accion) bg-(--color-tarjeta) px-4 py-2 text-sm text-(--color-tinta-2) hover:bg-(--color-reposo) hover:text-(--color-tinta)"
            }
          >
            {v.nombre}
          </button>
        );
      })}

      {/* Crear un viaje es una de las tres funcionalidades del producto y estaba
          puesta como un enlace de texto gris en una esquina — el tratamiento
          más débil que existe. Ahora es un control con contorno e icono: se lee
          como una acción sin robarle presencia al viaje activo. */}
      <button
        type="button"
        onClick={onNuevo}
        className="ancho-medio ml-1 flex items-center gap-1.5 rounded-(--radius-accion) border border-(--color-filete) px-3.5 py-2 text-sm text-(--color-tinta-2) hover:border-(--color-marca) hover:bg-(--color-marca-suave) hover:text-(--color-marca)"
      >
        <IconoMas tamano={14} />
        Nuevo viaje
      </button>
    </div>
  );
}
