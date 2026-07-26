import { browser } from '$app/environment';
import { STORES, PRODUCTS, DEALS, SERVICIOS, type Product } from '$lib/data/mock';
import { orders, type OrderStatus } from '$lib/stores/app.svelte';
import { citas, type EstadoCita } from '$lib/stores/citas.svelte';

const VENDEDOR_TIENDA_ID = 't1';          // tienda de productos (demo)
const VENDEDOR_SERVICIO_ID = 't9';         // tienda de servicios (demo)

export type ProductoVendedor = Product & { disponible: boolean };

export type OfertaVendedor = {
	id: string;
	tiendaId: string;
	productoId: string;
	precioOriginal: number;
	precioOferta: number;
	etiqueta: string;
	hasta: string;
	activa: boolean;
};

function createVendedor() {
	// ── Tiendas ───────────────────────────────────────────────────────────────
	const tienda         = $derived(STORES.find(t => t.id === VENDEDOR_TIENDA_ID)!);
	const tiendaServicio = $derived(STORES.find(t => t.id === VENDEDOR_SERVICIO_ID)!);
	const serviciosTienda = $derived(SERVICIOS.filter(s => s.tiendaId === VENDEDOR_SERVICIO_ID));

	// ── Catálogo ──────────────────────────────────────────────────────────────
	let catalogo = $state<ProductoVendedor[]>(
		PRODUCTS
			.filter(p => p.storeId === VENDEDOR_TIENDA_ID)
			.map(p => ({ ...p, disponible: (p.stock ?? 0) > 0 }))
	);

	// ── Ofertas ───────────────────────────────────────────────────────────────
	let ofertasState = $state<OfertaVendedor[]>(
		DEALS
			.filter(o => o.storeId === VENDEDOR_TIENDA_ID)
			.map(o => ({
				id: o.id,
				tiendaId: o.storeId,
				productoId: o.productId,
				precioOriginal: o.originalPrice,
				precioOferta: o.dealPrice,
				etiqueta: o.label,
				hasta: new Date(o.finishAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
				activa: o.finishAt > Date.now(),
			}))
	);

	// ── Estado tienda ─────────────────────────────────────────────────────────
	let abierto = $state(true);

	// ── Pedidos (tienda productos) ────────────────────────────────────────────
	const pedidosTienda = $derived(orders.items.filter(p => p.storeId === VENDEDOR_TIENDA_ID));
	const pedidosActivos = $derived(
		pedidosTienda.filter(p => ['confirmed', 'preparing', 'shipping'].includes(p.status))
	);
	const ingresosHoy = $derived(
		pedidosTienda.filter(p => p.status === 'delivered').reduce((s, p) => s + p.total, 0)
	);
	const totalVentasMes = $derived(pedidosTienda.filter(p => p.status === 'delivered').length);
	const ticketPromedio = $derived(
		totalVentasMes > 0
			? Math.round(pedidosTienda.filter(p => p.status === 'delivered').reduce((s, p) => s + p.total, 0) / totalVentasMes)
			: 0
	);

	// ── Citas (tienda servicios) ───────────────────────────────────────────────
	const citasTienda = $derived(citas.items.filter(c => c.tiendaId === VENDEDOR_SERVICIO_ID));

	const citasPendientes = $derived(
		citasTienda.filter(c => ['pendiente', 'solicitada', 'cotizada'].includes(c.estado))
	);

	const citasHoy = $derived.by(() => {
		const hoy = new Date().toISOString().slice(0, 10);
		return citasTienda.filter(c => c.fecha === hoy && !['cancelada', 'cerrada'].includes(c.estado));
	});

	const ingresosCitasMes = $derived(
		citasTienda
			.filter(c => ['completada', 'atendida'].includes(c.estado) && c.precio)
			.reduce((s, c) => s + (c.precio ?? 0), 0)
	);

	return {
		// Tiendas
		get tienda()          { return tienda; },
		get tiendaServicio()  { return tiendaServicio; },
		get serviciosTienda() { return serviciosTienda; },
		get abierto()         { return abierto; },

		// Catálogo
		get catalogo()        { return catalogo; },
		get ofertas()         { return ofertasState; },

		// Pedidos
		get pedidosTienda()   { return pedidosTienda; },
		get pedidosActivos()  { return pedidosActivos; },
		get ingresosHoy()     { return ingresosHoy; },
		get totalVentasMes()  { return totalVentasMes; },
		get ticketPromedio()  { return ticketPromedio; },

		// Citas
		get citasTienda()       { return citasTienda; },
		get citasPendientes()   { return citasPendientes; },
		get citasHoy()          { return citasHoy; },
		get ingresosCitasMes()  { return ingresosCitasMes; },

		toggleAbierto() { abierto = !abierto; },

		// Catálogo CRUD
		toggleDisponible(id: string) {
			const p = catalogo.find(p => p.id === id);
			if (p) p.disponible = !p.disponible;
		},
		updatePrecio(id: string, precio: number) {
			const p = catalogo.find(p => p.id === id);
			if (p) p.price = precio;
		},
		updateStock(id: string, stock: number) {
			const p = catalogo.find(p => p.id === id);
			if (p) { p.stock = stock; p.disponible = stock > 0; }
		},
		addProducto(prod: Omit<ProductoVendedor, 'id' | 'storeId'>) {
			catalogo.push({ ...prod, id: 'pv-' + Date.now(), storeId: VENDEDOR_TIENDA_ID });
		},
		removeProducto(id: string) {
			catalogo = catalogo.filter(p => p.id !== id);
		},

		// Pedidos
		cambiarEstado(pedidoId: string, estado: OrderStatus) {
			const p = orders.items.find(p => p.id === pedidoId);
			if (p) p.status = estado;
		},

		// Ofertas CRUD
		addOferta(o: Omit<OfertaVendedor, 'id'>) {
			ofertasState.push({ ...o, id: 'ov-' + Date.now() });
		},
		removeOferta(id: string) {
			ofertasState = ofertasState.filter(o => o.id !== id);
		},
		toggleOfertaActiva(id: string) {
			const o = ofertasState.find(o => o.id === id);
			if (o) o.activa = !o.activa;
		},

		// Citas
		cambiarEstadoCita(citaId: string, estado: EstadoCita) {
			citas.update(citaId, { estado });
		},
	};
}

export const vendedor = createVendedor();
