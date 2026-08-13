"use client";

import { useState } from "react";
import { agregarGasto, crearViaje } from "@/lib/almacen.ts";
import { leerMonto } from "@/lib/moneda.ts";
import { hoy, sumarDias } from "@/lib/fechas.ts";
import { Calendario } from "./Calendario.tsx";
import { CampoMonto } from "./CampoMonto.tsx";
import { CampoDestino } from "./CampoDestino.tsx";

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
  // El destino completo no tiene campo propio: lo escribe el de arriba. Guarda
  // «Cartagena, Colombia» cuando se elige de la lista y el texto tal cual
  // cuando se escribe libre.
  const [destino, setDestino] = useState("");
  const [inicio, setInicio] = useState(hoy());
  const [fin, setFin] = useState(sumarDias(hoy(), 6));
  const [presupuesto, setPresupuesto] = useState("");
  const [adelantado, setAdelantado] = useState("");
  // El error sabe DE QUÉ CAMPO es. Decía «Ponle un nombre al viaje» debajo del
  // botón, cuando la etiqueta del campo dice «A dónde vas»: quien lo leía tenía
  // que traducir el mensaje a un campo que se llama distinto, y quien usa
  // lector de pantalla no recibía ninguna marca de cuál falló.
  const [error, setError] = useState<{ campo: "nombre" | "tope" | null; texto: string } | null>(
    null,
  );

  function fallar(campo: "nombre" | "tope", texto: string) {
    setError({ campo, texto });
    // El foco va al campo que falló: el error se corrige ahí, no donde se lee.
    document.getElementById(campo === "tope" ? "tope" : "nombre")?.focus();
  }

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    const tope = leerMonto(presupuesto, "COP");
    // Cada mensaje usa las palabras de la etiqueta a la que apunta.
    if (!nombre.trim()) return fallar("nombre", "Escribe a dónde vas");
    if (tope === null || tope <= 0) return fallar("tope", "Escribe cuánto puedes gastar en total");
    if (fin < inicio) return setError({ campo: null, texto: "El regreso no puede ser antes de la salida" });
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

  const etiqueta = "rotulo";

  return (
    <form onSubmit={guardar} className="flex flex-col gap-4">
      {/**
        * UN SOLO CAMPO DE DESTINO.
        *
        * Había dos, «A dónde vas» y «Destino completo», y existían porque en el
        * tablero ocupan dos sitios distintos: el título grande y la línea de
        * abajo. Pero eso es un problema de estructura de datos, no una pregunta
        * que valga la pena hacerle a alguien que está creando un viaje —y al
        * llegar el autocompletado quedaron los dos rellenándose solos con casi
        * lo mismo, uno debajo del otro.
        *
        * Ahora se escribe una vez. Elegir de la lista guarda el país aparte
        * para la línea de abajo; escribiendo libre, el destino es lo que se
        * haya escrito y esa línea no aparece.
        *
        * ⚠️ Recorte consciente: no se puede nombrar un viaje distinto de su
        * destino —«Luna de miel», «Puente con los primos»—. Se cambia un campo
        * en todos los viajes por una posibilidad que casi nadie usa.
        */}
      <div className="flex flex-col gap-1">
        <label htmlFor="nombre" className={etiqueta}>A dónde vas</label>
        <CampoDestino
          id="nombre"
          valor={nombre}
          onCambio={(t) => {
            setNombre(t);
            // Escribiendo a mano no hay país que añadir: el destino es
            // exactamente lo que la persona escribió.
            setDestino(t);
          }}
          onElegir={(d) => {
            setNombre(d.ciudad);
            setDestino(`${d.ciudad}, ${d.pais}`);
          }}
          placeholder="Cartagena"
          aria-invalid={error?.campo === "nombre" || undefined}
          aria-describedby={error?.campo === "nombre" ? "error-viaje" : undefined}
          className="campo-linea ancho-medio text-2xl"
        />
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
        <CampoMonto id="tope" valor={presupuesto} onCambio={setPresupuesto}
          placeholder="0"
          aria-invalid={error?.campo === "tope" || undefined}
          aria-describedby={error?.campo === "tope" ? "error-viaje" : undefined}
          className="cifra-dato text-2xl" />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="adelantado" className={etiqueta}>Ya pagaste algo (opcional)</label>
        {/* El marcador decía «Hotel, vuelos» en un campo de números con teclado
            decimal: pedía texto y esperaba una cifra. */}
        <CampoMonto id="adelantado" valor={adelantado} onCambio={setAdelantado}
          placeholder="0" className="cifra" />
        <p className="m-0 text-xs leading-relaxed text-(--color-tinta-2)">
          El hotel y los vuelos, por ejemplo. Queda registrado como un gasto ya hecho y marcado para
          que no cuente en tu ritmo diario, porque no se repite.
        </p>
      </div>

      {error && (
        <p id="error-viaje" role="alert" className="m-0 text-sm text-(--color-excedido)">
          {error.texto}
        </p>
      )}

      <button type="submit"
        className="self-start rounded-(--radius-accion) bg-(--color-acento) px-5 py-2 font-medium text-(--color-sobre-acento)">
        Crear viaje
      </button>
    </form>
  );
}
