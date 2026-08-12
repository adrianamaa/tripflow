"use client";

import { useState } from "react";
import { crearViaje } from "@/lib/almacen.ts";
import { leerMonto } from "@/lib/moneda.ts";
import { hoy, sumarDias } from "@/lib/fechas.ts";

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

    crearViaje({
      nombre: nombre.trim(),
      destino: destino.trim() || nombre.trim(),
      inicio,
      fin,
      presupuesto: tope,
      moneda: "COP",
    });
    onListo();
  }

  const campo =
    "w-full border-b border-(--color-filete) bg-transparent pb-1 outline-none focus:border-(--color-tinta)";
  const etiqueta = "text-[11px] uppercase tracking-[0.13em] text-(--color-tinta-2)";

  return (
    <form onSubmit={guardar} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="nombre" className={etiqueta}>A dónde vas</label>
        <input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}
          placeholder="Cartagena" className={`${campo} text-2xl font-semibold`} autoFocus />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="destino" className={etiqueta}>Destino completo</label>
        <input id="destino" value={destino} onChange={(e) => setDestino(e.target.value)}
          placeholder="Cartagena, Colombia" className={campo} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="inicio" className={etiqueta}>Salida</label>
          <input id="inicio" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className={campo} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="fin" className={etiqueta}>Regreso</label>
          <input id="fin" type="date" value={fin} onChange={(e) => setFin(e.target.value)} className={campo} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="tope" className={etiqueta}>Cuánto puedes gastar en total</label>
        <input id="tope" value={presupuesto} onChange={(e) => setPresupuesto(e.target.value)}
          inputMode="decimal" placeholder="3.000.000" className={`${campo} text-2xl font-semibold tabular-nums`} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="adelantado" className={etiqueta}>Ya pagaste algo (opcional)</label>
        <input id="adelantado" value={adelantado} onChange={(e) => setAdelantado(e.target.value)}
          inputMode="decimal" placeholder="Hotel, vuelos" className={`${campo} tabular-nums`} />
        <p className="m-0 text-xs text-(--color-tinta-2)">
          Se descuenta del tope pero no cuenta para tu ritmo diario, porque no se repite.
        </p>
      </div>

      {error && <p role="alert" className="m-0 text-sm text-(--color-excedido)">{error}</p>}

      <button type="submit"
        className="self-start rounded-(--radius-accion) bg-(--color-marca) px-5 py-2 font-medium text-(--color-sobre-marca)">
        Crear viaje
      </button>
    </form>
  );
}
