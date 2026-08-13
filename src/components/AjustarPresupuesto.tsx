"use client";

import { useState } from "react";
import type { Balance, Viaje } from "@/lib/types.ts";
import { editarViaje } from "@/lib/almacen.ts";
import { formatearMoneda, formatearNumero, leerMonto } from "@/lib/moneda.ts";
import { CampoMonto } from "./CampoMonto.tsx";

/**
 * Ajustar el resto del viaje.
 *
 * El enunciado pide alertas «para regular y conservar sus finanzas», no para
 * avisar. La diferencia está justo acá: sin una palanca, la única acción
 * disponible después de una alerta es cerrar la app.
 *
 * Antes este botón solo ponía el foco en el campo de monto, que no ajusta nada.
 * Un control que promete una acción y no la cumple es peor que no tenerlo.
 *
 * Lo que hace ahora: deja mover el tope y muestra EN VIVO cómo cambia la cifra
 * diaria, que es la única pregunta que importa al ajustar — «si subo el tope,
 * ¿cuánto me queda por día?».
 */
export function AjustarPresupuesto({
  viaje,
  balance,
  onCerrar,
}: {
  viaje: Viaje;
  balance: Balance;
  onCerrar: () => void;
}) {
  // Formateado de entrada, como en los otros campos de plata: el tope actual
  // aparecía como «3000000» en un formulario donde todo lo demás dice «3.000.000».
  const [texto, setTexto] = useState(formatearNumero(viaje.presupuesto, viaje.moneda));

  const nuevoTope = leerMonto(texto, viaje.moneda);
  const valido = nuevoTope !== null && nuevoTope > 0;

  // La misma fórmula del motor, para que la vista previa no mienta.
  const nuevoDiario = valido
    ? Math.floor((nuevoTope - balance.gastadoTotal) / balance.diasRestantes)
    : balance.diarioDisponible;
  const diferencia = nuevoDiario - balance.diarioDisponible;

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!valido) return;
    editarViaje(viaje.id, { presupuesto: nuevoTope });
    onCerrar();
  }

  return (
    <form onSubmit={guardar} className="flex flex-col gap-3 rounded-(--radius-chip) bg-(--color-papel) p-3.5">
      <div className="flex flex-col gap-1">
        <label htmlFor="tope-nuevo" className="rotulo">
          Tope del viaje
        </label>
        <CampoMonto
          id="tope-nuevo"
          valor={texto}
          onCambio={setTexto}
          moneda={viaje.moneda}
          autoFocus
          className="cifra-dato w-full border-b-2 border-(--color-filete) bg-transparent pb-1 text-2xl outline-none focus:border-(--color-tinta)"
        />
      </div>

      <p className="m-0 text-sm text-(--color-tinta-2)">
        Con ese tope podrías gastar{" "}
        <span className="cifra text-(--color-tinta)">
          {formatearMoneda(Math.max(0, nuevoDiario), viaje.moneda)}
        </span>{" "}
        por día durante los {balance.diasRestantes}{" "}
        {balance.diasRestantes === 1 ? "día" : "días"} que faltan
        {diferencia !== 0 && (
          <>
            {" "}—{" "}
            <span className="cifra">
              {diferencia > 0 ? "+" : "−"}
              {formatearMoneda(Math.abs(diferencia), viaje.moneda)}
            </span>{" "}
            frente a hoy
          </>
        )}
        .
      </p>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={!valido}
          className="ancho-medio rounded-(--radius-accion) bg-(--color-tinta) px-4 py-2 text-sm text-(--color-tarjeta) hover:opacity-85 disabled:opacity-40"
        >
          Guardar el tope
        </button>
        <button
          type="button"
          onClick={onCerrar}
          className="ancho-ui rounded-(--radius-accion) px-3 py-2 text-sm text-(--color-tinta-2) hover:text-(--color-tinta)"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
