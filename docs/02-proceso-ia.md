# Dónde le dije que no

Claude Code escribió la mayor parte del código de Tripflow. Acá están las decisiones donde no
seguí lo que propuso, y cómo verifiqué las que sí.

## El reparto

| | Quién lo resolvió | Cómo lo verifiqué |
|---|---|---|
| Investigación | La herramienta buscó, yo escogí las fuentes | Abrí cada una y comparé la cita contra el original |
| Cifra protagonista y jerarquía | Yo | — |
| Sistema visual y color | Yo especifiqué, ella calculó los contrastes | Medí los pares críticos por aparte |
| Implementación | La herramienta | Navegador, a 390, 768 y 1440, antes de cada commit |
| Alcance | Yo, firmado antes del primer commit de interfaz | `docs/03-alcance.md`, fechado |
| Crítica y hallazgos | La herramienta propuso, yo acepté o rechacé | Reproduje cada error antes de aprobar el arreglo |

No escribí código para demostrar que programo. Lo escribí porque hay decisiones de diseño que solo
se verifican corriendo la app: el contraste se mide, el punto de quiebre se ve, y el formato de
fecha se rompe.

## Las barandas, puestas antes de la primera pantalla

Los dos primeros commits del repositorio no son interfaz. Son el planteamiento del problema
(`3a888ef`) y el alcance firmado (`a5f07e0`), y en el primero ya iba escrita la lista de lo que
queda prohibido acá: nada de librerías de componentes, nada de fuente del sistema, ningún color sin
un rol definido. El color se midió y se documentó en el commit seis; la primera pantalla llegó en
el doce.

Eso cambia qué clase de error es posible. Cuando la herramienta propuso algo fuera del sistema, el
error era detectable contra un documento y no contra mi gusto de ese día.

---

## Frené la investigación cuando empezó a fundarse en mí

Contesté unas preguntas sobre cómo manejo yo la plata en un viaje. Para el segundo mensaje mis
respuestas ya venían convertidas en implicaciones de diseño bastante concretas, con su
justificación.

Las archivé como hipótesis a verificar y no fundamentan ninguna decisión de la app. Lo dejo escrito
por el modo de falla, que es el que hay que aprender a atrapar: construye rápido sobre lo que uno
le da, y si uno le da una anécdota, le devuelve una anécdota bien argumentada.

## El calendario no era un problema de estilo

Marqué los campos de fecha porque se veían fuera del sistema. Mirándolos de cerca el problema era
otro: `<input type="date">` mostraba `08/12/2026`, y acá eso se lee 8 de diciembre.

Un error de correctitud disfrazado de detalle visual. Construí el calendario propio (y no me quedé
con el nativo, que era gratis y ya venía accesible) aceptando que el teclado y el lector de
pantalla pasaban a ser mi problema: flechas, Re/Av Pág, Enter y Esc los tuve que resolver yo.

## Unifiqué tres verdes que no eran un sistema

El calendario tenía un verde, los estados otro y la marca otro. Medidos: 76°, 140° y 176° de tono.
Cien grados entre el primero y el último. Eso no es una paleta, son tres colores que por casualidad
se llaman verdes, y en pantalla se notaba — el visto de «vas bien» se leía como otro verde.

Especifiqué una sola familia, un tono en tres claridades, cada color con su rol escrito. Y para el
escalón de en medio puse una restricción en vez de un color: la marca de ritmo del medidor cruza
dos fondos opuestos, el relleno casi negro y la pista clara, así que en lugar de escogerla a ojo
había que despejar el rango de luminancia que pasa 3:1 contra los dos y buscar dentro de esa
ventana. Los números están en [`04-color.md`](04-color.md).

Rechacé dos versiones de esa marca antes de la definitiva. Una se leía como una línea de
resaltador. Y preguntando qué representaba exactamente esa línea apareció que estaba calculada
sobre el presupuesto entero, incluyendo lo ya pagado antes de salir: el dibujo decía «vas
disparada» mientras la frase de al lado decía «vas bien». Mandé a rehacer el componente completo
(`b53c563`).

## Reproduje el error antes de aceptar el arreglo

De una crítica en frío salió un error grave. Con el panel de ajustar el tope abierto, cambiar de
viaje dejaba el formulario cargado con el tope del viaje anterior. Guardar se lo escribía al viaje
equivocado. Sin confirmación y sin deshacer.

Lo reproduje yo con las cifras de los dos viajes de ejemplo antes de tocar nada, porque un arreglo
aprobado sobre una descripción es un arreglo sin verificar. Está corregido en `c231186`.

De ahí salió además una decisión de producto que no estaba en el plan. Si el tope se puede escribir
mal, ¿por qué la única puerta para corregirlo vivía dentro de una alerta? Fui a buscar cómo lo
resuelven otros: Trail Wallet, YNAB, Copilot y Monzo lo dejan editar siempre desde una entrada
permanente, y ninguno lo condiciona a un estado de alerta. YNAB lo tiene hasta como regla de su
método.

Pero el argumento que cerró la decisión salió de esta app, no de ellos. **Un tope escrito de más es
justo el error que nunca enciende la alerta**, porque los umbrales se calculan sobre el tope
equivocado. La única puerta de ajuste jamás aparecía cuando más falta hacía. El tope se edita ahora
desde la leyenda del medidor, que es donde se lee.

## Rechacé los hallazgos que no resistieron una verificación

La regla que puse en las dos rondas de crítica fue que cada hallazgo tenía que sobrevivir un
intento de refutación antes de llegarme. Sirvió en las dos direcciones.

Descarté dos que parecían defectos. El primero: «las acciones de editar y borrar están siempre
visibles y compiten con los montos». Falso, y la causa vale la pena — el entorno donde se probó
reporta que no hay puntero fino, así que las veía siempre; en un computador de verdad aparecen al
acercarse. El segundo: «los objetivos táctiles de 24px son muy pequeños». Cumplen el nivel AA de
WCAG 2.2; los 44px son AAA.

Los dos habrían sido cambios reales sobre comportamiento correcto.

---

## Lo que salió mal, y lo que queda abierto

Este documento arrancaba diciendo que se llenaba en vivo, no reconstruido al final. Se atrasó dos
días. La frase se cayó y las entradas que faltaban se escribieron; el commit que lo puso al día está
en el historial.

Quedan dos cosas sin cerrar que prefiero dejar escritas. El medidor usa `role="progressbar"`, y
para «cuánto se usó de una capacidad» el rol exacto de ARIA es `meter`; lo dejé como está por
soporte en lectores viejos, pero es una decisión que revisaría con más tiempo. Y los estados al
pasar el puntero no los pude verificar de forma automatizada por la misma razón del falso positivo
de arriba: esos los probé a mano, en el computador y en el celular.
