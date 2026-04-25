# `@inume/css-vars-devtools` - Contexto de Producto para LLMs

> **Estado de vigencia:** este documento describe el producto real actual y no debe asumirse como una restricción técnica más fuerte que el código implementado.
>
> Si una sección de contexto entra en conflicto con el comportamiento actual del repo, manda el código real y `ESTADO_ACTUAL.md`.

## Propósito de este documento

Este archivo existe para que cualquier LLM, agente o desarrollador pueda entender rápidamente **qué producto se quiere construir**, **qué problema resuelve**, **qué alcance tiene**, **qué restricciones son importantes** y **qué no debe asumir**.

> Este documento es de **contexto de producto**.
> La especificación técnica detallada vive en:
>
> `@inume-css-vars-devtools-especificacion-final-v1.md`

---

## Resumen ejecutivo

`@inume/css-vars-devtools` será una **librería npm pública**, **framework-agnostic**, diseñada para ayudar a editar y probar en tiempo real **variables CSS de color** durante desarrollo.

La herramienta debe permitir que una persona pueda:

- descubrir variables CSS existentes en una app en runtime
- modificarlas visualmente desde un overlay flotante
- ver los cambios inmediatamente en la interfaz
- resetear cambios contra un baseline estable
- exportar el resultado como CSS y JSON
- usarla en distintos proyectos sin acoplarla al código productivo

La idea central es que esta herramienta sea un **devtool reutilizable**, no un componente interno de una app específica.

---

## Qué es esta aplicación

No es una web final para usuarios finales.

No es un panel de administración.

No es un plugin exclusivo de Nuxt, React o Vue.

Es una **herramienta de desarrollo** que se integra en proyectos frontend para inspeccionar y editar **CSS custom properties de color**, especialmente variables con naming tipo:

```css
--color-base
--color-primary
--color-surface
--color-text-primary
```

Su forma principal de uso será como:

- librería headless para manejo de sesión de variables CSS
- overlay browser opcional para edición visual durante desarrollo

> Nota operativa actual: el reconocimiento real no debe asumirse limitado únicamente al naming `--color-*`. Hoy la herramienta puede trabajar con custom properties cuyo valor runtime sea color, y `prefixes` sirve para acotar el scope cuando se necesita.

---

## Problema que resuelve

Hoy, cambiar una paleta de colores en un proyecto con CSS variables suele ser incómodo por varias razones:

1. hay que abrir archivos CSS o tokens manualmente
2. probar pequeños ajustes visuales interrumpe el flujo de trabajo
3. comparar variantes de color requiere editar, guardar, refrescar y volver atrás
4. muchas veces la herramienta para editar colores queda acoplada al proyecto y no se puede reutilizar
5. es fácil que una herramienta casera termine filtrándose a producción o contaminando el código de la app

`@inume/css-vars-devtools` busca resolver exactamente eso.

### Problema principal

**Falta una herramienta simple, reutilizable y segura para editar variables CSS de color en runtime durante desarrollo, sin acoplarla al proyecto host y sin convertirla en parte del producto final.**

---

## Para qué sirve

Sirve para:

- explorar variables CSS de color ya existentes
- iterar paletas visualmente sin tocar archivos fuente
- probar combinaciones de color en contexto real
- validar contraste, tono, saturación y alpha de forma rápida
- generar una salida exportable para luego llevarla manualmente al código fuente
- reutilizar la misma herramienta en múltiples proyectos

No sirve para:

- editar estilos arbitrarios de cualquier tipo sin restricciones
- ser un design token manager completo
- persistir cambios como fuente oficial del proyecto
- reemplazar Figma, Storybook o un sistema de theming completo

---

## Tipo de producto

Este producto debe tratarse como:

- **paquete npm público**
- **librería de desarrollo**
- **browser-first**, pero con un core desacoplado
- **agnóstico de framework**
- **consumible desde cualquier frontend** que tenga CSS custom properties

---

## Usuarios objetivo

### Usuario principal

Desarrolladores frontend o full-stack que trabajan con:

- CSS variables
- design systems básicos
- tokens de color
- apps estáticas o SPA/SSR

### Usuario secundario

Diseñadores técnicos o desarrolladores que necesitan ajustar colores directamente en la UI real sin modificar el código todavía.

---

## Contexto de origen

La necesidad nace de una funcionalidad existente usada dentro de una web en desarrollo para cambiar colores desde la misma interfaz.

Ese enfoque funcionaba a nivel local, pero tenía varios problemas:

