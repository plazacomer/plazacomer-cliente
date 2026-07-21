import { browser } from '$app/environment';

export type TimelineStep = {
	label: string;
	time: string;
	done: boolean;
	active: boolean;
};

export type PedidoItem = {
	productoId: string;
	cantidad: number;
	precio: number;
};

export type PedidoEstado = 'confirmed' | 'preparing' | 'shipping' | 'delivered' | 'cancelled';

export type Pedido = {
	id: string;
	numero: string;
	tiendaId: string;
	items: PedidoItem[];
	estado: PedidoEstado;
	fecha: string;
	total: number;
	pasarela: string;
	direccion: string;
	notas?: string;
	timeline: TimelineStep[];
	sugerenciaPendiente: boolean;
	recompensa?: string;
};

export type CartItem = {
	productoId: string;
	tiendaId: string;
	cantidad: number;
	precio: number;
	esOferta?: boolean;
	notas?: string;
	lineId?: string;
	selecciones?: Record<string, string | string[]>;
};

function createCart() {
	let items = $state<CartItem[]>(
		browser ? JSON.parse(localStorage.getItem('pc_cart') ?? '[]') : []
	);

	$effect.root(() => {
		$effect(() => {
			if (browser) localStorage.setItem('pc_cart', JSON.stringify(items));
		});
	});

	return {
		get items() { return items; },
		get count() { return items.reduce((s, i) => s + i.cantidad, 0); },
		get total() { return items.reduce((s, i) => s + i.precio * i.cantidad, 0); },
		add(item: Omit<CartItem, 'cantidad'> & { cantidad?: number }) {
			const qty = item.cantidad ?? 1;
			const hasSelecciones = item.selecciones && Object.keys(item.selecciones).length > 0;
			if (hasSelecciones) {
				const lineId = 'li-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
				items.push({ ...item, cantidad: qty, lineId });
			} else {
				const existing = items.find(
					(i) => i.productoId === item.productoId && i.tiendaId === item.tiendaId && !i.lineId
				);
				if (existing) {
					existing.cantidad += qty;
				} else {
					items.push({ productoId: item.productoId, tiendaId: item.tiendaId, precio: item.precio, esOferta: item.esOferta, notas: item.notas, cantidad: qty });
				}
			}
		},
		updateQty(key: string, delta: number) {
			const item = items.find((i) => (i.lineId ?? i.productoId) === key);
			if (!item) return;
			item.cantidad = Math.max(1, item.cantidad + delta);
		},
		remove(key: string) {
			const idx = items.findIndex((i) => (i.lineId ?? i.productoId) === key);
			if (idx !== -1) items.splice(idx, 1);
		},
		updateItem(lineId: string, updates: Partial<CartItem>) {
			const item = items.find((i) => i.lineId === lineId);
			if (!item) return;
			Object.assign(item, updates);
		},
		clear() {
			items.length = 0;
		},
	};
}

function createDarkMode() {
	let dark = $state(browser ? localStorage.getItem('pc_dark') === '1' : false);

	$effect.root(() => {
		$effect(() => {
			if (browser) {
				localStorage.setItem('pc_dark', dark ? '1' : '0');
				document.documentElement.classList.toggle('dark', dark);
			}
		});
	});

	return {
		get value() { return dark; },
		toggle() { dark = !dark; },
	};
}

export const cart = createCart();
export const darkMode = createDarkMode();

