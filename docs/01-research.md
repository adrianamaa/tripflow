# La cifra que manda no es cuánto llevas gastado

Diez decisiones de diseño, con la fuente que las sostiene y la pantalla donde se ven.

## En 60 segundos

Alguien se va de viaje con una plata contada y quiere volver sin haberse pasado. Sumar lo gastado
resuelve eso el día que uno vuelve, que es tarde. Lo que sirve es el día tres.

Por eso la cifra grande de Tripflow responde **cuánto puedes gastar por día de aquí en adelante**,
recalculada con cada gasto, y la alerta no espera al borde: proyecta el ritmo y dice qué día se
acaba la plata. La app está en [usetripflow.vercel.app](https://usetripflow.vercel.app).

Fuera quedaron el gasto compartido, la conversión de monedas y la foto del recibo. Cada recorte
con su motivo está en [`03-alcance.md`](03-alcance.md).

## Las decisiones, y de dónde salió cada una

| Decisión | Fuente | Dónde se ve |
|---|---|---|
| La cifra protagonista es «puedes gastar por día», recalculada | TravelSpend (ayuda oficial) · Trail Wallet | El número grande del tablero |
| Una sola cifra en ese plano, con una frase en lenguaje llano al lado | Los tres hallazgos publicados de Monzo | Banda de resumen: cifras a la izquierda, palabras a la derecha |
| Alerta de ritmo que nombra el día, con un umbral del 80% de respaldo | Google Cloud alerta en 50/90/100%, GitHub en 75/90/100% | «A este ritmo te quedas sin presupuesto el viernes 14» |
| El tope se ajusta en cualquier momento, no solo bajo alerta | YNAB («Roll with the Punches») · Trail Wallet · Copilot · Monzo | La cifra del tope en la leyenda del medidor es un botón |
| La alerta trae palanca, no solo aviso | El enunciado pide alertas *«para regular»* | Botón «Ajustar el tope del viaje» dentro de la alerta |
| Editar y borrar un gasto, con deshacer de 10 segundos | Tricount 2024 | Acciones de cada fila y aviso de deshacer |
| La lista se agrupa por día y la fecha sale de la fila | NN/g, seguimiento ocular | Encabezado de día con su propio total |
| Barras y no dona, con una sola destacada | Cleveland & McGill (1984) | «En qué se va la plata» |
| Un solo tono en tres claridades, con el escalón intermedio despejado por contraste | Restricción medida: 3:1 contra dos fondos opuestos | La marca de ritmo sobre el medidor |
| Ningún estado se comunica solo con color | Birch 2012 · National Eye Institute | Cada estado lleva icono de silueta propia y palabra |

## Para quién es Tripflow, y para quién no

Escogí una usuaria y solo una: **la que registra el gasto en el momento, con el celular en la mano,
y lo que quiere saber es si le alcanza.** No lleva contabilidad y no quiere llevarla.

Los tres problemas que Monzo documentó son suyos. No sabe cuánto puede gastar, no ve a qué
velocidad se le está yendo la plata, y le cuesta sostener el control hasta el final. Todo lo que
está en el primer plano de la app existe para ella.

Quedan por fuera, a propósito: quien viaja en grupo y reparte gastos (eso es Splitwise, otro
producto), quien quiere análisis contable al volver, y quien cruza monedas todos los días.

## La evidencia

### El presupuesto diario ajustado, y por qué desplazó a «cuánto llevo»

TravelSpend define en su ayuda oficial el presupuesto diario restante: lo que quedaba del total al
empezar hoy, dividido por los días que faltan. Trail Wallet —ya descontinuada, su página quedó como
archivo— lo ofrecía al tocar el presupuesto diario: *«an adjusted budget which tells you how much
you have left to spend based on what you've spent so far»*.

«Cuánto llevo» es una pregunta de contabilidad. «Cuánto me queda por día» se puede responder con el
mesero esperando. Puse la segunda en el plano protagonista y bajé el total gastado a la línea de
abajo del medidor.

### Avisar en el borde es avisar tarde

Google Cloud crea alertas por defecto en 50, 90 y 100% del presupuesto; GitHub en 75, 90 y 100%.
El umbral intermedio es la convención.

Tripflow usa dos vías porque una sola deja un hueco. La alerta de ritmo proyecta y nombra el día,
pero necesita dos días cerrados y tres gastos para existir. El umbral del 80% de consumo
(`UMBRAL_CONSUMO` en `src/lib/presupuesto.ts`) cubre justo esos primeros días, cuando alguien puede
gastarse casi todo el tope la primera tarde y la proyección todavía no tiene con qué hablar.

### El hotel rompía el cálculo, y ese fue el arreglo que más cambió el producto

Un viaje de siete días con tres millones. El primer día se paga el hotel: 1.200.000. Si el ritmo se
calcula sobre todo lo gastado, la app proyecta 8.400.000 y declara emergencia el día uno, y sigue
declarándola toda la semana en un viaje que va perfecto.

Hay dos tipos de gasto y solo uno se repite. Marqué los pagos únicos aparte y el ritmo se calcula
solo con lo variable. Hay una prueba que deja el error escrito por contraste: el mismo viaje, con y
sin la marca, proyecta 2.040.000 contra 3.640.000.

### Quitarle a la gente sus herramientas de control sale caro

El relanzamiento de Tricount bajo bunq, en 2024, eliminó repartos personalizados, estadísticas y
exportar. Justo lo que la gente usaba para controlar. Las reseñas se hundieron hasta que el equipo
prometió devolverlas.

Con cinco días de plazo, editar y borrar un gasto son de las primeras cosas que uno recorta. Las
dejé dentro. Un cero de más al registrar rápido daña la cifra principal para siempre, y el deshacer
de diez segundos existe porque borrar sin vuelta atrás en una app de plata es peor que no poder
borrar.

### Un tono, tres claridades, y un color que no escogí sino que despejé

La app empezó con tres verdes sin ninguna relación entre sí: la lima en 76°, el estado bueno en
140°, la marca en un petróleo de 176°. Cien grados de tono entre el primero y el último. Eso no es
una paleta, son tres colores que por casualidad se llaman verdes, y en pantalla se notaba.

Anclé la familia en la lima y recalculé el resto a su tono. Un color, tres claridades, cada una con
su rol escrito y su contraste medido.

El escalón de en medio no lo escogí: lo despejé. La marca de ritmo del medidor tiene que verse
sobre dos fondos opuestos —el relleno casi negro y la pista clara— y ninguno de los colores que ya
tenía servía: la lima da 15.08:1 contra el relleno y 1.07:1 contra la pista, o sea desaparece; la
marca da 8.33:1 contra la pista y se pierde dentro del negro. Para pasar 3:1 contra los dos hay que
estar en una luminancia relativa entre **0.109 y 0.237**. Busqué dentro de esa ventana, en el tono
de la familia, y salió `#6A871D`: 4.80:1 contra el relleno y 3.38:1 contra la pista.

Una restricción numérica resuelta, no un color probado hasta que se viera bien.

Los tres estados de alerta tampoco son hex escogidos a ojo. El tono lo fija la convención de
seguridad —ámbar advierte, rojo marca el límite pasado— y el valor sale de restricciones que se
pueden verificar: contraste sobre su propio fondo, croma suficiente para que sigan señalando, y una
escalera de claridad que baje con la gravedad, porque el par que de verdad se confunde no es
verde-rojo sino ámbar-rojo. Los números están en [`04-color.md`](04-color.md).

### La lista se agrupa por día porque sin encabezados nadie la lee

NN/g documentó con seguimiento ocular que sin encabezados los lectores tienden al patrón F, el
menos efectivo, y que con encabezados escanean en «layer cake», *«by far the most effective way in
which users can scan pages»*.

Cada día es su propia tarjeta, con su total. Y la fecha desapareció de la fila: repetirla en cada
línea después de haberla puesto de encabezado es ruido.

## Lo que no puedo concluir de esto

Todo lo anterior es investigación de escritorio. Leí ayudas oficiales, notas técnicas y reseñas
negativas de las apps del nicho, y busqué investigación publicada donde existía.

Eso significa que estas son hipótesis informadas, no conclusiones validadas. Sé de dónde salen y sé
qué no prueban.

Escribí acá que lo primero que probaría con gente real eran dos cosas. Una: si la cifra diaria de
verdad se entiende sin explicación, o si hay que tocar la app para saber de dónde sale ese número.
Dos: si la alerta de ritmo se siente útil o se siente como un regaño, porque las apps de presupuesto
se abandonan justo ahí.

**La primera quedó contestada.** Seis personas usaron la app y ninguna necesitó que le explicara qué
significaba la cifra principal — con un encuadre que además apuntaba al lado contrario. Está en
[`05-prueba-con-usuarias.md`](05-prueba-con-usuarias.md), con lo que salió y con lo que esa prueba
no alcanza a contestar.

La segunda sigue abierta: ninguna llegó a estado de alerta en el rato que la usó.

## Lo que recorté, y lo que costó

**Multimoneda.** El motor ya formatea ocho monedas y hay una prueba que cubre los centavos en
dólares, pero el formulario solo ofrece pesos. Convertir exige red y datos en vivo, y toda la app
está construida sobre no depender de un servidor. Costo asumido: un viaje internacional queda a
medias.

**Nombrar el viaje distinto de su destino.** Había dos campos, «A dónde vas» y «Destino completo».
Con el autocompletado puesto se rellenaban solos con casi lo mismo, uno debajo del otro. Los fundí.
Costo asumido: se pierde poder llamar «Luna de miel» a un viaje a Cartagena.

**Buscar destinos contra una API.** La lista es local, 127 destinos escogidos. Una llamada de red
en el primer campo del primer formulario rompería lo único que hace que la app abra en dos segundos
sin depender de nadie. Costo asumido: quien vaya a un pueblo que no está lo escribe a mano.

## Fuentes

- TravelSpend — [cómo funciona el presupuesto diario restante](https://help.travel-spend.com/daily-metrics/nsEZBhRKe4aEiaHGB4fnwF/how-does-the-remaining-daily-budget-work/uT5EPNGKPV3AFsgGuuKQGq)
- Trail Wallet — [página archivada](https://voyagetravelapps.com/trail-wallet/) · [FAQ](https://voyagetravelapps.com/trail-wallet-faq/)
- Monzo — [Targets in Trends](https://monzo.com/blog/targets-in-trends)
- YNAB — [If you aren't changing your budget, you're doing it wrong](https://www.ynab.com/blog/if-you-arent-changing-your-budget-youre-doing-it-wrong)
- Copilot Money — [Editing budgets by month](https://help.copilot.money/en/articles/6206293-editing-budgets-by-month)
- Google Cloud — [Budgets and alerts](https://docs.cloud.google.com/billing/docs/how-to/budgets) · GitHub — [Budgets and alerts](https://docs.github.com/en/enterprise-cloud@latest/billing/concepts/budgets-and-alerts)
- NN/g — [Text Scanning Patterns: Eyetracking Evidence](https://www.nngroup.com/articles/text-scanning-patterns-eyetracking/)
- Tricount — [reseñas tras el relanzamiento de 2024](https://apps.apple.com/us/app/tricount-split-settle-bills/id349866256)
- Cleveland, W. & McGill, R. (1984). *Graphical Perception*. JASA.
- Birch, J. (2012). *Worldwide prevalence of red-green color deficiency* · [National Eye Institute](https://www.nei.nih.gov/learn-about-eye-health/eye-conditions-and-diseases/color-blindness)

---

**Cómo busqué.** Ayudas oficiales y notas técnicas antes que páginas de marketing, y reseñas
negativas antes que reseñas buenas. Lo que alguien le reclama a una app que ya usa vale más que lo
que otra app dice de sí misma. Cada cifra y cada cita de acá está verificada contra su fuente
original; lo que no pude confirmar, lo boté, aunque me sirviera.
