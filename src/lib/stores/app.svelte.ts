import { browser } from '$app/env';

export type TimelineStep = { label: string; time: string; done: boolean; active: boolean };
export type OrderItem = { productId: string; quantity: number; price: number };

export type OrderStatus = 'confirmed' | 'preparing' | 'shipping' | 'delivered' | 'cancelled';

export type Order = {
	id: string;
	number: string;
	storeId: string;
	items: OrderItem[];
	status: OrderStatus;
	date: string;
	total: number;
	paymentGateway: string;
	address: string;
	notes?: string;
	timeline: TimelineStep[];
	reviewPromptPending: boolean;
	reward?: string;
};

export type CartItem = {
	productId: string;
	storeId: string;
	quantity: number;
	price: number;
	isDeal?: boolean;
	notes?: string;
	lineId?: string;
	selections?: Record<string, string | string[]>;
};

function createCart() {
	const items = $state<CartItem[]>(
		browser ? JSON.parse(localStorage.getItem('pc_cart_v2') ?? '[]') : []
	);

	$effect.root(() => {
		$effect(() => {
			if (browser) localStorage.setItem('pc_cart_v2', JSON.stringify(items));
		});
	});

	return {
		get items() {
			return items;
		},
		get count() {
			return items.reduce((s, i) => s + i.quantity, 0);
		},
		get total() {
			return items.reduce((s, i) => s + i.price * i.quantity, 0);
		},
		add(item: Omit<CartItem, 'quantity'> & { quantity?: number }) {
			const qty = item.quantity ?? 1;
			const hasSelections = item.selections && Object.keys(item.selections).length > 0;
			if (hasSelections) {
				const lineId = 'li-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
				items.push({ ...item, quantity: qty, lineId });
			} else {
				const existing = items.find(
					(i) => i.productId === item.productId && i.storeId === item.storeId && !i.lineId
				);
				if (existing) {
					existing.quantity += qty;
				} else {
					items.push({
						productId: item.productId,
						storeId: item.storeId,
						price: item.price,
						isDeal: item.isDeal,
						notes: item.notes,
						quantity: qty
					});
				}
			}
		},
		updateQty(key: string, delta: number) {
			const item = items.find((i) => (i.lineId ?? i.productId) === key);
			if (!item) return;
			item.quantity = Math.max(1, item.quantity + delta);
		},
		remove(key: string) {
			const idx = items.findIndex((i) => (i.lineId ?? i.productId) === key);
			if (idx !== -1) items.splice(idx, 1);
		},
		updateItem(lineId: string, updates: Partial<CartItem>) {
			const item = items.find((i) => i.lineId === lineId);
			if (!item) return;
			Object.assign(item, updates);
		},
		clear() {
			items.length = 0;
		}
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
		get value() {
			return dark;
		},
		toggle() {
			dark = !dark;
		}
	};
}

export const cart = createCart();
export const darkMode = createDarkMode();

const MOCK_ORDERS: Order[] = [
	{
		id: 'pm1',
		number: 'PC-2026-D5A1',
		storeId: 't1',
		items: [
			{ productId: 'p1', quantity: 1, price: 28000 },
			{ productId: 'p3', quantity: 2, price: 12000 }
		],
		status: 'shipping',
		date: '18 may. 2026, 12:34',
		total: 56000,
		paymentGateway: 'ePayco',
		address: 'Cra 10 #45-23, El Poblado, Medellín',
		timeline: [
			{ label: 'Pedido confirmado', time: '12:34', done: true, active: false },
			{ label: 'Tienda preparando', time: '12:38', done: true, active: false },
			{ label: 'Repartidor en camino', time: '12:55', done: true, active: true },
			{ label: 'Entregado', time: '', done: false, active: false }
		],
		reviewPromptPending: false
	},
	{
		id: 'pm2',
		number: 'PC-2026-B7C2',
		storeId: 't2',
		items: [{ productId: 'p5', quantity: 3, price: 4500 }],
		status: 'delivered',
		date: '16 may. 2026, 10:15',
		total: 17500,
		paymentGateway: 'PayU',
		address: 'Cra 10 #45-23, El Poblado, Medellín',
		timeline: [
			{ label: 'Pedido confirmado', time: '10:15', done: true, active: false },
			{ label: 'Tienda preparando', time: '10:20', done: true, active: false },
			{ label: 'Repartidor en camino', time: '10:42', done: true, active: false },
			{ label: 'Entregado', time: '11:05', done: true, active: false }
		],
		reviewPromptPending: true
	},
	{
		id: 'pm3',
		number: 'PC-2026-F2E8',
		storeId: 't3',
		items: [{ productId: 'p8', quantity: 1, price: 89000 }],
		status: 'confirmed',
		date: '18 may. 2026, 13:05',
		total: 93000,
		paymentGateway: 'Wompi',
		address: 'Cra 10 #45-23, El Poblado, Medellín',
		timeline: [
			{ label: 'Pedido confirmado', time: '13:05', done: true, active: true },
			{ label: 'Tienda preparando', time: '', done: false, active: false },
			{ label: 'Repartidor en camino', time: '', done: false, active: false },
			{ label: 'Entregado', time: '', done: false, active: false }
		],
		reviewPromptPending: false
	}
];

