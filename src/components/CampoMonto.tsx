"use client";

import { useLayoutEffect, useRef } from "react";
import { formatearAlEscribir } from "@/lib/moneda.ts";

/**
 * El campo de plata.
 *
 * Agrupa de a tres mientras se escribe: `3000000` es un muro y `3.000.000` se
 * lee de un golpe. Es la misma ayuda que dan las apps de banco de acá, y
 * funciona sin que nadie la tenga que aprender.
 *
 * ── Por qué es un componente y no tres `onChange` copiados ─────────────────
 *
 * Porque lo difícil no es el formato, es EL CURSOR. Reformatear el texto de un
 * campo controlado lo manda al final: si alguien escribe `3.000.000`, se da
 * cuenta de que quería `2` al principio y va a corregirlo, el cursor se le
 * escapa en cuanto toca una tecla. Duplicar eso en tres sitios es garantizar
 * que dos se queden sin arreglar.
 *
 * La recolocación va en `useLayoutEffect` y no en un `setTimeout`: hay que
 * ponerlo ANTES de que el navegador pinte, o se ve saltar.
 *
 * Y solo se recoloca cuando este componente cambió el texto —por eso el `ref`
 * que se limpia solo—; si no, cada render movería el cursor de alguien que ni
 * siquiera está escribiendo.
 */
export function CampoMonto({
  id,
  valor,
  onCambio,
  moneda = "COP",
  className,
  placeholder,
  autoFocus,
  ref,
  "aria-describedby": describedBy,
}: {
  id: string;
  valor: string;
  onCambio: (texto: string) => void;
  moneda?: string;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  ref?: React.Ref<HTMLInputElement>;
  "aria-describedby"?: string;
}) {
  const propio = useRef<HTMLInputElement>(null);
  const cursorPendiente = useRef<number | null>(null);

  useLayoutEffect(() => {
    const el = propio.current;
    if (cursorPendiente.current === null || !el) return;
    el.setSelectionRange(cursorPendiente.current, cursorPendiente.current);
    cursorPendiente.current = null;
  });

  function alEscribir(e: React.ChangeEvent<HTMLInputElement>) {
    const el = e.target;
    const r = formatearAlEscribir(el.value, el.selectionStart ?? el.value.length, moneda);
    cursorPendiente.current = r.cursor;
    onCambio(r.texto);
  }

  return (
    <input
      id={id}
      ref={(n) => {
        propio.current = n;
        if (typeof ref === "function") ref(n);
        else if (ref) (ref as React.RefObject<HTMLInputElement | null>).current = n;
      }}
      value={valor}
      onChange={alEscribir}
      // `numeric` y no `decimal`: en pesos no se escriben centavos, así que la
      // tecla del separador solo estorba en el teclado del teléfono.
      inputMode="numeric"
      autoComplete="off"
      placeholder={placeholder}
      autoFocus={autoFocus}
      aria-describedby={describedBy}
      className={className}
    />
  );
}
