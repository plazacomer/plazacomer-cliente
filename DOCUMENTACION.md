# PlazaComer — Documentación de Plataforma

> **Estado actual:** MVP funcional (mayo 2026) — Frontend client-side con datos mock.  
> **Stack:** SvelteKit · Svelte 5 (Runes) · TypeScript · TailwindCSS v4  
> **Contexto geográfico:** Colombia — moneda COP, medios de pago locales, ciudades principales.

---

## 1. Objetivo de la plataforma

PlazaComer es un **marketplace hiperlocal** diseñado para digitalizar el comercio de plazas de mercado, galerías comerciales y centros de negocio informales y semiformales de Colombia. Conecta a compradores con tiendas físicas locales que antes solo operaban por presencia o voz a voz, ofreciéndoles una experiencia de compra digital comparable a grandes plataformas — pero con identidad, cercanía y autonomía para el vendedor independiente.

### Propuesta de valor central

| Rol | Propuesta |
|---|---|
| **Comprador** | Descubrir, comparar y pedir a tiendas locales de su plaza desde el celular, con pago digital y entrega a domicilio. |
| **Vendedor** | Tener vitrina digital propia dentro del ecosistema de la plaza, gestionar pedidos y chatear con clientes sin necesidad de conocimiento técnico. |
| **Operador de plaza** | Modernizar su espacio comercial, aumentar ventas y fidelización con datos de comportamiento de compra. |

---

## 2. Arquitectura de módulos actuales

### 2.1 Inicio (`/app/inicio`)

El **feed social** de la aplicación. Es el punto de entrada principal del comprador.

**Funcionalidades:**
- **Stories rail** — acceso rápido a las tiendas que el usuario sigue, con anillo de gradiente tipo Instagram indicando actividad nueva.
- **Feed filtrable por categoría** — filtra en tiempo real por Comida, Moda, Tecnología, Mercado, Servicios, Artesanías o Belleza.
- **Tres tipos de cards en el feed:**
  - **Oferta flash** — precio tachado, badge de descuento, countdown en tiempo real, barra de stock progresiva con alerta de stock crítico (≤5 unidades).
  - **Producto nuevo** — producto publicado recientemente por una tienda seguida.
  - **Video** — contenido de tienda con contador de vistas y botón de play.
- **Acción directa desde feed** — botón "Agregar al carrito" sin necesidad de entrar al perfil de la tienda.

**Tipos de datos clave:** `FeedItem (oferta | producto | video)`, `Oferta`, `Producto`, `Tienda`.

---

### 2.2 Explorar (`/app/explorar`)

Motor de **descubrimiento de tiendas** con búsqueda y filtrado avanzado.

**Funcionalidades:**
- **Búsqueda en tiempo real** — busca por nombre de tienda o descripción.
- **Filtro por categoría** — chips horizontales con emoji y color de categoría.
- **Filtros avanzados** (panel modal `FiltrosAvanzados`):
  - Abierto ahora
  - Rating mínimo (estrellas)
  - Solo tiendas con ofertas activas
  - Solo tiendas que el usuario sigue
  - Precio máximo
  - Distancia máxima (km)
  - Tiempo máximo de entrega (min)
- **Grid de tiendas** responsivo (auto-fill, mínimo 280px) — muestra banner de gradiente, categoría, rating, seguidores, estado abierto/cerrado.
- **Contador de filtros activos** visible en el botón de filtros.

---

### 2.3 Perfil de Tienda (`/app/tienda/[id]`)

Vista completa de una tienda con **4 pestañas navegables**.

**Pestaña Catálogo:**
- Grid de productos (2 columnas mobile, hasta 4 en desktop).
- Botón `+` agrega directo al carrito; si el producto tiene modificadores, abre el `CustomizeModal`.
- Badge de agotado y alerta de stock bajo (≤3).
- Tienda cerrada bloquea toda compra con banner de error.

**Pestaña Ofertas:**
- Lista de ofertas activas de la tienda con countdown, badge de descuento y precio original tachado.