const MOCK_PEDIDOS: Pedido[] = [
	{
		id: 'pm1',
		numero: 'PC-2026-D5A1',
		tiendaId: 't1',
		items: [
			{ productoId: 'p1', cantidad: 1, precio: 28000 },
			{ productoId: 'p3', cantidad: 2, precio: 12000 },
		],
		estado: 'shipping',
		fecha: '18 may. 2026, 12:34',
		total: 56000,
		pasarela: 'ePayco',
		direccion: 'Cra 10 #45-23, El Poblado, Medellín',
		timeline: [
			{ label: 'Pedido confirmado', time: '12:34', done: true, active: false },
			{ label: 'Tienda preparando', time: '12:38', done: true, active: false },
			{ label: 'Repartidor en camino', time: '12:55', done: true, active: true },
			{ label: 'Entregado', time: '', done: false, active: false },
		],
		sugerenciaPendiente: false,
	},
	{
		id: 'pm2',
		numero: 'PC-2026-B7C2',
		tiendaId: 't2',
		items: [{ productoId: 'p5', cantidad: 3, precio: 4500 }],
		estado: 'delivered',
		fecha: '16 may. 2026, 10:15',
		total: 17500,
		pasarela: 'PayU',
		direccion: 'Cra 10 #45-23, El Poblado, Medellín',
		timeline: [
			{ label: 'Pedido confirmado', time: '10:15', done: true, active: false },
			{ label: 'Tienda preparando', time: '10:20', done: true, active: false },
			{ label: 'Repartidor en camino', time: '10:42', done: true, active: false },
			{ label: 'Entregado', time: '11:05', done: true, active: false },
		],
		sugerenciaPendiente: true,
	},
	{
		id: 'pm3',
		numero: 'PC-2026-F2E8',
		tiendaId: 't3',
		items: [{ productoId: 'p8', cantidad: 1, precio: 89000 }],
		estado: 'confirmed',
		fecha: '18 may. 2026, 13:05',
		total: 93000,
		pasarela: 'Wompi',
		direccion: 'Cra 10 #45-23, El Poblado, Medellín',
		timeline: [
			{ label: 'Pedido confirmado', time: '13:05', done: true, active: true },
			{ label: 'Tienda preparando', time: '', done: false, active: false },
			{ label: 'Repartidor en camino', time: '', done: false, active: false },
			{ label: 'Entregado', time: '', done: false, active: false },
		],
		sugerenciaPendiente: false,
	},
];

