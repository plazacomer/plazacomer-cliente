<script lang="ts">
	import { goto } from '$app/navigation';
	import { orders, cart, toast, type Order } from '$lib/stores/app.svelte';
	import { getStore } from '$lib/data/mock';
	import { favoritos } from '$lib/stores/favoritos.svelte';
	import { fmtCOP } from '$lib/utils';
	import TiendaLogo from '$lib/components/TiendaLogo.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { Button } from '$lib/components/ui/button';
	import type { OrderStatus } from '$lib/stores/app.svelte';

	function pedirDeNuevo(pedido: Order) {
		pedido.items.forEach((item) => {
			cart.add({
				productId: item.productId,
				storeId: pedido.storeId,
				price: item.price,
				quantity: item.quantity
			});
		});
		toast.show(
			`✓ ${pedido.items.length} producto${pedido.items.length !== 1 ? 's' : ''} agregado${pedido.items.length !== 1 ? 's' : ''} al carrito`
		);
		goto('/app/cart');
	}

	function guardarComoLista(pedido: Order) {
		const tienda = getStore(pedido.storeId);
		favoritos.createLista({
			nombre: `Pedido ${tienda.name} · ${pedido.date}`,
			emoji: tienda.emoji,
			items: pedido.items.map((i) => ({ productoId: i.productId, cantidad: i.quantity }))
		});
		toast.show('✓ Lista guardada en Guardados');
	}

	const estadoMap: Record<
		OrderStatus,
		{ variant: 'brand' | 'accent' | 'success' | 'error' | 'default'; label: string }
	> = {
		confirmed: { variant: 'brand', label: '✓ Confirmado' },
		preparing: { variant: 'accent', label: '⏳ Preparando' },
		shipping: { variant: 'brand', label: '🚚 En camino' },
		delivered: { variant: 'success', label: '✅ Entregado' },
		cancelled: { variant: 'error', label: '✕ Cancelado' }
	};
</script>

<div class="mx-auto max-w-[900px] px-4 pt-5 pb-12">
	<h1 class="mb-1 font-display text-[26px] font-extrabold">Mis pedidos</h1>
	<p class="mb-5 text-sm" style="color:var(--c-text-secondary)">
		{orders.count} pedido{orders.count !== 1 ? 's' : ''} en total
	</p>

	{#if orders.items.length === 0}
		<div class="pt-12 text-center">
			<div class="mb-4 text-6xl">📦</div>
			<h2 class="mb-2 font-display text-xl font-bold">Sin pedidos aún</h2>
			<p class="mb-6 text-sm" style="color:var(--c-text-secondary)">
				Explora las tiendas y haz tu primer pedido.
			</p>
			<Button variant="brand" onclick={() => goto('/app/explore')}>
				<Icon name="search" size={16} />
				Explorar tiendas
			</Button>
		</div>
	{:else}
		<div class="flex flex-col gap-3.5">
			{#each orders.items as pedido}
				{@const tienda = getStore(pedido.storeId)}
				{@const estado = estadoMap[pedido.status]}
				<div
					class="overflow-hidden rounded-2xl border"
					style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
				>
					<button
						onclick={() => goto(`/app/orders/${pedido.id}`)}
						class="flex w-full items-center gap-3.5 p-4 text-left transition-all hover:bg-[var(--c-bg-secondary)]"
					>
						<TiendaLogo {tienda} size={48} />
						<div class="min-w-0 flex-1">
							<div class="mb-1 flex flex-wrap items-center gap-2">
								<span class="font-display text-sm font-bold">{tienda.name}</span>
								<span class="font-mono text-[11px]" style="color:var(--c-text-muted)">
									{pedido.number}
								</span>
							</div>
							<div class="mb-1.5 text-xs" style="color:var(--c-text-secondary)">
								{pedido.items.length} producto{pedido.items.length !== 1 ? 's' : ''} · {pedido.date}
							</div>
							<div class="flex flex-wrap items-center gap-1.5">
								<Badge variant={estado.variant}>{estado.label}</Badge>
								{#if pedido.reviewPromptPending}
									<Badge variant="promo">💬 Deja tu sugerencia</Badge>
								{/if}
								{#if pedido.reward}
									<Badge variant="accent">🎁 Recompensa</Badge>
								{/if}
							</div>
						</div>
						<div class="shrink-0 text-right">
							<div class="font-mono text-base font-semibold">{fmtCOP(pedido.total)}</div>
							<Icon name="arrowRight" size={18} color="var(--c-text-muted)" />
						</div>
					</button>

					<!-- Acciones para pedidos entregados -->
					{#if pedido.status === 'delivered'}
						<div
							class="flex gap-2 border-t border-[var(--c-border-soft)] px-4 pt-0 pb-3.5"
							style="background:var(--c-bg-secondary)"
						>
							<button
								onclick={() => pedirDeNuevo(pedido)}
								class="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12.5px] font-bold text-white"
								style="background:var(--c-brand)"
							>
								<Icon name="cart" size={13} />
								Pedir de nuevo
							</button>
							<button
								onclick={() => guardarComoLista(pedido)}
								class="flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[12.5px] font-bold"
								style="background:var(--c-bg-card);border-color:var(--c-border);color:var(--c-text-primary)"
							>
								<Icon name="heart" size={13} />
								Guardar lista
							</button>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
