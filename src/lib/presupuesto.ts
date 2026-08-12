import type { Balance, Estado, Gasto, Viaje } from "./types.ts";
import { diasCerrados, diasRestantes, duracion, hoy, sumarDias, terminado } from "./fechas.ts";

/**
 * El cálculo del presupuesto. Es el corazón de la app y donde estaba el error
 * más grave del planteamiento original.
 *
 * ── El problema del hotel ──────────────────────────────────────────────────
 *
 * Un viaje de 7 días con $3.000.000. El primer día se paga el hotel: $1.200.000.
 * Si el ritmo se calcula sobre todo lo gastado, la app ve $1.200.000 en un día
 * y proyecta $8.400.000 para el viaje entero. Declara emergencia el día uno,
 * y sigue declarándola el resto de la semana, en un viaje que va perfecto.
 *
 * La causa es que hay dos tipos de gasto y solo uno se repite. El hotel se paga
 * una vez; los almuerzos, todos los días. Proyectar hacia el futuro un gasto que
 * no vuelve a ocurrir es simplemente un error de modelo.
 *
 * Por eso cada gasto lleva la marca `fueraDelRitmo`, y el ritmo se calcula solo
 * con lo que se repite.
 */

/** Un día a medias siempre parece barato, así que no entra al promedio. */
const DIAS_MINIMOS_PARA_PROYECTAR = 2;

/** Con menos de esto, un solo almuerzo caro distorsiona todo. */
const GASTOS_MINIMOS_PARA_PROYECTAR = 3;

/**
 * Margen antes de encender la alerta. Sin él, la alerta parpadea con cada gasto
 * que cruza el umbral por unos pocos pesos, y una alerta que parpadea es una
 * alerta que el usuario aprende a ignorar.
 *
 * Empezó en 5% y una prueba lo bajó a 2%. Con 5%, un viaje de tres millones
 * tenía que ir proyectado a $150.000 por encima para que la app dijera algo —
 * demasiado tarde para una herramienta cuyo propósito es avisar a tiempo.
 * Un 2% alcanza de sobra para que la alerta no parpadee.
 */
const MARGEN_ALERTA = 1.02;

/**
 * Segunda vía de alerta, independiente del ritmo: cuánto del tope se lleva
 * consumido.
 *
 * Hace falta porque la proyección necesita dos días cerrados y tres gastos para
 * existir, y hasta entonces la app se queda muda. Alguien que crea un viaje hoy
 * y se gasta el 95% del presupuesto esta misma tarde vería «vas bien», que es
 * exactamente lo contrario de lo que el enunciado pide: avisar cuando se llega
 * a los límites.
 *
 * El 80% es el umbral que usan casi todas las apps de presupuesto. No reemplaza
 * la alerta de ritmo —esa avisa antes y dice qué día— sino que cubre el hueco
 * de los primeros días.
 */
const UMBRAL_CONSUMO = 0.8;

