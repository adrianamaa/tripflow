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

const ICONO: Record<Balance["estado"], string> = {
  bien: "✓",
  cuidado: "!",
  excedido: "×",
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
      className="flex flex-col gap-3 rounded-(--radius-caja) border p-4"
      style={{ borderColor: color }}
      role={balance.estado === "bien" ? undefined : "status"}
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-(--color-lienzo)"
          style={{ background: color }}
        >
          {ICONO[balance.estado]}
        </span>
        <span className="text-sm font-semibold" style={{ color }}>
          {PALABRA[balance.estado]}
        </span>
      </div>

      <p className="m-0 text-sm leading-relaxed">{explicar(viaje, balance, seAcaba, culpable)}</p>

      {balance.estado !== "bien" && (
        <button
          type="button"
          onClick={onAjustar}
          className="self-start rounded-(--radius-accion) border border-(--color-tinta) px-4 py-1.5 text-sm font-medium hover:bg-(--color-tinta) hover:text-(--color-lienzo)"
        >
          Ajustar el resto del viaje
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
