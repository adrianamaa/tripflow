"use client";

import { useEffect, useId, useRef, useState } from "react";
import { buscarDestinos, type Destino } from "@/lib/destinos.ts";

/**
 * El campo de destino, con sugerencias.
 *
 * Escribir «cartag» y que aparezca «Cartagena · Colombia» quita tecleo, quita
 * dudas de ortografía y —lo que más importa acá— hace que el destino quede
 * escrito igual siempre. Sin eso, «Medellin», «medellín» y «MEDELLIN» son tres
 * viajes distintos para cualquier cosa que después quiera agruparlos.
 *
 * ── Sugerir no es exigir ───────────────────────────────────────────────────
 *
 * El campo sigue siendo texto libre: quien vaya a un pueblo que no está en la
 * lista simplemente lo escribe y ya. Un autocompletado que obliga a elegir de
 * su catálogo es un formulario que le dice al usuario que su viaje no existe.
 *
 * ── El patrón, y por qué no basta con un `<datalist>` ──────────────────────
 *
 * `<datalist>` sería una línea de código, pero se dibuja con el estilo del
 * sistema operativo —imposible de tocar—, no deja mostrar dos líneas por opción
 * y su comportamiento cambia entre navegadores. Es exactamente el tipo de
 * control que delata que nadie lo diseñó.
 *
 * Así que va el patrón ARIA de combobox con listbox: `aria-expanded`,
 * `aria-activedescendant` y `role="option"`. El foco NUNCA sale del campo —se
 * sigue escribiendo mientras se navega con las flechas—, que es justo lo que
 * hace que se sienta como el buscador de un sitio de vuelos y no como un menú.
 */
export function CampoDestino({
  id,
  valor,
  onCambio,
  onElegir,
  placeholder,
  className,
  "aria-describedby": describedBy,
  "aria-invalid": invalido,
}: {
  id: string;
  valor: string;
  onCambio: (texto: string) => void;
  onElegir: (d: Destino) => void;
  placeholder?: string;
  className?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const [indice, setIndice] = useState(-1);
  const contenedor = useRef<HTMLDivElement>(null);
  const listaId = useId();

  const sugerencias = abierto ? buscarDestinos(valor) : [];

  useEffect(() => {
    if (!abierto) return;
    function fuera(e: PointerEvent) {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener("pointerdown", fuera);
    return () => document.removeEventListener("pointerdown", fuera);
  }, [abierto]);

  function elegir(d: Destino) {
    onElegir(d);
    setAbierto(false);
    setIndice(-1);
  }

  function teclas(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setAbierto(false);
      setIndice(-1);
      return;
    }
    if (!sugerencias.length) return;

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const n = sugerencias.length;
      // Da la vuelta en los dos extremos: llegar al final y quedarse trabado se
      // siente como que algo dejó de responder. Desde «nada marcado» (-1), abajo
      // lleva a la primera y arriba a la última.
      setIndice((i) =>
        e.key === "ArrowDown" ? (i >= n - 1 ? 0 : i + 1) : i <= 0 ? n - 1 : i - 1,
      );
      return;
    }
    if (e.key === "Enter" && indice >= 0 && indice < sugerencias.length) {
      // Solo se traga el Enter si hay una sugerencia marcada; si no, deja
      // enviar el formulario como cualquier campo de texto.
      e.preventDefault();
      elegir(sugerencias[indice]);
    }
  }

  const marcado = indice >= 0 && indice < sugerencias.length;

  return (
    <div className="relative" ref={contenedor}>
      <input
        id={id}
        value={valor}
        onChange={(e) => {
          onCambio(e.target.value);
          setAbierto(true);
          setIndice(-1);
        }}
        onFocus={() => setAbierto(true)}
        onKeyDown={teclas}
        role="combobox"
        aria-expanded={sugerencias.length > 0}
        aria-controls={listaId}
        aria-autocomplete="list"
        aria-activedescendant={marcado ? `${listaId}-${indice}` : undefined}
        aria-describedby={describedBy}
        aria-invalid={invalido}
        autoComplete="off"
        placeholder={placeholder}
        className={className}
      />

      {sugerencias.length > 0 && (
        <ul
          id={listaId}
          role="listbox"
          aria-label="Destinos sugeridos"
          className="absolute top-full left-0 z-20 m-0 mt-2 flex w-full max-w-[340px] list-none flex-col rounded-(--radius-caja) border border-(--color-filete) bg-(--color-tarjeta) p-1.5 shadow-(--shadow-flotante)"
        >
          {sugerencias.map((d, i) => (
            <li key={`${d.ciudad}-${d.pais}`} id={`${listaId}-${i}`} role="option" aria-selected={i === indice}>
              {/* `onMouseDown` y no `onClick`: al hacer clic, el campo pierde el
                  foco antes de que llegue el `click`, y para entonces la lista
                  ya se cerró y la opción dejó de existir. */}
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => {
                  e.preventDefault();
                  elegir(d);
                }}
                onMouseEnter={() => setIndice(i)}
                className={`flex w-full items-baseline gap-2 rounded-(--radius-chip) px-2.5 py-2 text-left ${
                  i === indice ? "bg-(--color-marca-suave)" : ""
                }`}
              >
                <span className="ancho-medio text-sm">{d.ciudad}</span>
                <span className="ancho-densa text-xs text-(--color-tinta-2)">{d.pais}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
