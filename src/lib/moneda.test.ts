import { strict as assert } from "node:assert";
import { test } from "node:test";

import { formatearMoneda, leerMonto } from "./moneda.ts";

test("los pesos se escriben con punto de miles y sin centavos", () => {
  assert.equal(formatearMoneda(1_250_000, "COP").replace(/ /g, " "), "$ 1.250.000");
});

test("en pesos, cualquier puntuación que teclee el usuario significa lo mismo", () => {
  for (const escrito of ["45000", "45.000", "45,000", "$45.000", "45 000"]) {
    assert.equal(leerMonto(escrito, "COP"), 45_000, `falló con «${escrito}»`);
  }
});

test("en dólares los centavos NO se pierden", () => {
  // El error: borrar todo lo que no fuera dígito convertía 12.50 en 1250.
  assert.equal(leerMonto("12.50", "USD"), 12.5);
  assert.equal(leerMonto("1,234.56", "USD"), 1234.56);
  assert.equal(leerMonto("$99.99", "USD"), 99.99);
});

test("un campo vacío o solo puntuación no es cero, es nada", () => {
  assert.equal(leerMonto("", "COP"), null);
  assert.equal(leerMonto("abc", "COP"), null);
  assert.equal(leerMonto(".", "USD"), null);
});
