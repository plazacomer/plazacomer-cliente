# Plan: integración completa de shadcn-svelte en plazacomer-client

> **Estado (2026-07-25): Fases 1–5 ya fueron ejecutadas por Claude directamente en este repo**
> (el usuario pidió que se ejecutara en vez de dejarlo solo para Gemini). El kit legacy
> (`Button.svelte`, `Card.svelte`, `Badge.svelte`) ya no existe — todo corre sobre shadcn. Este
> documento queda como registro de lo que se hizo (y por qué) y como plan real de la **Fase 6**,
> que sigue pendiente y fuera de alcance hasta que el usuario la pida explícitamente. Dos cosas se
> descubrieron ejecutando que no estaban en la versión original de este plan y ya están aplicadas
> en el código: el prop `fullWidth` (ver 3.1bis) y la variante `variant="danger"` de `Button`
> (ver la tabla de 4.1) — ambas se agregaron al sistema en vez de tocar cada call site.

**Este documento es para ti, Gemini.** Fue preparado por Claude tras auditar el repo real (no es
un plan genérico). Cada paso trae la ruta de archivo exacta, el string de código exacto a poner, y
un comando de verificación. **No improvises fuera de lo que dice cada fase** — si algo no cuadra
con lo que ves en el archivo real (línea distinta, archivo que ya no existe, etc.), **detente y
reporta la discrepancia en vez de adivinar cómo resolverla.**

No eres un experto de frontend y este documento asume que no lo eres: por eso cada paso es
mecánico (qué borrar, qué pegar, en qué línea), no conceptual. Si un paso te pide "decidir" algo,
es un error del documento — repórtalo, no decidas tú.

---

## 0. Reglas no negociables (léelas antes de tocar nada)

**No toques estos archivos/carpetas bajo ninguna circunstancia en este plan:**
- `src/lib/gen/**` (tipos generados desde Protobuf)
- `src/lib/*.ts` que hablan con los Workers (`catalog.ts`, `user.ts`, etc.)
- Cualquier `*.proto` (no existe en este repo, vive en `plazacomer-cloudflare`)
- `messages/es.json`, `messages/en.json` (contenido de i18n)
- Nombres de carpetas dentro de `src/routes/**` (deben seguir en inglés, no las renombres)
- No agregues ningún string de texto visible para el usuario que no exista ya. Si un componente
  legacy tenía un texto en español hardcodeado, ese texto se queda igual — solo cambias el
  componente que lo envuelve, nunca el texto.

**Reglas de código de este repo (Svelte 5 + Tailwind v4):**
- Solo runas de Svelte 5 (`$state`, `$derived`, `$props`, `{@render children()}`). Nunca stores de
  Svelte 4 ni hooks de React.
- Nunca colores hardcodeados nuevos (`#2563EB`, `bg-blue-600`, etc.) en un `.svelte`. Todo color
  sale de un token definido en `src/routes/layout.css` (clases `bg-brand`, `text-primary`, etc.).
- No ejecutes `npx shadcn-svelte add <componente>` para ningún componente nuevo salvo que una fase
  de este documento te lo pida explícitamente con el nombre exacto del componente.

**Verificación obligatoria después de CADA fase**, en este orden, sin excepciones:
```bash
npm run check   # svelte-check — errores de tipos
npm run lint    # prettier + eslint
npm run dev     # levanta el servidor
```
Con `npm run dev` corriendo, **abre en el navegador y mira visualmente** al menos las rutas que
la fase tocó (la lista exacta está en cada fase). `npm run check` en verde **no significa que la
fase esté bien** — el bug más probable en este plan es visual (un botón que compila pero se ve
negro, o con el padding equivocado), no un error de tipos. Si algo se ve mal, no sigas a la
siguiente fase: repórtalo.

Si en cualquier fase un comando falla o un archivo no coincide con lo que este documento describe,
**para y reporta** — no intentes "arreglarlo" inventando una solución no descrita aquí.

---

## Diagnóstico: por qué existe este plan

`plazacomer-client` tiene **dos sistemas de UI conviviendo a la vez**:

