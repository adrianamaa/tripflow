"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORIAS, type Categoria, type Gasto, type Viaje } from "@/lib/types.ts";
import { formatearNumero, leerMonto } from "@/lib/moneda.ts";
import { acotarFecha, hoy } from "@/lib/fechas.ts";
import { agregarGasto, editarGasto } from "@/lib/almacen.ts";
import { Calendario } from "./Calendario.tsx";
import { CampoMonto } from "./CampoMonto.tsx";
import { IconoVistoCasilla } from "./iconos.tsx";

/**
 * Registrar un gasto.
 *
 * El enunciado pide que sea «fácil y rápida», y el enemigo real es el momento
 * en que alguien está pagando, con el mesero esperando, y decide «después lo
 * anoto». Ese «después» no llega nunca.
 *
 * Por eso el camino corto es: escribir el monto, tocar una categoría, Enter.
 * Tres acciones. Todo lo demás tiene un valor por defecto razonable y se puede
 * corregir luego:
 *
 * - el campo de monto arranca con el foco puesto y con teclado numérico
 * - las categorías son botones visibles, no un desplegable: un menú son dos
 *   toques más y una decisión escondida
 * - la fecha es hoy, y solo aparece si se pide
 * - la descripción es opcional
 *
 * Y no es un diálogo que tape la pantalla: queda al lado de la cifra, para que
 * se vea cambiar al guardar. Esa confirmación silenciosa es lo que hace que la
 * gente confíe y siga registrando.
 */

const ETIQUETA: Record<Categoria, string> = {
  alojamiento: "Alojamiento",
  transporte: "Transporte",
  comida: "Comida",
  actividades: "Actividades",
  compras: "Compras",
  otros: "Otros",
};

