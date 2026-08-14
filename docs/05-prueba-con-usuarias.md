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

## Lo que esto no puede contestar

- **Sin tareas definidas no hay medición de éxito.** Solo hay observación.
- **Solo celular.** El comportamiento en escritorio —incluido el trabajo de los anchos intermedios—
  no lo ha visto ningún usuario.
- **Muestra por conveniencia, no probabilística.** Sirve para descubrir problemas, no para estimar a
  cuánta gente le pasan. Y las seis son mujeres.
- **Que casi no aparecieran problemas no significa que no haya.** Con cero hallazgos en cinco
  personas solo se descartan problemas que afecten a cerca de la mitad de los usuarios; uno que
  afecte a un tercio pasa sin verse.
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
