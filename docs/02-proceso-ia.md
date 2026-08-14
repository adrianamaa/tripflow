# Proceso con IA

El reto pide el detalle de qué le pedí a la IA y qué ajusté yo. Este documento se llena en vivo,
mientras trabajo, no reconstruido al final.

Trabajo con **Claude Code** en la terminal. No es "pedirle una pantalla y copiarla": es
dirigir, revisar y corregir.

---

## Cómo trabajo con esto

Tres reglas mías, y las escribo porque explican los ajustes que aparecen más abajo:

1. **La IA no decide el diseño.** Investiga, propone y construye. La dirección la pongo yo.
2. **Todo lo que devuelve se verifica.** Si dice que algo funciona, se abre y se mira.
3. **Cuando se equivoca, queda escrito.** Media hoja de correcciones dice más de cómo trabajo que
   una pantalla que salió bien de primeras.

---

## Registro

### 11 de agosto — Encuadre del problema

**Qué pedí:** que analizara el enunciado y me dijera dónde estaban los riesgos reales antes de
diseñar nada.

**Qué devolvió:** identificó que tres requisitos condicionan *cómo* hay que trabajar y no solo qué
entregar — el historial de commits, el registro del proceso con IA, y que la app esté desplegada.
Los tres se incumplen si uno los deja para el final.

**Qué ajusté yo:** nada, porque el argumento se sostenía. Por eso este repositorio arranca con
investigación en vez de con código. El primer commit no es una pantalla: es el planteamiento.

---

### 11 de agosto — Corrección de método

**Qué pasó:** contesté unas preguntas sobre cómo manejo yo la plata en un viaje, y la IA convirtió
esas respuestas en implicaciones de diseño bastante concretas.

**Qué ajusté yo:** lo frené. Una persona no es una muestra, y diseñar a partir de mis costumbres es
diseñar para mí. Mis respuestas quedaron archivadas como hipótesis a verificar, y **no se usan como
fundamento de ninguna decisión.**

Lo dejo escrito porque es exactamente el tipo de error que hay que atrapar: la IA construye rápido
sobre lo que uno le da, y si uno le da una anécdota, le devuelve una anécdota bien argumentada.

---

### 12 de agosto — La primera pantalla, revisada a mano

**Qué pedí:** la primera versión completa del tablero, con las tres funcionalidades.

**Qué devolvió:** una pantalla que funcionaba y que a primera vista se veía bien.

**Qué ajusté yo:** la revisé y encontré siete problemas que la IA no había reportado: los datos eran
difíciles de leer, no se sabía dónde enfocarse, las etiquetas de categoría no se diferenciaban, el
conmutador de «más campos» era casi imperceptible, no se veía que hubiera varios viajes hasta hacer
clic en el selector, y editar y borrar eran confusos. Los siete apuntaban a lo mismo: **había
información pero no había jerarquía.** De ese diagnóstico salió la redistribución de la pantalla en
dos planos —el resumen en una banda de ancho completo, el detalle en dos columnas— y que el
formulario de registrar subiera, porque en 1440×900 quedaba debajo del pliegue.

---

### 12 de agosto — Tres verdes que no eran un sistema

**Qué encontré yo:** el calendario tenía un verde, los estados otro y la marca otro. No parecía que
hubiera un sistema de color alrededor de la app. Medidos, estaban en 76°, 140° y 176° de tono — cien
grados entre el primero y el último.

**Qué pedí:** un solo sistema, con cada color medido y con rol escrito.

**Qué devolvió:** una familia de un solo tono (74–76°) en tres claridades, con el contraste de cada
par calculado y no estimado. La marca de ritmo del medidor no se eligió a ojo: cruza dos fondos
opuestos, así que se despejó el rango de luminancia que pasa 3:1 contra ambos y se buscó el color
dentro de esa ventana.

**Qué ajusté yo:** rechacé dos versiones de esa marca antes de la definitiva — una se leía como una
línea resaltada, no como una señal. También pregunté qué significaba la línea del medidor y la
respuesta destapó que estaba dibujada en un sitio que no correspondía con el dato: se rehizo el
componente.

---

### 12 de agosto — El calendario nativo mentía

**Qué encontré yo:** los campos de fecha se veían fuera del sistema, sin diseñar.

**Qué devolvió al revisarlo:** el problema era peor que estético. `<input type="date">` mostraba
`08/12/2026` — formato gringo — y en Colombia eso se lee 8 de diciembre, no 12 de agosto. Un error
de correctitud disfrazado de detalle visual.

