import type { Gasto, Viaje } from "./types.ts";

/**
 * Interpretar lo que había guardado.
 *
 * Esto vivía dentro de `almacen.ts`, mezclado con las llamadas a
 * `localStorage`. Está acá aparte por una razón práctica: era la lógica que
 * decidía si al usuario se le mostraban sus datos o los de ejemplo, no tenía una
 * sola prueba, y se equivocaba en silencio. Sin el navegador de por medio se
 * puede probar caso por caso, que es lo que hace `lectura.test.ts`.
 *
 * Acá no se toca `localStorage` ni se decide nada: solo se dice qué se encontró.
 * Qué hacer con eso es trabajo del almacén.
 */

/** La forma exacta de lo que se escribe en disco. */
export interface Guardado {
  viajes: Viaje[];
  gastos: Gasto[];
  viajeActivoId: string | null;
}

/**
 * Los cuatro desenlaces posibles de una lectura.
 *
 * El bug que hizo falta separarlos: `primera-vez` e `ilegible` se trataban
 * igual, y los dos terminaban sembrando los datos de ejemplo. En el primer caso
 * está bien. En el segundo significa taparle a alguien sus viajes de verdad con
 * un Cartagena de mentira, y guardárselo encima en la siguiente edición.
 */
export type Lectura =
  | { tipo: "datos"; estado: Guardado }
  /** No existe la clave: nadie ha usado la app en este navegador. */
  | { tipo: "primera-vez" }
  /** La clave existe pero no se pudo entender. Había algo, y se perdió. */
  | { tipo: "ilegible" }
  /** El navegador no deja ni leer. Incógnito estricto, permisos bloqueados. */
  | { tipo: "bloqueado" };

const ES_FECHA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Un registro guardado por una versión anterior, o con una fecha vacía, llega
 * hasta el cálculo y sale por pantalla convertido en `NaN`. No hay forma de que
 * el usuario entienda ni arregle eso, así que se descarta acá.
 */
export function viajeValido(v: unknown): v is Viaje {
  const x = v as Viaje;
  return (
    !!x &&
    typeof x.id === "string" &&
    ES_FECHA.test(x.inicio) &&
    ES_FECHA.test(x.fin) &&
    Number.isFinite(x.presupuesto)
  );
}

export function gastoValido(g: unknown): g is Gasto {
  const x = g as Gasto;
  return (
    !!x &&
    typeof x.id === "string" &&
    typeof x.viajeId === "string" &&
    ES_FECHA.test(x.fecha) &&
    Number.isFinite(x.monto)
  );
}

/**
 * Qué hay en el texto que estaba guardado.
 *
 * `null` significa que la clave no existe, que es distinto de que exista con
 * basura adentro. Esa distinción es el arreglo entero.
 */
export function interpretar(crudo: string | null): Lectura {
  if (crudo === null) return { tipo: "primera-vez" };

  let datos: Guardado;
  try {
    datos = JSON.parse(crudo) as Guardado;
  } catch {
    return { tipo: "ilegible" };
  }

  // `JSON.parse("null")` no lanza, y `null.viajes` sí. Un `4` o un `"hola"`
  // guardados por error tampoco lanzan al parsear.
  if (!datos || typeof datos !== "object") return { tipo: "ilegible" };
  if (!Array.isArray(datos.viajes) || !Array.isArray(datos.gastos)) {
    return { tipo: "ilegible" };
  }

  const viajes = datos.viajes.filter(viajeValido);
  const idsVivos = new Set(viajes.map((v) => v.id));

  return {
    tipo: "datos",
    estado: {
      viajes,
      // Un gasto cuyo viaje ya no existe es un huérfano: nunca se ve y
      // desordena los totales si alguien lo suma sin filtrar.
      gastos: datos.gastos.filter((g) => gastoValido(g) && idsVivos.has(g.viajeId)),
      viajeActivoId: idsVivos.has(datos.viajeActivoId ?? "")
        ? datos.viajeActivoId
        : (viajes[0]?.id ?? null),
    },
  };
}
