import { strict as assert } from "node:assert";
import { test } from "node:test";

import { calcularBalance, diaEnQueSeAcaba } from "./presupuesto.ts";
import type { Gasto, Viaje } from "./types.ts";

/**
 * El viaje de referencia: Cartagena, 7 días, tres millones.
 * Empieza el 10 de agosto y termina el 16.
 */
const VIAJE: Viaje = {
  id: "v1",
  nombre: "Cartagena",
  destino: "Cartagena, Colombia",
  inicio: "2026-08-10",
  fin: "2026-08-16",
  presupuesto: 3_000_000,
  moneda: "COP",
  creadoEn: 0,
};

let n = 0;
function gasto(p: Partial<Gasto> & { monto: number; fecha: string }): Gasto {
  return {
    id: `g${++n}`,
    viajeId: "v1",
    categoria: "comida",
    descripcion: "gasto",
    fueraDelRitmo: false,
    creadoEn: 0,
    ...p,
  };
}

test("el hotel del primer día NO dispara una falsa alarma", () => {
  // Paga el hotel el día 1 y come normal durante tres días.
  const gastos = [
    gasto({ monto: 1_200_000, fecha: "2026-08-10", categoria: "alojamiento", fueraDelRitmo: true }),
    gasto({ monto: 120_000, fecha: "2026-08-10" }),
    gasto({ monto: 130_000, fecha: "2026-08-11" }),
    gasto({ monto: 110_000, fecha: "2026-08-12" }),
  ];
  // Estamos en la mañana del día 4.
  const b = calcularBalance(VIAJE, gastos, "2026-08-13");

  assert.equal(b.gastadoFijo, 1_200_000, "el hotel se contabiliza aparte");
  assert.equal(b.gastadoVariable, 360_000, "solo lo que se repite entra al ritmo");
  assert.equal(b.diasCerrados, 3, "hoy no cuenta: va a medias");
  assert.equal(b.ritmoReal, 120_000, "el ritmo sale de lo variable, no del hotel");

  // Sin el arreglo, la proyección sería 1.560.000 / 3 × 7 = 3.640.000 → alarma.
  // Con el arreglo: 1.560.000 ya gastado + 120.000 × 4 días = 2.040.000.
  assert.equal(b.proyeccion, 2_040_000);
  assert.equal(b.estado, "bien", "un viaje que va bien no debe declarar emergencia");
});

test("sin la marca de gasto fijo, el mismo viaje daría falsa alarma", () => {
  // El mismo caso, pero tratando el hotel como si fuera un gasto diario más.
  const gastos = [
    gasto({ monto: 1_200_000, fecha: "2026-08-10", categoria: "alojamiento", fueraDelRitmo: false }),
    gasto({ monto: 120_000, fecha: "2026-08-10" }),
    gasto({ monto: 130_000, fecha: "2026-08-11" }),
    gasto({ monto: 110_000, fecha: "2026-08-12" }),
  ];
  const b = calcularBalance(VIAJE, gastos, "2026-08-13");

  assert.equal(b.proyeccion, 3_640_000, "así es como se veía el error");
  assert.equal(b.estado, "cuidado", "y así es como daba la falsa alarma");
});

test("un ritmo alto de verdad sí dispara la alerta", () => {
  const gastos = [
    gasto({ monto: 400_000, fecha: "2026-08-10" }),
    gasto({ monto: 450_000, fecha: "2026-08-11" }),
    gasto({ monto: 500_000, fecha: "2026-08-12" }),
  ];
  const b = calcularBalance(VIAJE, gastos, "2026-08-13");

  assert.equal(b.ritmoReal, 450_000);
  assert.equal(b.estado, "cuidado");
  assert.equal(diaEnQueSeAcaba(VIAJE, b, "2026-08-13"), "2026-08-16");
});

test("no proyecta sin evidencia suficiente", () => {
  const b = calcularBalance(VIAJE, [gasto({ monto: 90_000, fecha: "2026-08-10" })], "2026-08-11");
  assert.equal(b.hayRitmoConfiable, false, "un día y un gasto no son un ritmo");
  assert.equal(b.proyeccion, null, "mejor no decir nada que inventar una proyección");
  assert.equal(b.estado, "bien");
});

test("pasarse del tope se detecta aunque no haya ritmo confiable", () => {
  const gastos = [gasto({ monto: 3_500_000, fecha: "2026-08-10", fueraDelRitmo: true })];
  const b = calcularBalance(VIAJE, gastos, "2026-08-10");
  assert.equal(b.estado, "excedido");
});

test("el último día no divide por cero", () => {
  const b = calcularBalance(VIAJE, [], "2026-08-16");
  assert.equal(b.diasRestantes, 1);
  assert.equal(b.diarioDisponible, 3_000_000);
  assert.ok(Number.isFinite(b.diarioDisponible), "nunca puede salir Infinity en pantalla");
});

test("después del último día el viaje queda cerrado", () => {
  const b = calcularBalance(VIAJE, [], "2026-08-20");
  assert.equal(b.terminado, true);
  assert.equal(b.proyeccion, null, "un viaje terminado no se proyecta");
});

test("el disponible diario se recalcula al pasarse un día", () => {
  const flojo = calcularBalance(VIAJE, [gasto({ monto: 100_000, fecha: "2026-08-10" })], "2026-08-11");
  const duro = calcularBalance(VIAJE, [gasto({ monto: 900_000, fecha: "2026-08-10" })], "2026-08-11");
  assert.ok(duro.diarioDisponible < flojo.diarioDisponible, "gastar de más aprieta los días siguientes");
});
