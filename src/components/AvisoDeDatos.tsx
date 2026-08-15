"use client";

import { useAvisoDeAlmacen } from "@/lib/almacen.ts";

/**
 * La banda que aparece cuando el almacenamiento no está haciendo su trabajo.
 *
 * Existe por una razón concreta: la app guardaba en `localStorage` y se tragaba
 * el error si la escritura fallaba. La pantalla seguía mostrando el gasto
 * recién anotado y la cifra principal se movía, así que todo decía «quedó
 * guardado». Al recargar no estaba. Alguien podía registrar una semana entera
 * de viaje sin una sola señal de que no se estaba guardando nada.
 *
 * Es amarillo y no rojo porque no es un error del que se haya perdido algo
 * todavía: es una advertencia sobre lo que va a pasar. Rojo es para lo que ya
 * salió mal.
 *
 * Va arriba de todo y de ancho completo porque no pertenece a ninguna tarjeta
 * en particular. Habla de la app entera.
 */
const TEXTOS = {
  "sin-guardado":
    "Este navegador no me está dejando guardar. Puedes usar la app, pero lo que anotes se pierde al recargar.",
  ilegible:
    "Había datos guardados en este navegador y no los pude leer. Empiezo en blanco, porque prefiero eso a mostrarte viajes que no son tuyos.",
} as const;

export function AvisoDeDatos() {
  const aviso = useAvisoDeAlmacen();
  if (!aviso) return null;

  return (
    <div
      role="status"
      className="bg-(--color-cuidado-fondo) px-5 py-2.5 text-center text-sm text-(--color-cuidado) sm:px-8"
    >
      <p className="ancho-ui m-0 leading-relaxed">{TEXTOS[aviso]}</p>
    </div>
  );
}
