# Tripflow

Webapp para controlar el presupuesto de un viaje: se define un tope, se registran los gastos y la app
avisa antes de que el dinero se acabe.

Reto técnico para Alegra — Adriana Forero, agosto de 2026.

**En vivo:** https://tripflow-drab.vercel.app

## Estado

En construcción. Este repositorio arranca con la investigación, antes que con el código, porque las
decisiones de producto se tomaron primero.

- [x] Análisis del problema y de las restricciones
- [x] Alcance firmado — qué entra, qué queda fuera y por qué
- [x] Proyecto montado y desplegado
- [ ] Investigación de referencias y de usuarios
- [ ] Personas y usuario principal
- [ ] Dirección visual y sistema de diseño
- [ ] Las tres pantallas

El link público existe desde el primer día, aunque todavía no muestre nada. Es a propósito: prefiero
que el despliegue sea lo primero resuelto y no lo último, para que ningún problema de infraestructura
aparezca el día de la entrega.

## Documentos

| Documento | Qué contiene |
|---|---|
| [`docs/01-research.md`](docs/01-research.md) | Investigación: el problema, las referencias, las personas y de dónde salió cada decisión |
| [`docs/02-proceso-ia.md`](docs/02-proceso-ia.md) | Qué le pedí a la IA, qué me devolvió y qué corregí yo |
| [`docs/03-alcance.md`](docs/03-alcance.md) | Qué entra, qué queda fuera y por qué |

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre http://localhost:3000. No hace falta configurar nada: la app guarda los datos en el navegador.
