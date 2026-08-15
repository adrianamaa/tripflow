import { strict as assert } from "node:assert";
import { test } from "node:test";

import { interpretar } from "./lectura.ts";
import type { Guardado } from "./lectura.ts";
import type { Gasto, Viaje } from "./types.ts";

/**
 * Estas pruebas existen por un error concreto.
 *
 * El almacén no distinguía «no hay clave guardada» de «hay clave y no la puedo
 * leer». Los dos casos caían en la misma línea y esa línea sembraba los datos de
 * ejemplo. Para alguien que ya tenía sus viajes eso significaba abrir la app y
 * encontrarse un Cartagena que no era suyo, con los suyos desaparecidos. Y como
 * la siguiente edición guarda encima, la pérdida pasaba de recuperable a
 * definitiva.
 *
 * Lo que se prueba acá es que cada caso se llama por su nombre. Qué hacer con
 * cada uno es decisión del almacén, pero no puede decidir bien si la lectura le
 * miente sobre lo que encontró.
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

const GASTO: Gasto = {
  id: "g1",
  viajeId: "v1",
  monto: 120_000,
  categoria: "comida",
  descripcion: "Almuerzo",
  fecha: "2026-08-10",
  fueraDelRitmo: false,
  creadoEn: 0,
};

const GUARDADO: Guardado = { viajes: [VIAJE], gastos: [GASTO], viajeActivoId: "v1" };

// ── Los cuatro desenlaces ──────────────────────────────────────────────────

test("sin clave guardada es primera vez, no un error", () => {
  assert.equal(interpretar(null).tipo, "primera-vez");
});

test("una clave vacía NO es primera vez: había algo y ya no se entiende", () => {
  // La diferencia importa: en «primera-vez» el almacén siembra. Si esto se
  // reportara como primera vez, el usuario recibiría datos de ejemplo encima.
  assert.equal(interpretar("").tipo, "ilegible");
});

test("basura que no es JSON es ilegible", () => {
  assert.equal(interpretar("{roto").tipo, "ilegible");
});

test("JSON válido pero que no es un objeto es ilegible", () => {
  // `JSON.parse` no lanza con ninguno de estos, así que sin la comprobación
  // explícita el `null` llegaba a `datos.viajes` y reventaba ahí.
  assert.equal(interpretar("null").tipo, "ilegible");
  assert.equal(interpretar("4").tipo, "ilegible");
  assert.equal(interpretar('"hola"').tipo, "ilegible");
});

test("un objeto sin las listas esperadas es ilegible", () => {
  assert.equal(interpretar('{"otraCosa":1}').tipo, "ilegible");
  assert.equal(interpretar('{"viajes":[],"gastos":"no soy lista"}').tipo, "ilegible");
});

test("datos buenos se leen como datos", () => {
  const r = interpretar(JSON.stringify(GUARDADO));
  assert.equal(r.tipo, "datos");
  if (r.tipo !== "datos") return;
  assert.equal(r.estado.viajes.length, 1);
  assert.equal(r.estado.gastos.length, 1);
  assert.equal(r.estado.viajeActivoId, "v1");
});

test("un almacén vacío a propósito NO es ilegible", () => {
  // Alguien que borró su único viaje tiene cero viajes, y eso es un estado
  // legítimo. Confundirlo con datos rotos le devolvería el viaje de ejemplo.
  const r = interpretar('{"viajes":[],"gastos":[],"viajeActivoId":null}');
  assert.equal(r.tipo, "datos");
});

// ── La limpieza que ya hacía, y que no se puede perder ─────────────────────

test("descarta viajes con fechas inservibles y se queda con los buenos", () => {
  const roto = { ...VIAJE, id: "v2", inicio: "" };
  const r = interpretar(JSON.stringify({ ...GUARDADO, viajes: [VIAJE, roto] }));
  assert.equal(r.tipo, "datos");
  if (r.tipo !== "datos") return;
  assert.deepEqual(
    r.estado.viajes.map((v) => v.id),
    ["v1"],
  );
});

test("descarta gastos huérfanos: su viaje ya no existe", () => {
  const huerfano = { ...GASTO, id: "g2", viajeId: "borrado" };
  const r = interpretar(JSON.stringify({ ...GUARDADO, gastos: [GASTO, huerfano] }));
  assert.equal(r.tipo, "datos");
  if (r.tipo !== "datos") return;
  assert.deepEqual(
    r.estado.gastos.map((g) => g.id),
    ["g1"],
  );
});

test("si el viaje activo ya no existe, cae en el primero que quede", () => {
  const r = interpretar(JSON.stringify({ ...GUARDADO, viajeActivoId: "se-borro" }));
  assert.equal(r.tipo, "datos");
  if (r.tipo !== "datos") return;
  assert.equal(r.estado.viajeActivoId, "v1");
});

test("sin viajes, el viaje activo queda en nada y no en un id inventado", () => {
  const r = interpretar('{"viajes":[],"gastos":[],"viajeActivoId":"v1"}');
  assert.equal(r.tipo, "datos");
  if (r.tipo !== "datos") return;
  assert.equal(r.estado.viajeActivoId, null);
});
