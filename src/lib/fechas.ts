import type { FechaISO } from "./types";

/**
 * Todo el manejo de fechas de la app vive acá, y en ningún otro lado.
 *
 * El error clásico de una app que cuenta días es pasarle `"2026-08-16"` a
 * `new Date()`. JavaScript lo interpreta como medianoche UTC, y para alguien
 * en Colombia —cinco horas atrás— eso es el día anterior a las 7 de la noche.
 * El viaje aparece con un día menos y la cifra diaria queda mal.
 *
 * La solución es no salir nunca del calendario: se parte el texto en números y
 * se compara en UTC, donde no hay horario de verano ni desfases.
 */

/** Convierte `YYYY-MM-DD` a un instante UTC. Uso interno. */
function aUTC(fecha: FechaISO): number {
  const [a, m, d] = fecha.split("-").map(Number);
  return Date.UTC(a, m - 1, d);
}

const MS_POR_DIA = 86_400_000;

/** Días de calendario entre dos fechas. Positivo si `hasta` es posterior. */
export function diasEntre(desde: FechaISO, hasta: FechaISO): number {
  return Math.round((aUTC(hasta) - aUTC(desde)) / MS_POR_DIA);
}

/** La fecha de hoy en la zona horaria del usuario, como `YYYY-MM-DD`. */
export function hoy(): FechaISO {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

/** Suma días a una fecha. Acepta negativos. */
export function sumarDias(fecha: FechaISO, dias: number): FechaISO {
  const d = new Date(aUTC(fecha) + dias * MS_POR_DIA);
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(d.getUTCDate()).padStart(2, "0");
  return `${d.getUTCFullYear()}-${mes}-${dia}`;
}

/**
 * Cuántos días faltan del viaje, contando hoy.
 *
 * Nunca devuelve menos de 1, porque esta cifra es un divisor: si llegara a cero
 * la app mostraría "Infinity" en la pantalla principal.
 */
export function diasRestantes(fin: FechaISO, desde: FechaISO = hoy()): number {
  return Math.max(1, diasEntre(desde, fin) + 1);
}

/**
 * Cuántos días del viaje ya terminaron.
 *
 * El día en curso no cuenta. Un día a medias siempre parece barato —a las diez
 * de la mañana apenas se ha gastado el desayuno— y si entrara en el promedio,
 * la app diría "vas muy bien" todas las mañanas y "vas mal" todas las noches.
 */
export function diasCerrados(inicio: FechaISO, desde: FechaISO = hoy()): number {
  return Math.max(0, diasEntre(inicio, desde));
}

/** Días totales del viaje, contando el primero y el último. */
export function duracion(inicio: FechaISO, fin: FechaISO): number {
  return Math.max(1, diasEntre(inicio, fin) + 1);
}

/** El viaje ya terminó: la fecha de fin quedó atrás. */
export function terminado(fin: FechaISO, desde: FechaISO = hoy()): boolean {
  return diasEntre(desde, fin) < 0;
}

/** El viaje todavía no empieza. */
export function noHaEmpezado(inicio: FechaISO, desde: FechaISO = hoy()): boolean {
  return diasEntre(desde, inicio) > 0;
}

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** «jueves 14» — para decirle al usuario cuándo se le acaba la plata. */
export function diaCorto(fecha: FechaISO): string {
  const d = new Date(aUTC(fecha));
  return `${DIAS[d.getUTCDay()]} ${d.getUTCDate()}`;
}

/** «14 de agosto» */
export function diaLargo(fecha: FechaISO): string {
  const d = new Date(aUTC(fecha));
  return `${d.getUTCDate()} de ${MESES[d.getUTCMonth()]}`;
}