1. Un kit de componentes hecho a mano: `src/lib/components/ui/Button.svelte`,
   `Card.svelte`, `Badge.svelte`, `Icon.svelte` (con mayúscula inicial).
2. `shadcn-svelte`, ya instalado (`components.json` en la raíz, estilo `nova`) con componentes
   generados en carpetas: `src/lib/components/ui/button/`, `card/`, `badge/`, `select/`,
   `dialog/`, `dropdown-menu/`, `accordion/`, `tabs/`, `input/`, `separator/`, `textarea/`.

Las pantallas más nuevas (`ServicioLanding.svelte`, `ServicioBooking.svelte`, creadas
2026-07-20) **ya usan shadcn**. Las pantallas más viejas (`app/home`, `app/cart`,
`app/checkout`, `app/orders`, etc.) **todavía usan el kit hecho a mano**. Este plan migra lo
viejo hacia lo nuevo, sin romper nada, en fases chicas y verificables.

Además encontramos (y este plan corrige) un bug real ya presente en producción: el token
`--color-accent` de Tailwind está pisado por el color de marca ámbar (`#F59E0B`) en vez del slot
semántico de shadcn, así que cualquier hover de shadcn que use `bg-accent` (menús desplegables,
`<Select>`, el borde del `<Badge variant="outline">`) hoy se pinta de **ámbar** en vez de gris
sutil. La Fase 1 lo arregla de paso.

---

## Fase 0 — Verificación previa (solo lectura, no edites nada)

Antes de tocar código, corre estos comandos y confirma que el resultado coincide con lo que dice
este documento. Si no coincide, **para y reporta la diferencia** — puede que el código haya
cambiado desde que se escribió este plan.

```bash
cd plazacomer-client

# Debe listar exactamente 7 archivos
grep -rl "ui/Button.svelte" src --include='*.svelte'

# Debe listar exactamente 1 archivo: src/routes/app/home/+page.svelte
grep -rl "ui/Card.svelte" src --include='*.svelte'

# Debe listar exactamente 10 archivos
grep -rl "ui/Badge.svelte" src --include='*.svelte'

# Debe listar 1 sola línea (línea ~18): --color-accent: #F59E0B;
grep -n "color-accent:" src/routes/layout.css
```

Si los cuatro comandos devuelven lo esperado, sigue a la Fase 1. Si no, detente.

---

## Fase 1 — Arreglar el theming (el paso más importante)

Archivo: `src/routes/layout.css`. Todos los cambios de esta fase van en ese único archivo.

### 1.1 — Renombrar el token de marca "accent" (libera el nombre para shadcn)

Busca este bloque (dentro de `@theme`, cerca de la línea 18):

```css
  --color-accent: #F59E0B;
  --color-accent-hover: #D97706;
  --color-accent-light: #FFFBEB;
```

Reemplázalo por:

```css
  --color-brand-accent: #F59E0B;
  --color-brand-accent-hover: #D97706;
  --color-brand-accent-light: #FFFBEB;
```

**Verificación de que este rename es seguro:** ya confirmamos que ningún `.svelte` usa las clases
Tailwind `bg-accent-hover` o `bg-accent-light` esperando el color ámbar (esas clases no existían
como tal — nadie las usaba directamente). El único lugar que usa el ámbar de marca lo hace vía
`var(--c-accent)`, una variable CSS **distinta** (con minúscula `c-`, definida más abajo en
`:root`) que este paso **no toca**. Si al buscar `grep -rn "bg-accent-hover\|bg-accent-light"
src --include='*.svelte'` encuentras algún resultado, para y reporta antes de continuar — significa
que el código cambió desde el diagnóstico.

### 1.2 — Agregar el mapeo correcto de `--color-accent` hacia el slot semántico de shadcn

Busca esta línea (cerca de la línea 97, dentro del mismo bloque `@theme`):

```css
  --color-accent-foreground: var(--accent-foreground);
```

Justo antes de esa línea, agrega:

```css
  --color-accent: var(--accent);
```

### 1.3 — Reescribir los tokens semánticos de shadcn en `:root` (modo claro)

