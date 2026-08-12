"use client";

import type { Balance, Gasto, Viaje } from "@/lib/types.ts";
import { categoriaCulpable, diaEnQueSeAcaba } from "@/lib/presupuesto.ts";
import { formatearMoneda } from "@/lib/moneda.ts";
import { diaCorto } from "@/lib/fechas.ts";
import { IconoCuidado, IconoExcedido, IconoVisto } from "./iconos.tsx";

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
 *
 * ⚠️ Van dibujados, no escritos. Antes eran los caracteres ✓ ▲ ⬣, y el tercero
 * —hexágono, U+2B23— no está en Archivo ni en la mayoría de fuentes: se resolvía
 * con lo que tuviera el sistema operativo, y donde no hubiera nada sale el
 * cuadrito vacío. Una app que se entrega por un link no puede apostar el estado
 * más grave a la fuente de respaldo de la máquina ajena.
 */
const ICONO: Record<
  Balance["estado"],
  (p: { tamano?: number; className?: string }) => React.ReactNode
> = {
  bien: IconoVisto,
  cuidado: IconoCuidado,
  excedido: IconoExcedido,
};

const PALABRA: Record<Balance["estado"], string> = {
  bien: "Vas bien",
  cuidado: "Cuidado",
  excedido: "Te pasaste",
};

/**
 * «Vas bien» usa el color de la MARCA, no un verde propio.
 *
 * Antes tenía un verde propio en 140° mientras la marca vive en 176°, así
 * que la app mostraba dos verdes distintos sin ninguna relación y el visto se
 * leía como «otro verde».
 *
 * El principio que lo ordena: el verde ES la marca y ES el estado normal. Los
 * colores de estado aparecen solo cuando algo va mal. Así no hay que distinguir
 * «verde de marca» de «verde de éxito» — son lo mismo, y quedan tres señales en
 * total: la marca, el ámbar y el rojo.
 */
const COLOR: Record<Balance["estado"], string> = {
  bien: "var(--color-marca)",
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
  cuidado: "var(--color-cuidado-fondo)",
  excedido: "var(--color-excedido-fondo)",
};

/**
 * El estado neutro, que faltaba y era un error de verdad.
 *
 * Con cero gastos registrados la alerta mostraba un check verde y «Vas bien»,
 * mientras el párrafo de al lado decía que todavía no se podía calcular el
 * ritmo. La insignia afirmaba lo que el texto desmentía.
 *
 * No es un detalle de estilo: es la app declarando que un viaje va bien sin
 * tener un solo dato para sostenerlo. Alguien crea un viaje y esa es la
 * primera pantalla que ve.
 *
 * «Sin datos» no es una gravedad menor que «bien»: es otra cosa. Por eso no
 * lleva color de estado —el color acá significa gravedad— sino el gris del
 * texto secundario y un contorno hueco en vez de una marca llena.
 */
function Neutro({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="h-5 w-5 shrink-0 rounded-full border-2 border-(--color-filete)"
        />
        <span className="ancho-medio text-sm text-(--color-tinta-2)">{titulo}</span>
      </div>
      <p className="m-0 text-sm leading-relaxed text-(--color-tinta-2)">{children}</p>
    </div>
  );
}

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
  const Icono = ICONO[balance.estado];
  const seAcaba = diaEnQueSeAcaba(viaje, balance);
  const culpable = categoriaCulpable(gastos, viaje.id);

  const m = (n: number) => formatearMoneda(n, viaje.moneda);

  /**
   * Un viaje terminado va primero que todo lo demás.
   *
   * Sin esto, un viaje cerrado hace tres semanas mostraba «con un día más de
   * gastos ya puedo decirte si vas a llegar». No hay un día más: el viaje se
   * acabó. Una alerta es una advertencia sobre algo que todavía se puede
   * cambiar, y acá ya no queda nada que corregir — por eso tampoco aparece el
   * botón de ajustar el tope.
   *
   * Lo que sí sirve es el cierre: en cuánto terminó y qué fue lo que pesó. Eso
   * es lo único que se puede llevar al siguiente viaje.
   */
  if (balance.terminado) {
    return (
      <Neutro titulo="Viaje cerrado">
        {balance.sobrante >= 0 ? (
          <>
            Terminaste con {m(balance.sobrante)} sin gastar de un tope de {m(viaje.presupuesto)}.
          </>
        ) : (
          <>
            Terminaste {m(Math.abs(balance.sobrante))} por encima del tope de{" "}
            {m(viaje.presupuesto)}.
          </>
        )}
        {/* «Del día a día» no es relleno: `categoriaCulpable` deja fuera los
            pagos únicos a propósito, porque su pregunta es qué se come el ritmo
            diario y no cuál fue el gasto más grande. Sin esa precisión, la
            frase decía que lo que más pesó fue comida mientras el hotel, más
            del doble, estaba a la vista dos columnas más allá. */}
        {culpable && (
          <>
            {" "}
            Del día a día, lo que más pesó fue {culpable.categoria}, con {m(culpable.monto)}.
          </>
        )}
      </Neutro>
    );
  }

  if (gastos.length === 0) {
    return (
      <Neutro titulo="Sin gastos todavía">
        Cuando anotes el primero, acá te digo si tu ritmo te alcanza para llegar al{" "}
        {diaCorto(viaje.fin)} o si toca apretar.
      </Neutro>
    );
  }

  // Hay gastos pero todavía no hay días cerrados suficientes para proyectar.
  // Prometer un veredicto acá sería inventarlo.
  if (balance.estado === "bien" && !balance.hayRitmoConfiable) {
    return (
      <Neutro titulo="Calculando tu ritmo">
        Llevas {m(balance.gastadoTotal)} de {m(viaje.presupuesto)}. Con un día más de gastos ya
        puedo decirte si vas a llegar.
      </Neutro>
    );
  }

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
        {/* Sin círculo relleno detrás: el set es de contorno, y meter un icono
            de trazo dentro de una mancha de color obliga a calarlo en blanco
            —dos pesos ópticos en una pieza de 20px— que es justo lo que hacía
            que los estados se vieran de sitios distintos. El icono lleva el
            color del estado, igual que la palabra que va al lado. */}
        <Icono tamano={17} className="shrink-0 text-(--estado)" />
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
        {culpable && (
          <> Del día a día, lo que más pesa es {culpable.categoria}, con {m(culpable.monto)}.</>
        )}
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
          {culpable && <> Del día a día, lo que más pesa es {culpable.categoria}.</>}
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
        {culpable && <> Del día a día, lo que más pesa es {culpable.categoria}.</>}
      </>
    );
  }

  // El estado bueno también habla: el silencio no confirma nada, y una app que
  // solo aparece cuando algo va mal se siente como un regaño esperando turno.
  //
  // El caso «todavía no hay ritmo» ya no llega hasta acá: lo atiende el estado
  // neutro antes de entrar, porque no es una gravedad sino una ausencia de dato.
  return (
    <>
      Vas gastando {m(balance.ritmoReal ?? 0)} por día y te alcanza:{" "}
      puedes gastar {m(balance.diarioDisponible)} diarios hasta el {diaCorto(viaje.fin)}.
    </>
  );
}
