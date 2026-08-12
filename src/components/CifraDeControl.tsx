"use client";

import type { Balance, Viaje } from "@/lib/types.ts";
import { formatearMoneda } from "@/lib/moneda.ts";

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
        <p className="m-0 text-[11px] uppercase tracking-[0.13em] text-(--color-tinta-2)">
          El viaje terminó
        </p>
        <p className="m-0 mt-1 text-5xl font-semibold tracking-tight tabular-nums">
          {formatearMoneda(balance.sobrante, viaje.moneda)}
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
      <p className="m-0 text-[11px] uppercase tracking-[0.13em] text-(--color-tinta-2)">
        {excedido ? "Te pasaste del presupuesto" : "Puedes gastar por día"}
      </p>
      <p
        className="m-0 mt-1 text-5xl leading-none font-semibold tracking-tight tabular-nums sm:text-6xl"
        style={{ color: excedido ? "var(--color-excedido)" : undefined }}
      >
        {excedido
          ? `−${formatearMoneda(Math.abs(balance.sobrante), viaje.moneda)}`
          : formatearMoneda(balance.diarioDisponible, viaje.moneda)}
      </p>
      <p className="m-0 mt-2 text-sm text-(--color-tinta-2)">
        {excedido ? (
          <>por encima del tope de {formatearMoneda(viaje.presupuesto, viaje.moneda)}</>
        ) : (
          <>
            {formatearMoneda(balance.sobrante, viaje.moneda)} entre {balance.diasRestantes}{" "}
            {balance.diasRestantes === 1 ? "día" : "días"} (incluye hoy)
          </>
        )}
      </p>
    </div>
  );
}