export function calcularBalance(
  viaje: Viaje,
  gastos: Gasto[],
  desde: string = hoy(),
): Balance {
  const delViaje = gastos.filter((g) => g.viajeId === viaje.id);

  const gastadoFijo = delViaje
    .filter((g) => g.fueraDelRitmo)
    .reduce((s, g) => s + g.monto, 0);

  const gastadoVariable = delViaje
    .filter((g) => !g.fueraDelRitmo)
    .reduce((s, g) => s + g.monto, 0);

  const gastadoTotal = gastadoFijo + gastadoVariable;

  const cerrados = diasCerrados(viaje.inicio, viaje.fin, desde);
  const restantes = diasRestantes(viaje.inicio, viaje.fin, desde);
  const totales = duracion(viaje.inicio, viaje.fin);
  const yaTermino = terminado(viaje.fin, desde);

  const sobrante = viaje.presupuesto - gastadoTotal;

  // La cifra protagonista. Responde «¿puedo pedir este plato?», que es la
  // pregunta que alguien se hace de verdad, y no «¿en qué se me fue la plata?».
  //
  // En un viaje terminado vale cero, y el sobrante se lee de `sobrante`. Antes
  // este campo guardaba el sobrante entero cuando el viaje acababa, y la pantalla
  // principal —que dice «por día»— habría mostrado «$1.190.000 por día».
  const diarioDisponible = yaTermino ? 0 : Math.floor(sobrante / restantes);

  const gastosVariables = delViaje.filter((g) => !g.fueraDelRitmo).length;
  const hayRitmoConfiable =
    cerrados >= DIAS_MINIMOS_PARA_PROYECTAR &&
    gastosVariables >= GASTOS_MINIMOS_PARA_PROYECTAR;

  const ritmoReal = cerrados > 0 ? Math.round(gastadoVariable / cerrados) : null;

  // Acá está el arreglo: al futuro solo se proyecta lo que se repite. Lo fijo
  // ya está contado en `gastadoTotal` y no vuelve a ocurrir.
  const proyeccion =
    hayRitmoConfiable && ritmoReal !== null && !yaTermino
      ? gastadoTotal + ritmoReal * restantes
      : null;

  const consumido = viaje.presupuesto > 0 ? gastadoTotal / viaje.presupuesto : 0;

  let estado: Estado = "bien";
  if (gastadoTotal > viaje.presupuesto) {
    estado = "excedido";
  } else if (
    // Cualquiera de las dos vías enciende la alerta: ir muy rápido, o llevar
    // consumida buena parte del tope. La segunda funciona desde el primer gasto.
    (proyeccion !== null && proyeccion > viaje.presupuesto * MARGEN_ALERTA) ||
    (consumido >= UMBRAL_CONSUMO && !yaTermino)
  ) {
    estado = "cuidado";
  }

  const excesoProyectado =
    proyeccion !== null && proyeccion > viaje.presupuesto
      ? proyeccion - viaje.presupuesto
      : null;

  return {
    presupuesto: viaje.presupuesto,
    sobrante,
    gastadoTotal,
    gastadoFijo,
    gastadoVariable,
    diasCerrados: cerrados,
    diasRestantes: restantes,
    diasTotales: totales,
    diarioDisponible,
    ritmoReal,
    proyeccion,
    estado,
    excesoProyectado,
    hayRitmoConfiable,
    consumido,
    porConsumo: estado === "cuidado" && consumido >= UMBRAL_CONSUMO,
    terminado: yaTermino,
  };
}

/**
 * Qué día se acaba la plata si sigue a este ritmo.
 *
 * La alerta útil no es «llevas el 80%» —eso llega tarde y no dice qué hacer—
 * sino «a este ritmo te quedas sin plata el jueves». Una avisa; la otra deja
 * corregir.
 */
export function diaEnQueSeAcaba(
  viaje: Viaje,
  balance: Balance,
  desde: string = hoy(),
): string | null {
  if (!balance.hayRitmoConfiable || balance.ritmoReal === null) return null;
  if (balance.ritmoReal <= 0) return null;

  const disponible = viaje.presupuesto - balance.gastadoTotal;
  if (disponible <= 0) return desde;

  const diasQueAguanta = Math.floor(disponible / balance.ritmoReal);
  if (diasQueAguanta >= balance.diasRestantes) return null; // alcanza

  return sumarDias(desde, diasQueAguanta);
}

/**
 * Cuánto tendría que gastar por día para llegar al final del viaje.
 *
 * Es la palanca que pide el enunciado: alertas «para regular». Una alerta que
 * solo informa deja al usuario sin nada que hacer más que cerrar la app.
 */
export function ritmoNecesario(balance: Balance): number {
  return Math.max(0, balance.diarioDisponible);
}

/**
 * Qué categoría explica mejor el exceso.
 *
 * Sirve para que la alerta no repita el número que ya está cuarenta píxeles más
 * arriba en tamaño grande, y diga algo que el usuario no sabía:
 * «vas $180.000 por encima, y $140.000 de eso son comida».
 */
export function categoriaCulpable(
  gastos: Gasto[],
  viajeId: string,
): { categoria: string; monto: number } | null {
  const variables = gastos.filter((g) => g.viajeId === viajeId && !g.fueraDelRitmo);
  if (variables.length === 0) return null;

  const porCategoria = new Map<string, number>();
  for (const g of variables) {
    porCategoria.set(g.categoria, (porCategoria.get(g.categoria) ?? 0) + g.monto);
  }

  let mayor: { categoria: string; monto: number } | null = null;
  for (const [categoria, monto] of porCategoria) {
    if (!mayor || monto > mayor.monto) mayor = { categoria, monto };
  }
  return mayor;
}
