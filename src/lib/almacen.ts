"use client";

import { useSyncExternalStore } from "react";
import type { Gasto, Viaje } from "./types.ts";
import { crearSemilla } from "./semilla.ts";
import { interpretar, type Guardado, type Lectura } from "./lectura.ts";

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
 * ── Tres trampas resueltas acá ─────────────────────────────────────────────
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
 *
 * 3. «No hay datos en el disco» NO es lo mismo que «es la primera vez». Este
 *    archivo los trataba igual en tres sitios distintos —al leer, al recibir un
 *    cambio de otra pestaña, y al fallar una escritura— y los tres terminaban
 *    en la misma línea: `crearSemilla()`. O sea que a alguien que ya tenía sus
 *    viajes la app se los podía cambiar por Cartagena y Medellín, y guardarlo
 *    encima en la siguiente edición. Ahora la lectura dice CUÁL de los cuatro
 *    casos encontró y solo uno de ellos siembra.
 */

/** El estado del almacén es exactamente lo que se escribe en disco. */
export type Estado = Guardado;

const CLAVE = "tripflow:v1";

const VACIO: Estado = { viajes: [], gastos: [], viajeActivoId: null };

/** Lo único que el usuario necesita saber de todo esto, cuando hay algo que decir. */
export type AvisoDeAlmacen = null | "ilegible" | "sin-guardado";

let actual: Estado = VACIO;
let aviso: AvisoDeAlmacen = null;
let iniciado = false;
const oyentes = new Set<() => void>();

/**
 * Lee, y dice qué encontró. No decide nada: decidir es trabajo de `arrancar`.
 *
 * Lo único que hace acá es tocar el navegador. Entender el contenido es de
 * `interpretar`, que no depende de nada y por eso tiene pruebas.
 */
function leerDelDisco(): Lectura {
  let crudo: string | null;
  try {
    crudo = localStorage.getItem(CLAVE);
  } catch {
    // Ni leer se puede. No es «no hay nada»: es «no me dejan mirar».
    return { tipo: "bloqueado" };
  }
  return interpretar(crudo);
}

/** Devuelve si de verdad quedó escrito. Antes se tragaba el error y nadie se enteraba. */
function guardarEnDisco(estado: Estado): boolean {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
    return true;
  } catch {
    return false;
  }
}

/**
 * Qué hacer con lo que se encontró.
 *
 * La semilla sale de UN solo caso: que la clave no exista. En los otros tres,
 * ponerla encima es inventarle viajes a alguien que quizá tenía los suyos.
 */
function arrancar(): { estado: Estado; aviso: AvisoDeAlmacen } {
  const lectura = leerDelDisco();

  switch (lectura.tipo) {
    case "datos":
      return { estado: lectura.estado, aviso: null };

    case "primera-vez": {
      const { viajes, gastos } = crearSemilla();
      const estado = { viajes, gastos, viajeActivoId: viajes[0]?.id ?? null };
      // Se guarda AL CREARLA. Sin esto, dos pestañas abiertas antes de la
      // primera edición se inventan cada una su propia semilla, con ids
      // distintos, y la primera que escriba le deja a la otra un estado donde
      // no reconoce ni el viaje que tiene en pantalla.
      return { estado, aviso: guardarEnDisco(estado) ? null : "sin-guardado" };
    }

    case "bloqueado": {
      // Acá no hay nada que perder: si no se puede leer, nunca se pudo escribir.
      // La semilla deja la app usable. Lo que no se vale es callar que lo que
      // anote se va a perder al recargar.
      const { viajes, gastos } = crearSemilla();
      return {
        estado: { viajes, gastos, viajeActivoId: viajes[0]?.id ?? null },
        aviso: "sin-guardado",
      };
    }

    case "ilegible":
      // Acá SÍ había algo. Sembrar sería taparlo con datos de mentira, y la
      // primera edición los guardaría encima: la pérdida pasa de recuperable a
      // definitiva. Se empieza en blanco y se dice lo que pasó.
      return { estado: VACIO, aviso: "ilegible" };
  }
}

function avisar() {
  for (const o of oyentes) o();
}

/**
 * Carga los datos del disco una sola vez.
 *
 * Antes esto vivía dentro de `suscribir`, y ahí había un hueco: cualquier
 * cosa que modificara los datos antes de que React montara un suscriptor
 * —un formulario o un diálogo que solo importe `agregarGasto`— corría sobre el
 * estado vacío y lo guardaba encima de los viajes del usuario. Ahora toda
 * operación pasa por acá primero.
 */