**Pestaña Reseñas:**
- Resumen de rating con promedio numérico, estrellas y distribución por estrella (barra horizontal).
- Filtros por puntuación (1★ a 5★) y orden (recientes, más útiles, mejor/peor puntuadas).
- Cards de reseña con avatar del usuario, texto, foto adjunta y respuesta del vendedor (hilo indentado).
- Botón "Útil" con contador reactivo, marcado por sesión.

**Pestaña Info:**
- Horario, ubicación, métodos de pago aceptados y categoría.

**Otras acciones:**
- Seguir/Dejar de seguir tienda.
- Botón Mensaje (abre chat).
- Botón Compartir.
- Indicador en tiempo real del estado (abierto/cerrado).

---

### 2.4 Personalización de Producto (`CustomizeModal`)

Modal de **configuración de producto** con modificadores dinámicos. Es el componente más rico del flujo de compra.

**Tipos de modificadores:**
| Tipo | Comportamiento | Validación |
|---|---|---|
| `single` | Selección de una opción (radio visual) | Obligatorio: bloquea el botón si no hay selección |
| `multi` | Selección múltiple (checkbox visual) | Min/max configurable; error si supera el máximo |

**Características:**
- Badge "Requerido" en rojo / "Opcional" en gris por cada grupo.
- Indicador de `máx N` en modificadores multi.
- Precio extra por opción sumado en tiempo real al total.
- Contador de cantidad con mínimo 1.
- Campo de notas libres para la cocina.
- Estado de error en footer: lista los modificadores pendientes, deshabilita el botón "Agregar".
- Soporte para **editar un ítem existente del carrito** con valores precargados (modo `initial`).

---

### 2.5 Carrito (`/app/carrito`)

Gestión del carrito de compras con soporte **multi-tienda**.

**Funcionalidades:**
- Agrupación de ítems por tienda con encabezado de tienda (logo, nombre, categoría, método de pago).
- Aviso informativo cuando hay productos de más de una tienda ("cada tienda procesa su pago por separado").
- Por ítem:
  - Emoji del producto sobre fondo de gradiente de la tienda.
  - Resumen de selecciones (modificadores elegidos).
  - Notas del pedido.
  - Precio unitario.
  - **Botón Editar** (icono lápiz + texto) — reabre el `CustomizeModal` con valores actuales.
  - Stepper de cantidad con botón `−` que se convierte en trash cuando `cantidad = 1`.
  - Botón eliminar.
- Subtotal por tienda.
- Panel de resumen lateral/inferior con total general y acceso a checkout.

**Estado:** Persistido en `localStorage` (`pc_cart`). Ítems con modificadores generan un `lineId` único para permitir múltiples variantes del mismo producto.

---

### 2.6 Checkout (`/app/checkout`)

Flujo de pago **por tienda** (multi-step cuando hay más de una tienda en el carrito).

**Secciones del formulario:**
1. **Dirección de entrega** — selector de direcciones guardadas con opción "Otra dirección" + campo libre.
2. **Teléfono de contacto** — con validación de formato colombiano.
3. **Notas para la tienda** — instrucciones especiales, timbre, piso, etc.
4. **Cupón de descuento** — código de texto, validación de tienda aplicable y monto mínimo. Tipos: `porcentaje`, `fijo`, `envio`.
5. **Modo de entrega** — Ahora (~30 min) o Programado (fecha + hora exacta).
6. **Método de pago** — Lista de métodos aceptados por la tienda específica (radio buttons estilizados).

**Resumen lateral:** ítems, subtotal, envío ($4.000 o GRATIS con cupón), descuento aplicado, total.

**Flujo de pago (modal):**
| Fase | Descripción |
|---|---|
| `methods` | Selección de método: Nequi, Daviplata, PSE, Tarjeta, Contraentrega |
| `processing` | Spinner con mensaje "No cierres la ventana", indicador de conexión segura |
| `approved` | Confirmación con método y monto, botón "Siguiente tienda" o "Ver resumen" |
| `rejected` | Error de banco con opción de reintentar o cambiar método |

