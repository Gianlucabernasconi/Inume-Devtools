# Plan de corrección documental y hardening pre-release

> Estado base asumido para este plan:
>
> - **Discovery amplio por valor runtime color es la ley**.
> - Los hallazgos de auditoría que dependen de asumir `--color-*` como default obligatorio deben descartarse como **falsos positivos causados por documentación desactualizada**.
> - Este plan busca corregir la documentación y ejecutar mejoras sin romper funcionalidades actuales del producto.

---

## Tabla de contenidos

- [1. Principio rector](#1-principio-rector)
- [2. Separación entre hallazgos reales y ruido documental](#2-separación-entre-hallazgos-reales-y-ruido-documental)
- [3. Plan de documentación](#3-plan-de-documentación)
- [4. Plan de implementación prioritaria](#4-plan-de-implementación-prioritaria)
  - [Fase A — Cleanup completo del overlay](#fase-a--cleanup-completo-del-overlay)
  - [Fase B — Endurecer `allowRaw + storage`](#fase-b--endurecer-allowraw--storage)
  - [Fase C — Optimizar picker sin romper UX](#fase-c--optimizar-picker-sin-romper-ux)
  - [Fase D — Reducir rebuild completo de lista](#fase-d--reducir-rebuild-completo-de-lista)
  - [Fase E — Corregir sample React](#fase-e--corregir-sample-react)
  - [Fase F — Validación de colores funcionales](#fase-f--validación-de-colores-funcionales)
  - [Fase G — i18n de estados visibles](#fase-g--i18n-de-estados-visibles)
  - [Fase H — Accesibilidad mínima](#fase-h--accesibilidad-mínima)
- [5. Decisiones de release pendientes](#5-decisiones-de-release-pendientes)
- [6. Validación final](#6-validación-final)
- [7. Orden recomendado de ejecución](#7-orden-recomendado-de-ejecución)

---

## 1. Principio rector

`discovery amplio por valor runtime color` es el contrato real del producto.

### Comportamiento esperado del contrato

| Caso | Comportamiento esperado |
|---|---|
| `createCssVarsSession()` sin `prefixes` | Descubre custom properties cuyo valor computado runtime sea color, sin depender del nombre |
| `prefixes: ['--color-']` | Acota el scope a nombres que empiezan por `--color-` |
| `include` | Agrega nombres exactos aunque no entren por prefijo |
| `exclude` | Elimina nombres del scope |
| `match` | Filtro final sobre el scope ya resuelto |
| `exportCss()` / `exportJson()` | Solo exportan valores seguros/exportables |

---

## 2. Separación entre hallazgos reales y ruido documental

### Hallazgos descartados por documentación vieja

| Hallazgo de agentes | Estado |
|---|---|
| “Default debería ser `--color-*`” | **Falso positivo** por documentación desactualizada |
| “Tests actuales protegen discovery amplio” | **Correcto** y deben mantenerse/alinearse con la decisión real |

### Hallazgos reales que siguen vigentes

| Hallazgo | Estado |
|---|---|
| Docs contradictorias sobre discovery | Real |
| `allowRaw + storage` | Real |
| teardown incompleto del overlay | Real |
| picker/lista con renders pesados | Real |
| sample React sin `handle.destroy()` | Real |
| i18n incompleto | Real |
| accesibilidad mejorable | Real |
| `./package.json` como tercer subpath | Resuelto: eliminado de `exports` |
| sourcemaps publicables | Resuelto: `sourcemap: false` en build |

### Indicadores de logro

- [x] Ningún documento afirma que `--color-*` es el default obligatorio.
- [x] Los ejemplos con `prefixes: ['--color-']` se explican como **scope narrowing opcional**, no como default.
- [x] Los agentes futuros no deberían volver a reportar `--color-*` como bug contractual.

---

## 3. Plan de documentación

### Checklist paso por paso

1. [x] Actualizar `AGENTS.md`
2. [x] Actualizar `ESTADO_ACTUAL.md`
3. [x] Actualizar `README.md`
4. [x] Actualizar `docs/architecture.md`
5. [x] Actualizar `@inume-css-vars-devtools-especificacion-final-v1.md`
6. [x] Actualizar `@inume-css-vars-devtools-contexto-producto-para-llms.md`
7. [x] Actualizar `@inume-css-vars-devtools-ux-y-usabilidad-v1.md`
8. [x] Revisar `docs/quick-start.es.md`
9. [x] Revisar `docs/integration-vanilla.md`
10. [x] Revisar `docs/integration-vite.md`
11. [x] Revisar `docs/integration-react.md`
12. [x] Revisar `docs/integration-nuxt.md`
13. [x] Revisar `examples/*/README.md`

### Cambios esperados

| Archivo | Cambio esperado |
|---|---|
| `AGENTS.md` | Cambiar invariant: discovery default amplio por valor runtime color |
| `ESTADO_ACTUAL.md` | Eliminar “gap” de `--color-*`; marcar discovery amplio como decisión cerrada |
| `README.md` | Explicar `prefixes` como filtro opcional para acotar scope |
| `docs/architecture.md` | Eliminar pre-release gap sobre `--color-*` |
| Spec v1 | Alinear discovery, tests obligatorios y ejemplos |
| Contexto LLM | Reforzar que naming `--color-*` no limita el reconocimiento |
| UX doc | Mantener solo reglas de superficie visual actuales |

### Comportamiento esperado

| Área | Resultado esperado |
|---|---|
| Documentación principal | describe discovery amplio como comportamiento real |
| Ejemplos con `prefixes` | se entienden como narrowing opcional |
| `ESTADO_ACTUAL.md` | ya no trata discovery amplio como bug |
| Documentos para agentes | no inducen auditorías equivocadas |

### Indicadores de logro

- [x] `grep` no encuentra frases tipo “default contractual `--color-*`”.
- [x] `README.md` dice claramente que `prefixes` **acota** discovery.
- [x] `ESTADO_ACTUAL.md` ya no lista discovery amplio como problema.
- [x] La documentación de integración es coherente entre sí.

---

## 4. Plan de implementación prioritaria

## Fase A — Cleanup completo del overlay

### Problema

Hay listeners globales que pueden quedar vivos tras `destroy()`.

### Checklist paso por paso

1. [x] Convertir el listener global `pointerdown` anónimo en handler nombrado.
2. [x] Remover ese handler en `destroy()`.
3. [x] Llamar `stopToggleDrag()` dentro de `destroy()`.
4. [x] Centralizar cleanup de drag del picker.
5. [x] Cancelar timers/frames pendientes si existen.
6. [x] Agregar tests de destroy repetido.

### Comportamiento esperado

| Acción | Resultado esperado |
|---|---|
| montar y destruir overlay 10 veces | no quedan listeners duplicados |
| destruir durante drag de panel | no muta estado después |
| destruir durante drag del launcher | no quedan `pointermove/pointerup` vivos |
| destruir con menú abierto | no queda listener global activo |

### Indicadores de logro

- [x] Tests nuevos pasan.
- [x] No hay callbacks anónimos globales imposibles de remover.
- [x] `destroy()` limpia todo recurso que el overlay creó.

---

## Fase B — Endurecer `allowRaw + storage`

### Problema

Valores no exportables pueden persistirse y restaurarse si `allowRaw` está activo.

### Checklist paso por paso

1. [x] Mantener `allowRaw` funcional dentro de la sesión actual.
2. [x] Filtrar persistencia para guardar solo `item.exportable === true`.
3. [x] Filtrar restore para ignorar valores no exportables ya existentes en storage.
4. [x] Documentar que raw es `working-state`, no persistencia segura.
5. [x] Agregar tests para storage con valores raw.

### Comportamiento esperado

| Caso | Resultado esperado |
|---|---|
| `allowRaw: true` sin storage | raw funciona como estado temporal |
| `allowRaw: true` con storage | raw no se persiste |
| storage viejo contiene `url(...)` | se ignora al restaurar |
| `exportCss()` / `exportJson()` | siguen omitiendo raw |

### Indicadores de logro

- [x] Storage no reinyecta valores no exportables.
- [x] No se rompe la edición raw temporal.
- [x] Tests cubren restore con payload inseguro.

---

## Fase C — Optimizar picker sin romper UX

### Problema

El picker llama `render()` completo en cada `pointermove`.

### Checklist paso por paso

1. [x] Separar update rápido del picker de render completo.
2. [x] En `pointermove`, actualizar solo valor seleccionado, input, swatch y thumb.
3. [x] Usar `requestAnimationFrame` para agrupar updates.
4. [x] Ejecutar render completo solo en `pointerup`, reset, búsqueda o cambio de selección.
5. [x] Mantener `onCommit` solo al cierre lógico del cambio, no por cada pixel.
6. [x] Agregar test o smoke mínimo del flujo de picker.

### Comportamiento esperado

| Acción | Resultado esperado |
|---|---|
| arrastrar picker | UI responde fluida |
| color cambia live en host | sí |
| lista no se reconstruye en cada pixel | sí |
| soltar pointer | estado final queda correcto |
| export tras drag | exporta último valor |

### Indicadores de logro

- [x] No hay `render()` directo en el hot path de `pointermove`.
- [x] El último valor siempre gana.
- [x] No cambia la API pública.

---

## Fase D — Reducir rebuild completo de lista

### Problema

La lista se reconstruye completa en cada render.

### Checklist paso por paso

1. [x] Mantener render completo solo cuando cambia el set visible.
2. [x] Usar event delegation en `listElement`.
3. [x] Evitar un listener por fila.
4. [x] Al cambiar color, actualizar solo la fila seleccionada si hace falta.
5. [x] Mantener selección y scroll estables cuando sea posible.

### Comportamiento esperado

| Caso | Resultado esperado |
|---|---|
| buscar texto | lista se actualiza |
| seleccionar variable | no se pierde estado innecesariamente |
| editar color seleccionado | no reconstruye toda la lista |
| muchas variables | menos DOM churn |

### Indicadores de logro

- [x] Menos creación de nodos por interacción.
- [x] Búsqueda sigue funcionando igual.
- [x] Tests del overlay siguen pasando.

---

## Fase E — Corregir sample React

### Problema

El sample real monta el overlay pero no destruye el handle.

### Checklist paso por paso

1. [x] Guardar `handle` en `useEffect`.
2. [x] Destruir `handle?.destroy()` en cleanup.
3. [x] Mantener guard `cancelled`.
4. [x] Alinear sample con `docs/integration-react.md`.

### Comportamiento esperado

| Caso | Resultado esperado |
|---|---|
| React StrictMode/HMR | no duplica overlays |
| unmount | desmonta overlay |
| import dinámico tarda | cleanup sigue seguro |

### Indicadores de logro

- [x] Sample y docs muestran el mismo patrón.
- [x] No queda handle vivo tras cleanup.

---

## Fase F — Validación de colores funcionales

### Problema

`rgb()/hsl()` puede aceptarse con gramática inválida.

### Checklist paso por paso

1. [x] Agregar tests negativos: `rgb(foo)`, `hsl(not-a-color)`, `rgba(1 2)`.
2. [x] Endurecer parser de `rgb()/rgba()/hsl()/hsla()`.
3. [x] Mantener soporte para sintaxis moderna válida tipo `rgb(38 38 38 / 1)`.
4. [x] No cambiar discovery amplio.
5. [x] Confirmar que export solo incluye valores válidos.

### Comportamiento esperado

| Valor | Resultado esperado |
|---|---|
| `rgb(38 38 38 / 1)` | exportable |
| `rgba(38, 38, 38, 1)` | exportable |
| `hsl(240 100% 50%)` | exportable |
| `rgb(foo)` | no exportable |
| `url(...)` | no exportable |

### Indicadores de logro

- [x] Los formatos válidos actuales no se rompen.
- [x] Valores inválidos dejan de exportarse.

---

## Fase G — i18n de estados visibles

### Problema

Hay `status messages` hardcodeados en inglés.

### Checklist paso por paso

1. [x] Identificar todos los `statusText = '...'`.
2. [x] Crear mensajes internos localizados para estados.
3. [x] Evitar ampliar API pública si no hace falta.
4. [x] Mantener `messages` custom para labels principales.
5. [x] Agregar tests de locale `es` en overlay.

### Comportamiento esperado

| Locale | Resultado esperado |
|---|---|
| `en` | estados en inglés |
| `es` | estados visibles en español |
| `messages` custom | sigue sobrescribiendo labels configurables |

### Indicadores de logro

- [x] No quedan estados visibles hardcodeados en inglés.
- [x] Tests validan al menos un flujo de reset/copy en ES.

---

## Fase H — Accesibilidad mínima

### Problema

Inputs y picker tienen nombres accesibles mejorables.

### Checklist paso por paso

1. [x] Agregar `aria-label` al input hex.
2. [x] Agregar `aria-label` al search.
3. [x] Agregar `aria-label` al hue range.
4. [x] Revisar botones de menú/copy/reset.
5. [x] Agregar test de presencia de labels principales.

### Comportamiento esperado

| Elemento | Resultado esperado |
|---|---|
| search | tiene nombre accesible |
| input hex | tiene nombre accesible |
| hue slider | tiene nombre accesible |
| botones principales | conservan labels |

### Indicadores de logro

- [x] Snapshot/tests pueden encontrar controles por label.
- [x] No empeora la UI visual.

---

## 5. Decisiones de release pendientes

| Punto | Recomendación |
|---|---|
| `./package.json` en exports | resuelto: eliminado |
| sourcemaps en npm | resuelto: desactivados en build |
| tipos browser exportados desde core | resuelto: tipos browser solo desde `./browser` |
| `.gitignore` | resuelto: agregado `.playwright-mcp/`, `*.tgz`, logs y screenshots temporales |

### Recomendación sugerida

| Punto | Decisión sugerida |
|---|---|
| `./package.json` | eliminado para mantener “dos entrypoints” estrictos |
| sourcemaps | desactivados para build publicable |
| tipos browser en core | movidos a `./browser` |
| `.gitignore` | endurecido |

---

## 6. Validación final

### Checklist técnico

1. [x] `npm run build`
2. [x] `npm run test`
3. [x] `npm run check`
4. [x] `npm run lint`
5. [x] `npm run test:smoke`
6. [x] `npm pack --dry-run`
7. [x] inspeccionar tarball dry-run

### Checklist documental

1. [x] `grep` sin contradicciones de `--color-*` como default.
2. [x] `README` alineado con spec.
3. [x] `AGENTS.md` alineado con la decisión de discovery amplio.
4. [x] docs de integración explican `prefixes` como narrowing opcional.
5. [x] `ESTADO_ACTUAL.md` refleja fase real.

### Comportamiento esperado final

| Área | Resultado esperado |
|---|---|
| Discovery | amplio por valor runtime color |
| Scope narrowing | `prefixes/include/exclude/match` funcionan |
| Overlay destroy | limpia todos los recursos |
| Picker | fluido, sin render completo por pixel |
| Storage | no restaura raw inseguro |
| React sample | cleanup correcto |
| i18n | estados visibles localizados |
| Export | solo valores exportables |
| Docs | no contradicen el código |

---

## 7. Orden recomendado de ejecución

1. Documentación de discovery amplio.
2. Tests que protejan discovery amplio.
3. Cleanup completo del overlay.
4. `allowRaw + storage`.
5. Picker/lista performance.
6. React sample cleanup.
7. Validación funcional de colores.
8. i18n y accesibilidad.
9. Decisiones de package/sourcemaps/exports.
10. Validación final completa.

> Recomendación práctica: el primer bloque a ejecutar debe ser **documentación + tests de discovery amplio**, porque elimina la causa raíz de falsos hallazgos futuros y fija el contrato real antes de tocar implementación sensible.