function asegurarIniciado() {
  if (iniciado || typeof window === "undefined") return;

  const arranque = arrancar();
  actual = arranque.estado;
  aviso = arranque.aviso;
  // La bandera se pone AL FINAL. Estaba antes de la lectura, así que si algo de
  // ahí adentro llegaba a fallar, el almacén quedaba marcado como iniciado con
  // el estado vacío, nunca se enganchaba el oyente, y la primera edición
  // escribía ese vacío encima de los viajes guardados.
  iniciado = true;

  window.addEventListener("storage", alEscribirOtraPestana);
}

/**
 * Otra pestaña tocó el almacenamiento.
 *
 * Con la app abierta dos veces, cada pestaña tenía su copia y la última en
 * escribir borraba lo que la otra hubiera registrado. localStorage es toda la
 * persistencia que hay acá, así que esa pérdida sería real.
 */
function alEscribirOtraPestana(e: StorageEvent) {
  if (e.key !== CLAVE) return;

  const lectura = leerDelDisco();
  // Si la otra pestaña BORRÓ la clave, la lectura vuelve «primera-vez». Antes
  // eso significaba semilla: esta pestaña cambiaba el viaje real por Cartagena y
  // Medellín sin decir nada, y la siguiente edición lo guardaba encima. Ahora no
  // se toca nada: lo que está en memoria sigue siendo lo bueno, y la próxima
  // escritura lo devuelve al disco.
  if (lectura.tipo !== "datos") return;

  // El viaje que estoy mirando es MÍO, no de la otra pestaña. Adoptar el suyo
  // desmontaba los formularios —van con `key` por viaje— y se llevaba lo que
  // estuviera a medio escribir, sin nada en pantalla que explicara por qué.
  const mio = actual.viajeActivoId;
  const sigueVivo = lectura.estado.viajes.some((v) => v.id === mio);

  actual = sigueVivo ? { ...lectura.estado, viajeActivoId: mio } : lectura.estado;

  // «ilegible» hablaba de lo que había en disco al arrancar, y acabamos de
  // adoptar datos buenos: ya no es cierto. Dejarlo puesto sería exactamente la
  // falla que este archivo existe para evitar, un mensaje diciendo lo contrario
  // de lo que muestra la pantalla.
  if (aviso === "ilegible") aviso = null;

  // «sin-guardado» NO se toca acá. Ese habla de si YO puedo escribir, y que otra
  // pestaña lo haya conseguido no lo demuestra: el cupo y los permisos pueden
  // ser distintos por pestaña. Lo único que lo desmiente es una escritura mía
  // que funcione, y eso ya pasa en `cambiar`. Apagarlo antes sería prometer un
  // guardado que no se ha comprobado.

  avisar();
}

function cambiar(fn: (e: Estado) => Estado) {
  asegurarIniciado();
  actual = fn(actual);
  // El aviso refleja la ÚLTIMA escritura, no una vieja: si el disco vuelve, se
  // apaga solo. Antes esto no existía y la pantalla mostraba tan campante un
  // gasto que nunca llegó a guardarse.
  aviso = guardarEnDisco(actual) ? null : "sin-guardado";
  avisar();
}

function suscribir(oyente: () => void) {
  asegurarIniciado();
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

/**
 * ¿Hay algo que decirle al usuario sobre sus datos?
 *
 * Un fallo de guardado que solo vive en una variable no le sirve a nadie: la
 * pantalla seguiría mostrando el gasto igual. Esto es lo que lo saca a la vista.
 */
export function useAvisoDeAlmacen(): AvisoDeAlmacen {
  return useSyncExternalStore(
    suscribir,
    () => aviso,
    () => null,
  );
}

/** Nada a lo que suscribirse: el valor solo cambia una vez, al hidratar. */
const sinSuscripcion = () => () => {};

/**
 * ¿Ya está el navegador al mando?
 *
 * Los datos viven en `localStorage`, que en el servidor no existe, así que el
 * primer pintado SIEMPRE llega con cero viajes. Y con cero viajes el tablero
 * dibujaba la pantalla de bienvenida: quien abría el link público —con la
 * semilla precargada o con sus propios viajes— veía «Crear mi primer viaje»
 * hasta que hidrataba. Medido contra el build de producción: el HTML del
 * servidor no contiene la palabra «Cartagena» ni una vez.
 *
 * Eso es un estado vacío haciendo de estado de carga, que son cosas distintas:
 * uno dice «no hay nada» y el otro «todavía no sé». Decir «no hay nada» sin
 * saberlo es lo que hace que una app parezca que perdió los datos.
 *
 * Devuelve `false` en el servidor y `true` en cuanto React toma el control, sin
 * efectos ni estado que sincronizar.
 */
export function useHidratado(): boolean {
  return useSyncExternalStore(
    sinSuscripcion,
    () => true,
    () => false,
  );
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
  asegurarIniciado();
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
