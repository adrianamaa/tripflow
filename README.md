# Tripflow

Webapp para controlar el presupuesto de un viaje: se define un tope, se registran los gastos y la app
avisa **antes** de que el dinero se acabe, no después.

Reto técnico para Alegra — Adriana Forero, agosto de 2026.

**En vivo:** https://usetripflow.vercel.app

---

## Cómo correrlo

Requiere **Node 22.6 o superior** — las pruebas corren TypeScript directo con
`--experimental-strip-types`, que existe desde esa versión.

```bash
npm install
npm run dev      # http://localhost:3000
```

No hace falta configurar nada: ni variables de entorno, ni base de datos, ni cuenta. La app abre con
dos viajes de ejemplo cargados para que se pueda usar de inmediato.

```bash
npm test         # 18 pruebas: motor de presupuesto y formato de moneda
npm run build    # build de producción
npx eslint src   # linter
```

---

## Qué hace

Tres pantallas, que son las tres funcionalidades del enunciado:

1. **Tablero de control** — cuánto puedes gastar por día de aquí en adelante, cuánto llevas contra el
   tope, en qué se está yendo y qué has registrado.
2. **Creación de viajes** con presupuesto límite, fechas y gasto ya adelantado.
3. **Registro de gastos** — monto, categoría, Enter. Tres acciones.

### La decisión de producto que lo sostiene

**El número protagonista no es «cuánto llevas gastado» sino «cuánto puedes gastar por día de aquí en
adelante»**, recalculado con cada gasto. Es la única cifra que responde la pregunta que uno se hace
de verdad, que es «¿puedo pedir este plato?».

Y la alerta no avisa por umbral —«llegaste al 80%»— sino **por ritmo**: dice qué día te quedas sin
plata y a cuánto diario tendrías que ir para llegar al final. Las alertas de umbral llegan tarde y la
gente las apaga.

### El problema del hotel

Alojamiento y vuelos suelen pagarse antes de salir. Si entraran al ritmo diario, pagar el hotel el
primer día haría que la app declarara emergencia durante todo un viaje que va bien.

Por eso un gasto puede marcarse como **pago único**: se descuenta del tope pero no cuenta para el
ritmo. Hay una prueba que deja el error escrito por contraste — el mismo viaje, con y sin la marca,
proyecta 2.040.000 contra 3.640.000.

---

## Decisiones técnicas

| Decisión | Por qué |
|---|---|
| **Next.js + React + TypeScript** | Lo que ya domino. El reto premia lo que se entrega, no aprender un stack nuevo en cinco días. |
| **Tailwind v4 con tokens en `@theme`** | El sistema de color, radios y tipografía vive en un solo archivo. Si un valor no está ahí, no se usa. |
| **`localStorage` detrás de una capa de datos** | Se abre el link y la app está viva en dos segundos: sin registro, sin backend que se caiga. La capa está aislada en `src/lib/almacen.ts`, así que cambiarla por una API sería tocar un archivo. |
| **Sin librerías de componentes** | El enunciado prohíbe UI kits genéricos. Todo lo visual está construido acá, incluidos el calendario, la casilla y los iconos. |
| **Todas las fechas en UTC, nunca `new Date(string)`** | `new Date("2026-08-16")` es medianoche UTC, o sea el día anterior a las 7 p.m. en Colombia. El viaje aparecía con un día menos. Todo el manejo vive en `src/lib/fechas.ts`. |

**Lo que cuesta `localStorage`:** los datos viven en un navegador y no viajan entre dispositivos, y el
servidor no puede pintarlos —por eso hay un estado de carga real y no un vacío haciendo de vacío—.
Es un recorte consciente, no un olvido.

---

## Estructura

```
src/
  app/          layout, estilos y tokens del sistema, favicon
  components/   la interfaz, construida a mano
  lib/          motor de presupuesto, fechas, moneda y almacenamiento
docs/           investigación, proceso con IA, alcance y color
```

El motor está separado de la interfaz a propósito: es la parte que tiene reglas de negocio y es la
única que se puede probar sin un navegador.

---

## Documentos

| Documento | Qué contiene |
|---|---|
| [`docs/01-research.md`](docs/01-research.md) | La investigación previa y de dónde salió cada decisión |
| [`docs/02-proceso-ia.md`](docs/02-proceso-ia.md) | Qué le pedí a la IA, qué me devolvió y qué corregí yo |
| [`docs/03-alcance.md`](docs/03-alcance.md) | Qué entra, qué queda fuera y por qué |
| [`docs/04-color.md`](docs/04-color.md) | El sistema de color, con los contrastes medidos |

---

## Accesibilidad

- Contraste medido, no estimado. Los números están en los comentarios de `src/app/globals.css`.
- **Ningún estado se comunica solo con color:** cada uno lleva icono de silueta distinta y palabra.
- Recorrido completo con teclado, incluido el calendario (flechas, Re/Av Pág, Enter, Esc).
- Respeta `prefers-reduced-motion`.

---

© 2026 Adriana Forero. Entregado para evaluación dentro del proceso de selección de Alegra.
Todos los derechos reservados.