**Qué ajusté yo:** aprobé construir un calendario propio que escribe «12 ago 2026», sin ambigüedad,
con teclado completo (flechas, Re/Av Pág, Enter, Esc).

---

### 13 de agosto — Los detalles que hacen que se sienta una app

**Qué pedí:** tres cosas concretas, cada una con su referencia. Que la plata se formatee mientras se
escribe, como en las apps de banco de acá. Que el destino se sugiera mientras se escribe, como en los
buscadores de vuelos. Y que editar un gasto pase a un diálogo, porque editar en el mismo formulario
de registrar no corresponde con el modelo mental: registrar y corregir son momentos distintos.

**Qué devolvió:** el formato en vivo con el cursor recolocado contando dígitos (no caracteres, que es
lo que lo vuelve insoportable en la mayoría de apps), un autocompletado local de ~110 destinos sin
llamadas de red, y el diálogo nativo con foco y Esc resueltos por el navegador.

**Qué ajusté yo:** con el autocompletado puesto, caí en cuenta de que los dos campos de destino
—«A dónde vas» y «Destino completo»— quedaron rellenándose solos con casi lo mismo: se fundieron en
uno y el recorte quedó anotado en el alcance. También moví la flecha de volver a la izquierda, donde
el ojo la busca en una pantalla de segundo nivel.

---

### 13 de agosto — Crítica en frío y un error grave

**Qué pedí:** una crítica de todo lo construido, con varios lentes a la vez —producto, accesibilidad,
consistencia visual, código— y con la instrucción de intentar refutar cada hallazgo antes de
reportarlo.

**Qué devolvió:** un error grave y cuatro menores. El grave: abrir el panel de ajustar el tope en un
viaje y cambiar a otro viaje sin cerrarlo dejaba el formulario cargado con el tope del viaje
anterior — guardar se lo escribía al viaje equivocado, sin confirmación y sin deshacer. Los menores:
una fila que repetía «Comida» como título y subtítulo al guardar sin descripción, la alerta nombrando
dos veces la misma fecha cuando la plata se acaba justo el último día, el error de validación de
crear viaje que no decía cuál campo falló, y este mismo documento con el registro atrasado.

La refutación también descartó falsos positivos: los objetivos táctiles de 24px cumplen el nivel AA
(44px es AAA), y el revelar acciones al pasar el puntero es comportamiento decidido, no descuido —
en pantalla táctil están siempre visibles.

**Qué ajusté yo:** verifiqué el repro del error grave antes de aceptar el arreglo, y se corrigieron
los cinco.

---

### 13 de agosto — Segunda ronda de crítica, y una decisión de producto con evidencia

**Qué pedí:** una segunda crítica, más dura, con lentes separados trabajando en paralelo y la
instrucción de refutar cada hallazgo antes de reportarlo. Y aparte, dos tareas de investigación con
fuentes verificables.

**Qué devolvió:** 63 hallazgos. No todos sobrevivieron la revisión —el de «las acciones de fila
siempre visibles» era falso: el entorno donde se probó no reporta puntero fino y por eso las veía; en un
computador real se revelan al acercarse— pero la mayoría eran ciertos y medibles. Los más serios: el
linter del propio README fallando por un arreglo de esa mañana, comentarios describiendo colores que
ya no existen, ids duplicados que dejaban al diálogo de editar sin etiqueta accesible, la señal de
ritmo a 1.58:1 sobre la barra roja de excedido, el rango 768–1023 mostrando el layout de móvil
estirado, y el botón de registrar 44px por debajo del pliegue en un teléfono.

**Qué ajusté yo:** prioricé y se corrigió por tandas, verificando cada una en el navegador antes del
commit — el historial de este día cuenta ese orden.

**La decisión de producto:** me pregunté si el usuario debería poder modificar el tope en cualquier
momento, no solo cuando hay alerta. En vez de decidirlo por intuición pedí investigación: de las apps
con presupuesto revisadas (Trail Wallet, YNAB, Copilot Money, Monzo), todas permiten editarlo siempre
desde una entrada permanente y ninguna lo condiciona a una alerta — YNAB lo tiene hasta como regla de
su método. Y el argumento decisivo salió de nuestra propia app: un tope escrito DE MÁS es justo el
error que nunca enciende la alerta, así que la única puerta de ajuste jamás aparecía cuando más se
necesitaba. Se añadió la entrada permanente donde el tope se lee, en la leyenda del medidor, y el
atajo de la alerta se quedó.
