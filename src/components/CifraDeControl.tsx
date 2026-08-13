"use client";

import type { Balance, Viaje } from "@/lib/types.ts";
import { conSigno, formatearMoneda } from "@/lib/moneda.ts";
import { diaCorto, noHaEmpezado } from "@/lib/fechas.ts";

/**
 * La cifra protagonista.
 *
 * Responde «¿puedo pedir este plato?» en vez de «¿en qué se me fue la plata?».
 * Es la única cifra de la pantalla con este tamaño: una app que existe para
 * mirar un número no puede tener quince compitiendo.
 *
 * Debajo va la fórmula en palabras. Sin ella, el usuario ve una cifra que
 * cambia sola y no sabe de dónde sale — y un número que no se entiende es un
 * número en el que no se confía.
 */
export function CifraDeControl({ viaje, balance }: { viaje: Viaje; balance: Balance }) {
  if (balance.terminado) {
    return (
      <div>
        <p className="rotulo m-0">
          El viaje terminó
        </p>
        {/* `conSigno` y no el formateador a secas: con sobrante negativo,
            Intl pone el guion del teclado (U+002D), corto y descolgado de las
            cifras — justo lo que moneda.ts documenta como error. */}
        <p className="cifra-hero m-0 mt-1 text-5xl">
          {conSigno(balance.sobrante, viaje.moneda)}
        </p>
        <p className="m-0 mt-1 text-sm text-(--color-tinta-2)">
          {balance.sobrante >= 0 ? "te sobraron" : "te pasaste por este valor"}
        </p>
      </div>
    );
  }

  // Pasarse no apaga la cifra: cambia de significado. Un cero enorme no es un
  // dato, es un regaño, y es justo cuando más falta hace saber dónde está parado.
  const excedido = balance.sobrante < 0;

  return (
    <div>
      <p className="rotulo m-0">
        {excedido ? "Te pasaste del presupuesto" : "Puedes gastar por día"}
      </p>
      <p
        className="cifra-hero m-0 mt-1 text-5xl leading-none sm:text-6xl"
        style={{ color: excedido ? "var(--color-excedido)" : undefined }}
      >
        {excedido
          ? conSigno(balance.sobrante, viaje.moneda)
          : formatearMoneda(balance.diarioDisponible, viaje.moneda)}
      </p>
      <p className="m-0 mt-1.5 text-sm text-(--color-tinta-2)">
        {excedido ? (
          <>por encima del tope de {formatearMoneda(viaje.presupuesto, viaje.moneda)}</>
        ) : (
          <>
            {formatearMoneda(balance.sobrante, viaje.moneda)} entre {balance.diasRestantes}{" "}
            {balance.diasRestantes === 1 ? "día" : "días"}{" "}
            {/* «(incluye hoy)» en un viaje que no ha empezado era falso: hoy
                no es un día del viaje. La coletilla dice desde cuándo corre. */}
            {noHaEmpezado(viaje.inicio)
              ? `(desde el ${diaCorto(viaje.inicio)})`
              : "(incluye hoy)"}
          </>
        )}
      </p>
    </div>
  );
}
