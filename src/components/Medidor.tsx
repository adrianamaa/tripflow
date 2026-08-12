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
 * ══ LO QUE SE REHIZO, Y POR QUÉ ═══════════════════════════════════════════
 *
 * La raya vertical no se explicaba sola. Un gráfico que hay
 * que explicar ya falló, así que se fue a buscar el motivo y había tres, no uno:
 *
 * 1. LA MARCA ESTABA EN EL SITIO EQUIVOCADO. Se calculaba sobre el presupuesto
 *    entero, y eso contradice la idea sobre la que está construida la app: el
 *    gasto adelantado no se reparte por días, se paga de un golpe antes de
 *    salir. Repartirlo en la referencia era volver a meterlo al ritmo por la
 *    puerta de atrás, justo después de haberlo sacado.
 *
 *    En el viaje de ejemplo eso se veía así: marca en 28,6%, gastado en 60%. El
 *    dibujo decía «vas disparadísima» mientras la frase de al lado decía «vas
 *    bien». Corrida al tramo variable —lo único que sí se gasta día a día— la
 *    marca cae en 61,9% contra 60% gastado: apenas por delante, que es
 *    exactamente lo que dice el texto.
 *
 * 2. HABÍA DOS CORTES BLANCOS QUE SIGNIFICABAN COSAS DISTINTAS Y SE VEÍAN
 *    IGUALES: la marca del ritmo, y una separación de 2px entre lo adelantado y
 *    lo del día a día. Con la barra oscura a ambos lados, las dos se leían como
 *    que la barra estaba PARTIDA. La separación sobraba: el cambio de tono ya
 *    dice dónde termina un tramo y empieza el otro, así que se quitó.
 *
 * 3. LA MARCA VIVÍA DENTRO DE LA PISTA. Cualquier cosa dibujada dentro de una
 *    barra se lee como parte de la barra. Ahora es una señal ENCIMA, apoyada en
 *    el borde superior: no corta nada y se lee como lo que es, una referencia
 *    externa.
 *
 * Y la leyenda nombra los dos tonos. Antes solo explicaba el claro, así que el
 * oscuro se quedaba sin decir qué era.
 */
/**
 * Cuánto se aclara el tramo ya pagado respecto al del día a día.
 *
 * Estaba en 0.28 y ese era el error de lectura más grande del componente: sobre
 * la pista clara daba un gris tan parecido al fondo que el ojo lo contaba como
 * VACÍO. De reojo la barra parecía llena hasta donde empezaba el negro —un 13%—
 * cuando iba en 60%.
 *
 * A 0.5 los dos tramos se leen como relleno y la diferencia entre ellos sigue
 * siendo obvia: sobre la pista dan un gris medio y un casi negro, con la pista
 * vacía mucho más clara que los dos.
 */
const CLARIDAD_ADELANTADO = 0.5;

