"use client";

import { useSyncExternalStore } from "react";
import type { Gasto, Viaje } from "./types";
import { crearSemilla } from "./semilla";

/**
 * El almacén de datos.
 *
 * Todo vive en `localStorage`, detrás de esta interfaz. No es una limitación
 * técnica sino una decisión: se abre el link y la app se usa al
 * instante, sin registrarse y sin mezclar datos con los de nadie más. Una base
 * de datos sin cuentas haría que todos vieran y editaran lo mismo, que es peor.
 *
 * Cambiar esto por un servidor real es reemplazar este archivo. Nada más lo
 * toca directamente.
 *
 * ── Dos trampas resueltas acá ──────────────────────────────────────────────
 *
 * 1. Next dibuja la primera versión de la página en el servidor, donde no existe
 *    `localStorage`. Si el servidor y el navegador dibujan cosas distintas, React
 *    protesta y la cifra principal parpadea. Se resuelve con `getServerSnapshot`,
 *    que devuelve un estado vacío estable.
 *
 * 2. `getSnapshot` tiene que devolver siempre la MISMA referencia mientras nada
 *    cambie. Si devolviera un objeto nuevo en cada llamada, React entraría en un
 *    ciclo infinito. Por eso el estado se guarda en `actual` y solo se reemplaza
 *    cuando de verdad cambia algo.
 */

export interface Estado {
  viajes: Viaje[];
  gastos: Gasto[];
  viajeActivoId: string | null;
}

const CLAVE = "tripflow:v1";

const VACIO: Estado = { viajes: [], gastos: [], viajeActivoId: null };

let actual: Estado = VACIO;
let iniciado = false;
const oyentes = new Set<() => void>();

function leerDelDisco(): Estado {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (crudo) {
      const datos = JSON.parse(crudo) as Estado;
      if (Array.isArray(datos.viajes) && Array.isArray(datos.gastos)) return datos;
    }
  } catch {
    // Datos corruptos o almacenamiento bloqueado (modo incógnito estricto).
    // Se sigue con la semilla: es mejor una app que funciona sin recordar nada
    // que una pantalla en blanco.
  }
  const { viajes, gastos } = crearSemilla();
  return { viajes, gastos, viajeActivoId: viajes[0]?.id ?? null };
}

function guardarEnDisco(estado: Estado) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch {
    // Sin espacio o sin permiso. La app sigue funcionando en memoria durante
    // esta sesión; no vale la pena interrumpir al usuario por esto.
  }
}

function avisar() {
  for (const o of oyentes) o();
}

function cambiar(fn: (e: Estado) => Estado) {
  actual = fn(actual);
  guardarEnDisco(actual);
  avisar();
}

function suscribir(oyente: () => void) {
  if (!iniciado && typeof window !== "undefined") {
    iniciado = true;
    actual = leerDelDisco();
  }
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

const leer = () => actual;
const leerEnServidor = () => VACIO;

export function useEstado(): Estado {
  return useSyncExternalStore(suscribir, leer, leerEnServidor);
}

// ── Operaciones ────────────────────────────────────────────────────────────

const nuevoId = (p: string) =>
  `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export function crearViaje(datos: Omit<Viaje, "id" | "creadoEn">): string {
  const id = nuevoId("v");
  cambiar((e) => ({
    ...e,
    viajes: [...e.viajes, { ...datos, id, creadoEn: Date.now() }],
    // Al crear un viaje, se pasa a él. Sin esto, el usuario crea un viaje y se
    // queda mirando el anterior, sin entender qué pasó.
    viajeActivoId: id,
  }));
  return id;
}

export function editarViaje(id: string, cambios: Partial<Omit<Viaje, "id">>) {
  cambiar((e) => ({
    ...e,
    viajes: e.viajes.map((v) => (v.id === id ? { ...v, ...cambios } : v)),
  }));
}

export function borrarViaje(id: string) {
  cambiar((e) => {
    const viajes = e.viajes.filter((v) => v.id !== id);
    return {
      viajes,
      gastos: e.gastos.filter((g) => g.viajeId !== id),
      viajeActivoId: e.viajeActivoId === id ? (viajes[0]?.id ?? null) : e.viajeActivoId,
    };
  });
}

export function activarViaje(id: string) {
  cambiar((e) => ({ ...e, viajeActivoId: id }));
}

export function agregarGasto(datos: Omit<Gasto, "id" | "creadoEn">): string {
  const id = nuevoId("g");
  cambiar((e) => ({
    ...e,
    gastos: [...e.gastos, { ...datos, id, creadoEn: Date.now() }],
  }));
  return id;
}

/**
 * Editar y borrar no son un lujo: sin ellos, escribir 450.000 en vez de 45.000
 * daña la cifra principal para siempre, en una app cuyo argumento entero es
 * registrar rápido sin mirar.
 */
export function editarGasto(id: string, cambios: Partial<Omit<Gasto, "id" | "viajeId">>) {
  cambiar((e) => ({
    ...e,
    gastos: e.gastos.map((g) => (g.id === id ? { ...g, ...cambios } : g)),
  }));
}

export function borrarGasto(id: string) {
  cambiar((e) => ({ ...e, gastos: e.gastos.filter((g) => g.id !== id) }));
}

/** Devuelve el gasto borrado para poder deshacer. */
export function borrarGastoConDeshacer(id: string): (() => void) | null {
  const gasto = actual.gastos.find((g) => g.id === id);
  if (!gasto) return null;
  borrarGasto(id);
  return () => cambiar((e) => ({ ...e, gastos: [...e.gastos, gasto] }));
}

/** Vuelve a los datos de ejemplo. Útil para volver a empezar de cero. */
export function reiniciar() {
  const { viajes, gastos } = crearSemilla();
  cambiar(() => ({ viajes, gastos, viajeActivoId: viajes[0]?.id ?? null }));
}