Busca este bloque completo (dentro de `:root`, las líneas que van desde `--background:
oklch(1 0 0);` hasta `--ring: oklch(0.708 0 0);` — **no toques** las líneas de `--chart-*` ni
`--sidebar-*` que vienen después, esas quedan igual):

```css
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
```

Reemplázalo por (usamos hex directo, no conviertas nada a oklch):

```css
  --background: #FAFAFA;
  --foreground: #2D2D2D;
  --card: #FFFFFF;
  --card-foreground: #2D2D2D;
  --popover: #FFFFFF;
  --popover-foreground: #2D2D2D;
  --primary: #2563EB;
  --primary-foreground: #FFFFFF;
  --secondary: #F2F2F2;
  --secondary-foreground: #2D2D2D;
  --muted: #F2F2F2;
  --muted-foreground: #6B6B6B;
  --accent: #F2F2F2;
  --accent-foreground: #2D2D2D;
  --destructive: #DC2626;
  --border: #E5E5E5;
  --input: #E5E5E5;
  --ring: #2563EB;
```

Nota: `--accent` queda como un gris sutil (`#F2F2F2`), **no** como el ámbar de marca. Esto es
intencional — son dos conceptos distintos que compartían nombre por error (ver diagnóstico
arriba). El ámbar de marca sigue vivo en `--color-brand-accent` (paso 1.1) para quien lo necesite
de verdad (la Fase 3 lo usa).

También en `:root`, busca `--radius: 0.625rem;` y cámbialo a `--radius: 0.75rem;` (alinea el
radio base de shadcn con el radio que ya usan los botones grandes del kit legacy).

### 1.4 — Reescribir los mismos tokens en `.dark`

Busca este bloque dentro de `.dark { ... }` (desde `--background: oklch(0.145 0 0);` hasta
`--ring: oklch(0.556 0 0);` — de nuevo, no toques `--chart-*` ni `--sidebar-*`):

```css
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
```

Reemplázalo por:

```css
  --background: #0F0F1A;
  --foreground: #F0F0F0;
  --card: #1E1E30;
  --card-foreground: #F0F0F0;
  --popover: #1E1E30;
  --popover-foreground: #F0F0F0;
  --primary: #2563EB;
  --primary-foreground: #FFFFFF;
  --secondary: #1A1A2E;
  --secondary-foreground: #F0F0F0;
  --muted: #1A1A2E;
  --muted-foreground: #A0A0B8;
  --accent: #1A1A2E;
  --accent-foreground: #F0F0F0;
  --destructive: #DC2626;
  --border: #2A2A3E;
  --input: #2A2A3E;
  --ring: #2563EB;
```

### 1.5 — Verificación de la Fase 1

```bash
npm run check
npm run lint
npm run dev
```

Con el navegador abierto en `/app/home` y en el demo de shadcn si existe (busca una ruta bajo
`/demo` o similar; si no existe ninguna, usa `/app/orders`): confirma visualmente que:
- Los botones y links que antes eran azules siguen azules (no se pusieron negros ni grises).
- Ningún fondo se ve ámbar/naranja donde antes no lo estaba (eso confirmaría que el bug del punto
  1.1/1.2 quedó bien resuelto).
- Cambia a modo oscuro (si hay un toggle) y repite la misma revisión visual.

No sigas a la Fase 2 hasta confirmar esto.

---

## Fase 2 — Unificar el paquete de íconos (lucide)

Hoy conviven dos paquetes de lucide: `lucide-svelte` (viejo, `^1.0.1`, usado solo por
`Icon.svelte`) y `@lucide/svelte` (nuevo, `^1.25.0`, usado por todos los componentes shadcn
generados). Confirmamos que `@lucide/svelte` exporta los mismos nombres con mayúscula inicial
(`Home`, `ShoppingCart`, `MessageCircle`, etc.) que `lucide-svelte`, así que el cambio es literal
de una sola línea.

### 2.1 — Editar `src/lib/components/ui/Icon.svelte`

Busca la línea (dentro del bloque `import { Home, Search, ... } from ...`):

```
	} from 'lucide-svelte';
```

