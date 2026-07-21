import { browser } from '$app/environment';
import { getProduct, type Product } from '$lib/data/mock';

export type Lista = {
	id: string;
	nombre: string;
	emoji: string;
	items: Array<{ productoId: string; cantidad: number }>;
	createdAt: number;
};

export const EMOJIS_LISTA = ['🛒', '🥑', '🍔', '🎉', '🏠', '🧺', '☕', '🥗', '🍱', '🎂', '🧼', '🐾'];

const FAV_KEY = 'pc_favoritos_v1';
const LISTAS_KEY = 'pc_listas_v1';

function readIds(): string[] {
	if (!browser) return [];
	try {
		const r = localStorage.getItem(FAV_KEY);
		if (r) return JSON.parse(r);
	} catch { /* */ }
	return [];
}

function readListas(): Lista[] {
	if (!browser) return [];
	try {
		const r = localStorage.getItem(LISTAS_KEY);
		if (r) return JSON.parse(r);
	} catch { /* */ }
	return [];
}

function createFavoritosStore() {
	let ids = $state<string[]>(readIds());
	let listas = $state<Lista[]>(readListas());

	function persistIds() {
		if (browser) localStorage.setItem(FAV_KEY, JSON.stringify(ids));
	}
	function persistListas() {
		if (browser) localStorage.setItem(LISTAS_KEY, JSON.stringify(listas));
	}

	return {
		// ── Favoritos ──────────────────────────────────────────────
		get ids() { return ids; },
		get productos(): Product[] {
			return ids.map(id => getProduct(id)).filter(Boolean) as Product[];
		},
		isFavorito(id: string): boolean {
			return ids.includes(id);
		},
		toggle(id: string): boolean {
			if (ids.includes(id)) {
				ids = ids.filter(x => x !== id);
			} else {
				ids = [id, ...ids];
			}
			persistIds();
			return ids.includes(id);
		},

		// ── Listas ─────────────────────────────────────────────────
		get listas(): Lista[] {
			return [...listas].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
		},
		getLista(id: string): Lista | undefined {
			return listas.find(l => l.id === id);
		},
		createLista({ nombre, emoji, items = [] }: { nombre: string; emoji?: string; items?: Lista['items'] }): Lista {
			const lista: Lista = {
				id: 'l-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
				nombre: nombre || 'Mi lista',
				emoji: emoji || '🧺',
				items: items.map(it => ({ productoId: it.productoId, cantidad: it.cantidad || 1 })),
				createdAt: Date.now(),
			};
			listas = [...listas, lista];
			persistListas();
			return lista;
		},
		updateLista(id: string, patch: Partial<Pick<Lista, 'nombre' | 'emoji'>>) {
			listas = listas.map(l => l.id === id ? { ...l, ...patch } : l);
			persistListas();
		},
		deleteLista(id: string) {
			listas = listas.filter(l => l.id !== id);
			persistListas();
		},
		addItemToLista(listaId: string, productoId: string) {
			listas = listas.map(l => {
				if (l.id !== listaId) return l;
				const ex = l.items.find(i => i.productoId === productoId);
				if (ex) return { ...l, items: l.items.map(i => i.productoId === productoId ? { ...i, cantidad: i.cantidad + 1 } : i) };
				return { ...l, items: [...l.items, { productoId, cantidad: 1 }] };
			});
			persistListas();
		},
		removeItemFromLista(listaId: string, productoId: string) {
			listas = listas.map(l => l.id === listaId ? { ...l, items: l.items.filter(i => i.productoId !== productoId) } : l);
			persistListas();
		},
		totalLista(lista: Lista): number {
			return lista.items.reduce((s, it) => {
				const p = getProduct(it.productoId);
				return s + (p ? p.price * (it.cantidad || 1) : 0);
			}, 0);
		},
	};
}

export const favoritos = createFavoritosStore();
