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

La primera versión tenía **tres verdes sin ninguna relación**: la lima en 76°, el estado bueno con un
estado bueno en 140°, y la marca en un petróleo de 176°. Cien grados de tono entre el primero
y el último.

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

El tono sale de la convención de seguridad: ámbar advierte, rojo marca el límite pasado. El valor
sale de tres restricciones verificables: contraste sobre su propio fondo, croma suficiente para
que siga señalando, y separación de claridad entre los dos.

| estado | texto | fondo | contraste | L* |
|---|---|---|---|---|
| vas bien | `#374706` (la marca) | — | 10.16:1 | 27.6 |
| cuidado | `#9E4C00` | `#FFF5DB` | **5.54:1** | 41.9 |
| te pasaste | `#AE2E24` | `#FFECEB` | **5.74:1** | 39.7 |

### Lo que se perdió al cambiar, dicho claro

**Separación de escalera.** El sistema anterior tenía 10.4 puntos de L\* entre cuidado y te pasaste;
este tiene 2.2.

La escalera importa porque el par que de verdad se confunde **no es verde-rojo sino ámbar-rojo** —los
dos casi no tienen azul— y quien no distingue colores los separa por claridad. Pero era un
**refuerzo**, no el requisito.

Lo obligatorio es que ningún estado se comunique solo con color, y de eso se encargan:

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
que venía con el enunciado. Nunca llegó a la app: la dirección visual se cerró en verde. Se deja la
nota porque un documento que describe otro producto cuesta más que no tener documento.