**Multi-tienda:** barra de progreso con paso actual, tiendas completadas y pendientes visualmente diferenciadas.

**Pantalla de éxito:** comprobantes por tienda (referencia, método, total), total general pagado, botón "Ver mis pedidos". Limpia el carrito y crea los objetos `Pedido` en el store.

---

### 2.7 Pedidos (`/app/pedidos` y `/app/pedidos/[id]`)

Historial y seguimiento de pedidos del usuario.

**Lista de pedidos:**
- Badge de estado: Confirmado, Preparando, En camino, Entregado, Cancelado.
- Badge "Deja tu sugerencia" cuando un pedido entregado tiene el buzón pendiente.
- Badge de recompensa cuando se ganaron puntos.
- Total y fecha de cada pedido.

**Detalle de pedido:**
- **Card de tienda** con badge de estado.
- **CTA de mapa en vivo** — aparece cuando el pedido está en estado `preparing` o `shipping`. Botón con fondo con gradiente de marca y indicador pulsante "EN VIVO" (mock, ruta pendiente).
- **Timeline de estados** — línea vertical con pasos: confirmado → preparando → en camino → entregado. Paso activo marcado con color de marca, completados en verde.
- **Buzón de sugerencias** — visible en pedidos entregados:
  - Rating con emojis (😞 a 😍), con efecto de escala en el seleccionado.
  - Textarea con contador de caracteres.
  - Validaciones: rating obligatorio, mínimo 10 caracteres.
  - Entrega recompensa de puntos al enviar (`+20 puntos`).
  - El mensaje es **privado**, solo visible por la tienda.
- **Cancelación** — disponible en estados `confirmed` y `preparing`. Modal de motivo de cancelación con opciones predefinidas.
- **Calificar pedido** — botón dorado visible en pedidos entregados, abre el buzón.

**Estados del pedido:** `confirmed | preparing | shipping | delivered | cancelled`

---

### 2.8 Mensajes (`/app/mensajes` y `/app/mensajes/[tiendaId]`)

Chat directo entre el comprador y las tiendas.

**Lista de conversaciones:**
- Ordenadas por actividad reciente.
- Badge rojo de mensajes no leídos sobre el avatar de la tienda.
- Preview del último mensaje con resaltado de no-leído.
- Timestamp relativo ("5 min", "2 h", "ayer").

**Vista de conversación:**
- Burbuja de chat diferenciada: cliente (derecha, color de marca) vs. tienda (izquierda, fondo secundario).
- Input de texto con envío por Enter o botón.
- Auto-respuesta simulada de la tienda (`fakeReply`) con delay.
- Marca automática como leído al abrir la conversación.

---

### 2.9 Perfil (`/app/perfil`)

Panel de configuración y cuenta del usuario.

**Funcionalidades:**
- Card de usuario con avatar, nombre, nivel del club de lealtad y puntos de recompensa.
- Acceso rápido a Mis pedidos (con contador de activos).
- Links de navegación: Notificaciones, Mis direcciones, Mis cupones, Vender en PlazaComer.
- **Toggle de modo oscuro** — persistido en localStorage, aplica clase `dark` al `<html>`.
- Cerrar sesión → redirige a `/`.

---

### 2.10 Autenticación (`/login`)

Pantalla de login (flujo de entrada). Actualmente mock sin backend de autenticación.

---

## 3. Modelo de datos

### 3.1 Tienda

```ts
type Tienda = {
  id: string;
  slug: string;
  nombre: string;
  categoria: string;          // food | fashion | tech | market | services | crafts | beauty
  emoji: string;
  logoColor: string;
  bannerGradient: string;
  descripcion: string;
  horario: string;
  pagos: string[];            // ['ePayco', 'Nequi', ...]
  seguidores: number;
  rating: number;
  siguiendo: boolean;
  ubicacion: string;
  estado?: string;            // 'cerrado' | undefined (abierto por defecto)
  ratingResumen?: RatingResumen;
}
```

