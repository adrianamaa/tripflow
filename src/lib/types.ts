/**
 * El modelo de datos de Tripflow.
 *
 * Una decisión atraviesa todo este archivo: las fechas se guardan como texto
 * `YYYY-MM-DD` y nunca como objetos `Date`. Un `Date` en JavaScript arrastra
 * hora y zona horaria, y en una app que cuenta días eso produce el error de
 * "un día de más o de menos" según dónde esté parado el usuario. Acá los días
 * son días de calendario, no instantes.
 */

/** Fecha de calendario en formato `YYYY-MM-DD`. Sin hora, sin zona horaria. */
export type FechaISO = string;

export const CATEGORIAS = [
  "alojamiento",
  "transporte",
  "comida",
  "actividades",
  "compras",
  "otros",
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export interface Viaje {
  id: string;
  nombre: string;
  destino: string;
  inicio: FechaISO;
  fin: FechaISO;
  /** Tope total del viaje, en la unidad mínima de la moneda (pesos, sin centavos). */
  presupuesto: number;
  moneda: string;
  creadoEn: number;
}

export interface Gasto {
  id: string;
  viajeId: string;
  monto: number;
  categoria: Categoria;
  descripcion: string;
  fecha: FechaISO;

  /**
   * Si el gasto ya estaba pagado antes de salir, o si es un pago único que no
   * se repite: el hotel, los vuelos, el seguro.
   *
   * Existe por una razón concreta. Sin esta marca, pagar el hotel el primer día
   * hunde el promedio diario y la app declara "vas muy rápido" durante todo un
   * viaje que en realidad va bien. El ritmo se calcula solo con lo que se repite.
   */
  fueraDelRitmo: boolean;

  creadoEn: number;
}

/** Los tres estados que puede tener un viaje respecto a su presupuesto. */
export type Estado = "bien" | "cuidado" | "excedido";

export interface Balance {
  /** Tope del viaje. */
  presupuesto: number;
  /** Lo que queda del tope. En un viaje terminado, lo que sobró. */
  sobrante: number;
  /** Todo lo gastado, sin distinguir. */
  gastadoTotal: number;
  /** Lo que no cuenta para el ritmo: hotel, vuelos, pagos únicos. */
  gastadoFijo: number;
  /** Lo que sí cuenta para el ritmo: comida, transporte del día a día. */
  gastadoVariable: number;

  /** Días del viaje que ya terminaron. El día en curso no cuenta: va a medias. */
  diasCerrados: number;
  /** Días que faltan, incluyendo hoy. Nunca menor que 1. */
  diasRestantes: number;
  /** Total de días del viaje. */
  diasTotales: number;

  /**
   * La cifra protagonista: cuánto se puede gastar por día de aquí en adelante.
   * En un viaje terminado vale cero — ahí lo que importa es `sobrante`.
   */
  diarioDisponible: number;
  /** A qué ritmo se ha gastado por día cerrado. `null` si no hay días cerrados. */
  ritmoReal: number | null;
  /** Cuánto terminaría gastando si sigue a este ritmo. `null` si no hay evidencia. */
  proyeccion: number | null;

  estado: Estado;
  /** Cuánto se pasaría del tope, si la proyección lo supera. */
  excesoProyectado: number | null;
  /** `false` mientras no haya evidencia suficiente para proyectar. */
  hayRitmoConfiable: boolean;
  /** Qué proporción del tope se lleva gastada, de 0 a 1 y más allá. */
  consumido: number;
  /** La alerta se encendió por consumo del tope, no por ir muy rápido. */
  porConsumo: boolean;
  /** El viaje ya terminó: la fecha de fin quedó atrás. */
  terminado: boolean;
}
