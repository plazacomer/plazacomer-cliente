# plazacomer-client

Frontend SvelteKit de Plazacomer. Consume el backend en
[plazacomer-claudflare](../plazacomer-claudflare/CLAUDE.md), un conjunto de Cloudflare Workers en
Rust que hablan exclusivamente Protobuf.

## Reglas de arquitectura (no negociables)

1. **Prohibido JSON contra los Workers.** Todas las llamadas a `worker-catalog`,
   `worker-catalog-admin` y `worker-user` van con `Accept: application/x-protobuf` y bodies
   serializados con `@bufbuild/protobuf` (`toBinary`/`fromBinary`/`create`), nunca `fetch(...).json()`
   ni `JSON.stringify` hacia estos endpoints.
2. **Nunca dupliques tipos a mano.** Los tipos TS de mensajes viven en `src/lib/gen/*_pb.ts`,
   generados desde `../plazacomer-claudflare/shared/proto/*.proto` vía
   `npm run generate-proto`. Si falta un campo o mensaje, edítese el `.proto` en
   `plazacomer-claudflare` y regenera — no agregues un `interface` paralelo en TS.
3. **Un cliente de dominio por Worker.** Sigue el patrón actual (`src/lib/catalog.ts`,
   `src/lib/user.ts`): cada archivo encapsula las llamadas a un Worker específico. No mezcles
   llamadas de dominios distintos (ej. chat, tracking GPS) en el mismo módulo cliente cuando se
   agreguen esos Workers.
4. **El código de `src/lib/*.ts` que habla con los Workers va en inglés** (nombres de función,
   variables, tipos) — refleja uno a uno los identificadores en inglés del `.proto`
   (`GetUserResponse`, `response.success`, `/users/login`, etc., ver
   [plazacomer-claudflare/CLAUDE.md](../plazacomer-claudflare/CLAUDE.md)).
5. **El texto que ve el usuario final se traduce con i18n (Paraglide JS), nunca en el backend ni
   hardcodeado en el componente.** El backend devuelve `message` en inglés como texto de
   desarrollo/log, no como copy para mostrar. Todo string visible para el usuario va en
   `messages/es.json` (locale base) y `messages/en.json`, se consume vía
   `import { m } from '$lib/paraglide/messages.js'` y se llama `m.nombre_del_mensaje()` — nunca un
   string literal en el `.svelte`. Ver la sección de i18n abajo para el estado real.
6. **Las carpetas de rutas de `src/routes` van en inglés.** Ej. `app/store`, `app/cart`,
   `app/messages`, `seller/catalog` — no `app/tienda`, `app/carrito`, `vendedor/catalogo`. El
   parámetro dinámico también: `[storeId]`, no `[tiendaId]`.

## i18n (Paraglide JS)

- Librería: `@inlang/paraglide-js` (via `sv add paraglide`), locale base **`es`**, locale adicional
  **`en`**. Config en `project.inlang/settings.json`; mensajes en `messages/es.json`/`messages/en.json`.
- El plugin de Vite (`paraglideVitePlugin` en `vite.config.ts`) compila los mensajes a
  `src/lib/paraglide/` (generado, gitignored) en cada `dev`/`build` — no lo edites a mano, y no hace
  falta correr `paraglide-js compile` manualmente salvo para depurar fuera de Vite.
- Patrón de uso: `import { m } from '$lib/paraglide/messages.js'; import { setLocale } from
  '$lib/paraglide/runtime';` — ver el ejemplo real y funcionando en
  [`/demo/paraglide`](src/routes/demo/paraglide/+page.svelte).
- **Estado real: solo instalado y probado de punta a punta (esta pasada), sin migrar copy
  existente.** Todo el texto Spanish hardcodeado en los ~20 componentes `.svelte` reales
  (`app/home`, `seller/*`, etc.) y en `src/lib/data/mock.ts` **sigue sin pasar por Paraglide** — es
  trabajo incremental pendiente, pantalla por pantalla. No asumas que un string en un componente ya
  usa `m.*` sin verificarlo.

## Notas de honestidad técnica

- Si en el futuro se agregan features de tiempo real (chat, tracking GPS), la base de transporte en
  el navegador debe ser WebSocket, no WebTransport — `workers-rs` en el backend no tiene soporte
  maduro de WebTransport todavía, así que el cliente no debería comprometerse a esa API antes de
  que el backend la soporte de forma estable.
- **No confundir con el trabajo de esta pasada:** las carpetas de `src/routes` ya están en inglés
  (`app/store`, `app/cart`, `app/explore`, `app/saved`, `app/home`, `app/messages/[storeId]`,
  `app/appointments`, `app/orders/[id]`, `app/profile`, `app/courier`, `seller`, `seller/catalog`,
  `seller/appointments`, `seller/deals`, `seller/orders`) y Paraglide está instalado y verificado.
  Lo que **no** se tocó es el copy en sí: `mock.ts` y el texto dentro de cada `.svelte` siguen
  100% en español hardcodeado, sin pasar por `m.*`. Migrarlos pantalla por pantalla es la fase
  siguiente — pídelo explícitamente cuando quieras avanzar con una pantalla concreta.
