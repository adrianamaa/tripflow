# Investigación

Este documento se escribe mientras trabajo, no al final. Cada decisión de diseño que aparezca después
en la aplicación debería poder rastrearse hasta acá.

---

## 1. El problema, en una frase

Alguien que se va de viaje tiene una cantidad de dinero y quiere volver sin haberse pasado. El
problema no es sumar: es **saber a tiempo que va mal, mientras todavía puede corregir.**

Un registro de gastos que solo suma sirve para el día que uno vuelve. Lo útil es lo que pasa el
día tres.

## 2. Qué pide el reto

Tres funcionalidades:

1. Dashboard de control de gastos
2. Creación de viajes con presupuesto límite
3. Registro de gastos — con una condición explícita: *"su interfaz debe ser eficiente para poder
   registrar los gastos de manera fácil y rápida"*

Y una regla de comportamiento: **cuando el usuario llega a los límites del presupuesto, tiene alertas
para regular y conservar sus finanzas.**

### Restricciones que condicionan el diseño

| Restricción | Qué implica |
|---|---|
| App funcional, no prototipo | Todo lo que se vea tiene que funcionar de verdad |
| Escritorio **y** móvil | El escritorio no puede ser la columna de móvil centrada en gris |
| Sin UI kits ni plantillas | Sistema de diseño propio: tipografía, color, espaciado y componentes decididos |
| 5 días | El alcance se defiende recortando, no acelerando |

## 3. Método

Decisión tomada antes de empezar, y vale la pena dejarla escrita porque condiciona todo lo demás:

> **Las personas se derivan de la investigación, no de mi propia experiencia.**

Cada supuesto se contrastó contra evidencia de usuarios reales. Lo propio sirvió para saber
**qué ir a buscar**, no para decidir.

La evidencia que busco no es el marketing de las apps existentes. Es lo contrario:

- reseñas negativas
- hilos de foros donde la gente cuenta qué abandonó y por qué
- quejas recurrentes

Lo que alguien dice que le falta a una app que ya usa vale más que lo que otra app dice de sí misma.

### Riesgo del que quiero cuidarme

Diseñar para "todo tipo de usuario" produce un producto que no le sirve a nadie. Al cerrar la
investigación voy a **escoger un usuario principal y declarar explícitamente qué queda fuera.**

---

## 4. Lo que se encontró

Cada hallazgo va con su fuente. Solo está acá lo que se pudo verificar contra la fuente original;
lo que no se pudo confirmar se descartó, aunque sonara bien.

### El número que importa no es lo gastado, es lo que queda por día

Las apps de referencia del nicho calculan un **presupuesto diario ajustado** — cuánto puedes gastar
por día de aquí en adelante, recalculado con lo ya gastado. TravelSpend lo define en su ayuda
oficial: lo que quedaba del presupuesto al empezar hoy, dividido por los días que faltan. Trail
Wallet —ya descontinuada, su página quedó como archivo— lo ofrecía al tocar el presupuesto diario:
*"an adjusted budget which tells you how much you have left to spend based on what you've spent so
far"*.

«¿Cuánto llevo?» es contabilidad; «¿cuánto me queda por día?» es una decisión que se puede tomar en
un restaurante. La segunda es la cifra protagonista de Tripflow.

### Un solo número protagonista, y que la app hable

Monzo publicó los tres hallazgos de su investigación de presupuestos, textuales: a la gente le
cuesta *"work out what you could spend or save"*, le cuesta *"visualise how quickly or slowly you
spend"*, y le cuesta *"track progress and stay motivated"*. Los tres son problemas de claridad, no
de datos: había datos de sobra. Por eso acá hay UNA cifra en el plano protagonista y una frase en
lenguaje llano al lado — la barra dice cuánto, la marca dice si eso es mucho, y la frase dice qué
hacer.

### Avisar antes, no en el borde

La convención en herramientas de presupuesto es alertar con **umbrales intermedios**, no al llegar
al tope: Google Cloud crea alertas por defecto en 50/90/100% y GitHub en 75/90/100%. Tripflow usa
dos vías: la alerta de ritmo —que proyecta y dice qué DÍA se acaba la plata, antes que cualquier
umbral— y un umbral del 80% de consumo que cubre los primeros días, cuando todavía no hay ritmo
que proyectar.

### El presupuesto se edita, siempre

Todas las apps con presupuesto que se revisaron lo dejan editar en cualquier momento desde una
entrada permanente: Trail Wallet desde la ficha del viaje, Copilot con el control de cada
categoría, Monzo desde la página del target. YNAB lo eleva a regla oficial de su método («Roll
with the Punches»): si no estás cambiando tu presupuesto, lo estás usando mal. Ninguna lo
condiciona a un estado de alerta. De ahí que en Tripflow el tope se ajuste desde el medidor en
cualquier momento, no solo cuando la alerta lo ofrece.

### La lección de Tricount: no quitarle a la gente sus herramientas de control

El relanzamiento de Tricount bajo bunq (2024) eliminó funciones que los usuarios usaban para
controlar — repartos personalizados, estadísticas, exportar — y las reseñas se volvieron negativas
al punto de que el equipo prometió devolverlas. La lección para un producto de control de gastos:
la visualización de progreso y las herramientas de corrección no son decoración; quitarlas rompe
la confianza que es todo el producto.

### Cómo se escanea una lista

NN/g documentó con seguimiento ocular que sin encabezados los lectores tienden al patrón F —el
menos efectivo— y que con encabezados y subencabezados escanean en «layer cake», *"by far the most
effective way in which users can scan pages"*. La lista de gastos se agrupa por día con el
encabezado como superficie propia, y la fecha desaparece de las filas.