function createOrders() {
	const items = $state<Order[]>(
		browser ? (JSON.parse(localStorage.getItem('pc_orders') ?? 'null') ?? MOCK_ORDERS) : MOCK_ORDERS
	);

	$effect.root(() => {
		$effect(() => {
			if (browser) localStorage.setItem('pc_orders', JSON.stringify(items));
		});
	});

	return {
		get items() {
			return items;
		},
		get count() {
			return items.length;
		},
		get activeCount() {
			return items.filter((o) => ['confirmed', 'preparing', 'shipping'].includes(o.status)).length;
		},
		add(order: Omit<Order, 'id'>) {
			items.push({
				...order,
				id: 'p-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6)
			});
		},
		cancel(id: string) {
			const o = items.find((o) => o.id === id);
			if (o) o.status = 'cancelled';
		},
		markReviewPromptSent(id: string, reward?: string) {
			const o = items.find((o) => o.id === id);
			if (o) {
				o.reviewPromptPending = false;
				if (reward) o.reward = reward;
			}
		},
		get(id: string) {
			return items.find((o) => o.id === id) ?? null;
		}
	};
}

export const orders = createOrders();

// ── Messages ──────────────────────────────────────────────────────────────────

export type Message = {
	author: 'customer' | 'store';
	text: string;
	time: string;
};

export type Conversation = {
	storeId: string;
	unreadCount: number;
	timeAgo: string;
	lastMessage: string;
	messages: Message[];
};

const MOCK_CONVERSATIONS: Conversation[] = [
	{
		storeId: 't1',
		unreadCount: 2,
		timeAgo: '5 min',
		lastMessage: '¿Quieres agregar algo más a tu pedido? 😊',
		messages: [
			{
				author: 'customer',
				text: 'Hola, ¿tienen bandeja paisa disponible para hoy?',
				time: '12:10'
			},
			{
				author: 'store',
				text: '¡Hola! Sí, tenemos disponibilidad hasta las 8 pm 🍲',
				time: '12:12'
			},
			{ author: 'customer', text: 'Perfecto, acabo de hacer el pedido', time: '12:15' },
			{ author: 'store', text: '¡Lo recibimos! Tiempo estimado: 35 min 🛵', time: '12:16' },
			{ author: 'store', text: '¿Quieres agregar algo más a tu pedido? 😊', time: '12:18' }
		]
	},
	{
		storeId: 't2',
		unreadCount: 0,
		timeAgo: '2 h',
		lastMessage: 'Tu canasta está lista para entrega ✅',
		messages: [
			{ author: 'customer', text: '¿Tienen aguacates Hass frescos hoy?', time: '10:00' },
			{ author: 'store', text: '¡Sí! Llegaron esta mañana del campo 🥑', time: '10:03' },
			{ author: 'customer', text: 'Genial, voy a pedir 3 y la canasta semanal', time: '10:05' },
			{ author: 'store', text: 'Tu canasta está lista para entrega ✅', time: '10:20' }
		]
	},
	{
		storeId: 't4',
		unreadCount: 1,
		timeAgo: 'ayer',
		lastMessage: 'El Hub USB-C que pediste tiene garantía de 1 año 🔧',
		messages: [
			{
				author: 'customer',
				text: '¿El hub USB-C es compatible con MacBook Pro M3?',
				time: 'ayer 15:30'
			},
			{
				author: 'store',
				text: '¡Sí! Funciona perfecto con todos los MacBook desde 2020 💻',
				time: 'ayer 15:35'
			},
			{
				author: 'store',
				text: 'El Hub USB-C que pediste tiene garantía de 1 año 🔧',
				time: 'ayer 15:36'
			}
		]
	}
];

function createMessages() {
	const convs = $state<Conversation[]>(
		browser
			? (JSON.parse(localStorage.getItem('pc_messages') ?? 'null') ?? MOCK_CONVERSATIONS)
			: MOCK_CONVERSATIONS
	);

	$effect.root(() => {
		$effect(() => {
			if (browser) localStorage.setItem('pc_messages', JSON.stringify(convs));
		});
	});

	return {
		get conversations() {
			return convs;
		},
		get totalUnread() {
			return convs.reduce((s, c) => s + c.unreadCount, 0);
		},
		getConversation(storeId: string) {
			return convs.find((c) => c.storeId === storeId) ?? null;
		},
		markRead(storeId: string) {
			const c = convs.find((c) => c.storeId === storeId);
			if (c) c.unreadCount = 0;
		},
		send(storeId: string, text: string) {
			let c = convs.find((c) => c.storeId === storeId);
			if (!c) {
				const newConv: Conversation = {
					storeId,
					unreadCount: 0,
					timeAgo: 'ahora',
					lastMessage: text,
					messages: []
				};
				convs.unshift(newConv);
				c = convs[0];
			}
			const time = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
			c.messages.push({ author: 'customer', text, time });
			c.lastMessage = text;
			c.timeAgo = 'ahora';
			c.unreadCount = 0;
		},
		fakeReply(storeId: string) {
			const c = convs.find((c) => c.storeId === storeId);
			if (!c) return;
			const time = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
			const reply = '¡Recibido! Te responderemos en un momento 🙌';
			c.messages.push({ author: 'store', text: reply, time });
			c.lastMessage = reply;
			c.timeAgo = 'ahora';
		}
	};
}

export const messages = createMessages();

let toastMsg = $state<string | null>(null);
let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const toast = {
	get message() {
		return toastMsg;
	},
	show(msg: string) {
		toastMsg = msg;
		if (toastTimer) clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			toastMsg = null;
		}, 2400);
	}
};
