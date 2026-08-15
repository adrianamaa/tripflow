# La cifra se entendió sola

`01-research.md` cierra diciendo qué probaría primero si esto siguiera: **si la cifra diaria de
verdad se entiende sin explicación.** Esto es lo que pasó cuando lo probé.

---

## Qué fue esto, y qué no fue

Seis personas usaron la app desde su propio celular, con el link público. A cada una le di un
encuadre de una frase, me callé, y la dejé usarla.

**No fue un test de tareas.** No hubo tareas definidas ni criterio de éxito fijado de antemano, así
que **no hay tasa de éxito y no la voy a inventar**. Fue evaluación formativa con exploración libre,
que es lo que cabía en el tiempo que había.

---

## Quiénes

| | viajan | cómo | a dónde |
|---|---|---|---|
| 2 | seguido | por tierra | una internacional, una nacional |
| 4 | ocasional | tierra y avión | nacional e internacional |

Las seis son mujeres y las seis viajan, o sea que están dentro de la población objetivo. Ninguna es
cercana a mí y ninguna sabía qué esperaba yo que encontrara.

---

## El encuadre, textual

Esto fue todo lo que les dije antes de que miraran la pantalla:

> «Es una app en la que puedes poner tus gastos de viaje, y lo puedes organizar por viajes.»

Nada sobre gasto por día, ni sobre que la plata alcance, ni sobre las alertas. **Esa frase describe
un registro de gastos**, que es justo el modelo mental que lleva a buscar «cuánto llevo gastado».

Vale la pena notarlo porque el encuadre apuntaba al lado contrario del que defiende el producto.

---

## Lo que salió

### 1. La cifra principal se leyó sola

Ninguna necesitó que le explicara qué significaba el número grande, cómo estaban divididas las
categorías, ni cómo crear un viaje propio.

Desplazar la cifra que la gente espera —cuánto llevas gastado— por una que no espera —cuánto puedes
gastar por día— es **la decisión más riesgosa de Tripflow**. Es también la que la prueba respaldó con
más claridad, y a pesar de un encuadre que empujaba en la dirección opuesta.

### 2. El orden de la lista: una pidió cambiarlo, cinco lo prefieren así

Una persona pidió ver los gastos del más viejo al más nuevo. Antes de cambiarlo, le pregunté a las
demás: **ninguna había tenido problema con el orden, y cinco de seis prefieren ver primero lo más
reciente.** El motivo que dieron es concreto: quieren confirmar que lo último que anotaron sí quedó
guardado.

Eso no es gusto, es necesidad de confirmación. **No se cambió.**

La convención documentada coincide: el sistema de diseño del Ministerio de Justicia del Reino Unido
dice para listas de eventos fechados *«show the most recent events first, unless user research
suggests a different order is better»*. Mi investigación no sugiere otro orden — lo confirma.

**Pero buscando la causa apareció un defecto real.** Los días bajaban del más reciente al más viejo,
mientras los gastos dentro de un mismo día subían, porque a fecha igual la comparación empataba y
quedaba el orden de inserción. La lista corría en dos sentidos a la vez. Nadie lo reportó —hay que
tener varios gastos el mismo día para notarlo— y se corrigió.

### 3. Falta orientación al entrar

Una persona pidió «una pequeña instrucción o introducción», y es la misma que dijo sentirse algo
perdida.

Tiene causa concreta: la pantalla de bienvenida existe y está diseñada, pero solo aparece cuando no
hay ningún viaje — y la app arranca con dos viajes de ejemplo precargados. **Nadie que abra la app
por primera vez la ve nunca.**

Es el punto ciego que *Getting Real* describe en su capítulo sobre el estado vacío: uno no diseña
para la pantalla en blanco porque su propia copia siempre está llena de datos de prueba, y nunca se
topa con ella.

Queda **sin resolver, a propósito**. El enunciado no pide onboarding, y meter una función que nadie
pidió a dos días de entregar contradice el criterio con el que se defendió todo lo demás en
`03-alcance.md`. El arreglo bueno tampoco es un cartel: es invertir la relación, que los datos de
ejemplo sean un botón que se ofrece **desde** el estado vacío, para que el estado vacío siga siendo
alcanzable.

---

## Una séptima persona, en escritorio y en otro idioma

Después de entregar, una séptima persona probó la app. Va aparte porque entra por un lado que las
seis primeras no cubrían: **la usó en escritorio**, y las seis la habían usado en el celular. Es
además el primer hombre. Le di el mismo encuadre de una frase y lo dejé solo, igual que a las demás.

Lo que **no** aporta es viajar poco, aunque a primera vista lo parezca: cuatro de las seis tampoco
viajan seguido. Está en la tabla de arriba.

Y hay que decir lo que le resta peso: **no habla español, y la app está entera en español.** O sea
que lo que leyó fue una traducción. Eso no invalida lo que vio, pero obliga a separar sus
comentarios en dos montones.

### El filtro que usé

Lo que observa **cómo se comporta** la app sobrevive a la traducción: dos elementos que no
concuerdan, una situación que la app no contempla. Para ver eso no hace falta el idioma.

