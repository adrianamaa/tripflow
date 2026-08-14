"use client";

import type { Balance, Gasto, Viaje } from "@/lib/types.ts";
import { categoriaCulpable, diaEnQueSeAcaba, ritmoNecesario } from "@/lib/presupuesto.ts";
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
 * Nada se comunica solo con color: cada estado lleva icono y palabra además del
 * tono. Alrededor del 8% de los hombres no distingue el par verde-rojo, y un
 * estado que solo existe como color para ellos no existe.
 *
 * ══ POR QUÉ AHORA ES UN PANEL, Y NO TEXTO SUELTO ══════════════════════════
 *
 * Ocupa la mitad derecha de la banda de resumen, que es la franja más valiosa
 * de la pantalla. Con la alerta como texto suelto, ese espacio sostenía dos
 * líneas y el resto era aire — se leía como algo que falta, no como respiro.
 *
 * Y hay una razón de contenido, no solo de relleno: LOS DOS RITMOS SALIERON DE
 * DENTRO DE LA FRASE. Decían «vas gastando $205.000 por día y te alcanza:
 * puedes gastar $238.000 diarios», o sea las dos cifras que hay que comparar
 * enterradas en prosa, separadas por doce palabras. Puestas una al lado de la
 * otra con su etiqueta, la comparación se hace de un vistazo y la frase queda
 * libre para decir lo único que un número no puede: qué hacer.
 *
 * ⚠️ CAMBIO DE OPINIÓN, y vale la pena dejarlo escrito: antes el estado bueno
 * no llevaba caja, con el argumento de que «la ausencia de alarma es el
 * mensaje». El argumento sigue siendo bueno para no ALARMAR, y por eso el fondo
 * del estado bueno es el tinte de la marca y no un color de estado. Pero servía
 * mal al layout: dejaba la mitad de la banda sin forma. Un panel no es una
 * alarma, es un contenedor.
 */

/**
 * Cada estado tiene una silueta distinta, no solo un color: trazo abierto,
 * contorno angular, y mancha sólida. A 16px reales eso se distingue aunque el
 * color no llegue.
 *
 * ⚠️ Van dibujados, no escritos. Antes eran los caracteres ✓ ▲ ⬣, y el tercero
 * —hexágono, U+2B23— no está en Archivo ni en la mayoría de fuentes: se
 * resolvía con lo que tuviera el sistema operativo, y donde no hubiera nada
 * sale el cuadrito vacío. Una app que se entrega por un link no puede apostar
 * el estado más grave a la fuente de respaldo de la máquina ajena.
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
 * Antes tenía un verde propio en 140° mientras la marca vive en 75°, así que la
 * app mostraba dos verdes sin relación y el visto se leía como «otro verde».
 *
 * El principio que lo ordena: el verde ES la marca y ES el estado normal. Los
 * colores de estado aparecen solo cuando algo va mal.
 */
const COLOR: Record<Balance["estado"], string> = {
  bien: "var(--color-marca)",
  cuidado: "var(--color-cuidado)",
  excedido: "var(--color-excedido)",
};

const FONDO: Record<Balance["estado"], string> = {
  bien: "var(--color-marca-suave)",
  cuidado: "var(--color-cuidado-fondo)",
  excedido: "var(--color-excedido-fondo)",
};

/**
 * El panel es siempre el mismo nodo, pase lo que pase.
 *
 * No es capricho de estructura: `role="status"` solo anuncia cuando cambia el
 * contenido de una región que YA existía. Antes cada estado devolvía un árbol
 * distinto, así que React desmontaba uno y montaba otro y el lector de pantalla
 * no decía nada — justo en el momento más importante, cuando alguien registra
 * un gasto y la app pasa de «vas bien» a «te pasaste».
 */
function Panel({
  fondo,
  color,
  icono,
  titulo,
  children,
}: {
  fondo: string;
  color: string;
  icono: React.ReactNode;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      className="flex flex-col gap-2.5 rounded-(--radius-caja) p-4 sm:p-5"
      style={{ background: fondo, "--estado": color } as React.CSSProperties}
    >
      <div className="flex items-center gap-2">
        {icono}
        <span className="ancho-medio text-[15px] text-(--estado)">{titulo}</span>
      </div>
      {children}
    </div>
  );
}