export function Medidor({ viaje, balance }: { viaje: Viaje; balance: Balance }) {
  const tope = viaje.presupuesto;
  const pct = (n: number) => Math.min(100, Math.max(0, (n / tope) * 100));

  const anchoFijo = pct(balance.gastadoFijo);
  const anchoVariable = pct(balance.gastadoVariable);
  const excedido = balance.gastadoTotal > tope;
  const consumido = Math.round((balance.gastadoTotal / tope) * 100);

  const proporcion = balance.diasTotales > 0 ? balance.diasCerrados / balance.diasTotales : 0;
  // El tramo que de verdad se gasta día a día es lo que queda del eje después
  // de lo ya pagado. La referencia de ritmo solo tiene sentido sobre él.
  const tramoVariable = Math.max(0, 100 - anchoFijo);
  const marca = Math.min(100, anchoFijo + tramoVariable * proporcion);
  const hayMarca =
    !balance.terminado && balance.diasCerrados > 0 && balance.gastadoTotal > 0 && marca < 99;

  // La barra va en tinta, no en el acento: el acento está reservado para la
  // acción de registrar. Si se gasta acá, deja de significar «esto se toca».
  const color = excedido ? "var(--color-excedido)" : "var(--color-tinta)";

  return (
    <div className="flex flex-col gap-2">
      {/**
        * La señal de ritmo CRUZA la barra, y sobresale por arriba y por abajo.
        *
        * Ha estado en los dos extremos y los dos estaban mal. Dentro de la
        * pista, dibujada como un hueco claro, se leía como que la barra estaba
        * partida. Fuera de la pista, apoyada encima, dejaba de pertenecerle a la
        * barra —una marquita suelta— y además quedaba en tinta sobre una barra
        * de tinta, o sea casi invisible.
        *
        * Lo que resuelve las dos cosas es el halo: un trazo claro un poco más
        * ancho con el trazo oscuro adentro. Sobre el relleno negro se ve por el
        * halo; sobre la pista clara se ve por el núcleo. Y como sobresale doce
        * píxeles más que la pista, se lee como una referencia que la atraviesa y
        * no como un corte en ella.
        */}
      <div className="relative py-1.5">
        <div
          role="progressbar"
          aria-label={`Gastado del presupuesto de ${viaje.nombre}`}
          // Acotado: sin esto, pasarse del tope emitía valores como 145 contra un
          // máximo de 100, que el navegador reporta como basura.
          aria-valuenow={Math.min(100, Math.max(0, consumido))}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${formatearMoneda(balance.gastadoTotal, viaje.moneda)} de ${formatearMoneda(tope, viaje.moneda)}, ${consumido}%`}
          className="relative h-3 w-full overflow-hidden rounded-full bg-(--color-reposo)"
        >
          {/* Adelantado: el mismo color, más claro. Es el mismo dinero, otro
              momento. Sin separación dibujada: el cambio de tono ya separa, y
              una raya blanca ahí competía con la señal de ritmo. */}
          <div
            className="absolute inset-y-0 left-0"
            style={{ width: `${anchoFijo}%`, background: color, opacity: CLARIDAD_ADELANTADO }}
          />
          {/* Gasto del día a día. La punta va redonda para que el conjunto se
              lea como UN relleno: con el tramo claro redondeado por la pista y
              este cortado en recto, eran dos formas pegadas en vez de una. */}
          <div
            className="absolute inset-y-0 rounded-r-full"
            style={{ left: `${anchoFijo}%`, width: `${anchoVariable}%`, background: color }}
          />
        </div>

        {/**
          * La señal va en la familia de la marca, y no es decoración: es lo
          * único que la hace visible en los dos fondos que tiene que cruzar.
          *
          * En tinta sobre una barra de tinta era casi imperceptible. Y ningún
          * color sirve solo: la lima da 15.08:1 contra el relleno negro pero
          * 1.07:1 contra la pista clara, donde desaparece; el verde oscuro da
          * 8.33:1 contra la pista pero se pierde en el negro.
          *
          * Puestos uno dentro del otro se cubren: sobre el relleno se ve por el
          * halo lima, sobre la pista se ve por el núcleo oscuro. Siempre hay una
          * de las dos leyéndose, sin blanco de por medio y sin salirse del
          * sistema de color.
          */}
        {hayMarca && (
          <div
            aria-hidden="true"
            className="absolute inset-y-0 w-[7px] rounded-full bg-(--color-acento)"
            style={{ left: `calc(${marca}% - 3.5px)` }}
          >
            <div className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-(--color-marca)" />
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

        {/* La leyenda repite la forma de la señal, no la nombra: «la muesca» no
            le dice nada a quien no sabe qué es una muesca. */}
        {hayMarca && (
          <span className="ancho-densa flex items-center gap-1.5 whitespace-nowrap">
            {/* La muestra repite la señal completa —halo y núcleo— y no solo el
                núcleo: si la leyenda no se parece a lo que hay en la barra, no
                sirve de leyenda. */}
            <span
              aria-hidden="true"
              className="relative inline-block h-3.5 w-[7px] shrink-0 rounded-full bg-(--color-acento)"
            >
              <span className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-(--color-marca)" />
            </span>
            deberías ir por acá hoy
          </span>
        )}
      </div>

      {/* Los dos tonos, nombrados. Antes solo se explicaba el claro y el oscuro
          se quedaba sin decir qué era, que es justo lo que se preguntó. */}
      {balance.gastadoFijo > 0 && (
        <p className="m-0 flex flex-wrap gap-x-4 gap-y-1 text-xs text-(--color-tinta-2)">
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ background: color, opacity: CLARIDAD_ADELANTADO }}
            />
            <span className="cifra">{formatearMoneda(balance.gastadoFijo, viaje.moneda)}</span>{" "}
            pagados antes de salir
          </span>
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ background: color }}
            />
            <span className="cifra">{formatearMoneda(balance.gastadoVariable, viaje.moneda)}</span>{" "}
            del día a día
          </span>
        </p>
      )}
    </div>
  );
}