Lo que observa **si una palabra se entiende** no sobrevive, porque nunca leyó mis palabras.

### Lo que se aplicó

**El ejemplo de la nota no cambiaba con la categoría.** Con «Alojamiento» marcado, el formulario
proponía «Almuerzo en Getsemaní». Son dos cosas en pantalla que no concuerdan, y eso se ve sin
entender una sola palabra. Corregido: cada categoría tiene su propio ejemplo.

### Lo que se descartó, con motivo

**«No se entiende qué es el ritmo diario».** Él mismo dejó la duda por escrito: *«maybe this is just
a translation difference»*. Tenía razón. Nunca vio «ritmo diario», vio su traducción, y en inglés esa
palabra no lleva la idea de a qué velocidad se está gastando. Contra eso está el dato tomado en el
idioma real de la app: **las seis primeras entendieron la cifra sin que nadie se la explicara.**
Manda ese.

**«Las fechas no se actualizan hasta crear el viaje».** Comprobado: sí se actualizan, al instante.
Lo que probablemente vio es otra cosa — al mover la salida más allá del regreso, el regreso se
ajusta solo, y visto desde afuera parece que la pantalla hace algo raro.

Pero debajo hay algo cierto que él no llegó a nombrar: **ese formulario no dice qué significan las
fechas que uno escoge.** No aparece «son siete días» ni «te quedan tanto por día». En una app cuyo
argumento entero es la cifra diaria, la pantalla donde esa cifra se define no la muestra hasta
después de crear el viaje. Eso sí entra a lo que sigue.

### Lo que quedó anotado y no se tocó

**Dos viajes al mismo destino se ven iguales en el selector.** Es cierto, y es exactamente el costo
que quedó anotado en `03-alcance.md` cuando se tomó la decisión, a mitad de la construcción: el
autocompletado dejó «A dónde vas» y «Destino completo» llenándose solos con casi lo mismo, así que
se quitó el nombre propio del viaje. Se cambió un campo visible en TODOS los viajes por una
posibilidad que casi nadie usa. Un usuario acaba de encontrar el costo de ese cambio.

**No tengo seis opiniones del otro lado, y no las voy a inventar.** A las seis primeras nunca se les
preguntó por esto, y ninguna tuvo dos viajes al mismo destino, así que su silencio no es evidencia
de nada. Lo que hay es una persona que encontró el costo y seis que no estaban en posición de
encontrarlo. Eso no alcanza para revertir la decisión, pero sí la mueve de supuesta a medida — que
es lo único que cambió acá.

**Nada impide crear dos viajes con fechas solapadas.** Cierto, no hay ninguna validación. Si eso se
bloquea o solo se avisa es una decisión de producto, no un parche, y no se toma a un día de que
venza el plazo.

---

## Lo que esto no puede contestar

- **Sin tareas definidas no hay medición de éxito.** Solo hay observación.
- **Casi todo en celular.** Seis de las siete personas la usaron en el teléfono. Solo la séptima
  entró desde escritorio, y una sola pasada no alcanza para dar por visto el trabajo de los anchos
  intermedios.
- **Muestra por conveniencia, no probabilística.** Sirve para descubrir problemas, no para estimar a
  cuánta gente le pasan. Seis mujeres y un hombre.
- **Seis personas no alcanzan para descartar nada.** Aun si no hubiera salido ningún problema, con
  seis observaciones limpias solo quedarían descartados los que afecten a cerca del 40% de los
  usuarios: uno que le pase a un tercio se cuela sin que nadie lo vea. Y sí salieron cosas, así que
  la cifra que importa no es cuántos problemas hay sino cuántos quedaron sin ver.

  **La séptima persona no mueve ese número, y por eso no lo moví.** Leyó una traducción, no la app,
  así que no es una séptima observación limpia del mismo experimento. Sumarla para bajar la cifra
  sería hacer que el dato diga más de lo que puede.
- **La segunda pregunta de `01-research.md` sigue abierta:** si la alerta de ritmo se siente útil o
  se siente como un regaño. Ninguna llegó a estado de alerta en el rato que la usó.

---

## Lo que probaría después

Una sesión moderada de verdad, con tareas escritas y criterio de éxito fijado antes de empezar. Tres
cosas, en este orden:

1. **Cuatro minutos mirando el tablero sin tocar nada.** Es el único momento que mide si el concepto
   se sostiene solo, sin ningún encuadre. Acá lo hubo, aunque fuera de una frase.
2. **Una tarea que obligue a recorrer la lista hasta el primer día del viaje**, que es el costo de
   haber dejado lo más reciente arriba y es el lado que todavía no medí.
3. **Un viaje con la alerta ya disparada**, para contestar la segunda pregunta.

Y una cosa que no es una prueba sino un arreglo, salida de la séptima persona: **que el formulario de
crear viaje diga qué significan las fechas y el tope mientras se escriben** — cuántos días son y
cuánto queda por día. Hoy esa cifra, que es el argumento entero de la app, solo aparece cuando el
viaje ya está creado.
