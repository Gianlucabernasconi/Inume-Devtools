# Estado actual del proyecto

> Documento operativo para seguir el avance de `@inume/css-vars-devtools`.
>
> **Regla de uso:** cada vez que se termine una tarea relevante, este archivo debe actualizarse en el mismo cambio o commit.

---

## Tabla de contenidos

- [Resumen ejecutivo](#resumen-ejecutivo)
- [Fuentes de verdad](#fuentes-de-verdad)
- [Cómo mantener este archivo](#cómo-mantener-este-archivo)
- [Estado actual verificado](#estado-actual-verificado)
- [Checklist por fases](#checklist-por-fases)
- [Próxima fase activa](#próxima-fase-activa)
- [Criterio de “hecho” para marcar una tarea](#criterio-de-hecho-para-marcar-una-tarea)

---

## Resumen ejecutivo

**Estado general:** base técnica inicial lista.

El proyecto ya salió de la etapa de documentación-only y hoy tiene:

- scaffold de paquete npm
- entrypoints públicos definidos
- core headless funcional
- export CSS/JSON funcional
- tests dirigidos del core
- sample `vanilla` mínimo para validación manual
- linting y typecheck básicos

Todavía **no** están implementados:

- overlay visual real
- storage browser opt-in
- i18n `en/es`
- copy/download reales
- smoke tests con Playwright
- validación final con `npm pack`

---

## Fuentes de verdad

Este estado se basa en:

- `@inume-css-vars-devtools-especificacion-final-v1.md`
- `@inume-css-vars-devtools-contexto-producto-para-llms.md`
- `README.md`
- `src/core/create-session.ts`
- `src/browser/mount-devtool.ts`
- `tests/core.test.ts`

> Si hay conflicto entre este archivo y la especificación, manda la especificación.

---

## Cómo mantener este archivo

### Actualizar siempre estos campos

Cuando se cierre una tarea importante, actualizar:

1. el checkbox correspondiente
2. el bloque **Estado actual verificado** si cambia la etapa real
3. la sección **Próxima fase activa**
4. la fecha o nota de avance si aporta contexto

### Convención de checkboxes

- `[x]` terminado y validado
- `[ ]` pendiente
- `[-]` iniciado pero incompleto o parcial

### Qué no hacer

- no marcar algo como hecho solo porque exista un archivo
- no marcar una fase completa si solo hay scaffold parcial
- no usar este archivo para ideas opcionales fuera de la spec

---

## Estado actual verificado

### Etapa real del proyecto

El proyecto está en **fase de fundación técnica del core**.

Más concretamente:

- **Infraestructura base:** lista
- **Core headless:** funcional
- **Browser/UI real:** pendiente
- **Release v1:** lejos todavía

### Evidencia actual en el repo

#### Packaging y tooling

- `package.json` con `typescript`, `tsup`, `vitest`, `playwright`, `eslint`
- `tsconfig.json`
- `tsup.config.ts`
- `vitest.config.ts`
- `eslint.config.js`

#### Core implementado

- discovery one-shot sobre `Document`
- filtros por `prefixes`, `include`, `exclude`, `match`
- baseline inmutable por sesión
- `setVar()`, `resetVar()`, `resetAll()`, `destroy()`
- `exportCss()` y `exportJson()` desde estado en memoria
- validación de valores exportables y soporte raw controlado con `allowRaw`

#### Browser implementado parcialmente

- entry `@inume/css-vars-devtools/browser` existe
- import SSR-safe e inert al importarse
- `mountCssVarsDevtool()` existe
- `productionGuard` base existe
- **overlay visual todavía no existe**

#### Sample manual implementado

- `examples/vanilla/index.html`
- `examples/vanilla/app.js`
- `examples/vanilla/styles.css`
- `examples/vanilla/README.md`
- validación manual del core usando el build de `dist/`

#### Tests actuales

- tests del core en `tests/core.test.ts`
- cobertura dirigida de discovery, filtros, baseline, reset, export y `destroy()`

---

## Checklist por fases

## Fase 1 — Scaffold y packaging

- [x] `package.json` creado
- [x] exports públicos `.` y `./browser`
- [x] `type: module`
- [x] `tsup` configurado
- [x] `README.md` base creado
- [x] `LICENSE` incluida
- [x] `.gitignore` creado

**Estado de fase:** completada.

---

## Fase 2 — Tipos públicos

- [x] `CssVarsSessionOptions`
- [x] `CssVarItem`
- [x] `CssVarsSession`
- [x] `CssVarsDevtoolBrowserOptions`
- [x] `CssVarsDevtoolOptions`
- [x] `CssVarsDevtoolHandle`
- [x] re-export desde `src/index.ts`
- [x] re-export desde `src/browser.ts`

**Estado de fase:** completada.

---

## Fase 3 — Normalización y validación pura

- [x] normalización segura de nombres de custom properties
- [x] normalización básica de valores
- [x] validación de valores exportables
- [x] bloqueo de patrones inseguros (`url(`, `expression(`, `@`, `;`, comentarios)
- [x] serialización estable de CSS
- [x] serialización estable de JSON

**Estado de fase:** completada.

---

## Fase 4 — Discovery

- [x] target oficial sobre `Document`
- [x] uso de `documentElement`
- [x] discovery one-shot
- [x] filtro por prefijos por defecto `--color-*`
- [x] soporte de `include`
- [x] soporte de `exclude`
- [x] soporte de `match`
- [x] mapa estable de baseline

**Estado de fase:** completada.

---

## Fase 5 — Sesión headless

- [x] `createCssVarsSession()`
- [x] `getVars()`
- [x] `getVar()`
- [x] `setVar()`
- [x] `resetVar()`
- [x] `resetAll()`
- [x] `destroy()` idempotente
- [x] contrato post-destroy básico

**Estado de fase:** completada.

---

## Fase 6 — Export CSS y JSON

- [x] `exportCss()`
- [x] `exportJson()`
- [x] orden estable
- [x] export solo de valores exportables
- [x] exclusión de raw no exportable

**Estado de fase:** completada.

---

## Fase 7 — Tests del core headless

- [x] tests de prefixes por defecto
- [x] tests de `prefixes`
- [x] tests de `include` y `exclude`
- [x] tests de baseline inmutable
- [x] tests de `resetVar()`
- [x] tests de no-op fuera de scope
- [x] tests de `allowRaw`
- [x] tests de export estable
- [x] tests de `destroy()`

**Estado de fase:** completada.

---

## Fase 8 — Sample `vanilla`

- [x] crear `examples/vanilla`
- [x] demostrar integración oficial dev-only
- [x] validar flujo mínimo manual

**Estado de fase:** completada.

---

## Fase 9 — Production guard

- [x] implementación base existente
- [x] cubrir explícitamente `strict`
- [x] cubrir explícitamente `warn`
- [x] cubrir explícitamente `off`
- [x] tests del contrato inert del handle

**Estado de fase:** completada.

---

## Fase 10 — Overlay browser

- [ ] botón flotante
- [ ] panel flotante
- [ ] Shadow DOM
- [ ] header draggable
- [ ] buscador
- [ ] lista scrollable
- [ ] editor de variable activa
- [ ] `Reset`
- [ ] `Reset all`
- [ ] feedback visual mínimo

**Estado de fase:** pendiente.

---

## Fase 11 — Storage versionado del browser

- [ ] storage opt-in
- [ ] key versionada
- [ ] tolerancia a storage corrupta
- [ ] `clearPersisted()` real
- [ ] persistencia de posición

**Estado de fase:** pendiente.

---

## Fase 12 — i18n mínimo

- [ ] locale `en`
- [ ] locale `es`
- [ ] `locale: 'auto'`
- [ ] precedencia `messages` custom → locale → fallback `en`

**Estado de fase:** pendiente.

---

## Fase 13 — Downloads / copy

- [ ] `Copy CSS` real
- [ ] `Copy JSON` real
- [ ] `Download CSS` real
- [ ] `Download JSON` real
- [ ] sanitización de filenames
- [ ] solo bajo gesto explícito

**Estado de fase:** pendiente.

---

## Fase 14 — Smoke tests reales de navegador

- [ ] smoke test de discovery
- [ ] smoke test de copy
- [ ] smoke test de download
- [ ] smoke test de overlay básico

**Estado de fase:** pendiente.

---

## Fase 15 — Resto de integration samples

- [ ] `examples/vite`
- [ ] `examples/react`
- [ ] `examples/nuxt`

**Estado de fase:** pendiente.

---

## Fase 16 — Documentación

- [x] `README.md` base inicial
- [ ] quick start completo
- [ ] docs de integración vanilla
- [ ] docs de integración vite
- [ ] docs de integración react
- [ ] docs de integración nuxt
- [ ] documento de arquitectura

**Estado de fase:** parcial.

---

## Fase 17 — Validación con `npm pack`

- [ ] correr `npm pack`
- [ ] inspeccionar tarball
- [ ] verificar que `examples/` no se publique
- [ ] verificar `exports` y `types`

**Estado de fase:** pendiente.

---

## Fase 18 — Publicación

- [ ] validar scope `@inume`
- [ ] validar 2FA en npm
- [ ] publicar paquete

**Estado de fase:** pendiente.

---

## Próxima fase activa

La siguiente fase lógica del proyecto es:

### **Fase 10 — Overlay browser**

Motivo:

- es la siguiente fase definida por la especificación
- `productionGuard` ya quedó cubierto en sus tres modos
- el siguiente gap real del producto es la UI browser con Shadow DOM

Después de eso, la prioridad correcta sería:

1. storage + i18n
2. copy/download
3. smoke tests reales
4. resto de integration samples
5. docs

---

## Criterio de “hecho” para marcar una tarea

Una tarea solo se marca como terminada si cumple estas condiciones:

- existe implementación real en el repo
- respeta las restricciones de la spec v1
- no contradice invariantes del core
- pasó validación razonable para su alcance (`lint`, `check`, `test` o validación dirigida)
- deja el proyecto en un estado retirable sin parches pendientes ocultos

> Regla práctica: **“archivo creado” no equivale a “fase resuelta”**.
