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
