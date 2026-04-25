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

**Estado general:** producto funcional con overlay browser real, pero con **hardening pre-release pendiente** antes de publicar v1.

El proyecto ya salió de la etapa de documentación-only y hoy tiene:

- scaffold de paquete npm
- entrypoints públicos definidos
- core headless funcional
- discovery one-shot funcional, pero con una desalineación detectada entre spec y comportamiento default
- export CSS/JSON funcional
- tests dirigidos del core
- sample `vanilla` en proceso de corrección para reflejar uso real del producto
- linting y typecheck básicos

Todavía **no** están cerrados del todo:

- alineación final del contrato público con la especificación v1
- publicación final
- endurecimiento final del sample de prueba para eliminar hardcodes remanentes
- limpieza final de lifecycle/performance del overlay browser

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

El proyecto está en **fase avanzada de producto**, con el overlay browser ya rediseñado, pero con una tanda de **correcciones contractuales y de hardening** todavía abiertas antes de release.

Más concretamente:

- **Infraestructura base:** lista
- **Core headless:** funcional
- **Browser/UI real:** funcional
- **Release v1:** cerca en funcionalidad, pero no listo para publicar sin hardening adicional

### Evidencia actual en el repo

#### Packaging y tooling

- `package.json` con `typescript`, `tsup`, `vitest`, `playwright`, `eslint`
- `tsconfig.json`
- `tsup.config.ts`
- `vitest.config.ts`
- `eslint.config.js`

#### Core implementado

- discovery one-shot sobre `Document`
- discovery actual implementado sobre custom properties reales cuyo valor runtime sea color
- filtros por `prefixes`, `include`, `exclude`, `match`
- baseline inmutable por sesión
- `setVar()`, `resetVar()`, `resetAll()`, `destroy()`
- `exportCss()` y `exportJson()` desde estado en memoria
- validación de valores exportables y soporte raw controlado con `allowRaw`

> **Gap verificado:** la especificación v1 exige que el default sea `--color-*`, pero la implementación actual y sus tests todavía no están alineados con ese contrato.

#### Browser implementado

- entry `@inume/css-vars-devtools/browser` existe
- import SSR-safe e inert al importarse
- `mountCssVarsDevtool()` existe
- `productionGuard` base existe
- overlay real con Shadow DOM
- launcher flotante draggable rediseñado según mockup (compacto oscuro, sin badge)
- panel draggable rediseñado con header, editor, buscador, lista y footer alineados al mockup
- paleta vintage tech aplicada en launcher, header, panel y botones
- tipografías centralizadas en variables CSS (`--font-body`, `--font-mono`)
- sprite cat (mascota pixel art) integrado en header y launcher
- acción visible `Copy CSS` con feedback contextual
- eliminación de elementos superfluos (badge dev-only, grip visual del launcher)

> **Gaps verificados del browser:** todavía quedan mejoras pendientes en teardown completo de listeners globales y en performance de caminos calientes del picker/lista.

#### Sample manual implementado

- `examples/vanilla/index.html`
- `examples/vanilla/app.js`
- `examples/vanilla/styles.css`
- `examples/vanilla/README.md`
- sample ampliado para depender de más variables de color reales
- todavía quedan hardcodes visuales y decisiones de integración a endurecer para que el sample represente el contrato final del producto
- validación manual del core usando el build de `dist/`

#### Tests actuales

- tests del core en `tests/core.test.ts`
- cobertura dirigida de discovery, filtros, baseline, reset, export y `destroy()`

### Hallazgos de auditoría pendientes de resolver

#### Críticos para alinear v1

- corregir el default de discovery a `--color-*`
- alinear tests y documentación con ese contrato
- revisar si `./package.json` debe seguir expuesto como subpath público

#### Importantes antes de release

- cerrar teardown completo del overlay (`pointerdown` global y drag del launcher)
- evitar trabajo DOM excesivo en `pointermove` del color picker
- corregir documentación/integración React para destruir correctamente el handle
- completar i18n de mensajes de estado visibles del overlay

#### Hardening recomendado

- endurecer la combinación `allowRaw + storage`
- ampliar `.gitignore` para artefactos locales de validación y screenshots
- mejorar accesibilidad básica de inputs y picker

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
- [-] filtro por prefijos por defecto `--color-*`
- [x] soporte de `include`
- [x] soporte de `exclude`
- [x] soporte de `match`
- [x] mapa estable de baseline

**Estado de fase:** iniciada pero no cerrada; la implementación actual no está completamente alineada con el default contractual de v1.

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

- [x] botón flotante
- [x] panel flotante
- [x] Shadow DOM
- [x] header draggable
- [x] buscador
- [x] lista scrollable
- [x] editor de variable activa
- [x] `Reset`
- [x] `Reset all`
- [x] feedback visual mínimo

**Estado de fase:** completada.

---

## Fase 11 — Storage versionado del browser

- [x] storage opt-in
- [x] key versionada
- [x] tolerancia a storage corrupta
- [x] `clearPersisted()` real
- [x] persistencia de posición

**Estado de fase:** completada.

---

## Fase 12 — i18n mínimo

- [x] locale `en`
- [x] locale `es`
- [x] `locale: 'auto'`
- [x] precedencia `messages` custom → locale → fallback `en`

**Estado de fase:** completada.

---

## Fase 13 — Downloads / copy

- [x] `Copy CSS` real
- [x] `Copy JSON` real
- [x] `Download CSS` real
- [x] `Download JSON` real
- [x] sanitización de filenames
- [x] solo bajo gesto explícito

**Estado de fase:** completada.

---

## Fase 14 — Smoke tests reales de navegador

- [x] smoke test de discovery
- [x] smoke test de copy
- [x] smoke test de download
- [x] smoke test de overlay básico

**Estado de fase:** completada.

---

## Fase 15 — Resto de integration samples

- [x] `examples/vite`
- [x] `examples/react`
- [x] `examples/nuxt`

**Estado de fase:** completada.

---

## Fase 16 — Documentación

- [x] `README.md` base inicial
- [x] quick start completo
- [x] docs de integración vanilla
- [x] docs de integración vite
- [x] docs de integración react
- [x] docs de integración nuxt
- [x] documento de arquitectura

**Estado de fase:** completada.

---

## Fase 17 — Validación con `npm pack`

- [x] correr `npm pack`
- [x] inspeccionar tarball
- [x] verificar que `examples/` no se publique
- [x] verificar `exports` y `types`

**Estado de fase:** completada.

---

## Fase 18 — Publicación

- [ ] validar scope `@inume`
- [ ] validar 2FA en npm
- [ ] publicar paquete

**Estado de fase:** pendiente.

---

## Próxima fase activa

La siguiente fase lógica del proyecto es:

### **Hardening pre-release**

Motivo:

- aunque `npm pack` ya fue validado, todavía hay desalineaciones entre spec, tests y código en puntos de contrato público
- publicar sin corregir esos puntos fijaría una API/comportamiento v1 equivocado
- los siguientes gaps reales están en hardening contractual, lifecycle del browser y documentación de integración

Después de eso, la prioridad correcta sería:

1. release checklist
2. publicación efectiva
3. mantenimiento post-v1
4. iteración de v1.x

---

## Criterio de “hecho” para marcar una tarea

Una tarea solo se marca como terminada si cumple estas condiciones:

- existe implementación real en el repo
- respeta las restricciones de la spec v1
- no contradice invariantes del core
- pasó validación razonable para su alcance (`lint`, `check`, `test` o validación dirigida)
- deja el proyecto en un estado retirable sin parches pendientes ocultos

> Regla práctica: **“archivo creado” no equivale a “fase resuelta”**.
