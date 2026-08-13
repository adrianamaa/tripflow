# Alcance

Firmado el **11 de agosto de 2026**, antes de escribir la primera línea de código.

## La regla

> **Se recortan funcionalidades. Nunca se recorta el despliegue.**

Cada día termina con algo desplegado que se abre en un teléfono. Prefiero una app con menos cosas
que funcione de verdad, a una app completa que solo corre en mi computador.

---

## Dentro — no se negocia

Esto sale de los tres requisitos del enunciado y de lo que cualquiera va a probar en los primeros
cinco minutos.

| | Por qué está dentro |
|---|---|
| Crear un viaje con presupuesto tope | Funcionalidad 2 del enunciado |
| Registrar un gasto en el menor número de toques posible | Funcionalidad 3, con la condición explícita de que sea rápida |
| Dashboard con la cifra de control y el desglose | Funcionalidad 1 |
| **Editar y borrar un gasto** | Un cero de más no puede dañar la cifra principal para siempre |
| **Selector de viajes** | Sin él, crear un segundo viaje deja el primero inalcanzable |
| **Separar gasto adelantado de gasto diario** | El hotel pagado el día 1 rompe cualquier cálculo de ritmo |
| Alerta de ritmo **con una acción para corregir** | El enunciado pide alertas *"para regular"*, no solo para avisar |
| Estados: sin datos, viaje terminado, presupuesto excedido | Cualquiera los va a encontrar |
| Responsive real en móvil, tableta y escritorio | Requisito duro |
| Persistencia entre recargas | Sin esto no es una app, es una maqueta |

## Fuera — decidido, no olvidado

Cada una va al README con su motivo. Un recorte explicado demuestra criterio; un hueco callado, no.

| Fuera | Por qué |
|---|---|
| Varias monedas con conversión | La conversión exige red y datos en vivo. Un viaje, una moneda, elegida al crearlo |
| Gasto compartido entre personas | Es otro producto. Splitwise existe |
| Presupuesto por ciudad dentro de un viaje | Complica el modelo sin resolver el problema del enunciado |
| Foto del recibo | Bonito en la maqueta, caro de verdad (almacenamiento, permisos, peso) |
| Cuentas de usuario y sincronización | Sin login se abre el link y se usa la app de una. Con login, mucha gente no entra |
| Importar datos | Nadie tiene datos que importar todavía |
| Atajos de teclado más allá de Enter y Esc | Aporta poco frente a lo que cuesta probarlos bien |
| **Ponerle al viaje un nombre distinto de su destino** | Había dos campos, «A dónde vas» y «Destino completo», y con el autocompletado quedaron rellenándose solos con casi lo mismo. Se cambió un campo que se ve en TODOS los viajes por una posibilidad —«Luna de miel», «Puente con los primos»— que casi nadie usa. |
| **Buscar destinos contra una API de lugares** | La lista de sugerencias es local, ~110 destinos escogidos. Una llamada de red en el primer campo del primer formulario rompería lo único que hace que la app abra en dos segundos sin depender de nadie. Quien vaya a un pueblo que no está lo escribe: sugerir no es exigir. |

## Por qué los datos viven en el navegador

La app guarda todo en `localStorage`, detrás de una capa aislada.

No es una limitación técnica, es una decisión: **se abre el link y la app está funcionando
al instante**, sin registrarse, sin esperar y sin mezclar datos con los de nadie más. Una base de
datos sin cuentas haría que todos vieran y editaran lo mismo, que es peor.

La persistencia está aislada en una sola interfaz. Cambiarla por un servidor real es reemplazar un
archivo, no reescribir la app.

## Qué haría después, si esto fuera un producto

Sincronización entre dispositivos con cuentas, moneda con conversión para viajes internacionales,
y gasto compartido. En ese orden, y ninguna antes de que la experiencia de un solo viajero esté
resuelta.
