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
 * Lo que lo hace distinto de una barra de progreso cualquiera es la marca de
 * referencia: la línea vertical que dice dónde estaría el gasto si fuera parejo
 * a estas alturas del viaje. Sin ella, «llevas el 60%» no significa nada — el
 * 60% en el día dos es un problema y en el día seis es ir sobrado. La barra
 * responde «cuánto», la marca responde «¿y eso es mucho?».
 *
 * El gasto adelantado —hotel, vuelos— va en un tramo aparte y más claro. Es
 * plata que ya salió pero que no se repite, y mezclarla con el gasto diario
 * fue justo el error que hacía que la app declarara emergencia el primer día.
 */
export function Medidor({ viaje, balance }: { viaje: Viaje; balance: Balance }) {
  const tope = viaje.presupuesto;
  const pct = (n: number) => Math.min(100, Math.max(0, (n / tope) * 100));

  const anchoFijo = pct(balance.gastadoFijo);
  const anchoVariable = pct(balance.gastadoVariable);
  const excedido = balance.gastadoTotal > tope;

  // Dónde debería ir el gasto si fuera parejo: la proporción del viaje que ya
  // pasó. Solo tiene sentido con el viaje en curso.
  const proporcionTranscurrida =
    balance.diasTotales > 0 ? balance.diasCerrados / balance.diasTotales : 0;
  const marcaRitmo = Math.min(100, proporcionTranscurrida * 100);
  const hayMarca = !balance.terminado && balance.diasCerrados > 0 && marcaRitmo < 99;

  // La barra va en tinta, no en el acento: el acento está reservado para la
  // acción de registrar. Si se gasta acá, deja de significar «esto se toca».
  const color = excedido ? "var(--color-excedido)" : "var(--color-tinta)";

  return (
    <div className="flex flex-col gap-2">
      <div
        role="progressbar"
        aria-valuenow={Math.round((balance.gastadoTotal / tope) * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${formatearMoneda(balance.gastadoTotal, viaje.moneda)} de ${formatearMoneda(tope, viaje.moneda)}`}
        className="relative h-2.5 w-full overflow-hidden rounded-full bg-(--color-reposo)"
      >
        {/* Adelantado: el mismo color, más claro. Es el mismo dinero, otro momento. */}
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${anchoFijo}%`, background: color, opacity: 0.35 }}
        />
        {/* Gasto del día a día, arrancando donde termina el adelantado. Los 2px
            de separación son superficie, no un borde dibujado. */}
        <div
          className="absolute inset-y-0 rounded-full"
          style={{
            left: `calc(${anchoFijo}% + ${anchoFijo > 0 ? "2px" : "0px"})`,
            width: `max(0px, calc(${anchoVariable}% - ${anchoFijo > 0 ? "2px" : "0px"}))`,
            background: color,
          }}
        />
      </div>

      {/* La marca de ritmo va fuera de la pista para no taparla. */}
      {hayMarca && (
        <div className="relative h-4">
          <div
            className="absolute top-0 -translate-x-1/2"
            style={{ left: `${marcaRitmo}%` }}
          >
            <div className="mx-auto h-2 w-px bg-(--color-tinta)" />
            <span className="ancho-densa block text-[10px] whitespace-nowrap text-(--color-tinta-2)">
              ritmo parejo
            </span>
          </div>
        </div>
      )}

      <div className="flex items-baseline justify-between text-xs text-(--color-tinta-2)">
        <span>
          <span className="cifra">{formatearMoneda(balance.gastadoTotal, viaje.moneda)}</span> de{" "}
          <span className="cifra">{formatearMoneda(tope, viaje.moneda)}</span>
        </span>
        <span className="cifra">{Math.round((balance.gastadoTotal / tope) * 100)}%</span>
      </div>

      {balance.gastadoFijo > 0 && (
        <p className="m-0 text-xs text-(--color-tinta-2)">
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full align-[0.5px]" style={{ background: color, opacity: 0.35 }} />
          <span className="cifra">{formatearMoneda(balance.gastadoFijo, viaje.moneda)}</span> ya
          estaban pagados antes de salir y no cuentan para el ritmo diario.
        </p>
      )}
    </div>
  );
}
