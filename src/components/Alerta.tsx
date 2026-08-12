"use client";

import type { Balance, Gasto, Viaje } from "@/lib/types.ts";
import { categoriaCulpable, diaEnQueSeAcaba } from "@/lib/presupuesto.ts";
import { formatearMoneda } from "@/lib/moneda.ts";
import { diaCorto } from "@/lib/fechas.ts";

/**
 * La alerta.
 *
 * El enunciado pide alertas «para regular y conservar sus finanzas», no para
 * avisar. La diferencia es que una alerta que solo informa deja al usuario sin
 * nada que hacer más que cerrar la app.
 *
 * Por eso esta dice tres cosas y ofrece una: qué pasa, cuándo se acaba la plata,
 * y a qué ritmo tendría que ir para llegar. La acción reusa el mismo formulario
 * de siempre.
 *
 * Nada se comunica solo con color: cada estado lleva icono y palabra además del
 * tono. Alrededor del 8% de los hombres no distingue el par verde-rojo, y un
 * estado que solo existe como color para ellos no existe.
 */

/**
 * Cada estado tiene una silueta distinta, no solo un color: trazo abierto,
 * contorno angular, y mancha sólida. A 16px reales eso se distingue aunque el
 * color no llegue.
 */
const ICONO: Record<Balance["estado"], string> = {
  bien: "✓",
  cuidado: "▲",
  excedido: "⬣",
};

const PALABRA: Record<Balance["estado"], string> = {
  bien: "Vas bien",
  cuidado: "Cuidado",
  excedido: "Te pasaste",
};

const COLOR: Record<Balance["estado"], string> = {
  bien: "var(--color-bien)",
  cuidado: "var(--color-cuidado)",
  excedido: "var(--color-excedido)",
};

/** El estado bueno no necesita fondo: la ausencia de alarma es el mensaje. */
/**
 * El estado bueno no lleva caja: la ausencia de alarma es el mensaje, y
 * dibujarle un marco sería ruido. Los otros dos sí, porque tienen que
 * interrumpir.
 */
const FONDO: Record<Balance["estado"], string> = {
  bien: "transparent",
  cuidado: "#FDF3E7",
  excedido: "#FDF0EF",
};

export function Alerta({
  viaje,
  balance,
  gastos,
  onAjustar,
}: {
  viaje: Viaje;
  balance: Balance;
  gastos: Gasto[];
  onAjustar: () => void;
}) {
  const color = COLOR[balance.estado];
  const seAcaba = diaEnQueSeAcaba(viaje, balance);
  const culpable = categoriaCulpable(gastos, viaje.id);

  return (
    <div
      className="flex flex-col gap-2 rounded-(--radius-caja)"
      style={
        {
          background: FONDO[balance.estado],
          padding: balance.estado === "bien" ? "0" : "0.875rem 1rem",
          "--estado": color,
        } as React.CSSProperties
      }
      role={balance.estado === "bien" ? undefined : "status"}
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--estado) text-[13px] font-bold text-(--color-tarjeta)"
        >
          {ICONO[balance.estado]}
        </span>
        <span className="ancho-medio text-sm text-(--estado)">
          {PALABRA[balance.estado]}
        </span>
      </div>

      <p className="m-0 text-sm leading-relaxed">{explicar(viaje, balance, seAcaba, culpable)}</p>

      {balance.estado !== "bien" && (
        // Sin `style` en línea: le gana a la clase de :hover y el estado no
        // se ve. El color del estado entra por variable CSS.
        <button
          type="button"
          onClick={onAjustar}
          className="ancho-medio mt-0.5 self-start rounded-(--radius-accion) border border-(--estado) px-3.5 py-1.5 text-[13px] text-(--estado) hover:bg-(--estado) hover:text-(--color-tarjeta)"
        >
          Ajustar el tope del viaje
        </button>
      )}
    </div>
  );
}

function explicar(
  viaje: Viaje,
  balance: Balance,
  seAcaba: string | null,
  culpable: { categoria: string; monto: number } | null,
) {
  const m = (n: number) => formatearMoneda(n, viaje.moneda);

  if (balance.estado === "excedido") {
    return (
      <>
        Llevas {m(balance.gastadoTotal)} de un tope de {m(viaje.presupuesto)}.
        {culpable && <> Lo que más pesa es {culpable.categoria}, con {m(culpable.monto)}.</>}
      </>
    );
  }

  if (balance.estado === "cuidado") {
    // La alerta se enciende por dos vías distintas y cada una necesita decir
    // algo distinto. La de ritmo puede nombrar el día; la de consumo todavía no
    // tiene días suficientes para calcularlo, y prometer una fecha ahí sería
    // inventarla.
    if (balance.porConsumo && !seAcaba) {
      return (
        <>
          Llevas gastado el {Math.round(balance.consumido * 100)}% del presupuesto y todavía te
          quedan {balance.diasRestantes} {balance.diasRestantes === 1 ? "día" : "días"}. Para llegar
          al final, {m(balance.diarioDisponible)} por día.
          {culpable && <> Lo que más pesa hasta ahora es {culpable.categoria}.</>}
        </>
      );
    }

    return (
      <>
        {seAcaba ? (
          <>A este ritmo te quedas sin presupuesto el {diaCorto(seAcaba)}, y el viaje termina el{" "}
            {diaCorto(viaje.fin)}.</>
        ) : (
          <>Vas por encima del ritmo que te alcanza para todo el viaje.</>
        )}{" "}
        Para llegar al final, {m(balance.diarioDisponible)} por día.
        {culpable && <> Lo que más pesa hasta ahora es {culpable.categoria}.</>}
      </>
    );
  }

  // El estado bueno también habla: el silencio no confirma nada, y una app que
  // solo aparece cuando algo va mal se siente como un regaño esperando turno.
  if (!balance.hayRitmoConfiable) {
    return <>Todavía no hay suficientes días para calcular tu ritmo. Registra un par de gastos más.</>;
  }
  return (
    <>
      Vas gastando {m(balance.ritmoReal ?? 0)} por día y te alcanza:{" "}
      puedes gastar {m(balance.diarioDisponible)} diarios hasta el {diaCorto(viaje.fin)}.
    </>
  );
}
