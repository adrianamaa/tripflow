"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORIAS, type Categoria, type Gasto, type Viaje } from "@/lib/types.ts";
import { leerMonto } from "@/lib/moneda.ts";
import { hoy } from "@/lib/fechas.ts";
import { agregarGasto, editarGasto } from "@/lib/almacen.ts";

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
  const [monto, setMonto] = useState(editando ? String(editando.monto) : "");
  const [categoria, setCategoria] = useState<Categoria>(editando?.categoria ?? "comida");
  const [descripcion, setDescripcion] = useState(editando?.descripcion ?? "");
  const [fecha, setFecha] = useState(editando?.fecha ?? hoy());
  const [fueraDelRitmo, setFueraDelRitmo] = useState(editando?.fueraDelRitmo ?? false);
  const [masCampos, setMasCampos] = useState(Boolean(editando));
  const [error, setError] = useState<string | null>(null);
  const campoMonto = useRef<HTMLInputElement>(null);

  // Lo único que sí es un efecto: poner el foco al montar. Registrar un gasto
  // debe empezar escribiendo el monto, sin un toque previo.
  useEffect(() => {
    campoMonto.current?.focus();
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
      campoMonto.current?.focus();
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
    campoMonto.current?.focus();
    onListo?.();
  }

  return (
    <form onSubmit={guardar} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="monto"
          className="rotulo"
        >
          {editando ? "Editar gasto" : "Cuánto gastaste"}
        </label>
        <input
          id="monto"
          ref={campoMonto}
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          inputMode="decimal"
          autoComplete="off"
          placeholder="45.000"
          aria-describedby={error ? "monto-error" : undefined}
          className="cifra ancho-dato w-full border-b-2 border-(--color-filete) bg-transparent pb-1 text-3xl outline-none focus:border-(--color-tinta)"
        />
        {error && (
          <p id="monto-error" role="alert" className="m-0 text-sm text-(--color-excedido)">
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
              <button
                key={c}
                type="button"
                onClick={() => cambiarCategoria(c)}
                aria-pressed={activa}
                className="rounded-(--radius-accion) border px-3 py-1.5 text-sm"
                style={{
                  borderColor: activa ? "var(--color-tinta)" : "var(--color-filete)",
                  background: activa ? "var(--color-tinta)" : "transparent",
                  color: activa ? "var(--color-lienzo)" : "var(--color-tinta)",
                }}
              >
                {ETIQUETA[c]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-(--radius-accion) bg-(--color-marca) px-5 py-2 font-medium text-(--color-sobre-marca)"
        >
          {editando ? "Guardar cambios" : "Registrar"}
        </button>
        <button
          type="button"
          onClick={() => setMasCampos((v) => !v)}
          className="text-sm text-(--color-tinta-2) underline underline-offset-2"
        >
          {masCampos ? "Menos campos" : "Más campos"}
        </button>
        {editando && (
          <button
            type="button"
            onClick={onListo}
            className="text-sm text-(--color-tinta-2) underline underline-offset-2"
          >
            Cancelar
          </button>
        )}
      </div>

      {masCampos && (
        <div className="flex flex-col gap-3 border-t border-(--color-filete) pt-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="desc" className="rotulo">
              Descripción
            </label>
            <input
              id="desc"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Almuerzo en Getsemaní"
              className="border-b border-(--color-filete) bg-transparent pb-1 outline-none focus:border-(--color-tinta)"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="fecha" className="rotulo">
              Cuándo
            </label>
            <input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="border-b border-(--color-filete) bg-transparent pb-1 outline-none focus:border-(--color-tinta)"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={fueraDelRitmo}
              onChange={(e) => setFueraDelRitmo(e.target.checked)}
            />
            No cuenta para el ritmo diario
            <span className="text-(--color-tinta-2)">— hotel, vuelos, pagos únicos</span>
          </label>
        </div>
      )}
    </form>
  );
}
