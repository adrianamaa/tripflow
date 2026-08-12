# Color

> **Estado: medición, no decisión.** Este documento mide el color que venía en el archivo de marca
> del reto. La dirección visual propia todavía no está cerrada, y cuando lo esté se documenta acá
> mismo, con sus propias mediciones y con el motivo de haberse ido —o no— del color original.

## De dónde sale

El archivo de marca que venía con el reto trae un icono: un círculo rosa con dos triángulos blancos
apuntando hacia abajo. El rosa es **`#FF3482`** — tono 337°, saturación 100%.

Antes de decidir nada más, medí ese color, porque un color de marca vivo es fácil de usar mal.

## Lo que dicen las mediciones

| Combinación | Contraste | Sirve para |
|---|---|---|
| `#FF3482` como texto sobre blanco | 3.46:1 | Solo texto grande. **Nunca** texto de lectura |
| Texto blanco sobre `#FF3482` | 3.46:1 | Solo texto grande |
| **Texto negro sobre `#FF3482`** | **6.07:1** | Cualquier tamaño ✅ |
| `#FF3482` sobre fondo casi negro | 5.72:1 | Cualquier tamaño ✅ |

El mínimo que exige WCAG AA es 4.5:1 para texto normal y 3:1 para texto grande.

## Las reglas que salen de ahí

**El rosa de marca es una superficie y un acento, no un color de texto.**

- ✅ Va en: el icono, rellenos, la barra de progreso, cifras grandes, botones
- ✅ Cuando algo se apoya sobre el rosa, el texto va en **negro**, no en blanco
- ❌ No va en: texto corrido, etiquetas, cifras pequeñas, enlaces dentro de un párrafo

Para cuando se necesite el mismo color en texto, existe una versión oscura del **mismo tono**:

| | Contraste sobre blanco |
|---|---|
| `#C2004A` | 6.19:1 ✅ |
| `#AD0043` | 7.35:1 ✅ |

Es el mismo color de la marca, más oscuro. No es un color nuevo: es el mismo tono con otro trabajo.

## Por qué esto importa más de lo que parece

La app existe para que alguien mire un número y sepa si va bien. **Si ese número no se lee, la app no
sirve** — por bonita que esté. Por eso el color se midió antes de elegirlo y no después de dibujarlo,
y por eso cada valor de esta tabla tiene un número al lado en vez de una opinión.

## La textura

El archivo de marca también trae los mismos triángulos en grande y a baja opacidad —15% del rosa y
30% de un rosa claro— usados como fondo. Es un recurso de identidad que ya viene resuelto: da
carácter a un estado vacío o a una cabecera **sin introducir un solo color nuevo**.

Se conserva y se usa. Está en `public/brand/pattern-source.svg`.