### Comparar magnitudes

La investigación clásica de percepción gráfica (Cleveland & McGill) ordena las codificaciones por
precisión de lectura: posición y longitud se comparan mejor que ángulos y áreas. «¿En qué gasté
más?» es comparar magnitudes → barras, no dona.

### El color no puede ser el único canal

Alrededor del 8% de los hombres de ascendencia norte-europea tiene deficiencia de visión rojo-verde
(Birch 2012; las cifras del National Eye Institute coinciden). Por eso ningún estado de Tripflow se
comunica solo con color: cada uno lleva palabra e icono de silueta distinta, y el par ámbar-rojo
—que es el que de verdad se confunde— se separa además por claridad.

## 5. La usuaria principal

De los hallazgos sale una elección, y es una sola: **la persona que registra el gasto en el momento,
con el teléfono en la mano, y que lo que quiere saber es si le alcanza** — no llevar contabilidad.
Los tres problemas documentados por Monzo son suyos: no sabe cuánto puede gastar, no ve a qué
velocidad va, le cuesta sostener el control. Todo lo que está en el plano protagonista de Tripflow
—la cifra diaria, la marca de ritmo, la frase que dice qué hacer, el registro en tres toques—
existe para ella.

**Quiénes quedan conscientemente por fuera:** quien viaja en grupo y reparte gastos (eso es
Splitwise/Tricount, otro producto), quien quiere análisis contable después del viaje, y quien
cruza monedas constantemente. Está declarado, no olvidado — el detalle en `03-alcance.md`.

## 6. Decisiones de diseño

| Decisión | Fuente | Por qué |
|---|---|---|
| La cifra protagonista es «puedes gastar por día», recalculada | TravelSpend (ayuda oficial) · Trail Wallet | Es la única cifra que responde una decisión del momento |
| Una sola cifra en el plano protagonista + frase en lenguaje llano | Los tres hallazgos publicados de Monzo | Los problemas reportados son de claridad, no de falta de datos |
| Alerta de ritmo que nombra el día + umbral del 80% como respaldo | Convención de umbrales intermedios (Google Cloud 50/90/100 · GitHub 75/90/100) | Avisar en el borde es avisar tarde; la proyección avisa antes y el umbral cubre los primeros días |
| El tope se ajusta en cualquier momento | YNAB (regla «Roll with the Punches») · Trail Wallet · Copilot · Monzo | Ninguna app lo condiciona a una alerta; y el tope escrito de más nunca la enciende |
| La alerta trae palanca («ajustar el tope»), no solo aviso | El enunciado: alertas *«para regular»* | Una alerta sin acción deja como única salida cerrar la app |
| Lista agrupada por día, fecha fuera de la fila | NN/g, eyetracking de patrones de escaneo | El encabezado convierte el patrón F en «layer cake» |
| Barras, no dona; una sola destacada | Cleveland & McGill | Longitud se compara mejor que ángulo; el color solo trabaja si es escaso |
| Ningún estado comunicado solo con color | Birch 2012 · NEI | ~8% de los hombres no separa el par rojo-verde |
| Editar y borrar gastos, y deshacer el borrado | La lección de Tricount 2024 | Quitar u omitir herramientas de control rompe la confianza |

## 7. Qué queda conscientemente fuera

Multi-moneda con conversión, gasto compartido, foto del recibo, cuentas y sincronización, importar
datos. Cada recorte con su motivo está en [`03-alcance.md`](03-alcance.md) — la regla fue **se
recortan funcionalidades, nunca el despliegue**, y un recorte explicado antes de empezar es una
decisión de producto, no un hueco.

---

## Fuentes

- TravelSpend — [How does the remaining daily budget work](https://help.travel-spend.com/daily-metrics/nsEZBhRKe4aEiaHGB4fnwF/how-does-the-remaining-daily-budget-work/uT5EPNGKPV3AFsgGuuKQGq)
- Trail Wallet (archivo) — [Voyage Travel Apps](https://voyagetravelapps.com/trail-wallet/) · [FAQ](https://voyagetravelapps.com/trail-wallet-faq/)
- Monzo — [Targets in Trends](https://monzo.com/blog/targets-in-trends)
- YNAB — [If you aren't changing your budget, you're doing it wrong](https://www.ynab.com/blog/if-you-arent-changing-your-budget-youre-doing-it-wrong) · [Moving money](https://support.ynab.com/moving-money-in-your-plan-ryyCKbBJi)
- Copilot Money — [Editing budgets by month](https://help.copilot.money/en/articles/6206293-editing-budgets-by-month)
- Google Cloud — [Budgets and alerts](https://docs.cloud.google.com/billing/docs/how-to/budgets) · GitHub — [Budgets and alerts](https://docs.github.com/en/enterprise-cloud@latest/billing/concepts/budgets-and-alerts)
- NN/g — [Text Scanning Patterns: Eyetracking Evidence](https://www.nngroup.com/articles/text-scanning-patterns-eyetracking/) · [F-Shaped Pattern](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/)
- Cleveland, W. & McGill, R. (1984). *Graphical Perception*. JASA.
- Birch, J. (2012). *Worldwide prevalence of red-green color deficiency*. J Opt Soc Am A · [NEI — Color blindness](https://www.nei.nih.gov/learn-about-eye-health/eye-conditions-and-diseases/color-blindness)
- Tricount 2024 — reseñas en la [App Store](https://apps.apple.com/us/app/tricount-split-settle-bills/id349866256) tras el relanzamiento de bunq
