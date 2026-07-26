<script lang="ts">
	import { vendedor } from '$lib/stores/vendedor.svelte';
	import { fmtCOP } from '$lib/utils';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import type { OrderStatus } from '$lib/stores/app.svelte';

	type Tab = 'activos' | 'historial';
	let tab = $state<Tab>('activos');

	const lista = $derived(
		tab === 'activos'
			? vendedor.pedidosTienda.filter(p => ['confirmed', 'preparing', 'shipping'].includes(p.status))
			: vendedor.pedidosTienda.filter(p => ['delivered', 'cancelled'].includes(p.status))
	);

	const ESTADO_LABEL: Record<OrderStatus, string> = {
		confirmed: '✓ Confirmado',
		preparing: '⏳ Preparando',
		shipping: '🚚 En camino',
		delivered: '✅ Entregado',
		cancelled: '✕ Cancelado',
	};

	const ESTADO_VARIANT: Record<OrderStatus, 'brand' | 'accent' | 'success' | 'error' | 'default'> = {
		confirmed: 'brand', preparing: 'accent', shipping: 'brand',
		delivered: 'success', cancelled: 'error',
	};

	const TRANSITIONS: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
		confirmed: { next: 'preparing', label: 'Empezar preparación' },
		preparing: { next: 'shipping',  label: 'Enviar a domicilio' },
		shipping:  { next: 'delivered', label: 'Marcar entregado' },
	};

	let expandido = $state<string | null>(null);
</script>

<div class="max-w-2xl mx-auto px-4 pt-6 pb-10">
	<h1 class="font-display text-[24px] font-extrabold mb-1">Pedidos</h1>
	<p class="text-sm mb-5" style="color:var(--c-text-secondary)">
		{vendedor.pedidosTienda.length} pedido{vendedor.pedidosTienda.length !== 1 ? 's' : ''} en total
	</p>

	<!-- Tabs -->
	<div class="flex p-1 rounded-xl mb-5" style="background:var(--c-bg-secondary)">
		{#each ([['activos', 'Activos'], ['historial', 'Historial']] as [Tab, string][]) as [id, label]}
			<button onclick={() => tab = id}
				class="flex-1 py-2.5 rounded-[10px] text-[13.5px] font-bold transition-all"
				style="background:{tab === id ? 'var(--c-bg-card)' : 'transparent'};
					color:{tab === id ? 'var(--c-text-primary)' : 'var(--c-text-muted)'};
					box-shadow:{tab === id ? 'var(--shadow-sm)' : 'none'}">
				{label}
				{#if id === 'activos' && vendedor.pedidosActivos.length > 0}
					<span class="ml-1 text-[11px] font-bold text-white bg-[var(--c-brand)] px-1.5 py-0.5 rounded-full">
						{vendedor.pedidosActivos.length}
					</span>
				{/if}
			</button>
		{/each}
	</div>

	{#if lista.length === 0}
		<div class="text-center py-16" style="color:var(--c-text-muted)">
			<div class="text-5xl mb-4">📦</div>
			<h3 class="font-display font-bold text-lg mb-2">
				{tab === 'activos' ? 'Sin pedidos activos' : 'Sin historial aún'}
			</h3>
		</div>
	{:else}
		<div class="flex flex-col gap-3">
			{#each lista as pedido}
				{@const trans = TRANSITIONS[pedido.status]}
				<div class="rounded-2xl border border-[var(--c-border-soft)] overflow-hidden"
					style="background:var(--c-bg-card)">
					<!-- Header clickable -->
					<button
						onclick={() => expandido = expandido === pedido.id ? null : pedido.id}
						class="flex items-center gap-3 p-4 w-full text-left hover:bg-[var(--c-bg-secondary)] transition-colors">
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 mb-1 flex-wrap">
								<span class="font-mono text-[12px] font-bold">{pedido.number}</span>
								<Badge variant={ESTADO_VARIANT[pedido.status]}>{ESTADO_LABEL[pedido.status]}</Badge>
							</div>
							<div class="text-xs" style="color:var(--c-text-muted)">
								{pedido.items.length} producto{pedido.items.length !== 1 ? 's' : ''} · {pedido.date}
							</div>
						</div>
						<div class="text-right shrink-0">
							<div class="font-mono text-base font-bold">{fmtCOP(pedido.total)}</div>
							<Icon name={expandido === pedido.id ? 'arrowUp' : 'arrowDown'} size={14} color="var(--c-text-muted)"/>
						</div>
					</button>

					<!-- Detalle expandido -->
					{#if expandido === pedido.id}
						<div class="px-4 pb-4 border-t border-[var(--c-border-soft)]"
							style="background:var(--c-bg-secondary)">
							<div class="pt-3 flex flex-col gap-1.5 mb-3">
								{#each pedido.items as item}
									<div class="flex items-center justify-between text-[13px]">
										<span class="text-[var(--c-text-secondary)]">
											{item.quantity}× Producto #{item.productId}
										</span>
										<span class="font-mono font-semibold">{fmtCOP(item.price * item.quantity)}</span>
									</div>
								{/each}
							</div>
							<div class="flex items-center justify-between text-[12px] mb-3 pb-3 border-b border-[var(--c-border-soft)]">
								<span style="color:var(--c-text-muted)">📍 {pedido.address}</span>
							</div>

							{#if trans}
								<div class="flex gap-2">
									<button
										onclick={() => { vendedor.cambiarEstado(pedido.id, trans.next); expandido = null; }}
										class="flex-1 py-2.5 rounded-xl font-bold text-sm text-white"
										style="background:var(--c-brand)">
										{trans.label}
									</button>
									{#if pedido.status === 'confirmed'}
										<button
											onclick={() => { if (confirm('¿Cancelar este pedido?')) vendedor.cambiarEstado(pedido.id, 'cancelled'); expandido = null; }}
											class="px-4 py-2.5 rounded-xl font-bold text-sm border"
											style="border-color:var(--c-error);color:var(--c-error);background:rgba(220,38,38,.04)">
											Cancelar
										</button>
									{/if}
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