Cámbiala por:

```
	} from '@lucide/svelte';
```

No toques nada más en ese archivo — ni el objeto `ICONS`, ni los nombres, ni el resto del
componente.

### 2.2 — Quitar la dependencia vieja

En `package.json`, dentro de `"dependencies"`, borra la línea:

```
    "lucide-svelte": "^1.0.1",
```

Luego corre (este repo usa `yarn.lock` como lockfile activo — es el más reciente, no uses
`npm install` para esto):

```bash
yarn remove lucide-svelte
```

Si `yarn remove` da error porque ya la borraste a mano del `package.json`, en su lugar corre
`yarn install` para que reescriba el lockfile.

### 2.3 — Verificación de la Fase 2

```bash
npm run check
npm run lint
npm run dev
```

Abre cualquier pantalla con íconos (`/app/home` tiene varios: carrito, corazón, etc.) y confirma
que todos los íconos se siguen viendo igual que antes — mismo dibujo, mismo tamaño. Si algún
ícono desaparece o rompe, no sigas: repórtalo.

---

## Fase 3 — Extender los componentes shadcn `button` y `badge` con las variantes de marca

**No crees componentes nuevos.** Vas a agregar variantes dentro de los archivos que shadcn ya
generó, para que un solo `<Button>` y un solo `<Badge>` cubran todo lo que hoy cubren el legacy
`Button.svelte`/`Badge.svelte` más lo que ya cubre shadcn.

### 3.1 — `src/lib/components/ui/button/button.svelte`

Dentro de `export const buttonVariants = tv({ ... variants: { variant: { ... } ...`, busca este
bloque:

```ts
			variant: {
				default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
				outline: "border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground",
				secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
				ghost: "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground",
				destructive: "bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30",
				link: "text-primary underline-offset-4 hover:underline",
			},
```

Agrega dos claves nuevas, `brand` y `promo`, sin tocar las que ya existen:

```ts
			variant: {
				default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
				outline: "border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground",
				secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
				ghost: "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground",
				destructive: "bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30",
				link: "text-primary underline-offset-4 hover:underline",
				brand: "bg-brand text-white hover:bg-brand-hover shadow-brand",
				promo: "bg-promo text-white hover:opacity-90",
				danger: "bg-destructive text-white hover:opacity-90",
			},
```

Ahora, en el mismo objeto `tv()`, busca `variants: { ... size: { ... } }`:

```ts
			size: {
				default: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
				xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
				sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
				lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
				icon: "size-8",
				"icon-xs": "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
				"icon-sm": "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
				"icon-lg": "size-9",
			},
```

Reemplaza **solo** las claves `default`, `sm` y `lg` (deja `xs`, `icon`, `icon-xs`, `icon-sm`,
`icon-lg` exactamente como están, no las toques):

```ts
			size: {
				default: "h-auto gap-2 px-5 py-2.5 text-sm rounded-xl has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
				xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
				sm: "h-auto gap-2 px-3.5 py-1.5 text-xs rounded-lg",
				lg: "h-auto gap-2 px-6 py-3.5 text-[15px] rounded-[14px]",
				icon: "size-8",
				"icon-xs": "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
				"icon-sm": "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
				"icon-lg": "size-9",
			},
```

**Por qué:** nadie en el repo usa hoy `size="sm"` o `size="lg"` del shadcn de fábrica (los únicos
usos de tamaño existentes con shadcn son `size="icon"` e `size="icon-sm"`, que no tocamos), así
que no hay riesgo de romper una pantalla ya migrada. En cambio 6 de las 7 pantallas legacy sí usan
`size="sm"`/`size="lg"` esperando botones grandes y cómodos de tocar (es una tienda para celular);
por eso el tamaño "grande" del kit legacy gana.

**Ojo con `gap-2`:** el `Button` legacy siempre traía `gap-2` en su clase base (para separar ícono
y texto), sin importar el tamaño. Los tres tamaños de arriba (`default`/`sm`/`lg`) tienen que
incluir `gap-2` explícito — si lo omitís, cualquier botón migrado que combine ícono + texto se ve
con el ícono pegado al texto.