### 3.2 Producto y Modificadores

```ts
type Producto = {
  id: string;
  tiendaId: string;
  nombre: string;
  descripcion: string;
  precio: number;
  emoji: string;
  categoria: string;
  stock?: number;
  modificadores?: Modificador[];
}

type Modificador = {
  id: string;
  nombre: string;
  tipo: 'single' | 'multi';
  requerido: boolean;
  min?: number;
  max?: number;
  opciones: OpcionMod[];
}

type OpcionMod = {
  id: string;
  nombre: string;
  extra: number;              // costo adicional en COP
}
```

### 3.3 Oferta Flash

```ts
type Oferta = {
  id: string;
  tiendaId: string;
  productoId: string;
  precioOferta: number;
  precioOriginal: number;
  stockOferta: number;
  stockInicial: number;
  etiqueta: string;           // '🔥 Flash 2h', '🛒 Oferta semana'
  finishAt: number;           // timestamp Unix (ms)
}
```

### 3.4 Pedido

```ts
type Pedido = {
  id: string;
  numero: string;             // 'PC-2026-XXXX'
  tiendaId: string;
  items: PedidoItem[];
  estado: PedidoEstado;       // 'confirmed' | 'preparing' | 'shipping' | 'delivered' | 'cancelled'
  fecha: string;
  total: number;
  pasarela: string;
  direccion: string;
  notas?: string;
  timeline: TimelineStep[];
  sugerenciaPendiente: boolean;
  recompensa?: string;
}
```

### 3.5 Cupón

```ts
type Cupon = {
  id: string;
  codigo: string;
  descripcion: string;
  tipo: 'porcentaje' | 'fijo' | 'envio';
  valor: number;
  tiendaId: string | null;    // null = aplica a todas las tiendas
  minimo: number;
  activo: boolean;
}
```

### 3.6 Carrito (CartItem)

```ts
type CartItem = {
  productoId: string;
  tiendaId: string;
  cantidad: number;
  precio: number;
  esOferta?: boolean;
  notas?: string;
  lineId?: string;            // presente cuando el ítem tiene modificadores
  selecciones?: Record<string, string | string[]>;
}
```

---

## 4. Persistencia de estado

Todo el estado relevante se almacena en `localStorage` del navegador (no hay backend todavía):

| Clave | Contenido | Store |
|---|---|---|
| `pc_cart` | Ítems del carrito | `cart` |
| `pc_pedidos` | Historial de pedidos | `pedidos` |
| `pc_mensajes` | Conversaciones | `mensajes` |
| `pc_dark` | Preferencia de tema | `darkMode` |

---

## 5. Categorías y medios de pago soportados

### Categorías

| Slug | Label | Emoji |
|---|---|---|
| `food` | Comida | 🍔 |
| `fashion` | Moda | 👗 |
| `tech` | Tecnología | 💻 |
| `market` | Mercado | 🛒 |
| `services` | Servicios | ⚡ |
| `crafts` | Artesanías | 🎨 |
| `beauty` | Belleza | 💄 |

### Pasarelas de pago registradas

`ePayco` · `PayU` · `Wompi` · `Nequi` · `Daviplata` · `PSE` · `Efectivo contra entrega` · `Enlace de pago`

---

## 6. Rutas de la aplicación

```
/                           → Landing / raíz
/login                      → Autenticación
/app/
  inicio                    → Feed social
  explorar                  → Descubrimiento de tiendas
  tienda/[id]               → Perfil de tienda (catálogo, ofertas, reseñas, info)
  carrito                   → Carrito de compras
  checkout                  → Flujo de pago multi-tienda
  pedidos                   → Historial de pedidos
  pedidos/[id]              → Detalle y seguimiento de pedido
  mensajes                  → Lista de conversaciones
  mensajes/[tiendaId]       → Chat con tienda
  perfil                    → Cuenta y configuración
```

---

## 7. Componentes compartidos

