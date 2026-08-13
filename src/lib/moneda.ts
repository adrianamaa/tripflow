/**
 * Formato de dinero.
 *
 * Esto importa más de lo que parece. Un monto mal formateado —`$1,250,000.00`
 * donde debería decir `$1.250.000`— se nota de inmediato y quema credibilidad
 * más rápido que un color feo.
 *
 * En Colombia el separador de miles es el punto, el decimal es la coma, y en la
 * práctica nadie escribe centavos: los pesos no se parten.
 */

/** El locale correcto para cada moneda que la app acepta. */
const LOCALES: Record<string, string> = {
  COP: "es-CO",
  USD: "en-US",
  EUR: "es-ES",
  MXN: "es-MX",
  PEN: "es-PE",
  CLP: "es-CL",
  ARS: "es-AR",
  BRL: "pt-BR",
};

/**
 * Monedas que no usan centavos en la práctica. En Colombia y Chile un precio
 * con decimales se lee como error de sistema, no como precisión.
 */
const SIN_DECIMALES = new Set(["COP", "CLP", "PYG", "JPY", "KRW"]);

/** `$1.250.000` — con símbolo. */
export function formatearMoneda(monto: number, moneda = "COP"): string {
  const decimales = SIN_DECIMALES.has(moneda) ? 0 : 2;
  return new Intl.NumberFormat(LOCALES[moneda] ?? "es-CO", {
    style: "currency",
    currency: moneda,
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(monto);
}

/** `1.250.000` — sin símbolo, para cuando el contexto ya dice la moneda. */
export function formatearNumero(monto: number, moneda = "COP"): string {
  const decimales = SIN_DECIMALES.has(moneda) ? 0 : 2;
  return new Intl.NumberFormat(LOCALES[moneda] ?? "es-CO", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(monto);
}

/**
 * Da formato mientras se escribe, como el teclado de plata de un banco.
 *
 * `3000000` es un muro; `3.000.000` se lee de un golpe. Agrupar de a tres es de
 * las pocas ayudas de lectura que funcionan sin que nadie las tenga que
 * aprender, y en un campo donde uno teclea siete dígitos seguidos es la
 * diferencia entre revisar y confiar.
 *
 * ── El detalle que hace que esto funcione o estorbe ────────────────────────
 *
 * Reformatear el texto de un campo controlado MUEVE EL CURSOR AL FINAL. Si uno
 * escribe `3.000.000`, se da cuenta de que quería `2` al principio y va a
 * corregirlo, el cursor se le escapa al final en cuanto toca una tecla. Ese es
 * el motivo por el que la mayoría de los campos con formato en vivo terminan
 * siendo insoportables.
 *
 * Se resuelve contando DÍGITOS y no caracteres: se cuenta cuántos dígitos había
 * a la izquierda del cursor, se reformatea, y se vuelve a poner el cursor
 * después de esa misma cantidad de dígitos. Los puntos que se metan o se
 * quiten en el camino dejan de importar.
 *
 * ⚠️ Solo agrupa monedas sin centavos. Con decimales, escribir `12,` obligaría a
 * decidir qué hacer con una coma suelta a mitad de tecleo, y cualquier respuesta
 * pelea con quien está escribiendo. Ahí el texto se deja intacto.
 */
export function formatearAlEscribir(
  texto: string,
  cursor: number,
  moneda = "COP",
): { texto: string; cursor: number } {
  if (!SIN_DECIMALES.has(moneda)) return { texto, cursor };

  const digitosAntes = (texto.slice(0, cursor).match(/\d/g) ?? []).length;
  const digitos = texto.replace(/\D/g, "");
  if (digitos === "") return { texto: "", cursor: 0 };

  // Sin tope, `Number` pierde precisión y empieza a redondear en silencio.
  const recortado = digitos.slice(0, 15);
  const formateado = formatearNumero(Number(recortado), moneda);

  // El cursor va justo después del dígito número `digitosAntes`.
  let vistos = 0;
  let posicion = formateado.length;
  for (let i = 0; i < formateado.length; i++) {
    if (/\d/.test(formateado[i])) {
      vistos++;
      if (vistos === digitosAntes) {
        posicion = i + 1;
        break;
      }
    }
  }
  if (digitosAntes === 0) posicion = 0;

  return { texto: formateado, cursor: posicion };
}

/** El separador decimal que usa el locale de esa moneda: `,` en es-CO, `.` en en-US. */
function separadorDecimal(moneda: string): string {
  return (
    new Intl.NumberFormat(LOCALES[moneda] ?? "es-CO")
      .formatToParts(1.1)
      .find((p) => p.type === "decimal")?.value ?? ","
  );
}

/**
 * Lo que el usuario escribe, convertido a número.
 *
 * En pesos, alguien escribiendo rápido teclea `45.000`, `45000` o `45,000` sin
 * pensarlo: los tres significan lo mismo y los tres tienen que funcionar. El
 * formulario de gastos existe para ser rápido, y rechazar un monto por su
 * puntuación es justo la fricción que hace que la gente diga «después lo anoto».
 *
 * Pero eso solo vale en monedas sin centavos. La primera versión de esta función
 * borraba todo lo que no fuera dígito, y en un viaje en dólares `12.50` se leía
 * como `1250`: un error de cien veces, en el campo donde menos se puede permitir.
 * Ahora el separador decimal depende de la moneda del viaje.
 */
export function leerMonto(texto: string, moneda = "COP"): number | null {
  if (SIN_DECIMALES.has(moneda)) {
    const soloDigitos = texto.replace(/[^\d]/g, "");
    if (soloDigitos === "") return null;
    const n = Number(soloDigitos);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }

  const decimal = separadorDecimal(moneda);
  // Se quita todo menos dígitos y el separador decimal de esa moneda; los
  // separadores de miles caen solos porque no son ninguno de los dos.
  const limpio = texto
    .replace(new RegExp(`[^\\d${decimal === "." ? "\\." : decimal}]`, "g"), "")
    .replace(decimal, ".");
  if (limpio === "" || limpio === ".") return null;
  const n = Number(limpio);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/**
 * El signo menos tipográfico, no el guion del teclado.
 *
 * `-` (U+002D) es un guion: corto, alto de más y descolgado de las cifras.
 * `−` (U+2212) tiene el ancho y la altura de los números. En una columna de
 * montos la diferencia se ve.
 */
export function conSigno(monto: number, moneda = "COP"): string {
  if (monto < 0) return `−${formatearMoneda(Math.abs(monto), moneda)}`;
  return formatearMoneda(monto, moneda);
}