**Verificación adicional que sí hicimos (no asumas, repetila si volvés a tocar este archivo):**
`ServicioLanding.svelte` y `ServicioBooking.svelte` ya usan `ui/button` de shadcn y **no** están en
la lista de migración de la Fase 4 — hay que confirmar que cambiar `size="default"` no les rompe
nada. Se revisó cada `<Button` de esos dos archivos que no trae `size=` explícito: los 11 casos
encontrados siempre traen su propio `class="h-... py-..."` (o `h-12`, `w-full h-12`, etc.) que
gana por `tailwind-merge` sobre lo que genera `buttonVariants`, así que el cambio de `default` no
los afecta visualmente. El único lugar de todo el repo que renderiza un `<Button>` sin `size` y sin
`class` propio es el botón "Close" por defecto de `src/lib/components/ui/dialog/dialog-footer.svelte`
— pero ese componente (`Dialog.Footer` con `showCloseButton`) no se usa en ningún archivo de la
app (se confirmó con `grep -rn "Dialog.Footer\|DialogFooter" src --include='*.svelte'`), así que es
código muerto y no hay riesgo real.

### 3.1bis — Prop `fullWidth` (se descubrió al ejecutar la Fase 4, agregalo ahora)

El `Button` legacy tenía un prop `fullWidth?: boolean` que aplica `w-full`, usado en 13 lugares
reales (`checkout`, `cart`, `home`, `orders/[id]`, la portada). El `Button` de shadcn no lo tiene.
En vez de tocar los 13 call sites, agregalo al componente:

En el bloque `export type ButtonProps = ...`, agregá `fullWidth?: boolean;` junto a `variant` y
`size`. En el segundo `<script>`, desestructurá `fullWidth = false` junto a `variant`/`size`. Y en
las dos clases (`<a>` y `<button>`), cambiá `class={cn(buttonVariants({ variant, size }), className)}`
por `class={cn(buttonVariants({ variant, size }), fullWidth && "w-full", className)}`. Con esto los
13 call sites no necesitan ningún cambio para este prop en la Fase 4.

### 3.2 — `src/lib/components/ui/badge/badge.svelte`

Busca:

```ts
	export const badgeVariants = tv({
		base: "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 gap-1 [&>svg]:size-3 [&>svg]:pointer-events-none transition-[color,box-shadow] overflow-hidden",
		variants: {
			variant: {
				default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
				secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
				destructive: "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90",
				outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	});
```

Agrega estas siete claves nuevas dentro de `variant: { ... }`, sin tocar `default`, `secondary`,
`destructive` ni `outline`:

```ts
			variant: {
				default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
				secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
				destructive: "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90",
				outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
				brand: "border-transparent bg-[var(--c-brand-light)] text-[var(--c-brand)]",
				accent: "border-transparent bg-[var(--c-accent-light)] text-[var(--c-accent)]",
				success: "border-transparent bg-[var(--c-success-light)] text-[var(--c-success)]",
				warning: "border-transparent bg-[var(--c-warning-light)] text-[var(--c-warning)]",
				error: "border-transparent bg-[var(--c-error-light)] text-[var(--c-error)]",
				promo: "border-transparent bg-[var(--c-promo-light)] text-[var(--c-promo)]",
				beauty: "border-transparent bg-[var(--c-beauty-light)] text-[var(--c-beauty)]",
			},
```

**Por qué usamos `bg-[var(--c-...)]` en vez de las clases `bg-*-light` que ya existen en
`@theme`:** las clases `bg-*-light` (`bg-brand-light`, `bg-success-light`, etc.) apuntan a colores
fijos definidos una sola vez en `@theme`, **sin versión para modo oscuro**. Las variables
`--c-*-light` en cambio sí tienen un valor distinto dentro de `.dark { ... }` (por ejemplo
`--c-brand-light` es `#EFF6FF` en claro pero `#1A2850` en oscuro). Si usáramos las clases
`bg-*-light`, estos 7 badges se verían con un fondo casi blanco encima de un fondo oscuro en modo
noche. Los botones `brand`/`promo` de la Fase 3.1, en cambio, sí pueden usar `bg-brand`/`bg-promo`
sin problema porque son colores sólidos y saturados con texto blanco — no tienen versión "tenue"
que dependa del modo.

