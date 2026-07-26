import { orders } from '$lib/stores/app.svelte';
import { STORES, getStore } from '$lib/data/mock';

export type EntregaEstado = 'disponible' | 'recogiendo' | 'en_camino' | 'entregado';

export type EntregaActiva = {
	pedidoId: string;
	estado: EntregaEstado;
	recogidoAt: number | null;
	salidaAt: number | null;
};

// Perfil del repartidor (demo estático)
export const REPARTIDOR = {
	nombre: 'Julián Ospina',
	iniciales: 'JO',
	color: '#16A34A',
	vehiculo: '🛵 Moto · YBR 125 · ABC-123',
	rating: 4.9,
	entregasTotal: 847,
	miembroDesde: 'marzo 2025',
};

function createRepartidor() {
	let disponible = $state(true);
	let entregaActiva = $state<EntregaActiva | null>(null);

	// Ganancias acumuladas (demo)
	let gananciasHoy = $state(68000);
	let entregasHoy  = $state(4);

	// Pedidos que el repartidor puede recoger (preparing → shipping disponibles)
	const disponibles = $derived(
		orders.items.filter(p => p.status === 'preparing')
	);

	// Pedido en entrega activa
	const pedidoActivo = $derived.by(() => {
		if (!entregaActiva) return null;
		return orders.items.find(p => p.id === entregaActiva!.pedidoId) ?? null;
	});

	// Historial del repartidor (delivered)
	const historial = $derived(
		orders.items.filter(p => p.status === 'delivered')
	);

	return {
		get disponible()    { return disponible; },
		get entregaActiva() { return entregaActiva; },
		get pedidoActivo()  { return pedidoActivo; },
		get disponibles()   { return disponibles; },
		get historial()     { return historial; },
		get gananciasHoy()  { return gananciasHoy; },
		get entregasHoy()   { return entregasHoy; },

		toggleDisponible() { disponible = !disponible; },

		// Tomar un pedido disponible
		tomarPedido(pedidoId: string) {
			const p = orders.items.find(p => p.id === pedidoId);
			if (!p) return;
			p.status = 'shipping';
			entregaActiva = { pedidoId, estado: 'recogiendo', recogidoAt: null, salidaAt: null };
		},

		// Marcar recogido en la tienda
		marcarRecogido() {
			if (!entregaActiva) return;
			entregaActiva.estado = 'en_camino';
			entregaActiva.recogidoAt = Date.now();
		},

		// Marcar entregado al cliente
		marcarEntregado() {
			if (!entregaActiva) return;
			const p = orders.items.find(p => p.id === entregaActiva!.pedidoId);
			if (p) {
				p.status = 'delivered';
				gananciasHoy += Math.round(p.total * 0.1); // 10% comisión demo
				entregasHoy++;
			}
			entregaActiva = null;
		},
	};
}

export const repartidor = createRepartidor();
