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

## 4. Investigación de referencias

> En curso. Frentes abiertos: apps de presupuesto de viaje y sus quejas reales · patrones de entrada
> rápida de datos · visualización de gastado contra presupuesto · estrategias de responsive ·
> dirección visual · lenguaje de las alertas · accesibilidad para datos financieros.

## 5. Personas

> Pendiente. Salen del punto 4, con la evidencia citada al lado de cada una.

## 6. Decisiones de diseño

> Pendiente. Formato: decisión — fuente — por qué.

## 7. Qué queda conscientemente fuera

> Pendiente.