export function RegistrarGasto({
  viaje,
  editando,
  onListo,
}: {
  viaje: Viaje;
  editando?: Gasto | null;
  onListo?: () => void;
}) {
  // El estado arranca de lo que se está editando, sin sincronizarlo después con
  // un efecto. Cuando cambia el gasto en edición, el padre reinicia este
  // componente con `key` — que es más simple y no dispara renders en cascada.
  // Al abrir para editar, el monto entra ya formateado: `String(21000)` ponía
  // «21000» en un campo donde toda la app escribe «21.000». Es seguro porque al
  // leerlo de vuelta los separadores se descartan.
  const [monto, setMonto] = useState(
    editando ? formatearNumero(editando.monto, viaje.moneda) : "",
  );
  const [categoria, setCategoria] = useState<Categoria>(editando?.categoria ?? "comida");
  const [descripcion, setDescripcion] = useState(editando?.descripcion ?? "");
  // «Hoy» solo si hoy es un día del viaje. En un viaje que empieza en tres
  // semanas, el camino rápido fechaba el gasto ocho días antes de la salida —
  // el mismo principio que el propio formulario de crear ya aplicaba a lo
  // adelantado: un viaje no puede tener gastos fuera de sus propios días.
  const [fecha, setFecha] = useState(
    editando?.fecha ?? acotarFecha(hoy(), viaje.inicio, viaje.fin),
  );
  const [fueraDelRitmo, setFueraDelRitmo] = useState(editando?.fueraDelRitmo ?? false);
  const [masCampos, setMasCampos] = useState(Boolean(editando));
  const [error, setError] = useState<string | null>(null);
  const campoMonto = useRef<HTMLInputElement>(null);

  // Este formulario vive montado DOS VECES a la vez: en el tablero y dentro
  // del diálogo de editar. Con ids fijos, `document` tenía dos `#monto` y las
  // dos etiquetas apuntaban al campo del tablero — el del diálogo quedaba sin
  // nombre accesible y el lector de pantalla anunciaba el placeholder como si
  // fuera la etiqueta. El prefijo hace únicos los ids de la instancia.
  const pref = editando ? "editar-" : "";

  // El foco al montar sirve para que registrar un gasto empiece escribiendo el
  // monto, sin un toque previo. Pero `focus()` a secas hace que el navegador
  // desplace la página hasta el campo: al abrir la app aparecías a media
  // pantalla. `preventScroll` da el foco sin mover la vista.
  //
  // Y solo se pide en escritorio: en un teléfono el foco automático levanta el
  // teclado y tapa la mitad de la pantalla antes de que puedas mirar nada.
  // Y solo si el foco está libre: este efecto corre al HIDRATAR, no al abrir
  // la página, y con red lenta alguien ya puede ir tabulando por el encabezado
  // — quitarle el foco a mitad de recorrido lo teletransporta al formulario
  // sin anuncio. Si el foco ya es de alguien, se respeta.
  useEffect(() => {
    const enEscritorio = window.matchMedia("(min-width: 1024px)").matches;
    const focoLibre =
      document.activeElement === document.body || document.activeElement === null;
    if (enEscritorio && focoLibre) {
      campoMonto.current?.focus({ preventScroll: true });
    }
  }, []);

  // Alojamiento y vuelos se pagan una vez y no se repiten. Si contaran para el
  // ritmo diario, pagar el hotel el primer día haría que la app declarara
  // emergencia durante todo un viaje que va bien.
  function cambiarCategoria(c: Categoria) {
    setCategoria(c);
    if (!editando) setFueraDelRitmo(c === "alojamiento");
  }

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    const valor = leerMonto(monto, viaje.moneda);
    if (valor === null || valor <= 0) {
      setError("Escribe cuánto gastaste");
      campoMonto.current?.focus({ preventScroll: true });
      return;
    }
    setError(null);

    const datos = {
      viajeId: viaje.id,
      monto: valor,
      categoria,
      descripcion: descripcion.trim() || ETIQUETA[categoria],
      fecha,
      fueraDelRitmo,
    };

    if (editando) editarGasto(editando.id, datos);
    else agregarGasto(datos);

    setMonto("");
    setDescripcion("");
    setMasCampos(false);

    /**
     * Se reinicia lo que quedó ESCONDIDO, no lo que quedó a la vista.
     *
     * `setMasCampos(false)` cierra el panel, pero la fecha y la marca de pago
     * único seguían vivas adentro. Quien registraba un almuerzo con fecha del 5
     * y después anotaba otro gasto, se lo guardaba también el 5 —sin nada en
     * pantalla que lo dijera— y eso corría los días cerrados y el ritmo real.
     * Un dato equivocado que el usuario no puede ver es peor que un error.
     *
     * La categoría NO se reinicia, y esa asimetría es a propósito: está visible
     * en la pantalla, así que si se queda en «comida» se ve que se quedó, y de
     * paso ahorra un toque cuando se anotan tres comidas seguidas.
     */
    if (!editando) {
      setFecha(acotarFecha(hoy(), viaje.inicio, viaje.fin));
      setFueraDelRitmo(categoria === "alojamiento");
    }

    campoMonto.current?.focus({ preventScroll: true });
    onListo?.();
  }

  return (
    <form onSubmit={guardar} className="flex flex-col gap-3">
      {/* Ya no hay letrero de «Editando».
          Existía porque el formulario cambiaba de trabajo sin moverse de sitio,
          y hacía falta un cartel que explicara qué estaba pasando. Ahora editar
          ocurre en su propio diálogo, cuyo encabezado ya lo dice: un letrero
          que repite el título es ruido. */}
      <div className="flex flex-col gap-1">
        <label htmlFor={`${pref}monto`} className="rotulo">
          Cuánto gastaste
        </label>
        <CampoMonto
          id={`${pref}monto`}
          ref={campoMonto}
          // Dentro de un diálogo, `showModal()` manda el foco al primer elemento
          // enfocable —que sería el botón de cerrar— y pisaría cualquier foco
          // pedido desde un efecto. El atributo se lo dice al navegador antes,
          // así que abrir para editar deja el cursor en el monto.
          autoFocus={Boolean(editando)}
          valor={monto}
          onCambio={setMonto}
          moneda={viaje.moneda}
          // «0» y no «45.000»: un número realista en gris parecía un monto ya
          // puesto, no un ejemplo. Con el símbolo fijo adelante, «$ 0» es
          // inequívocamente un campo vacío.
          placeholder="0"
          aria-describedby={error ? `${pref}monto-error` : undefined}
          className="cifra-dato text-3xl"
        />
        {error && (
          <p id={`${pref}monto-error`} role="alert" className="m-0 text-sm text-(--color-excedido)">
            {error}
          </p>
        )}
      </div>

      <fieldset className="m-0 flex flex-col gap-1.5 border-0 p-0">
        <legend className="rotulo p-0">
          En qué
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIAS.map((c) => {
            const activa = c === categoria;
            return (
              // Nada de estilos en línea acá: un `style` le gana a cualquier
              // clase de :hover, así que el estado al pasar el puntero existía
              // en el código y no se veía en pantalla.
              //
              // El chip activo va en TINTA, mientras el viaje activo del
              // header va en MARCA — y es regla, no descuido: la selección de
              // navegación (dónde estoy) usa la marca; la selección de
              // captura (qué estoy escribiendo) usa la tinta, porque es un
              // dato del formulario y los datos no se visten de marca.
              <button
                key={c}
                type="button"
                onClick={() => cambiarCategoria(c)}
                aria-pressed={activa}
                className={
                  activa
                    ? "ancho-medio rounded-(--radius-accion) border border-(--color-tinta) bg-(--color-tinta) px-3 py-1.5 text-sm text-(--color-tarjeta)"
                    : "ancho-ui rounded-(--radius-accion) border border-(--color-filete) px-3 py-1.5 text-sm text-(--color-tinta-2) hover:border-(--color-tinta) hover:text-(--color-tinta)"
                }
              >
                {ETIQUETA[c]}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* El panel expandido va ANTES de los botones. Estaba después, y en el
          diálogo de editar —donde llega abierto— el «Guardar cambios» quedaba
          por ENCIMA de la nota, la fecha y la casilla: el ojo terminaba el
          formulario en el botón primario y los campos de abajo se quedaban
          fuera del recorrido. El botón que guarda cierra el formulario, no lo
          parte por la mitad. */}
      {masCampos && (
        <div className="flex flex-col gap-3 rounded-(--radius-chip) bg-(--color-papel) p-3">
          <div className="flex flex-col gap-1">
            <label htmlFor={`${pref}desc`} className="rotulo">
              Nota
            </label>
            <input
              id={`${pref}desc`}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Almuerzo en Getsemaní"
              className="campo-linea"
            />
          </div>
          <Calendario id={`${pref}fecha`} etiqueta="Cuándo" valor={fecha} onCambio={setFecha} />
          {/**
            * La casilla dibujada.
            *
            * La nativa se queda —oculta, no borrada— porque es la que trae el
            * teclado, el rol, el estado para lectores de pantalla y el clic en
            * la etiqueta. Encima va el cuadro del sistema, y como es hermana
            * previa, `peer-checked` y `peer-focus-visible` lo pintan sin una
            * línea de JavaScript.
            *
            * Antes era la casilla gris del navegador: el único control de la
            * app dibujado por el sistema operativo y no por nosotras, en medio
            * de un panel que sí estaba diseñado.
            */}
          <label className="flex cursor-pointer items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={fueraDelRitmo}
              onChange={(e) => setFueraDelRitmo(e.target.checked)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-(--radius-chip) border-2 border-(--color-filete) text-(--color-sobre-marca) transition-colors peer-checked:border-(--color-marca) peer-checked:bg-(--color-marca) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--color-marca)"
            >
              {fueraDelRitmo && <IconoVistoCasilla />}
            </span>
            <span className="leading-snug">
              No cuenta para el ritmo diario{" "}
              <span className="text-(--color-tinta-2)">— hotel, vuelos, pagos únicos</span>
            </span>
          </label>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="ancho-medio rounded-(--radius-accion) bg-(--color-acento) px-5 py-2.5 text-[15px] text-(--color-sobre-acento) hover:brightness-95 active:brightness-90"
        >
          {editando ? "Guardar cambios" : "Registrar"}
        </button>
        <button
          type="button"
          onClick={() => setMasCampos((v) => !v)}
          aria-expanded={masCampos}
          className="ancho-ui flex items-center gap-1.5 rounded-(--radius-accion) border border-(--color-filete) px-3 py-1.5 text-[13px] text-(--color-tinta-2) hover:border-(--color-tinta) hover:text-(--color-tinta)"
        >
          <span
            aria-hidden="true"
            className="inline-block transition-transform"
            style={{ transform: masCampos ? "rotate(90deg)" : "none" }}
          >
            ›
          </span>
          Fecha, nota y más
        </button>
        {/* La misma píldora fantasma del Cancelar de ajustar el tope. Era el
            único texto subrayado de toda la app: un lenguaje de enlace que
            ningún otro control usa. */}
        {editando && (
          <button
            type="button"
            onClick={onListo}
            className="ancho-ui rounded-(--radius-accion) px-3 py-2 text-sm text-(--color-tinta-2) hover:text-(--color-tinta)"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
