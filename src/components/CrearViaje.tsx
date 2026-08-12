"use client";

import { useState } from "react";
import { agregarGasto, crearViaje } from "@/lib/almacen.ts";
import { leerMonto } from "@/lib/moneda.ts";
import { hoy, sumarDias } from "@/lib/fechas.ts";
import { Calendario } from "./Calendario.tsx";

/**
 * Crear un viaje.
 *
 * Las fechas vienen puestas —hoy y en una semana— porque la mayoría de los
 * viajes se planean con esa forma, y un formulario que arranca vacío obliga a
 * abrir dos calendarios antes de poder hacer nada.
 *
 * Hay un campo que no traen las otras apps: lo que ya está pagado. Alojamiento
 * y vuelos suelen pagarse antes de salir, y si entraran al ritmo diario la app
 * declararía emergencia el primer día de un viaje que va bien.
 */
export function CrearViaje({ onListo }: { onListo: () => void }) {
  const [nombre, setNombre] = useState("");
  const [destino, setDestino] = useState("");
  const [inicio, setInicio] = useState(hoy());
  const [fin, setFin] = useState(sumarDias(hoy(), 6));
  const [presupuesto, setPresupuesto] = useState("");
  const [adelantado, setAdelantado] = useState("");
  const [error, setError] = useState<string | null>(null);

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    const tope = leerMonto(presupuesto, "COP");
    if (!nombre.trim()) return setError("Ponle un nombre al viaje");
    if (tope === null || tope <= 0) return setError("Escribe cuánto puedes gastar en total");
    if (fin < inicio) return setError("El regreso no puede ser antes de la salida");
    setError(null);

    const viajeId = crearViaje({
      nombre: nombre.trim(),
      destino: destino.trim() || nombre.trim(),
      inicio,
      fin,
      presupuesto: tope,
      moneda: "COP",
    });

    /**
     * Lo ya pagado se convierte en un gasto de verdad.
     *
     * Antes este campo se escribía en el estado del formulario y NUNCA salía de
     * ahí: no llegaba a `crearViaje`, no existía en el tipo `Viaje`, no generaba
     * ningún gasto. El texto de ayuda prometía «se descuenta del tope pero no
     * cuenta para tu ritmo diario» y no pasaba ni lo uno ni lo otro.
     *
     * Se resuelve como gasto y no como campo del viaje a propósito: así reusa el
     * motor que ya distingue lo fijo de lo variable, aparece en la lista donde
     * el usuario puede corregirle la categoría o borrarlo, y no hay dos maneras
     * distintas de representar la misma plata.
     *
     * Va fechado el día de salida, no hoy: un viaje que empieza en tres semanas
     * no puede tener un gasto anterior a su propio comienzo.
     */
    const yaPagado = leerMonto(adelantado, "COP");
    if (yaPagado !== null && yaPagado > 0) {
      agregarGasto({
        viajeId,
        monto: yaPagado,
        categoria: "otros",
        descripcion: "Pagado antes de salir",
        fecha: inicio,
        fueraDelRitmo: true,
      });
    }

    onListo();
  }

  const campo =
    "w-full border-b border-(--color-filete) bg-transparent pb-1 outline-none focus:border-(--color-tinta)";
  const etiqueta = "rotulo";

  return (
    <form onSubmit={guardar} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="nombre" className={etiqueta}>A dónde vas</label>
        <input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}
          placeholder="Cartagena" className={`${campo} ancho-medio text-2xl`} autoFocus />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="destino" className={etiqueta}>Destino completo</label>
        <input id="destino" value={destino} onChange={(e) => setDestino(e.target.value)}
          placeholder="Cartagena, Colombia" className={campo} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Calendario
          id="inicio"
          etiqueta="Salida"
          valor={inicio}
          onCambio={(f) => {
            setInicio(f);
            // Mover la salida más allá del regreso dejaba el formulario en un
            // estado imposible esperando a que el usuario notara el error.
            // Arrastrar el regreso es lo que la persona iba a hacer de todos
            // modos, y de paso desaparece un mensaje de error.
            if (f > fin) setFin(f);
          }}
        />
        <Calendario
          id="fin"
          etiqueta="Regreso"
          valor={fin}
          onCambio={setFin}
          minimo={inicio}
          // Pegado al borde derecho: abriéndose hacia la derecha, en un
          // teléfono el panel se saldría de la pantalla.
          alinear="derecha"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="tope" className={etiqueta}>Cuánto puedes gastar en total</label>
        <input id="tope" value={presupuesto} onChange={(e) => setPresupuesto(e.target.value)}
          inputMode="decimal" placeholder="3.000.000" className={`${campo} cifra-dato text-2xl`} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="adelantado" className={etiqueta}>Ya pagaste algo (opcional)</label>
        {/* El marcador decía «Hotel, vuelos» en un campo de números con teclado
            decimal: pedía texto y esperaba una cifra. */}
        <input id="adelantado" value={adelantado} onChange={(e) => setAdelantado(e.target.value)}
          inputMode="decimal" placeholder="1.400.000" className={`${campo} cifra`} />
        <p className="m-0 text-xs leading-relaxed text-(--color-tinta-2)">
          El hotel y los vuelos, por ejemplo. Queda registrado como un gasto ya hecho y marcado para
          que no cuente en tu ritmo diario, porque no se repite.
        </p>
      </div>

      {error && <p role="alert" className="m-0 text-sm text-(--color-excedido)">{error}</p>}

      <button type="submit"
        className="self-start rounded-(--radius-accion) bg-(--color-acento) px-5 py-2 font-medium text-(--color-sobre-acento)">
        Crear viaje
      </button>
    </form>
  );
}