| Componente | Propósito |
|---|---|
| `AppShell` | Shell principal con navegación inferior y header |
| `CustomizeModal` | Modal de personalización de producto con modificadores |
| `TiendaLogo` | Avatar circular de tienda con color de marca |
| `CategoryBadge` | Chip de categoría con emoji y color |
| `CountdownPill` | Chip de countdown con actualización cada segundo |
| `FiltrosAvanzados` | Panel modal de filtros de búsqueda avanzada |
| `GlobalSearch` | Búsqueda global (componente disponible) |
| `ui/Button` | Botón con variantes: `brand`, `ghost`, `outline`, `danger`, `promo` |
| `ui/Badge` | Chip informativo con variantes de color |
| `ui/Card` | Contenedor de card con sombra y borde |
| `ui/Icon` | SVG icon system con ~40 iconos inline |

---

## 8. Funcionalidades pendientes / en construcción

Las siguientes funcionalidades están scaffoldeadas en navegación pero sin implementación completa:

- **Notificaciones push** — ruta y opción en perfil presente, sin lógica.
- **Gestión de direcciones** — opción en perfil, sin CRUD completo.
- **Gestión de cupones del usuario** — opción en perfil, sin listado.
- **Portal de vendedor** — opción "Vender en PlazaComer" en perfil, sin ruta.
- **Mapa en tiempo real del repartidor** — CTA presente en detalle de pedido, muestra toast "Próximamente".
- **Módulo de repartidor** — no existe vista ni lógica de repartidor.
- **Backend / API real** — todo opera con datos mock en memoria + localStorage.
- **Autenticación real** — pantalla de login existe, sin integración de auth.
- **Reseñas desde el cliente** — se pueden ver reseñas pero no se pueden escribir desde la app.
- **Búsqueda de productos** — la búsqueda en Explorar aplica solo a tiendas, no a productos individuales.

---

## 9. Flujos de usuario documentados

### Flujo de compra estándar
```
Inicio/Explorar
  → Perfil de tienda
    → [si tiene modificadores] CustomizeModal
  → Carrito
    → [editar ítem] CustomizeModal (modo edición)
  → Checkout
    → Seleccionar dirección
    → [opcional] Cupón
    → Seleccionar entrega (ahora / programado)
    → Seleccionar método de pago
    → Modal de pago (methods → processing → approved/rejected)
  → Pantalla de éxito
  → Pedidos
```

### Flujo de sugerencia post-pedido
```
Pedido entregado
  → Badge "Deja tu sugerencia"
  → Buzón de sugerencias (rating emoji + texto)
  → Envío → Recompensa de puntos
```

### Flujo de cancelación
```
Pedido confirmado o preparando
  → Detalle de pedido
  → "Cancelar pedido"
  → Modal de motivo
  → Confirmar cancelación
```

---

## 10. Sistema de lealtad y recompensas

Actualmente implementado de forma básica:

- El usuario tiene un **nivel** (Oro) y **puntos de recompensa** (340 pts).
- Los puntos se otorgan al enviar un buzón de sugerencias (+20 puntos, configurable en el store).
- Badge `🎁 Recompensa` en la lista de pedidos cuando se ganaron puntos.
- El club tiene niveles (al menos "Oro" está definido), sin lógica de progresión implementada.

---

## 11. Consideraciones técnicas

- **Svelte 5 Runes** — el estado usa `$state`, `$derived`, `$effect` en lugar de stores tradicionales de Svelte 4.
- **Sin SSR activo** — la app es client-side rendering; `$app/stores` y `localStorage` son el único state layer.
- **Sin backend** — no hay API calls, autenticación real, ni base de datos. Todo es mock en `src/lib/data/mock.ts`.
- **Responsive** — diseñado mobile-first con breakpoints `lg:` para tablet/desktop. Navegación inferior en mobile, lateral en desktop.
- **Dark mode** — implementado con variable CSS `--c-*` y clase `dark` en el `<html>`. Persiste en localStorage.
- **Multi-tienda** — el carrito y el checkout soportan nativamente productos de múltiples tiendas con flujos de pago independientes por tienda.