### 3.3 — Verificación de la Fase 3

```bash
npm run check
npm run lint
```

Todavía no hay ningún `.svelte` de pantalla usando estas variantes nuevas (eso es la Fase 4), así
que no deberías ver cambios visuales todavía — solo confirma que no rompiste el archivo (sin
errores de sintaxis TypeScript).

---

## Fase 4 — Migrar cada pantalla del kit legacy al shadcn extendido

Para cada archivo de la lista, hacés dos cosas: (a) cambiar el import, (b) traducir cada prop
`variant=`/`size=` usando las tablas de abajo. **No cambies ningún otro prop, ningún texto, ningún
`class=` existente que no sea `variant`/`size`.**

### 4.1 — Tabla de traducción: `Button`

| Import viejo | Import nuevo |
|---|---|
| `import Button from '$lib/components/ui/Button.svelte';` | `import { Button } from '$lib/components/ui/button';` |

| `variant` viejo | `variant` nuevo |
|---|---|
| `variant="brand"` (o sin `variant`, porque `brand` era el default) | `variant="brand"` |
| `variant="ghost"` | `variant="ghost"` |
| `variant="promo"` | `variant="promo"` |

| `variant="danger"` | `variant="danger"` (agregada al `tv()` en 3.1, existe un uso real en `orders/[id]/+page.svelte:451`, dentro de un botón con atributos multilínea — si buscás con un grep de una sola línea no lo vas a ver) |

(Si encuentras `variant="accent"`, `variant="outline"` o `variant="dark"` en algún archivo de la
lista — no deberían aparecer según nuestra auditoría — para y reporta antes de adivinar cómo
traducirlos. Y **no confíes solo en un grep de una sola línea** para armar esta tabla: los atributos
de un componente a veces están repartidos en varias líneas, como pasó con el `variant="danger"` de
arriba. Antes de dar por cerrada la migración de un archivo, abrilo y mirá cada `<Button` a ojo.)

`size` no cambia de nombre (`sm`/`lg` siguen siendo `sm`/`lg`, y omitir `size` sigue dando el
tamaño grande por defecto) — no necesitas tocar el prop `size` en absoluto.

Archivos a migrar (7):
1. `src/lib/components/TiendaLanding.svelte`
2. `src/routes/+page.svelte`
3. `src/routes/app/home/+page.svelte`
4. `src/routes/app/checkout/+page.svelte`
5. `src/routes/app/cart/+page.svelte`
6. `src/routes/app/orders/+page.svelte`
7. `src/routes/app/orders/[id]/+page.svelte`

Después de cada archivo, antes de pasar al siguiente: `npm run check` y una mirada visual rápida
a esa pantalla en el navegador.

### 4.2 — Tabla de traducción: `Badge`

| Import viejo | Import nuevo |
|---|---|
| `import Badge from '$lib/components/ui/Badge.svelte';` | `import { Badge } from '$lib/components/ui/badge';` |

| `variant` viejo | `variant` nuevo |
|---|---|
| sin `variant` (default) | `variant="secondary"` — **este es el único caso donde el nombre no es igual, prestá atención** |
| `variant="brand"` | `variant="brand"` |
| `variant="accent"` | `variant="accent"` |
| `variant="error"` | `variant="error"` |
| `variant="promo"` | `variant="promo"` |
| `variant="success"` | `variant="success"` |
| `variant="warning"` | `variant="warning"` |
| `variant="beauty"` | `variant="beauty"` |

Archivos a migrar (10):
1. `src/lib/components/TiendaLanding.svelte`
2. `src/routes/seller/appointments/+page.svelte`
3. `src/routes/seller/+page.svelte`
4. `src/routes/seller/orders/+page.svelte`
5. `src/routes/app/home/+page.svelte`
6. `src/routes/app/courier/+page.svelte`
7. `src/routes/app/profile/+page.svelte`
8. `src/routes/app/cart/+page.svelte`
9. `src/routes/app/orders/+page.svelte`
10. `src/routes/app/orders/[id]/+page.svelte`

