/**
 * El isotipo: dos triángulos anidados apuntando hacia abajo, el grande en lima y
 * el chico en blanco, sobre un disco de marca.
 *
 * Va con el disco macizo y no sobre transparente porque tiene que sobrevivir a
 * 16px en una pestaña. Contra una barra oscura el disco casi se funde con ella
 * —1.19:1 contra `#35363A`— y ahí la marca la sostienen los dos triángulos, que
 * sí separan: lima sobre marca 7.75:1, blanco sobre marca 10.16:1.
 */
export function Tripflow({ tamano = 26 }: { tamano?: number }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 99 99"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      <rect width="98.68" height="98.68" rx="49.34" fill="var(--color-marca)" />
      {/* El grande en lima. Es la única masa de color del isotipo: la lima nunca
          entra como trazo ni como texto. */}
      <path
        d="M69.83 33.14C73.02 33.14 75.02 36.59 73.42 39.36L57.87 66.29C56.27 69.06 52.29 69.06 50.69 66.29L35.14 39.36C33.54 36.59 35.54 33.14 38.73 33.14L69.83 33.14Z"
        fill="var(--color-acento)"
      />
      {/* El chico en blanco. La jerarquía entre los dos la carga el color y no la
          opacidad: a 16px una opacidad del 60% se lee como un gris sucio. */}
      <path
        d="M52.05 44.32C54.42 44.32 55.90 46.89 54.72 48.94L43.17 68.94C41.98 70.99 39.02 70.99 37.84 68.94L26.29 48.94C25.10 46.89 26.58 44.32 28.95 44.32L52.05 44.32Z"
        fill="var(--color-sobre-marca)"
      />
    </svg>
  );
}

/** Isotipo + palabra. La palabra va en `.ancho-dato`, el mismo de las cifras. */
export function Marca({ tamano = 26 }: { tamano?: number }) {
  return (
    <span className="flex items-center gap-2">
      <Tripflow tamano={tamano} />
      <span className="ancho-dato text-(--color-marca)" style={{ fontSize: tamano * 0.76 }}>
        Tripflow
      </span>
    </span>
  );
}