1. estaba acoplado al proyecto específico
2. estaba montado dentro del layout de la app
3. dependía de variables hardcodeadas
4. no era portable
5. no era un producto externo ni reusable
6. aunque fuera dev-only, seguía siendo código propio de la app

La nueva solución debe corregir eso y convertirse en una herramienta separada, portable y publicable.

---

## Visión del producto

La visión correcta no es “hacer un picker de colores lindo”.

La visión correcta es:

> construir un devtool pequeño, sólido, reutilizable y seguro para editar variables CSS de color en tiempo real, con una integración mínima y sin contaminar producción.

Eso implica priorizar:

- claridad de API
- seguridad del overlay
- aislamiento del código de la app host
- portabilidad
- defaults estrictos
- poco bundle y poco acoplamiento

---

## Compatibilidad esperada

La herramienta debe ser compatible con:

### Entornos frontend

- HTML + CSS + JS vanilla
- Vue 3
- Vite
- Nuxt
- React
- cualquier frontend que use CSS custom properties en el DOM

### Compatibilidad conceptual

La compatibilidad oficial de v1 debe asumirse sobre un `Document` objetivo.

Debe funcionar siempre que:

1. exista un `Document` objetivo disponible en runtime
2. el proyecto use variables CSS accesibles en runtime
3. esas variables se puedan leer vía `getComputedStyle(...)`

Los casos de edición sobre contenedores o `HTMLElement` específicos pueden reevaluarse en versiones posteriores, pero **no forman parte del soporte oficial cerrado de v1**.

### No debe depender de

- Vue
- React
- Nuxt
- Tailwind
- Sass
- PostCSS
- CSS Modules
- un sistema de tokens específico

---

## Compatibilidad de formato

La v1 debe soportar bien al menos:

- `#rgb`
- `#rgba`
- `#rrggbb`
- `#rrggbbaa`
- `rgb()`
- `rgba()`
- `hsl()`
- `hsla()`

Puede tolerar como estado raw de trabajo interno, pero sin prometer soporte visual completo ni export público seguro:

- `color-mix()`
- `oklch()`
- `lab()`
- `lch()`
- cadenas authored complejas como `var(--otro-token)`

Esos formatos raw pueden existir temporalmente dentro de una sesión de trabajo si la implementación los tolera, pero **no deben formar parte del export público final de v1**.

> Distinción importante para agentes: una cosa es el **reconocimiento/discovery** de variables cuyo valor runtime es color y otra distinta es el **set exportable soportado**. No asumir que ambos scopes son idénticos.

---

## Compatibilidad de producto

La herramienta debe poder usarse en proyectos que:

- tengan una sola raíz global con variables en `:root`
- necesiten editar variables sobre `document.documentElement`
- quieran integrar un overlay dev-only sin acoplarlo al producto host

La compatibilidad oficial y optimizada de v1 debe cerrarse sobre el caso más común:

```ts
document.documentElement
```

Los casos con variables por componente, contenedor o `HTMLElement` específico quedan fuera del soporte oficial de v1 para evitar ambigüedad en export, persistencia y lifecycle.

---

## Qué debe saber un LLM antes de trabajar en este proyecto

### 1. No es una app final de negocio

Es una herramienta de desarrollo empaquetada como librería.

### 2. La prioridad no es “feature richness”

La prioridad es una v1 sólida, pequeña, segura y fácil de mantener.

### 3. El core y el overlay son distintos

Hay que pensar siempre en dos capas:

- un **core headless**
- un **browser overlay** opcional

### 4. El overlay no debe contaminar producción

Esto es una restricción crítica del producto.

### 5. La librería no debe casarse con ningún framework

Nada de asumir lifecycle de Vue, React, Nuxt o similares.

### 6. La fuente de verdad no es el CSS authored

La herramienta trabaja con el valor efectivo/canonizado en runtime.

### 7. No debe modificar archivos del proyecto host

Su trabajo termina en runtime + export manual.

### 8. No debe intentar resolver todo el universo CSS

La v1 está enfocada en **variables de color**, no en un editor universal de custom properties.

---

## Qué debe hacer el producto

El producto debe permitir:

1. descubrir variables CSS dentro de un scope
2. filtrar por prefijo, inclusión y exclusión
3. guardar un baseline inicial de sesión
4. modificar variables y aplicarlas inline al target
5. resetear una variable o todas
6. exportar resultado en CSS
7. exportar resultado en JSON
8. montar un overlay visual opcional
9. persistir de forma opt-in durante desarrollo **solo desde la capa browser/overlay**
10. soportar inglés y español

---

## Qué no debe hacer el producto

El producto no debe:

1. reescribir estilos fuente
2. editar hojas CSS del proyecto directamente
3. depender de observadores automáticos complejos en v1
4. montar listeners globales innecesarios
5. escanear continuamente el DOM
6. usar `innerHTML`
7. publicar helpers específicos por framework en v1
8. exponer una API pública innecesariamente ancha
9. resolver authored source compleja
10. convertirse en un token manager generalista

---

## Restricciones importantes

### Restricción 1: dev-only

La herramienta debe pensarse para desarrollo.

Aunque el paquete sea público, el overlay no debe colarse a producción por accidente.

La protección real debe seguir estando en la integración del host mediante import dinámico dev-only.

`productionGuard` debe entenderse como una defensa adicional de runtime, no como una garantía suficiente por sí sola.

### Restricción 2: framework-agnostic

Toda decisión técnica debe resistir el consumo desde múltiples stacks.

### Restricción 3: API pequeña

Una API pública demasiado grande compromete semver y mantenimiento.

### Restricción 4: seguridad práctica

Hay que prevenir:

- XSS por textos configurables
- export CSS inseguro
- export JSON inseguro
- fugas accidentales a producción
- uso abusivo de clipboard/download

### Restricción 5: performance razonable

Como devtool, puede pagar un costo inicial, pero no debe producir jank innecesario.

---

## Filosofía de implementación

La implementación debe seguir esta lógica:

### Núcleo simple

El corazón del producto debe ser aburrido y predecible:

- discovery una sola vez
- cache en memoria
- baseline estable
- export estable

### UI desacoplada

El overlay es importante, pero no debe arrastrar el diseño del producto completo.

### Defaults estrictos

Las opciones peligrosas deben ser opt-in.

Ejemplos:

- `allowRaw: false`
- persistencia apagada por defecto
- `productionGuard: 'strict'`
- exports públicos siempre seguros

### Portabilidad primero

La herramienta debe integrarse con import dinámico y sin depender de una arquitectura host particular.

---

## Modelo mental correcto

La forma correcta de pensar esta herramienta es:

```text
Proyecto host con CSS vars
        ↓
Core descubre variables en runtime
        ↓
Session mantiene baseline + estado actual
        ↓
Browser overlay edita ese estado
        ↓
Cambios se aplican inline al DOM
        ↓
Usuario exporta CSS/JSON manualmente
```

---

## Diferencia entre este producto y una solución improvisada

### Solución improvisada

- panel metido dentro del layout de una app
- variables hardcodeadas
- sin separación entre tool y proyecto host
- sin garantías anti-producción
- reusable solo copiando código a mano

### Producto correcto

- repo separado
- paquete npm
- core reusable
- overlay desacoplado
- integración mínima
- seguridad y restricciones explícitas
- listo para usarse en distintos proyectos

---

## Qué problema de DX resuelve

La herramienta mejora la experiencia de desarrollo porque reduce fricción en tareas como:

- probar paletas nuevas
- ajustar tonos y contrastes
- validar resultados visuales en contexto real
- iterar branding sin tocar archivos constantemente
- compartir una herramienta común entre proyectos

En lugar de:

```text
editar archivo → guardar → refrescar → comparar → repetir
```

permite:

```text
ajustar visualmente → ver resultado inmediato → exportar → aplicar manualmente al código
```

---

## Riesgos del producto que un LLM debe respetar

### Riesgo 1: sobreingeniería

No convertir esta herramienta en un editor universal de tokens.

### Riesgo 2: acoplamiento a framework

No asumir hooks, lifecycle ni patterns de Vue/React/Nuxt.

### Riesgo 3: API innecesariamente grande

No agregar callbacks, observers, adapters o features reactivas si no son imprescindibles para v1.

### Riesgo 4: fuga a producción

No pensar el overlay como si fuera parte permanente del producto host.

No asumir que `productionGuard` reemplaza el import dinámico dev-only del host.

### Riesgo 5: performance mala por ingenuidad

No rescanees el DOM constantemente.
No uses `getComputedStyle` en loops reactivos.
No escribas storage por cada tick.

---

## Reglas de calidad del producto

Todo trabajo futuro debería respetar estas reglas:

1. cambios pequeños y bien delimitados
2. core sin dependencias de UI
3. browser sin globals en top-level
4. textos siempre plain text
5. export estable y seguro
6. persistencia solo en la capa browser
7. exports públicos solo con valores exportables
8. tipados claros y públicos solo cuando sea necesario
9. sin deep imports
10. sin inventar soporte de features no especificadas

---

## Reglas de compatibilidad para LLMs

