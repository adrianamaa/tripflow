/**
 * La marca.
 *
 * Está armada con masas y no con un trazo porque tiene que sobrevivir a 16px en
 * una pestaña: un trazo fino a ese tamaño se convierte en un gris sucio, y las
 * masas gruesas se siguen leyendo.
 */
export function Tripflow({ tamano = 26 }: { tamano?: number }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      {/* La pista: todo el presupuesto del viaje. */}
      <rect x="2" y="4" width="28" height="8" rx="4" fill="var(--color-marca)" />
      <rect x="2" y="4" width="14" height="8" rx="4" fill="var(--color-acento)" />
      <path d="M12 4H20V24A4 4 0 0 1 12 24Z" fill="var(--color-marca)" />
    </svg>
  );
}

/**
 * El bloque de identidad. La palabra va en el ancho más abierto de la familia,
 * que es el mismo que usan las cifras: la marca y los datos hablan igual.
 */
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
