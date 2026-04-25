# `@inume/css-vars-devtools` — UX y Usabilidad v1

> Documento derivado de la discusión de diseño y de la revisión de UX sobre la herramienta.
>
> Este archivo complementa, pero no reemplaza, la especificación técnica principal.
>
> **Estado de vigencia:** esta guía describe la dirección UX actual del overlay. Si alguna sección antigua contradice la UI implementada, manda la superficie real del repo y `ESTADO_ACTUAL.md`.

---

## Tabla de contenidos

- [1. Objetivo del documento](#1-objetivo-del-documento)
- [2. Principios UX cerrados para v1](#2-principios-ux-cerrados-para-v1)
- [3. Layout del panel](#3-layout-del-panel)
- [4. Interacciones principales](#4-interacciones-principales)
- [5. Reglas de lista y overflow](#5-reglas-de-lista-y-overflow)
- [6. Estados UX mínimos](#6-estados-ux-mínimos)
- [7. Movimiento y persistencia de posición](#7-movimiento-y-persistencia-de-posición)
- [8. Desktop-first y pantallas pequeñas](#8-desktop-first-y-pantallas-pequeñas)
- [9. Qué queda fuera de la superficie principal en v1](#9-qué-queda-fuera-de-la-superficie-principal-en-v1)
- [10. Resumen operativo](#10-resumen-operativo)

---

## 1. Objetivo del documento

Cerrar la dirección de **UX y usabilidad** de `@inume/css-vars-devtools` para la primera versión visual del overlay browser.

Este documento define:

- tamaño y estructura del panel
- prioridades de densidad visual
- reglas de selección y scroll
- decisiones sobre copy/export visibles en UI
- comportamiento de drag y posición
- estados mínimos que no deben improvisarse

---

## 2. Principios UX cerrados para v1

### 2.1 Herramienta pequeña y utilitaria

La UI de v1 debe sentirse como un **devtool compacto**, no como una app dentro de otra app.

### 2.2 Un solo punto de edición activa

La edición visual debe ocurrir sobre **una variable seleccionada a la vez**.

La lista sirve para:

- explorar
- localizar
- seleccionar

El editor superior sirve para:

- ver detalle
- editar
- resetear la variable activa

### 2.3 Densidad visual controlada

La interfaz no debe inflarse con:

- pickers por fila
- demasiadas acciones globales visibles
- textos largos sin truncado
- múltiples modos permanentes en el mismo panel

### 2.4 Export visible mínimo

La superficie principal visible de v1 tendrá **un solo botón global**:

- `Copy CSS`

No habrá en la UI principal de v1:

- `Copy JSON`
- `Paste CSS`
- `Paste JSON`

---

## 3. Layout del panel

## 3.1 Forma general

- panel flotante rectangular
- pequeño
- movable
- siempre dentro del viewport

### 3.2 Dimensiones objetivo

- ancho recomendado: `320px` a `360px`
- alto máximo recomendado: `70vh`

El panel **no debe crecer** con la cantidad de variables.

### 3.3 Estructura vertical

```text
┌──────────────────────────────┐
│ Header fijo + drag handle    │
├──────────────────────────────┤
│ Editor de variable activa    │
├──────────────────────────────┤
│ Buscador                     │
├──────────────────────────────┤
│ Lista de variables           │
│ con scroll interno           │
├──────────────────────────────┤
│ Footer mínimo: Copy CSS      │
└──────────────────────────────┘
```

### 3.4 Zonas fijas

Deben quedar fijos:

- header
- editor superior
- buscador
- footer

La única zona scrollable del panel debe ser:

- **la lista de variables**

---

## 4. Interacciones principales

## 4.1 Header

Debe incluir:

- título corto
- identidad visual compacta del producto (por ejemplo, título + sprite/ícono)
- botón de cerrar

No debe incluir en la superficie principal de v1:

- selector visible de idioma
- demasiados controles secundarios
- acciones globales destructivas

### 4.2 Drag

- el panel se mueve solo desde el header
- la zona draggable debe estar claramente separada del botón cerrar
- los controles del header no deben disparar drag accidental

### 4.3 Editor superior

Debe mostrar:

- nombre completo de la variable seleccionada
- swatch mediano
- color picker principal
- valor actual visible como texto
- botón `Reset` de la variable activa

No debe transformarse en una mini pantalla compleja.

### 4.4 Lista

Click sobre una fila:

- selecciona la variable
- actualiza el editor superior

La lista no debe editar directamente.

### 4.5 Búsqueda

En v1, el buscador debe:

- buscar solo por nombre
- filtrar en tiempo real
- ser simple
- no tener operadores ni modos avanzados

Placeholder recomendado:

```text
Buscar variable
```

### 4.6 Acción global visible

El footer visible de v1 tendrá una sola acción primaria claramente dominante:

- `Copy CSS`

Las demás acciones globales pueden existir como secundarias dentro de un menú contextual, siempre que no compitan visualmente con la acción principal.

---

## 5. Reglas de lista y overflow

## 5.1 Problema a evitar

Las CSS variables reales pueden tener nombres largos. El panel no debe romperse ni perder legibilidad por eso.

### 5.2 Regla por fila

Cada fila debe mostrar solo:

- swatch pequeño
- nombre de variable
- estado de selección

No debe mostrar en la fila:

- valor textual completo
- múltiples acciones
- picker

### 5.3 Tratamiento del nombre

- una sola línea por fila
- truncado con `ellipsis`
- el nombre completo vive en el editor superior

Si se implementa ayuda adicional, puede existir tooltip al hover, pero no es requisito central de v1.

### 5.4 Prioridad visual

En la lista, la prioridad es:

1. nombre
2. estado seleccionado
3. swatch

El valor no compite en esa capa.

---

## 6. Estados UX mínimos

Antes de implementar la UI, deben quedar previstos como estados explícitos:

- sin variables detectadas
- sin resultados de búsqueda
- variable seleccionada normal
- copia CSS exitosa
- posición restaurada desde storage
- panel reencajado por cambio de viewport
- valor no editable visualmente
- panel cerrado y reabierto

### 6.1 Regla de selección al abrir

Al abrir el panel:

- se selecciona automáticamente la primera variable visible

### 6.2 Regla de selección al filtrar

- si la variable seleccionada sigue visible, se mantiene
- si deja de estar visible, se selecciona la primera coincidencia del filtro
- si no hay coincidencias, el editor entra en estado vacío claro

---

## 7. Movimiento y persistencia de posición

### 7.1 Movimiento

- el panel puede moverse libremente por la pantalla
- el movimiento queda limitado al viewport

### 7.2 Persistencia

Si el storage del overlay está activo:

- la posición debe recordarse entre sesiones

Si la posición restaurada cae fuera de pantalla:

- el panel debe reencajarse automáticamente dentro del viewport

### 7.3 Acción secundaria opcional

Puede existir una acción secundaria de reset de posición si la implementación la necesita, pero no es un requisito obligatorio de la superficie principal de v1.

---

## 8. Desktop-first y pantallas pequeñas

La herramienta debe diseñarse **desktop-first**.

Eso no significa ignorar estos contextos:

- laptops pequeñas
- split-screen
- zoom alto
- viewport angosto con DevTools abiertas

### Reglas mínimas

- ancho contenido, no excesivo
- altura suficiente para que la lista siga siendo útil
- posición restaurada siempre validada contra viewport actual
- la UI debe seguir siendo usable con espacio horizontal reducido

---

## 9. Qué queda fuera de la superficie principal en v1

Para mantener la UI limpia, quedan fuera de la superficie principal visible:

- `Copy JSON` como acción visible primaria en el footer
- `Paste CSS`
- `Paste JSON`
- selector visible de idioma
- pickers por fila
- sidebar grande
- panel resizable
- demasiadas acciones visibles en footer

Si algunas acciones administrativas o destructivas siguen existiendo por contrato funcional, no deben competir visualmente con la acción principal `Copy CSS` y pueden vivir dentro de un menú contextual.

---

## 10. Resumen operativo

La UX v1 debe sentirse así:

- panel pequeño
- draggable
- editor arriba
- lista abajo con scroll interno
- una fila simple por variable
- nombres largos controlados con truncado
- una acción global primaria visible: `Copy CSS`
- acciones secundarias relegadas a menú contextual

Versión corta:

> La UI de v1 debe ser compacta, clara y poco ruidosa: header draggable simple, editor superior para una sola variable activa, lista scrollable sin overflow visual, y un footer mínimo con `Copy CSS` como acción principal visible y acciones secundarias fuera de competencia visual.
