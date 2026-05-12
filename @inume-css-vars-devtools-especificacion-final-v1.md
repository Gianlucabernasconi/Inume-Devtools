# `inume-devtools` - Especificación v1/v1.1

> **Estado de vigencia:** este documento fue actualizado para reflejar el comportamiento real actual del repo.
>
> Si aparece una diferencia entre una sección histórica de este archivo y el código implementado, manda el comportamiento real documentado en `ESTADO_ACTUAL.md` y en `src/`.

## Tabla de contenidos

- [1. Producto](#1-producto)
- [2. Objetivos](#2-objetivos)
- [3. No objetivos](#3-no-objetivos)
- [4. Principios](#4-principios)
- [5. Arquitectura](#5-arquitectura)
  - [5.1 Estructura de directorios](#51-estructura-de-directorios)
  - [5.2 Boundary de capas](#52-boundary-de-capas)
  - [5.3 Entrypoints públicos](#53-entrypoints-públicos)
- [6. Invariantes funcionales](#6-invariantes-funcionales)
- [7. Semántica de target y scopes](#7-semántica-de-target-y-scopes)
- [8. Discovery](#8-discovery)
  - [8.1 Flujo](#81-flujo)
  - [8.2 Reglas de inclusión](#82-reglas-de-inclusión)
  - [8.3 Reglas de nombres](#83-reglas-de-nombres)
- [9. API pública final](#9-api-pública-final)
  - [9.1 Tipos y contratos](#91-tipos-y-contratos)
  - [9.2 Decisiones de API](#92-decisiones-de-api)
  - [9.3 Semántica de métodos](#93-semántica-de-métodos)
  - [9.4 Idempotencia obligatoria](#94-idempotencia-obligatoria)
- [10. Source of truth](#10-source-of-truth)
- [11. Validación y formatos](#11-validación-y-formatos)
  - [11.1 Categorías](#111-categorías)
  - [11.2 Reglas de validación](#112-reglas-de-validación)
  - [11.3 Formatos soportados](#113-formatos-soportados)
- [12. Overlay browser](#12-overlay-browser)
  - [12.1 UI requerida](#121-ui-requerida)
  - [12.2 Reglas de render](#122-reglas-de-render)
  - [12.3 Ownership entre session y handle](#123-ownership-entre-session-y-handle)
- [13. Production guard](#13-production-guard)
- [14. Persistencia](#14-persistencia)
- [15. Export](#15-export)
- [16. Seguridad](#16-seguridad)
- [17. Performance](#17-performance)
- [18. SSR safety](#18-ssr-safety)
- [19. Packaging](#19-packaging)
- [20. Tooling del repo](#20-tooling-del-repo)
- [21. Tests obligatorios](#21-tests-obligatorios)
- [22. Samples oficiales de integración](#22-samples-oficiales-de-integración)
- [23. Integración oficial recomendada](#23-integración-oficial-recomendada)
- [24. Documentación](#24-documentación)
- [25. Orden de implementación](#25-orden-de-implementación)
- [26. Checklist de release](#26-checklist-de-release)
- [27. Criterio de aceptación de v1](#27-criterio-de-aceptación-de-v1)

---

## 1. Producto

`inume-devtools` es una librería npm pública, **framework-agnostic**, enfocada en editar en tiempo real **CSS custom properties de color** durante desarrollo.

v1.1 tiene tres entrypoints públicos:

- `inume-devtools`
- `inume-devtools/browser`
- `inume-devtools/next`

Su propuesta de valor es:

- descubrir variables CSS existentes en runtime
- permitir editarlas en memoria y aplicarlas al DOM
- exportarlas manualmente como CSS y JSON
- ofrecer un overlay visual **dev-only** opcional
- no tocar archivos fuente del proyecto host

---

## 2. Objetivos

La v1 debe:

- funcionar en cualquier frontend que use CSS custom properties
- mantenerse pequeña, predecible y fácil de integrar
- no depender de frameworks
- no colarse a producción por accidente
- soportar `en` y `es`
- reconocer por defecto custom properties cuyo valor runtime sea color
- permitir acotar el scope mediante `prefixes`, `include`, `exclude` y `match`
- ser **npm-ready** desde v1

---

## 3. No objetivos

La v1 **no** busca:

- ser un editor universal de design tokens
- preservar el CSS authored original
- editar archivos `.css`, `.scss` o `theme.ts`
- parsear ni reescribir hojas de estilo completas
- ofrecer adapters oficiales por framework, salvo el entrypoint mínimo `inume-devtools/next` introducido en v1.1 por onboarding
- incluir callbacks ni event bus
- incluir sync con Figma ni export a otros formatos complejos
- soportar perfectamente toda la semántica avanzada de CSS Color 5

---

## 4. Principios

- `core` y `browser` deben poder evolucionar por separado
- la fuente de verdad operativa será el estado en memoria de la sesión
- el baseline inicial de la sesión es inmutable
- el valor trabajado por la herramienta es el valor efectivo/canonizado de runtime
- el export debe ser estable y seguro
- la UI nunca debe renderizar HTML inyectado
- el overlay debe ser **cliente-only** y **dev-only** por diseño
- el overlay browser de v1 se implementa con **TypeScript + vanilla DOM API + Shadow DOM**, sin framework UI
- defaults estrictos y opciones avanzadas claramente **opt-in**

---

## 5. Arquitectura

### 5.1 Estructura de directorios

```text
src/
  shared/
    types.ts
    normalize-name.ts
    normalize-color.ts
    validate-exportable-value.ts
    serialize-css.ts
    serialize-json.ts
    constants.ts
  core/
    discover-vars.ts
    create-session.ts
    filters.ts
  browser/
    mount-devtool.ts
    create-overlay.ts
    i18n.ts
    storage.ts
    storage-schema.ts
    production-guard.ts
    styles.ts
  index.ts
  browser.ts
tests/
  core.test.ts
  browser.test.ts
  overlay.test.ts
examples/
  vanilla/
  vite/
  react/
  nuxt/
docs/
  quick-start.es.md
  integration-vanilla.md
  integration-vite.md
  integration-react.md
  integration-nuxt.md
```

### 5.2 Boundary de capas

#### `src/shared`

Responsabilidades:

- tipos
- normalización
- validación
- serialización pura

Prohibido:

- DOM
- storage
- timers
- `window`
- `document`

#### `src/core`

Responsabilidades:

- discovery
- baseline
- estado de sesión
- filtros
- export lógico

Prohibido:

- UI
- Shadow DOM
- storage real
- timers y `requestAnimationFrame`
- globals de browser en top-level

#### `src/browser`

Responsabilidades:

- overlay
- storage real
- persistencia opt-in
- guard de entorno
- i18n
- mount
- batching visual de inputs intensos
- drag del panel
- copy al clipboard

Permitido:

- DOM
- `window`
- `document`
- `localStorage`
- `sessionStorage`
- `navigator.clipboard`
- `PointerEvent`

Restricción:

- nunca tocar globals en top-level
- solo dentro de funciones

### 5.3 Entrypoints públicos

- `inume-devtools` expone el **core headless**
- `inume-devtools/browser` expone el **overlay visual** y usa internamente el core
- `inume-devtools/next` expone un **Client Component** mínimo para Next.js
- no habrá **deep imports** soportados

---

## 6. Invariantes funcionales

- La sesión captura un **baseline inicial inmutable** al crearse.
- `resetVar()` vuelve al baseline de esa sesión.
- `resetAll()` vuelve todo al baseline de esa sesión.
- `destroy()` no resetea el DOM por defecto.
- Si el DOM cambia por fuera después de crear la sesión, eso no redefine el baseline.
- El scope de variables administradas queda congelado al momento del discovery inicial, salvo que en el futuro exista una API explícita de refresh.
- v1 no tendrá refresh automático ni observers reactivos.
- El discovery será snapshot único, no reactivo por defecto.
- El export siempre opera sobre el estado en memoria de la sesión, no releyendo el DOM en cada llamada.
- La UI trabaja sobre una sesión existente o una creada internamente.
- Si el handle recibe una sesión externa, no es dueño de destruirla.
- Si el handle crea la sesión, sí es dueño de destruirla.
- La persistencia de v1 pertenece al `browser`, no al `core`.
- Los exports públicos de v1 solo contienen valores exportables.

---

## 7. Semántica de target y scopes

Se usará una sola opción pública: `target`.

Reglas:

- el target soportado oficialmente sigue siendo `Document`
- si `target` se omite y existe `document` global, el paquete usará ese `document`
- el paquete siempre escanea `target.documentElement` como `:root`
- v1.1 permite `scopes: string[]` para escanear selectores CSS adicionales
- las variables descubiertas en un scope adicional se escriben sobre el elemento que matcheó ese selector
- si no existe un `Document` resolvible al crear la sesión, `createCssVarsSession()` debe fallar con un error claro
- no habrá `readTarget` y `writeTarget` separados en v1

Los targets `HTMLElement` quedan fuera del soporte oficial para evitar ambigüedad en export y persistencia. Para tokens scoped, usar `scopes`.

---

## 8. Discovery

### 8.1 Flujo

El proceso de discovery debe:

1. resolver el target efectivo
2. ejecutar `getComputedStyle()` sobre `:root` y cada selector de `scopes` que matchee un elemento
3. iterar las custom properties disponibles en esos snapshots
4. filtrar por nombre según reglas de filtrado
5. construir un mapa estable `name -> baselineValue`
6. construir el estado actual inicial copiando el baseline

### 8.2 Reglas de inclusión

Reglas de inclusión:

- por defecto: cualquier custom property cuyo valor runtime actual sea un color válido para el discovery
- si `prefixes` está presente, reemplaza el set por defecto
- `include` agrega nombres exactos
- `exclude` elimina nombres exactos
- `match` será un filtro final opcional

Precedencia exacta:

1. descubrir solo custom properties con valor runtime de color
2. normalizar nombres
3. aceptar por `prefixes` o por `include`
4. excluir por `exclude`
5. filtrar finalmente por `match`, si existe

### 8.3 Reglas de nombres

- `include` y `exclude` esperan nombres completos de custom properties
- si un nombre no empieza por `--`, se normaliza agregándolo solo si la normalización es inequívoca
- si no puede normalizarse de forma segura, se ignora

---

## 9. API pública final

### 9.1 Tipos y contratos

```ts
export type CssVarsLocale = 'auto' | 'en' | 'es'
export type CssVarsProductionGuard = 'strict' | 'warn' | 'off'

export interface CssVarsMessages {
  title: string
  searchPlaceholder: string
  noResults: string
  noSelection: string
  noVariablesDetected: string
  rawValue: string
  alpha: string
  reset: string
  resetAll: string
  copyCss: string
  copyJson: string
  downloadCss: string
  downloadJson: string
  clearPersisted: string
  close: string
  open: string
  moreActions: string
}

export interface CssVarsStorageOptions {
  kind?: 'local' | 'session'
  key?: string
}

export interface CssVarsSessionOptions {
  target?: Document
  scopes?: string[]
  prefixes?: string[]
  include?: string[]
  exclude?: string[]
  match?: (name: string) => boolean
  allowRaw?: boolean
}

export interface CssVarItem {
  key: string
  name: string
  scope: string
  value: string
  baselineValue: string
  exportable: boolean
  editableAsColor: boolean
}

export interface CssVarsSession {
  getVars(): CssVarItem[]
  getVar(name: string): CssVarItem | undefined
  setVar(name: string, value: string): void
  resetVar(name: string): void
  resetAll(): void
  exportCss(): string
  exportJson(): string
  destroy(): void
}

export interface CssVarsDevtoolBrowserOptions {
  storage?: false | CssVarsStorageOptions
  locale?: CssVarsLocale
  messages?: Partial<CssVarsMessages>
  title?: string
  productionGuard?: CssVarsProductionGuard
  defaultOpen?: boolean
}

export type CssVarsDevtoolOptions =
  | (CssVarsDevtoolBrowserOptions & CssVarsSessionOptions & { session?: undefined })
  | (CssVarsDevtoolBrowserOptions & { session: CssVarsSession })

export interface CssVarsDevtoolHandle {
  show(): void
  hide(): void
  toggle(): void
  clearPersisted(): void
  destroy(): void
}

export function createCssVarsSession(
  options?: CssVarsSessionOptions
): CssVarsSession

export function mountCssVarsDevtool(
  options?: CssVarsDevtoolOptions
): CssVarsDevtoolHandle
```

### 9.2 Decisiones de API

Decisiones explícitas de v1:

- `save()` sale de v1
- `getSession()` sale del handle
- `matchAll` sale de v1
- `exportJson()` devolverá `string`, no objeto
- `CssVarItem` queda público porque lo devuelve `getVars()` y `getVar()`
- `locale: 'auto'` usa el primary language subtag y hace fallback a `en`
- la precedencia de textos es: `messages` custom → diccionario del locale → fallback `en`
- si `session` se pasa a `mountCssVarsDevtool()`, no se pueden pasar `target`, `prefixes`, `include`, `exclude`, `match` ni `allowRaw`
- mezclar `session` con opciones de sesión es un error de configuración y debe fallar de forma explícita antes de montar
- si `productionGuard: 'strict'` bloquea el mount, `mountCssVarsDevtool()` debe devolver un handle **inert** e idempotente, sin `throw`

### 9.3 Semántica de métodos

#### `getVars()`

- devuelve un **snapshot nuevo** por llamada
- ordenado lexicográficamente por `name`
- si la sesión está destruida, devuelve `[]`

#### `getVar(name)`

- devuelve `undefined` si la variable no pertenece al scope de la sesión
- devuelve `undefined` si la sesión está destruida

#### `setVar(name, value)`

- solo opera sobre variables dentro del scope
- fuera de scope hace **no-op**
- si `name` no puede normalizarse de forma segura, hace **no-op**
- si la sesión está destruida, hace **no-op**
- si `allowRaw` es `false`, solo aplica valores `exportable: true`
- si `allowRaw` es `true`, puede mantener valores raw en estado de trabajo, pero esos no forman parte del export público

#### `resetVar(name)`

- no-op si la variable no pertenece al scope
- no-op si la sesión está destruida
- si pertenece, vuelve a `baselineValue`

#### `resetAll()`

- vuelve todas las variables del scope al baseline
- si la sesión está destruida, hace **no-op**

#### `exportCss()`

- exporta solo variables del scope
- usa orden estable
- incluye solo valores exportables
- si encuentra valores no exportables, los omite
- si la sesión está destruida, devuelve `''`

#### `exportJson()`

- exporta un JSON string estable
- usa schema fijo y orden estable
- incluye solo valores exportables
- representa un **schema de export**, no un dump bruto de sesión
- si la sesión está destruida, devuelve `''`

#### `destroy()`

- idempotente
- libera listeners y referencias internas
- no resetea estilos del host

#### `handle.show()`

- idempotente
- no-op si el handle está destruido o inert

#### `handle.hide()`

- idempotente
- no-op si el handle está destruido o inert

#### `handle.toggle()`

- alterna visibilidad del overlay
- no-op si el handle está destruido o inert
- **no es idempotente**

#### `handle.clearPersisted()`

- no-op si no hay storage configurado
- no-op si el handle está destruido o inert
- borra solo el namespace de persistencia de ese handle
- no debe volver a persistir nada hasta el próximo cambio válido del usuario

#### `createCssVarsSession(options)`

- si `target` se omite y no existe un `Document` global resolvible, falla con error claro
- si `match` lanza una excepción durante el discovery, la creación de sesión falla con error claro

#### `mountCssVarsDevtool(options)`

- si recibe `session`, usa esa sesión y no la destruye
- si no recibe `session`, crea una sesión interna y es dueño de destruirla
- si el `productionGuard` bloquea en `strict`, devuelve un handle inert
- si la configuración mezcla `session` con opciones de sesión, falla con error claro antes de montar

### 9.4 Idempotencia obligatoria y contrato post-destroy

Los siguientes métodos deben ser idempotentes:

- `session.destroy()`
- `handle.destroy()`
- `handle.show()`
- `handle.hide()`
- `handle.clearPersisted()`
- `session.resetAll()`

Contratos post-destroy:

- después de `session.destroy()`, `getVars()` devuelve `[]`
- después de `session.destroy()`, `getVar()` devuelve `undefined`
- después de `session.destroy()`, `setVar()`, `resetVar()` y `resetAll()` son `no-op`
- después de `session.destroy()`, `exportCss()` y `exportJson()` devuelven `''`
- después de `handle.destroy()`, `show()`, `hide()`, `toggle()` y `clearPersisted()` son `no-op`
- si una sesión externa se destruye mientras el handle sigue vivo, el handle queda **inert** sin `throw`

---

## 10. Source of truth

- El discovery inicial usa el valor efectivo/canonizado visible en runtime.
- La sesión guarda ese baseline en memoria.
- `session.setVar()` aplica el cambio al estado en memoria y al DOM como una sola operación lógica.
- El overlay/browser puede agrupar inputs intensos y llamar a `setVar()` como máximo una vez por frame por variable.
- El export sale del estado en memoria actual.
- No se intenta reconstruir expresiones authored como `var(--x)` o `color-mix(...)` originales.

> La fuente de verdad operativa es el estado en memoria de la sesión, no el authored source ni relecturas continuas del DOM.

---

## 11. Validación y formatos

### 11.1 Categorías

La validación distingue dos categorías:

- `editableAsColor`
- `exportable`

### 11.2 Reglas de validación

Estados permitidos:

- `editableAsColor: true` y `exportable: true`
- `editableAsColor: false` y `exportable: true`
- `editableAsColor: false` y `exportable: false`

Reglas:

- `allowRaw: false` solo permite `exportable: true`
- `allowRaw: true` permite mantener valores no exportables en estado de trabajo, pero esos no salen en el export público
- `exportCss()` y `exportJson()` solo incluirán valores `exportable: true`
- valores que contengan `url(`, `expression(`, `@`, `;`, comentarios CSS o funciones fuera del set permitido nunca son exportables en v1
- `exportJson()` es un schema de export estable, no un dump bruto del estado raw

### 11.3 Formatos soportados

Debe soportar bien:

- `#rgb`
- `#rgba`
- `#rrggbb`
- `#rrggbbaa`
- `rgb()`
- `rgba()`
- `hsl()`
- `hsla()`

No se promete soporte visual perfecto para:

- `color-mix()`
- `oklch()`
- `lab()`
- `lch()`
- `var(...)` authored chains

Los formatos anteriores pueden existir solo como estado raw temporal si `allowRaw` está activo, pero no forman parte del export público seguro de v1.

---

## 12. Overlay browser

### 12.0 Tecnología de implementación cerrada para v1

El overlay browser de v1 debe implementarse con:

- `TypeScript`
- `vanilla DOM API`
- `Shadow DOM`
- CSS inyectado dentro del shadow root

No debe implementarse con:

- React
- Vue
- Svelte
- librerías de componentes
- librerías de drag si no son imprescindibles

Decisiones cerradas de browser APIs:

- el drag del panel debe usar `Pointer Events`
- la acción visible `Copy CSS` debe usar `Clipboard API`
- si `Clipboard API` no está disponible o falla, la UI debe mostrar feedback claro y no romper el overlay

### 12.1 UI requerida

La UI tendrá:

- botón flotante para abrir/cerrar
- panel flotante
- Shadow DOM obligatorio
- buscador
- lista de variables
- swatch
- editor visual de la variable activa
- input textual del color actual
- picker visual inline con hue
- `Reset`
- `Reset all`
- `Copy CSS`

Acciones secundarias permitidas fuera de la acción principal visible:

- `Copy JSON`
- `Download CSS`
- `Download JSON`
- `Clear persisted`

Estas acciones no necesitan competir visualmente con `Copy CSS` y pueden vivir en un menú contextual.

### 12.2 Reglas de render

- ningún texto configurable se renderiza con `innerHTML`
- `title`, `messages`, nombres y valores visibles se pintan como plain text
- la UI nunca debe depender de estilos del host
- la UI debe inyectar solo su CSS mínimo dentro del shadow root
- el botón flotante puede montarse liviano y el panel completo debe materializarse de forma lazy al abrirse
- búsqueda y filtrado operan solo sobre snapshot en memoria; nunca relanzan discovery
- no se soporta más de una raíz de overlay por handle
- v1 tolera múltiples mounts independientes por documento, pero no coordina layout, foco ni z-index entre ellos
- cada acción de copy/download/persistencia se limita al handle que la dispara

### 12.3 Ownership entre session y handle

#### `mountCssVarsDevtool({ session })`

- usa esa sesión
- no la destruye
- permite opciones de browser (`storage`, `locale`, `messages`, `title`, `productionGuard`, `defaultOpen`)
- no permite pasar opciones de sesión (`target`, `prefixes`, `include`, `exclude`, `match`, `allowRaw`)

#### `mountCssVarsDevtool()` sin sesión externa

- crea una sesión interna
- la destruye al destruirse

#### `handle.destroy()`

- desmonta overlay y listeners del browser layer
- no destruye una sesión externa

#### `handle.clearPersisted()`

- opera solo sobre el namespace de storage del handle
- no repersiste nada hasta el próximo cambio válido del usuario

#### `session.destroy()`

- destruye la sesión headless
- la deja inutilizable

#### Sesión destruida externamente con handle vivo

- si un handle sigue vivo con una sesión destruida externamente, debe quedar **inert** sin `throw`

---

## 13. Production guard

Modos soportados:

- `strict`: modo conservador; solo permite loopback local (`localhost`, `127.0.0.1`, `::1`). Si bloquea, no monta y devuelve handle inert
- `warn`: monta, pero emite warning claro en consola
- `off`: no hace chequeos

Invariantes:

- no reemplaza el `dynamic import` dev-only recomendado
- no es una garantía de exclusión de bundle ni una barrera de seguridad fuerte por sí sola
- vive solo en `browser`
- el core headless no bloquea uso por host
- toda detección ocurre dentro de `mountCssVarsDevtool()`

Si un proyecto usa dominios de desarrollo no loopback, debe resolverlo desde su integración dev-only del host y optar explícitamente por `warn` u `off` en esos entornos.

---

## 14. Persistencia

La persistencia es un concern **solo de `browser`** y es **opt-in** mediante `storage` en `mountCssVarsDevtool()`.

Configuración:

- `false` desactiva persistencia
- `local` usa `localStorage`
- `session` usa `sessionStorage`

Convención de key por defecto para el caso oficial `Document/:root`:

```text
@inume/css-vars-devtools:v1:<host>:<path>:<scope>
```

`<path>` se captura al montar el handle, sin `query` ni `hash`.

`<scope>` puede derivarse de:

- prefijos configurados
- firma estable de `include` y `exclude`

Reglas adicionales:

- si `match` está presente y `storage` está activo, `storage.key` debe definirse explícitamente
- si existen múltiples handles con persistencia sobre el mismo documento/ruta, `storage.key` debe definirse explícitamente

Reglas:

- no persistir en cada tick de input
- persistir solo en commit válido
- commit válido significa: `change`, `blur`, `reset`, `resetAll`, cierre del panel o acción explícita de export si corresponde
- persistir solo si hubo dirty state real
- colapsar múltiples commits cercanos en una sola escritura
- si storage falla, no romper la sesión
- si storage está corrupta o con schema inválido, ignorarla
- `handle.clearPersisted()` borra solo la entrada de ese handle y no reescribe nada hasta el próximo cambio válido del usuario
- storage y persistencia no deben usarse para datos sensibles

Schema JSON sugerido:

```json
{
  "version": 1,
  "vars": {
    "--color-base": "#ffffff"
  }
}
```

---

## 15. Export

### `exportCss()`

Debe devolver un bloque `:root { ... }` con:

- orden lexicográfico
- spacing estable
- `\n` estable
- solo valores exportables
- nunca interpolando valores no validados

`exportCss()` representa el export público oficial de v1 para el caso `Document/:root`.

Ejemplo esperado:

```css
:root {
  --color-base: #ffffff;
  --color-text-primary: rgb(38 38 38 / 1);
}
```

### `exportJson()`

Debe devolver un string JSON estable como:

```json
{
  "version": 1,
  "vars": {
    "--color-base": "#ffffff",
    "--color-text-primary": "rgb(38 38 38 / 1)"
  }
}
```

Reglas:

- contiene solo valores exportables
- `version` representa la versión del **schema de export**, no el semver del paquete
- los valores raw de trabajo nunca forman parte del export público JSON

> Nota operativa: el discovery puede reconocer más colores de los que luego la validación/export público soporta. Discovery y export no comparten exactamente el mismo criterio.

---

## 16. Seguridad

Obligatorio:

- no usar `innerHTML`
- filename de descarga sanitizado con charset acotado, longitud razonable, extensión fija y fallback estable
- copy/download solo bajo gesto explícito directo sobre controles visibles del overlay
- no disparar copy/download automáticamente al montar, abrir el panel o desde timers
- `allowRaw` por defecto `false`
- `productionGuard` por defecto `strict`
- `exportCss()` y `exportJson()` deben filtrar valores no exportables
- nunca considerar exportable un valor con `url(`, `expression(`, `@`, `;`, comentarios CSS o funciones fuera del set permitido
- `matchAll` no existe en v1
- no aceptar HTML en `title` ni `messages`
- no usar dependencias runtime innecesarias
- no usar `postinstall`
- publicar con 2FA
- storage y export no deben considerarse aptos para datos sensibles

> La UI debe tratar todo texto configurable como texto plano y el export debe operar únicamente sobre valores validados según las reglas de exportación.

---

## 17. Performance

Obligatorio:

- discovery **one-shot**
- cache en memoria como source of truth
- no relanzar `getComputedStyle` en cada render o búsqueda
- el `core` mantiene semántica simple y síncrona
- el `browser` puede agrupar inputs intensos con `requestAnimationFrame`
- dentro de un frame, el browser usa `last-write-wins` por variable
- `resetVar()` y `resetAll()` pisan cualquier write visual pendiente del overlay
- `handle.destroy()` cancela cola pendiente y listeners sin flush adicional
- no persistir en cada tick
- no persistir si no hubo cambios reales
- no precomputar export continuamente
- no observers automáticos en v1
- búsqueda y filtrado del overlay solo sobre snapshot en memoria
- el panel debe poder renderizarse lazy al abrirse
- el browser entry no debe inflar el core
- no acceso a globals en top-level

Presupuestos iniciales de v1 a verificar con benchmarks:

- discovery de 300 variables en navegador de escritorio moderno: objetivo `<= 16 ms`
- filtrado de 300 items en overlay: objetivo `<= 8 ms` por input
- export CSS/JSON de 300 variables: objetivo `<= 8 ms` por acción
- entry `browser` sin dependencias runtime innecesarias y con budget pequeño y verificable en CI

---

## 18. SSR safety

- `@inume/css-vars-devtools` debe ser **SSR-safe**
- `@inume/css-vars-devtools/browser` no debe tocar globals al importarse
- `@inume/css-vars-devtools/browser` debe ser completamente inert al importarse
- `window`, `document`, `navigator`, `localStorage`, `ShadowRoot` solo se usan dentro de `mountCssVarsDevtool()`
- `createCssVarsSession()` sin `Document` resolvible debe fallar con error claro y predecible
- el patrón oficial de integración será **import dinámico en dev**

---

## 19. Packaging

Shape aproximado de `package.json`:

```json
{
  "name": "@inume/css-vars-devtools",
  "version": "0.1.0",
  "license": "MIT",
  "type": "module",
  "sideEffects": false,
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./browser": {
      "types": "./dist/browser.d.ts",
      "import": "./dist/browser.js",
      "require": "./dist/browser.cjs"
    }
  },
  "files": ["dist", "README.md", "LICENSE"]
}
```

Reglas de packaging:

- no publicar `examples/`
- no publicar fuentes innecesarias
- no soportar deep imports
- tipados por entrypoint
- solo dos subpaths públicos: `.` y `./browser`
- side effects precisos
- el entry `browser` no debe importar CSS ni ejecutar side effects al importarse

---

## 20. Tooling del repo

El repo debe usar:

- `typescript`
- `tsup`
- `vitest`
- `happy-dom` o `jsdom` para browser tests
- `playwright` para smoke tests reales en navegador
- `npm pack` como validación previa a publish

---

## 21. Tests obligatorios

La batería mínima de tests de v1 debe cubrir:

- descubre por defecto custom properties cuyo valor runtime sea color
- `prefixes` reemplaza el default cuando se configura
- respeta `include`
- respeta `exclude`
- respeta `match`
- falla con error claro si no hay `Document` resolvible
- usa `documentElement` cuando `target` es `Document`
- baseline se mantiene inmutable
- `resetVar()` vuelve al baseline correcto
- `resetAll()` vuelve todo al baseline correcto
- `destroy()` es idempotente
- `show()` y `hide()` son idempotentes
- `toggle()` alterna visibilidad y no se trata como idempotente
- `getVars()` devuelve snapshot, no referencia viva
- `getVar()` devuelve `undefined` fuera de scope
- `setVar()` fuera de scope es no-op
- `setVar()` con nombre inválido hace no-op
- `exportCss()` ordena y filtra correctamente
- `exportJson()` ordena, serializa y omite valores no exportables
- `allowRaw: false` hace no-op con valores inválidos
- `allowRaw: true` permite aplicar raw
- raw no exportable no sale ni en CSS ni en JSON público
- mezclar `session` con opciones de sesión falla antes de montar
- sesión destruida deja getters vacíos y mutaciones como `no-op`
- handle destruido o inert deja `show()`, `hide()`, `toggle()` y `clearPersisted()` como `no-op`
- storage corrupta se ignora
- `handle.clearPersisted()` borra solo su key y no repersiste automáticamente
- `strict` bloquea hosts no locales devolviendo handle inert
- `warn` monta y loguea warning
- `off` no bloquea
- `locale: 'auto'` resuelve correctamente y hace fallback a `en`
- `messages` custom pisan al diccionario del locale
- `browser` no toca globals en top-level
- importar `browser` es inert
- textos configurables no ejecutan HTML
- filename de descarga se sanea
- copy/download requieren gesto explícito
- writes live no deben degradar perceptiblemente la interacción del overlay
- no se escribe storage por cada tick
- si `match` existe con storage, `storage.key` es obligatoria
- múltiples mounts con storage en la misma ruta requieren keys explícitas
- smoke tests en navegador real con `Playwright` para discovery, copy y download

---

## 22. Samples oficiales de integración

La distribución oficial de samples será:

- `vanilla`
- `vite`
- `react`
- `nuxt`

No habrá helpers específicos por framework.

Estos samples son guías de integración, no soporte oficial por framework.

---

## 23. Integración oficial recomendada

Patrón oficial:

```ts
if (import.meta.env.DEV && typeof window !== 'undefined') {
  const { mountCssVarsDevtool } = await import('@inume/css-vars-devtools/browser')

  mountCssVarsDevtool({
    prefixes: ['--color-'],
    locale: 'auto',
    productionGuard: 'strict'
  })
}
```

> Este patrón es complementario al `productionGuard`. No debe ser reemplazado por él.

---

## 24. Documentación

### `README.md` en inglés

Debe incluir:

- qué hace y qué no hace
- quick start
- API core
- API browser
- security notes
- production guard
- supported formats
- non-goals
- integration samples
- npm publish info si aplica

### `docs/quick-start.es.md`

Debe incluir lo mismo en versión corta.

---

## 25. Orden de implementación

El orden de implementación de v1 será:

1. scaffold del repo y packaging
2. tipos públicos
3. normalización y validación pura
4. discovery
5. sesión headless
6. export CSS y JSON
7. tests del core headless
8. sample `vanilla` mínimo para validación manual
9. production guard
10. overlay browser
11. storage versionado del browser
12. i18n mínimo
13. downloads/copy
14. smoke tests reales de navegador
15. resto de `integration samples`
16. docs
17. `npm pack`
18. publicación

---

## 26. Checklist de release

Checklist obligatorio antes de publicar:

- scope `@inume` disponible
- 2FA habilitado en npm
- `exports` correctos
- `types` correctos
- `npm pack` inspeccionado
- bundle sin dependencias runtime innecesarias
- examples fuera del tarball
- browser entry SSR-safe al importar
- tests verdes
- licencia MIT incluida

---

## 27. Criterio de aceptación de v1

La v1 se considera aceptada si cumple todo lo siguiente:

- puede descubrir y editar `--color-*` en runtime
- puede resetear contra baseline estable
- puede exportar CSS y JSON públicos con formato estable y solo valores exportables
- puede montar overlay aislado con Shadow DOM
- soporta `en` y `es`
- no se monta por error en producción bajo `strict`
- no rompe SSR al importar
- no requiere framework
- no escribe archivos fuente
- define sin ambigüedad lifecycle, target, baseline y persistencia browser-only

---

## Anexo A. Resumen operativo de decisiones cerradas

### Alcance del producto

- librería npm pública
- framework-agnostic
- edición runtime de CSS custom properties de color
- core headless + browser overlay opcional
- soporte oficial v1 optimizado para `Document/:root`
- sin edición de archivos del host

### Decisiones de lifecycle

- baseline inmutable por sesión
- discovery único al crear sesión
- sin refresh automático en v1
- export desde memoria, no desde DOM reread
- ownership explícito entre session y handle
- contrato post-destroy cerrado con no-ops y valores vacíos estables

### Decisiones de seguridad

- overlay dev-only
- `productionGuard: 'strict'` por defecto
- sin `innerHTML`
- copy/download bajo gesto explícito
- export CSS y JSON filtrados
- `allowRaw: false` por defecto
- valores raw fuera del export público

### Decisiones de distribución

- dos entrypoints públicos
- sin deep imports
- tipados por entrypoint
- SSR-safe al importar
- publicación npm lista desde v1
- persistencia solo en `browser`

---

## Anexo B. Ejemplos de uso de la API

### Core headless

```ts
import { createCssVarsSession } from '@inume/css-vars-devtools'

const session = createCssVarsSession({
  prefixes: ['--color-'],
  allowRaw: false
})

const vars = session.getVars()

session.setVar('--color-base', '#ffffff')
session.resetVar('--color-base')

const css = session.exportCss()
const json = session.exportJson()

session.destroy()
```

### Browser overlay con sesión interna

```ts
import { mountCssVarsDevtool } from '@inume/css-vars-devtools/browser'

const handle = mountCssVarsDevtool({
  prefixes: ['--color-'],
  locale: 'es',
  productionGuard: 'strict',
  defaultOpen: false
})

handle.toggle()
handle.hide()
handle.show()
handle.clearPersisted()
handle.destroy()
```

### Browser overlay con sesión externa

```ts
import { createCssVarsSession } from '@inume/css-vars-devtools'
import { mountCssVarsDevtool } from '@inume/css-vars-devtools/browser'

const session = createCssVarsSession({
  prefixes: ['--color-'],
  allowRaw: false
})

const handle = mountCssVarsDevtool({
  session,
  storage: {
    kind: 'local',
    key: '@inume/css-vars-devtools:v1:my-app'
  },
  locale: 'auto',
  productionGuard: 'warn'
})

// El handle no es dueño de destruir la sesión externa
handle.destroy()
session.destroy()
```

---

## Estado final de la especificación

**Especificación v1 final cerrada para implementación**.