Si un LLM propone cambios, debe asumir:

### Compatibilidad mínima obligatoria

- browser moderno con soporte de CSS custom properties
- `getComputedStyle`
- `style.setProperty`
- `Shadow DOM` para el overlay

### Compatibilidad de integración

- uso por import estándar de npm
- integración dev-only mediante import dinámico
- consumo desde toolchains modernos como Vite/Nuxt/React

### Compatibilidad que no debe asumir sin confirmar

- soporte nativo para IE
- soporte para frameworks legacy
- soporte para authored source recovery
- soporte completo de todo formato CSS moderno complejo

---

## Qué archivos deberían existir en el proyecto nuevo

Como base conceptual, el repo nuevo debería terminar teniendo:

```text
src/
  shared/
  core/
  browser/
tests/
examples/
docs/
README.md
package.json
tsconfig.json
tsup.config.ts
vitest.config.ts
LICENSE
```

La forma detallada de esa estructura está documentada en la especificación técnica final.

---

## Stack base recomendado

La base tecnológica recomendada para arrancar este proyecto es:

- `TypeScript`
- `tsup`
- `Vitest`
- `Playwright` para smoke tests reales de navegador
- `vanilla DOM API` para el overlay
- `Shadow DOM` para aislar la UI
- `Pointer Events` para mover el panel
- `Clipboard API` para `Copy CSS`

La v1 no debería introducir un framework UI para el overlay salvo que aparezca una razón técnica muy fuerte y demostrable.

---

## Estrategia correcta para empezar la implementación

La forma correcta de empezar no es por el panel visual, sino por el contrato interno del producto.

Orden recomendado:

1. scaffold del paquete y packaging npm
2. utilidades puras de `shared`
3. sesión headless de `core`
4. tests del core
5. sample `vanilla` mínimo para validar runtime real
6. overlay `browser`
7. persistencia y movimiento del panel
8. smoke tests reales de navegador
9. documentación y release checks

Esto reduce el riesgo de construir una UI bonita encima de un core ambiguo o incorrecto.

---

## Qué entregable espera el producto

La v1 ideal entrega esto:

1. un paquete headless usable desde código
2. un overlay visual usable en browser
3. examples funcionales
4. documentación clara
5. export CSS y JSON
6. baseline estable y resets correctos
7. integración segura y dev-only

---

## Cómo debería usarlo un proyecto host

Ejemplo conceptual de integración:

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

Punto clave:

- el host decide cuándo montarlo
- el devtool no debe formar parte natural del bundle productivo
- `productionGuard` complementa esta integración, pero no la reemplaza

---

## Señales de que una propuesta va por mal camino

Si un LLM propone algo así, probablemente está desalineado:

1. “hagamos adapters oficiales para varios frameworks en v1”
2. “persistamos todo automáticamente a cada cambio”
3. “reescribamos directamente los archivos CSS del host”
4. “usemos HTML custom para que el panel sea más flexible”
5. “escaneemos constantemente el DOM para detectar nuevas vars”
6. “agreguemos callbacks, eventos, plugin APIs y observers desde el inicio”
7. “soportemos cualquier custom property, no solo color, desde v1”

Todo eso aumenta alcance y degrada la solidez de la primera versión.

---

## Señales de que una propuesta sí va bien encaminada

1. reduce superficie pública
2. deja claro el boundary entre core y browser
3. prioriza export seguro
4. usa defaults estrictos
5. mantiene compatibilidad amplia sin acoplarse a frameworks
6. evita top-level side effects
7. optimiza por claridad y mantenibilidad

---

## Documento complementario obligatorio

Este archivo debe leerse junto con:

`@inume-css-vars-devtools-especificacion-final-v1.md`

Diferencia entre ambos:

- este documento explica el **qué** y el **por qué** del producto
- la especificación técnica explica el **cómo** debe implementarse

---

## Resumen final para cualquier LLM

Si solo pudieras retener una versión corta del contexto, sería esta:

> `@inume/css-vars-devtools` es una librería npm pública, framework-agnostic, pensada como devtool reutilizable para editar variables CSS de color en runtime. Debe tener un core headless y un overlay browser opcional, optimizar oficialmente v1 para `Document/:root`, mantener la persistencia solo en la capa browser, exportar CSS/JSON públicos siempre seguros, no tocar archivos fuente, mantenerse fuera de producción por diseño y priorizar una v1 pequeña, segura, portable y fácil de mantener.

---

## Estado del documento

**Documento de contexto de producto listo para arrancar el proyecto desde cero con apoyo de LLMs.**
