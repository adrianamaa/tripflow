"use client";

import type { Balance, Viaje } from "@/lib/types.ts";
import { formatearMoneda } from "@/lib/moneda.ts";

/**
 * El medidor: gastado contra tope, con una marca de dónde deberías ir hoy.
 *
 * La forma es un medidor de pista, no una torta de dos porciones — para una
 * razón contra un límite, la barra gana siempre porque la longitud se compara
 * sin pensar.
 *
 * Lo que lo separa de una barra de progreso cualquiera es la marca de
 * referencia: dice dónde estaría el gasto si fuera parejo a estas alturas del
 * viaje. Sin ella «llevas el 60%» no significa nada — el 60% en el día dos es
 * un problema y en el día seis es ir sobrado. La barra responde «cuánto»; la
 * marca responde «¿y eso es mucho?».
 *
 * La marca va DENTRO de la pista, cruzándola. Antes colgaba debajo con su
 * propia etiqueta y quedaba flotando sin anclaje visible.
 */
export function Medidor({ viaje, balance }: { viaje: Viaje; balance: Balance }) {
  const tope = viaje.presupuesto;
  const pct = (n: number) => Math.min(100, Math.max(0, (n / tope) * 100));

  const anchoFijo = pct(balance.gastadoFijo);
  const anchoVariable = pct(balance.gastadoVariable);
  const excedido = balance.gastadoTotal > tope;
  const consumido = Math.round((balance.gastadoTotal / tope) * 100);

  const proporcion =
    balance.diasTotales > 0 ? balance.diasCerrados / balance.diasTotales : 0;
  const marca = Math.min(100, proporcion * 100);
  const hayMarca = !balance.terminado && balance.diasCerrados > 0 && marca > 2 && marca < 98;

  // La barra va en tinta, no en el acento: el acento está reservado para la
  // acción de registrar. Si se gasta acá, deja de significar «esto se toca».
  const color = excedido ? "var(--color-excedido)" : "var(--color-tinta)";

  return (
    <div className="flex flex-col gap-2">
      <div
        role="progressbar"
        aria-valuenow={consumido}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${formatearMoneda(balance.gastadoTotal, viaje.moneda)} de ${formatearMoneda(tope, viaje.moneda)}, ${consumido}%`}
        className="relative h-3 w-full rounded-full bg-(--color-reposo)"
      >
        <div className="absolute inset-0 overflow-hidden rounded-full">
          {/* Adelantado: el mismo color, más claro. Es el mismo dinero, otro momento. */}
          <div
            className="absolute inset-y-0 left-0"
            style={{ width: `${anchoFijo}%`, background: color, opacity: 0.3 }}
          />
          {/* Gasto del día a día. Los 2px de separación son superficie, no un
              borde dibujado encima. */}
          <div
            className="absolute inset-y-0"
            style={{
              left: `calc(${anchoFijo}% + ${anchoFijo > 0 ? "2px" : "0px"})`,
              width: `max(0px, calc(${anchoVariable}% - ${anchoFijo > 0 ? "2px" : "0px"}))`,
              background: color,
            }}
          />
        </div>

        {/* La muesca cruza la pista de arriba abajo, así que se lee como
            referencia y no como otro dato más. */}
        {hayMarca && (
          <div
            aria-hidden="true"
            className="absolute -top-1 -bottom-1 w-1 rounded-full bg-(--color-tarjeta)"
            style={{ left: `calc(${marca}% - 2px)` }}
          >
            <div className="absolute inset-y-0 left-[1.5px] w-px bg-(--color-tinta-2)" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs text-(--color-tinta-2)">
        <span>
          <span className="cifra text-(--color-tinta)">
            {formatearMoneda(balance.gastadoTotal, viaje.moneda)}
          </span>{" "}
          de <span className="cifra">{formatearMoneda(tope, viaje.moneda)}</span>
          <span className="cifra"> · {consumido}%</span>
        </span>
        {/* La leyenda solo aparece cuando hay algo que comparar. Sin un solo
            gasto, explicar la muesca es explicar una referencia de nada. */}
        {hayMarca && balance.gastadoTotal > 0 && (
          <span className="ancho-densa whitespace-nowrap">la muesca es el ritmo parejo</span>
        )}
      </div>

      {balance.gastadoFijo > 0 && (
        <p className="m-0 text-xs leading-relaxed text-(--color-tinta-2)">
          <span
            className="mr-1.5 inline-block h-2 w-2 rounded-full align-[0.5px]"
            style={{ background: color, opacity: 0.3 }}
          />
          <span className="cifra">{formatearMoneda(balance.gastadoFijo, viaje.moneda)}</span> ya
          estaban pagados antes de salir, así que no cuentan para el ritmo diario.
        </p>
      )}
    </div>
  );
}