### 4.3 — `Card` (1 archivo)

En `src/routes/app/home/+page.svelte`:

Cambia el import:
```
import Card from '$lib/components/ui/Card.svelte';
```
por:
```
import { Card } from '$lib/components/ui/card';
```

Hay 3 usos, los tres iguales: `<Card class="animate-slide-up">`. El `Card` de shadcn trae su
propio padding, borde y espaciado interno (`ring-1`, `py-4`, `flex flex-col gap-(--card-spacing)`)
que el `Card` legacy no tenía (el legacy era un `<div>` sin padding ni gap propios, dejaba que el
contenido lo manejara). En los 3 casos cambia:
```
<Card class="animate-slide-up">
```
por:
```
<Card class="animate-slide-up py-0 ring-0 gap-0 border border-border-soft shadow-sm rounded-[18px]">
```
El `gap-0` es necesario además de `py-0`/`ring-0`: sin él, shadcn sigue aplicando `flex flex-col
gap-4` y vas a ver un espacio extra de ~1rem entre los hijos del Card que la versión legacy no
tenía. No toques el `</Card>` de cierre ni nada del contenido entre las etiquetas.

### 4.4 — `Icon` (no se toca en esta fase)

`Icon.svelte` ya se actualizó en la Fase 2 (solo el import interno). Los 28 archivos que usan
`<Icon name="...">` **no se tocan** — siguen llamando al mismo componente con la misma API, nada
cambia para ellos.

### 4.5 — Verificación de la Fase 4

Después de migrar TODOS los archivos de 4.1/4.2/4.3:
```bash
npm run check
npm run lint
npm run build
```
`npm run build` tiene que terminar sin errores — es la señal más fuerte de que no quedó ningún
import roto. Después, con `npm run dev`, revisa visualmente cada una de las 10 rutas tocadas
(home, cart, checkout, orders, orders/[id], seller, seller/orders, seller/appointments, courier,
profile) en claro y oscuro.

---

## Fase 5 — Borrar los componentes legacy

Solo después de que la Fase 4 esté 100% verificada y confirmada visualmente.

Primero confirma que ya no queda ninguna referencia:
```bash
grep -rl "ui/Button.svelte" src --include='*.svelte'   # debe imprimir nada
grep -rl "ui/Card.svelte" src --include='*.svelte'     # debe imprimir nada
grep -rl "ui/Badge.svelte" src --include='*.svelte'    # debe imprimir nada
```

Si los tres comandos no imprimen nada, borra:
- `src/lib/components/ui/Button.svelte`
- `src/lib/components/ui/Card.svelte`
- `src/lib/components/ui/Badge.svelte`

Si **cualquiera** de los tres comandos sí imprime un archivo, no borres nada — significa que a esa
pantalla se le escapó la migración en la Fase 4. Repórtalo.

Verificación final: `npm run check && npm run lint && npm run build`.

---

## Fase 6 — Fuera de alcance por ahora (no la ejecutes sin permiso explícito)

Hay 29 archivos `.svelte` en `src/routes`/`src/lib/components` que usan una etiqueta `<button>`
nativa de HTML en vez de cualquiera de los dos kits (ni legacy ni shadcn). Migrarlos al `<Button>`
de shadcn es un trabajo real pero mucho más grande y con más riesgo de romper estilos puntuales
hechos a mano — **no lo hagas como parte de este plan**. Si terminas las Fases 1–5 y querés seguir,
para y pregúntale al usuario si quiere que abordes esto como un plan aparte.

---

## Qué reportar al terminar

Al final de cada fase (no solo al final de todo), reportá en una lista corta:
- Qué archivos tocaste.
- Resultado de `npm run check` / `npm run lint` / `npm run build` (verde o el error exacto).
- Qué revisaste visualmente y si se veía como se esperaba.
- Cualquier discrepancia entre lo que este documento decía encontrar y lo que realmente
  encontraste en el código (aunque la hayas resuelto).