/**
 * El icono del estado neutro: contorno hueco, sin color de estado.
 *
 * En `tinta-3` y no en `filete`: los paneles neutros tienen fondo papel, y
 * filete sobre papel da 1.20:1 — el mismo error, medido, que ya había hecho
 * desaparecer los días bloqueados del calendario. `tinta-3` es el token que
 * existe exactamente para «lo inactivo que aun así tiene que verse».
 */
function PuntoNeutro() {
  return (
    <span
      aria-hidden="true"
      className="h-[17px] w-[17px] shrink-0 rounded-full border-2 border-(--color-tinta-3)"
    />
  );
}

/**
 * Los dos ritmos, uno al lado del otro.
 *
 * Es la comparación que responde «¿voy bien?» sin leer una frase: lo que estás
 * gastando contra lo que te alcanza. Estaban los dos dentro del párrafo,
 * separados por doce palabras, y nadie compara dos números que no están
 * alineados.
 */
function Ritmos({ viaje, balance }: { viaje: Viaje; balance: Balance }) {
  const m = (n: number) => formatearMoneda(n, viaje.moneda);
  const excedido = balance.estado === "excedido";
  return (
    <dl className="m-0 mt-1 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-(--color-filete) pt-3">
      <dt className="rotulo m-0">Vas gastando</dt>
      {/* «Te quedan», presente: el monto de abajo es el $0 de AHORA, y
          «quedaban $0» además nunca fue cierto — quedaba algo hasta que se
          acabó. Paralelo con «Te alcanzan», la otra rama del mismo ternario. */}
      <dt className="rotulo m-0">{excedido ? "Te quedan" : "Te alcanzan"}</dt>
      <dd className="cifra m-0 text-[17px]">{m(balance.ritmoReal ?? 0)}<span className="ancho-ui text-xs text-(--color-tinta-2)"> /día</span></dd>
      <dd className="cifra m-0 text-[17px]">
        {/* La palanca que pide el enunciado tiene función propia en el motor;
            reimplementarla acá era tener dos fuentes para el mismo número. */}
        {m(ritmoNecesario(balance))}
        <span className="ancho-ui text-xs text-(--color-tinta-2)"> /día</span>
      </dd>
    </dl>
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

  const neutro = { fondo: "var(--color-papel)", color: "var(--color-tinta-2)" };

  /**
   * Un viaje terminado va primero que todo lo demás.
   *
   * Sin esto, un viaje cerrado hace tres semanas mostraba «con un día más de
   * gastos ya puedo decirte si vas a llegar». No hay un día más: el viaje se
   * acabó. Una alerta advierte sobre algo que todavía se puede cambiar, y ahí
   * no queda nada que corregir — por eso tampoco ofrece ajustar el tope.
   */
  if (balance.terminado) {
    // «Terminado», no «cerrado»: la banda de al lado dice «El viaje terminó»
    // y el propio cuerpo de este panel dice «Terminaste con…» — un estado,
    // un verbo.
    return (
      <Panel {...neutro} icono={<PuntoNeutro />} titulo="Viaje terminado">
        <p className="m-0 text-sm leading-relaxed text-(--color-tinta-2)">
          {balance.sobrante >= 0 ? (
            <>
              Terminaste con {m(balance.sobrante)} sin gastar de un tope de{" "}
              {m(viaje.presupuesto)}.
            </>
          ) : (
            <>
              Terminaste {m(Math.abs(balance.sobrante))} por encima del tope de{" "}
              {m(viaje.presupuesto)}.
            </>
          )}
          {/* «Del día a día» no es relleno: `categoriaCulpable` deja fuera los
              pagos únicos a propósito, porque su pregunta es qué se come el
              ritmo diario y no cuál fue el gasto más grande. */}
          {culpable && (
            <> Del día a día, lo que más pesó fue {culpable.categoria}, con {m(culpable.monto)}.</>
          )}
        </p>
      </Panel>
    );
  }

  if (gastos.length === 0) {
    return (
      <Panel {...neutro} icono={<PuntoNeutro />} titulo="Sin gastos todavía">
        <p className="m-0 text-sm leading-relaxed text-(--color-tinta-2)">
          Cuando anotes el primero, acá te digo si tu ritmo te alcanza para llegar al{" "}
          {diaCorto(viaje.fin)} o si toca apretar.
        </p>
      </Panel>
    );
  }

  // Hay gastos pero todavía no hay días cerrados suficientes para proyectar.
  // Prometer un veredicto acá sería inventarlo.
  if (balance.estado === "bien" && !balance.hayRitmoConfiable) {
    return (
      <Panel {...neutro} icono={<PuntoNeutro />} titulo="Calculando tu ritmo">
        <p className="m-0 text-sm leading-relaxed text-(--color-tinta-2)">
          Llevas {m(balance.gastadoTotal)} de {m(viaje.presupuesto)}. Con un día más de gastos ya
          puedo decirte si vas a llegar.
        </p>
      </Panel>
    );
  }

  return (
    <Panel
      fondo={FONDO[balance.estado]}
      color={color}
      icono={<Icono tamano={17} className="shrink-0 text-(--estado)" />}
      titulo={PALABRA[balance.estado]}
    >
      <p className="m-0 text-sm leading-relaxed">{explicar(viaje, balance, seAcaba, culpable)}</p>

      {balance.hayRitmoConfiable && <Ritmos viaje={viaje} balance={balance} />}

      {balance.estado !== "bien" && (
        // Sin `style` en línea: le gana a la clase de :hover y el estado no se
        // ve. El color del estado entra por variable CSS.
        <button
          type="button"
          id="boton-ajustar"
          onClick={onAjustar}
          className="ancho-medio mt-1 self-start rounded-(--radius-accion) border border-(--estado) px-3.5 py-1.5 text-[13px] text-(--estado) hover:bg-(--estado) hover:text-(--color-tarjeta)"
        >
          Ajustar el tope del viaje
        </button>
      )}
    </Panel>
  );
}

/**
 * La frase.
 *
 * Ya no repite las cifras de ritmo: esas viven en su propio bloque, alineadas
 * para poder compararlas. Acá queda lo que un número no puede decir — cuándo se
 * acaba la plata y qué la está consumiendo.
 */
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
      // «Aún te faltan» y no «todavía te quedan»: quedar encuadra los días
      // como alivio, cuando el problema es justo ese — falta viaje y queda
      // poca plata. Es una alerta, no una buena noticia.
      return (
        <>
          Llevas gastado el {Math.round(balance.consumido * 100)}% del presupuesto y aún{" "}
          {balance.diasRestantes === 1
            ? "te falta 1 día"
            : `te faltan ${balance.diasRestantes} días`}{" "}
          de viaje.
          {culpable && <> Del día a día, lo que más pesa es {culpable.categoria}.</>}
        </>
      );
    }

    return (
      <>
        {/* Cuando la plata se acaba justo el último día, la forma general decía
            «te quedas sin presupuesto el sábado 15, y el viaje termina el
            sábado 15» — la misma fecha dos veces, como si fueran dos datos.
            Pasa en viajes con hotel prepagado, donde el ritmo come lo que queda
            casi exacto. Ese caso tiene su propia frase. */}
        {seAcaba && seAcaba === viaje.fin ? (
          <>
            A este ritmo el presupuesto se te acaba justo el {diaCorto(viaje.fin)}, el último día del
            viaje: llegas, pero sin margen para nada imprevisto.
          </>
        ) : seAcaba ? (
          <>
            A este ritmo te quedas sin presupuesto el {diaCorto(seAcaba)}, y el viaje termina el{" "}
            {diaCorto(viaje.fin)}.
          </>
        ) : (
          <>Vas por encima del ritmo que te alcanza para todo el viaje.</>
        )}
        {culpable && <> Del día a día, lo que más pesa es {culpable.categoria}.</>}
      </>
    );
  }

  // El estado bueno también habla: el silencio no confirma nada, y una app que
  // solo aparece cuando algo va mal se siente como un regaño esperando turno.
  // «Sin apuros» y no «sin quedarte corta»: era la única palabra con género de
  // toda la interfaz, en la frase del pantallazo por defecto.
  return <>Tu ritmo te alcanza para llegar al {diaCorto(viaje.fin)} sin apuros.</>;
}
