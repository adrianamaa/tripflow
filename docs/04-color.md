# El color

Todos los contrastes de este documento están **medidos**, no estimados. Se pueden verificar contra
los tokens de `src/app/globals.css`, que es donde vive el sistema.

---

## La familia: un tono, tres claridades

El color de marca y el de acento **son el mismo tono**. No son dos verdes parecidos: son el mismo
color a distinta claridad.

| rol | hex | tono | sobre blanco | dónde va |
|---|---|---|---|---|
| **marca** | `#374706` | 74.8° | **10.16:1** | logo, iconos, texto de marca, «vas bien», la categoría que más pesa |
| **media** | `#6A871D` | 76.4° | 4.12:1 | **solo** la marca de ritmo del medidor |
| **acento** | `#C8F04A` | 76.4° | 1.31:1 | **solo** relleno de área grande — la acción de registrar |
| marca suave | `#EFF3E2` | 74.1° | — | fondo tenue; la marca encima da **9.00:1** |

### Por qué se llegó acá

La primera versión tenía **tres verdes sin ninguna relación**: la lima en 76°, el estado bueno en
140° y la marca en un petróleo de 176°. Cien grados de tono entre el primero y el último.

Eso no es una paleta: son tres colores que por casualidad se llaman verdes. Y se notaba en pantalla —
el visto de «vas bien» se leía como *otro* verde y el calendario como *el otro* verde.

Se resolvió **anclando la familia en la lima** y recalculando el resto a su tono, en vez de al revés.

### El escalón de en medio no se eligió: se despejó

`--color-marca-media` existe por una necesidad concreta. La marca de ritmo del medidor tiene que
verse sobre dos fondos opuestos —el relleno casi negro y la pista clara— y **ningún color de la
paleta servía**:

- la lima da 15.08:1 contra el relleno, pero **1.07:1** contra la pista: desaparece
- la marca da 8.33:1 contra la pista, pero se pierde dentro del negro

Para pasar 3:1 contra los dos hace falta una luminancia relativa **entre 0.109 y 0.237**. `#6A871D`
es ese punto en el tono de la familia: **4.80:1** contra el relleno y **3.38:1** contra la pista.

Es una restricción numérica resuelta, no un color probado hasta que se viera bien.

---

## Reglas de uso

| regla | por qué |
|---|---|
| **La lima nunca es texto, borde ni icono.** | 1.31:1 sobre blanco. Solo funciona como masa de color con tinta encima (15.08:1). |
| **La marca no entra en las cifras de dinero.** | Un monto se lee en tinta. Si la marca se mete en los números, deja de significar «esto es Tripflow». |
| **Los estados viven dentro de tarjetas blancas.** | Medidos sobre blanco. Sobre el papel cálido la escalera de claridad se aplana. |
| **El estado bueno no tiene color propio: usa la marca.** | El verde ES la marca y ES el estado normal. Los colores de estado aparecen solo cuando algo va mal. |

---

## Los estados

| estado | texto | fondo | contraste | L* |
|---|---|---|---|---|
| vas bien | `#374706` (la marca) | — | 10.16:1 | 27.6 |
| cuidado | `#9E4C00` | `#FFF5DB` | **5.54:1** | 41.9 |
| te pasaste | `#961414` | `#FFECEB` | **7.67:1** | 31.9 |

### De dónde sale el tono

De la convención, no del gusto. **ISO 3864-1:2011** asigna el amarillo a la advertencia y el rojo a
la prohibición, y la **Convención de Viena sobre Señalización Vial** (art. 23) codifica rojo-ámbar-verde
en un tratado. Es el código de color con más alcance que existe: casi nadie lo aprendió para esta app,
todo el mundo llega con él puesto.

Con un matiz que conviene decir antes de que lo digan: la cláusula 4.2 de esa norma limita las señales
de seguridad a salud y seguridad. **Respalda la convención, no es un mandato para una app de plata.**

### De dónde sale el valor exacto

Fijado el tono, los valores salen de tres restricciones que se pueden verificar:

| restricción | por qué | resultado |
|---|---|---|
| contraste ≥ 4.5:1 sobre su fondo | WCAG 2.2, SC 1.4.3, nivel AA para texto normal | 5.54:1 y 7.67:1 |
| croma alto | un rojo que se oscurece hasta parecer tinta deja de señalar | C\* 59.9 y 62.6 |
| separación de claridad entre los dos | abajo | **10.0 puntos de L\*** |

### Por qué la escalera de claridad, y no solo el tono

Porque el par que de verdad se confunde **no es verde-rojo sino ámbar-rojo**: los dos son de onda
larga y casi no tienen azul, así que caen sobre la misma línea de confusión.

Y hay una razón mecánica para que la salida sea la claridad. El Vocabulario Internacional de
Iluminación de la CIE define la deuteranopía como la pérdida de discriminación rojo-verde *«without
any colours appearing abnormally dim»*: el canal de luminancia **queda intacto**. O sea que quien no
separa esos dos tonos sí separa sus claridades. Por eso el rojo baja hasta L\* 31.9 en vez de quedarse
al lado del ámbar.

Afecta a cerca del **8% de los hombres de ascendencia europea y al 0.4% de las mujeres**
(Birch, 2012, *JOSA A* 29(3):313-320), y de los casos la mayoría son deutan.

Aun así la escalera es un **refuerzo**, no el requisito. Lo obligatorio es que ningún estado se
comunique solo con color, y de eso se encargan:

- **el icono**, con una silueta distinta por estado: trazo abierto, triángulo, octágono
- **la palabra**: «Vas bien», «Cuidado», «Te pasaste»

Hay además un cuarto estado, **neutro**, para cuando no hay datos —sin gastos, o sin días suficientes
para calcular el ritmo—. No lleva color de estado a propósito: «no sé todavía» no es una gravedad
menor que «vas bien», es otra cosa.

---

## Neutros

| rol | hex | uso |
|---|---|---|
| papel | `#F4F2F0` | el lienzo |
| tarjeta | `#FFFFFF` | las superficies encima |
| reposo | `#EBE8E5` | pistas de barras, fondos al pasar el puntero |
| filete | `#E2DED9` | líneas de campo y separadores |
| tinta | `#0C0A08` | texto y cifras |
| tinta 2 | `#6D6C6B` | texto secundario — 5.24:1 sobre tarjeta |
| tinta 3 | `#A3A09D` | **solo** lo deshabilitado — 2.60:1 |

`--color-tinta-3` no pasa como texto y no debe: WCAG exime los controles inactivos justamente porque
tienen que verse inactivos. Existe porque los días bloqueados del calendario estaban dibujados con el
color de filete, a 1.34:1, y desaparecían.

**La elevación no sale de un borde ni de una sombra: sale del cambio de superficie.** La única
excepción del sistema es el panel flotante del calendario, que queda encima de otra superficie del
mismo blanco — ahí el cambio de superficie no alcanza y sí lleva filete y sombra.

---

## Historial

Este archivo describió durante un tiempo un **rosa `#FF3482`**, sacado del icono del archivo de marca
que venía con el enunciado. Ese rosa no llegó a la app: la dirección visual se cerró en verde. Se
deja la nota porque un documento que describe otro producto cuesta más que no tener documento.

El isotipo sí viene de ese archivo. Conservé la geometría —el disco y los dos triángulos anidados— y
cambié solo los valores de color: el disco a `--color-marca`, el triángulo grande a `--color-acento`
y el chico a blanco. La jerarquía entre los dos triángulos la carga el color y no una opacidad,
porque a 16px un 60% se lee como un gris sucio.

| par | contraste |
|---|---|
| lima sobre marca | **7.75:1** |
| blanco sobre marca | **10.16:1** |
| el disco contra una barra de pestañas oscura (`#35363A`) | 1.19:1 |

Ese último número es el que decide la construcción: contra una pestaña oscura el disco casi
desaparece, así que la marca no puede depender de su silueta. La sostienen los dos triángulos.
