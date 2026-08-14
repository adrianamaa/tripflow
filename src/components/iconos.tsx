/**
 * Los iconos.
 *
 * ── Por qué propios y no una biblioteca ────────────────────────────────────
 *
 * Porque las bibliotecas grandes se reconocen: el trazo de Lucide o de Feather
 * lo identifica de una cualquiera que dibuje interfaces. Y la app necesita
 * siete iconos — instalar cientos para usar siete es traer una dependencia y un
 * estilo ajeno a cambio de nada.
 *
 * ── Qué estaba mal antes ───────────────────────────────────────────────────
 *
 * No era el dibujo, era la MEZCLA. Convivían tres siluetas macizas —triángulo
 * relleno, octágono relleno, punto— con un visto de trazo abierto y un
 * calendario de contorno. Puestos uno al lado del otro no se leían como un
 * conjunto sino como iconos traídos de tres sitios distintos.
 *
 * ── Las reglas del set ─────────────────────────────────────────────────────
 *
 * Una retícula de 16, trazo de 1.5, remates y uniones redondos, TODOS de
 * contorno y ninguno macizo. El color entra por `currentColor`, así que un
 * icono nunca trae color propio: lo hereda de donde esté, que es lo que
 * mantiene el sistema de color en un solo sitio.
 *
 * El área de dibujo real es de 12 y no de 16: deja un margen de 2 por lado para
 * que los iconos no se toquen con el texto de al lado ni entre ellos.
 *
 * ── Y por qué los tres estados no se distinguen solo por color ─────────────
 *
 * Las siluetas son deliberadamente distintas: el visto es un trazo ABIERTO, la
 * advertencia es un triángulo de tres lados y el exceso es un octágono. A 16px
 * reales esas tres formas se separan aunque el color no llegue — cerca del 8%
 * de los hombres no distingue el par verde-rojo, y un estado que solo existe
 * como color para ellos no existe.
 */

type Props = {
  /** Lado en píxeles. 16 es la base de la retícula; en la práctica cada icono
      se ajusta a la caja del control donde vive (14–17). El trazo NO se
      reescala con el tamaño, así que en ese rango el peso óptico se mantiene;
      por fuera de él habría que redibujar. */
  tamano?: number;
  className?: string;
};

function Icono({
  tamano = 16,
  className,
  children,
}: Props & { children: React.ReactNode }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

/** Vas bien. Trazo abierto — la silueta más ligera del set, para el estado que
    no pide nada. */
export function IconoVisto(p: Props) {
  return (
    <Icono {...p}>
      <path d="M3 8.5 6.2 11.7 13 4.9" />
    </Icono>
  );
}

/** Cuidado. Tres lados y un trazo vertical: la silueta angular del medio. */
export function IconoCuidado(p: Props) {
  return (
    <Icono {...p}>
      <path d="M8 2.4 14.6 13.6H1.4z" />
      <path d="M8 6.6v2.8" />
      <path d="M8 11.5h.01" />
    </Icono>
  );
}

/** Te pasaste. Ocho lados y una barra que cruza: se lee como un límite roto, y
    es la silueta más cerrada del set. */
export function IconoExcedido(p: Props) {
  return (
    <Icono {...p}>
      <path d="M5.9 1.8h4.2L13.9 5.6v4.8l-3.8 3.8H5.9L2.1 10.4V5.6z" />
      <path d="M5.4 8h5.2" />
    </Icono>
  );
}

export function IconoCalendario(p: Props) {
  return (
    <Icono {...p}>
      <rect x="2.2" y="3.4" width="11.6" height="10.4" rx="2" />
      <path d="M2.2 6.6h11.6" />
      <path d="M5.4 2.2v2.2M10.6 2.2v2.2" />
    </Icono>
  );
}

export function IconoIzquierda(p: Props) {
  return (
    <Icono {...p}>
      <path d="M9.8 3.6 5.4 8l4.4 4.4" />
    </Icono>
  );
}

export function IconoDerecha(p: Props) {
  return (
    <Icono {...p}>
      <path d="M6.2 3.6 10.6 8l-4.4 4.4" />
    </Icono>
  );
}

export function IconoMas(p: Props) {
  return (
    <Icono {...p}>
      <path d="M8 3.2v9.6M3.2 8h9.6" />
    </Icono>
  );
}

/** El visto de la casilla. Va más grueso que el resto a propósito: se dibuja a
    10px dentro de un cuadro pequeño, y a ese tamaño 1.5 se ve anémico. */
export function IconoVistoCasilla({ tamano = 10 }: { tamano?: number }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M1.6 5.2 4 7.6 8.4 2.6" />
    </svg>
  );
}