function createPedidos() {
	let items = $state<Pedido[]>(
		browser ? (JSON.parse(localStorage.getItem('pc_pedidos') ?? 'null') ?? MOCK_PEDIDOS) : MOCK_PEDIDOS
	);

	$effect.root(() => {
		$effect(() => {
			if (browser) localStorage.setItem('pc_pedidos', JSON.stringify(items));
		});
	});

	return {
		get items() { return items; },
		get count() { return items.length; },
		get activeCount() {
			return items.filter((p) => ['confirmed', 'preparing', 'shipping'].includes(p.estado)).length;
		},
		add(pedido: Omit<Pedido, 'id'>) {
			items.push({ ...pedido, id: 'p-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6) });
		},
		cancel(id: string) {
			const p = items.find((p) => p.id === id);
			if (p) p.estado = 'cancelled';
		},
		markSugerenciaEnviada(id: string, recompensa?: string) {
			const p = items.find((p) => p.id === id);
			if (p) {
				p.sugerenciaPendiente = false;
				if (recompensa) p.recompensa = recompensa;
			}
		},
		get(id: string) {
			return items.find((p) => p.id === id) ?? null;
		},
	};
}

export const pedidos = createPedidos();

// ── Mensajes ──────────────────────────────────────────────────────────────────

export type Mensaje = {
	autor: 'cliente' | 'tienda';
	texto: string;
	hora: string;
};

export type Conversacion = {
	tiendaId: string;
	noLeidos: number;
	hace: string;
	ultimo: string;
	mensajes: Mensaje[];
};

const MOCK_CONVERSACIONES: Conversacion[] = [
	{
		tiendaId: 't1',
		noLeidos: 2,
		hace: '5 min',
		ultimo: '¿Quieres agregar algo más a tu pedido? 😊',
		mensajes: [
			{ autor: 'cliente', texto: 'Hola, ¿tienen bandeja paisa disponible para hoy?', hora: '12:10' },
			{ autor: 'tienda', texto: '¡Hola! Sí, tenemos disponibilidad hasta las 8 pm 🍲', hora: '12:12' },
			{ autor: 'cliente', texto: 'Perfecto, acabo de hacer el pedido', hora: '12:15' },
			{ autor: 'tienda', texto: '¡Lo recibimos! Tiempo estimado: 35 min 🛵', hora: '12:16' },
			{ autor: 'tienda', texto: '¿Quieres agregar algo más a tu pedido? 😊', hora: '12:18' },
		],
	},
	{
		tiendaId: 't2',
		noLeidos: 0,
		hace: '2 h',
		ultimo: 'Tu canasta está lista para entrega ✅',
		mensajes: [
			{ autor: 'cliente', texto: '¿Tienen aguacates Hass frescos hoy?', hora: '10:00' },
			{ autor: 'tienda', texto: '¡Sí! Llegaron esta mañana del campo 🥑', hora: '10:03' },
			{ autor: 'cliente', texto: 'Genial, voy a pedir 3 y la canasta semanal', hora: '10:05' },
			{ autor: 'tienda', texto: 'Tu canasta está lista para entrega ✅', hora: '10:20' },
		],
	},
	{
		tiendaId: 't4',
		noLeidos: 1,
		hace: 'ayer',
		ultimo: 'El Hub USB-C que pediste tiene garantía de 1 año 🔧',
		mensajes: [
			{ autor: 'cliente', texto: '¿El hub USB-C es compatible con MacBook Pro M3?', hora: 'ayer 15:30' },
			{ autor: 'tienda', texto: '¡Sí! Funciona perfecto con todos los MacBook desde 2020 💻', hora: 'ayer 15:35' },
			{ autor: 'tienda', texto: 'El Hub USB-C que pediste tiene garantía de 1 año 🔧', hora: 'ayer 15:36' },
		],
	},
];

function createMensajes() {
	let convs = $state<Conversacion[]>(
		browser ? (JSON.parse(localStorage.getItem('pc_mensajes') ?? 'null') ?? MOCK_CONVERSACIONES) : MOCK_CONVERSACIONES
	);

	$effect.root(() => {
		$effect(() => {
			if (browser) localStorage.setItem('pc_mensajes', JSON.stringify(convs));
		});
	});

	return {
		get conversaciones() { return convs; },
		get totalNoLeidos() { return convs.reduce((s, c) => s + c.noLeidos, 0); },
		getConv(tiendaId: string) {
			return convs.find((c) => c.tiendaId === tiendaId) ?? null;
		},
		markRead(tiendaId: string) {
			const c = convs.find((c) => c.tiendaId === tiendaId);
			if (c) c.noLeidos = 0;
		},
		send(tiendaId: string, texto: string) {
			let c = convs.find((c) => c.tiendaId === tiendaId);
			if (!c) {
				const nuevo: Conversacion = {
					tiendaId,
					noLeidos: 0,
					hace: 'ahora',
					ultimo: texto,
					mensajes: [],
				};
				convs.unshift(nuevo);
				c = convs[0];
			}
			const hora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
			c.mensajes.push({ autor: 'cliente', texto, hora });
			c.ultimo = texto;
			c.hace = 'ahora';
			c.noLeidos = 0;
		},
		fakeReply(tiendaId: string) {
			const c = convs.find((c) => c.tiendaId === tiendaId);
			if (!c) return;
			const hora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
			const respuesta = '¡Recibido! Te responderemos en un momento 🙌';
			c.mensajes.push({ autor: 'tienda', texto: respuesta, hora });
			c.ultimo = respuesta;
			c.hace = 'ahora';
		},
	};
}

export const mensajes = createMensajes();

let toastMsg = $state<string | null>(null);
let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const toast = {
	get message() { return toastMsg; },
	show(msg: string) {
		toastMsg = msg;
		if (toastTimer) clearTimeout(toastTimer);
		toastTimer = setTimeout(() => { toastMsg = null; }, 2400);
	},
};
