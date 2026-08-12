import type { Gasto, Viaje } from "./types";
import { hoy, sumarDias } from "./fechas";

/**
 * Datos de ejemplo.
 *
 * Existen por una razón de producto: quien abra el link tiene que ver la app
 * viva en dos segundos. Una app vacía con un botón de «crear tu primer viaje»
 * obliga a inventarse un viaje antes de poder juzgar nada, y la mayoría no lo
 * hace — cierra la pestaña.
 *
 * Las fechas son relativas a hoy, no fijas. Un ejemplo con fechas escritas a
 * mano funciona el día que se escribe y a la semana siguiente muestra un viaje
 * vencido. Este no caduca nunca.
 *
 * Son dos viajes a propósito: uno que va bien y uno en riesgo. Así se pueden
 * ver los dos estados sin tener que registrar nada.
 */

let n = 0;
const id = (p: string) => `${p}-${Date.now().toString(36)}-${++n}`;

export function crearSemilla(): { viajes: Viaje[]; gastos: Gasto[] } {
  const hoyISO = hoy();
  const ahora = Date.now();

  // ── Viaje 1: Cartagena. Empezó hace dos días, termina en cuatro. Va bien. ──
  const cartagena: Viaje = {
    id: id("v"),
    nombre: "Cartagena",
    destino: "Cartagena, Colombia",
    inicio: sumarDias(hoyISO, -2),
    fin: sumarDias(hoyISO, 4),
    presupuesto: 3_000_000,
    moneda: "COP",
    creadoEn: ahora - 86_400_000 * 3,
  };

  // ── Viaje 2: Medellín. Empezó hace tres días, termina en dos. Va apretado. ──
  const medellin: Viaje = {
    id: id("v"),
    nombre: "Medellín",
    destino: "Medellín, Colombia",
    inicio: sumarDias(hoyISO, -3),
    fin: sumarDias(hoyISO, 2),
    presupuesto: 1_500_000,
    moneda: "COP",
    creadoEn: ahora - 86_400_000 * 5,
  };

  const g = (
    viaje: Viaje,
    monto: number,
    categoria: Gasto["categoria"],
    descripcion: string,
    diaRelativo: number,
    fueraDelRitmo = false,
  ): Gasto => ({
    id: id("g"),
    viajeId: viaje.id,
    monto,
    categoria,
    descripcion,
    fecha: sumarDias(hoyISO, diaRelativo),
    fueraDelRitmo,
    creadoEn: ahora + diaRelativo * 86_400_000,
  });

  const gastos: Gasto[] = [
    // Cartagena — el hotel y los vuelos van fuera del ritmo: ya están pagados
    // y no se repiten. Sin esta marca, la app declararía emergencia el día uno.
    g(cartagena, 980_000, "alojamiento", "Hotel en el centro, 6 noches", -2, true),
    g(cartagena, 420_000, "transporte", "Vuelos ida y vuelta", -2, true),
    g(cartagena, 38_000, "comida", "Almuerzo en Getsemaní", -2),
    g(cartagena, 62_000, "comida", "Cena en la muralla", -2),
    g(cartagena, 25_000, "transporte", "Taxi del aeropuerto", -2),
    g(cartagena, 18_000, "comida", "Desayuno", -1),
    g(cartagena, 145_000, "actividades", "Tour a Islas del Rosario", -1),
    g(cartagena, 54_000, "comida", "Almuerzo en la playa", -1),
    g(cartagena, 32_000, "compras", "Sombrero vueltiao", -1),
    g(cartagena, 21_000, "comida", "Desayuno", 0),
    g(cartagena, 15_000, "transporte", "Mototaxi", 0),

    // Medellín — sin gastos adelantados y con un ritmo alto. Este dispara alerta.
    g(medellin, 210_000, "alojamiento", "Hostal en Laureles", -3),
    g(medellin, 85_000, "comida", "Cena con amigos", -3),
    g(medellin, 40_000, "transporte", "Del aeropuerto al centro", -3),
    g(medellin, 195_000, "actividades", "Tour de café", -2),
    g(medellin, 72_000, "comida", "Almuerzo en Provenza", -2),
    g(medellin, 130_000, "compras", "Regalos", -2),
    g(medellin, 165_000, "actividades", "Parapente", -1),
    g(medellin, 68_000, "comida", "Cena", -1),
    g(medellin, 45_000, "transporte", "Taxis del día", -1),
    g(medellin, 28_000, "comida", "Desayuno", 0),
  ];

  return { viajes: [cartagena, medellin], gastos };
}
