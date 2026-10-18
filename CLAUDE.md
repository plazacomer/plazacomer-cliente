# plazacomer-client

Frontend SvelteKit de Plazacomer. Consume el backend en
[plazacomer-cloudflare](../plazacomer-cloudflare/CLAUDE.md), un conjunto de Cloudflare Workers en
Rust que hablan exclusivamente Protobuf.

## Reglas de arquitectura (no negociables)

1. **Prohibido JSON contra los Workers.** Todas las llamadas a `worker-catalog`,
   `worker-catalog-admin` y `worker-user` van con `Accept: application/x-protobuf` y bodies
   serializados con `@bufbuild/protobuf` (`toBinary`/`fromBinary`/`create`), nunca `fetch(...).json()`
   ni `JSON.stringify` hacia estos endpoints.
2. **Nunca dupliques tipos a mano.** Los tipos TS de mensajes viven en `src/lib/gen/*_pb.ts`,
   generados desde `../plazacomer-cloudflare/shared/proto/*.proto` vía
   `yarn generate-proto`. Si falta un campo o mensaje, edítese el `.proto` en
   `plazacomer-cloudflare` y regenera — no agregues un `interface` paralelo en TS.
3. **Un cliente de dominio por Worker.** Sigue el patrón actual (`src/lib/catalog.ts`,
   `src/lib/user.ts`): cada archivo encapsula las llamadas a un Worker específico. No mezcles
   llamadas de dominios distintos (ej. chat, tracking GPS) en el mismo módulo cliente cuando se
   agreguen esos Workers.
4. **El código de `src/lib/*.ts` que habla con los Workers va en inglés** (nombres de función,
   variables, tipos) — refleja uno a uno los identificadores en inglés del `.proto`
   (`GetUserResponse`, `response.success`, `/users/login`, etc., ver
   [plazacomer-cloudflare/CLAUDE.md](../plazacomer-cloudflare/CLAUDE.md)).
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

## Tests E2E (`yarn test:api`)

- `tests/run-e2e.js` orquesta la corrida: crea un directorio `--persist-to` **temporal y aislado**
  (`plazacomer/.wrangler-test-<timestamp>/`, fuera de cualquier repo git), aplica ahí el esquema de
  los dos dominios D1 desde cero, levanta `worker-user`/`worker-catalog`/`worker-catalog-admin`/
  `worker-user-admin` apuntando a esa base temporal, y corre `vitest run`.
  - Dominio `users` (`plazacomer_co_users`): esquema real vía
    **`wrangler d1 migrations apply`** contra `worker-user/migrations/*.sql` — el mismo mecanismo
    que se usaría en un deploy real, no un script ad-hoc. `worker-user` es el único de los cuatro
    Workers con `migrations_dir` configurado (los otros tres comparten la misma base D1, no
    necesitan su propio migrations_dir). Después se aplica `tests/seed-admin.sql` (fixture de
    solo test: un usuario admin ya sembrado, con `d1 execute`, nunca parte de la migración misma
    — sembrar una cuenta admin con ID conocido en una migración real sería un riesgo de seguridad).
  - Dominio `catalog` (`plazacomer_co_catalog`): sigue vía `tests/init-catalog.sql` con
    `d1 execute` — ese Worker todavía no tiene `migrations_dir` propio (ver ADR-005 en
    `arquitectura_applicacion/plazacomer-cloudflare/ADR.md`).
- **Si todos los tests pasan**, borra el directorio temporal completo. **Si algún test falla**, lo
  deja intacto y muestra su ruta por consola para poder inspeccionar el estado exacto en el que
  falló — nunca lo borra en ese caso.
- Esto mantiene los datos de test completamente separados de la base que usan las sesiones
  manuales de `wrangler dev` (`yarn wrangler:user/catalog/admin`, que siguen usando el
  `--persist-to ../../.wrangler` compartido) — la misma base que lee el panel de
  `plazacomer-admin`. Antes de esto, correr el suite E2E localmente filtraba usuarios de prueba
  (`e2e-<timestamp>`) a esa base compartida.
- `yarn db:init:users` corre `wrangler d1 migrations apply` contra la base compartida de dev
  manual (no la temporal de test) — no siembra el admin de prueba (`seed-admin.sql` es solo para
  `test:api`); el primer admin real se siembra a mano en D1, no hay ruta de API para eso.

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
