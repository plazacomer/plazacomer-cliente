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
			? vendedor.pedidosTienda.filter((p) =>
					['confirmed', 'preparing', 'shipping'].includes(p.status)
				)
			: vendedor.pedidosTienda.filter((p) => ['delivered', 'cancelled'].includes(p.status))
	);

	const ESTADO_LABEL: Record<OrderStatus, string> = {
		confirmed: '✓ Confirmado',
		preparing: '⏳ Preparando',
		shipping: '🚚 En camino',
		delivered: '✅ Entregado',
		cancelled: '✕ Cancelado'
	};

	const ESTADO_VARIANT: Record<OrderStatus, 'brand' | 'accent' | 'success' | 'error' | 'default'> =
		{
			confirmed: 'brand',
			preparing: 'accent',
			shipping: 'brand',
			delivered: 'success',
			cancelled: 'error'
		};

	const TRANSITIONS: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
		confirmed: { next: 'preparing', label: 'Empezar preparación' },
		preparing: { next: 'shipping', label: 'Enviar a domicilio' },
		shipping: { next: 'delivered', label: 'Marcar entregado' }
	};

	let expandido = $state<string | null>(null);
</script>

<div class="mx-auto max-w-2xl px-4 pt-6 pb-10">
	<h1 class="mb-1 font-display text-[24px] font-extrabold">Pedidos</h1>
	<p class="mb-5 text-sm" style="color:var(--c-text-secondary)">
		{vendedor.pedidosTienda.length} pedido{vendedor.pedidosTienda.length !== 1 ? 's' : ''} en total
	</p>

	<!-- Tabs -->
	<div class="mb-5 flex rounded-xl p-1" style="background:var(--c-bg-secondary)">
		{#each [['activos', 'Activos'], ['historial', 'Historial']] as [Tab, string][] as [id, label] (id)}
			<button
				onclick={() => (tab = id)}
				class="flex-1 rounded-[10px] py-2.5 text-[13.5px] font-bold transition-all"
				style="background:{tab === id ? 'var(--c-bg-card)' : 'transparent'};
					color:{tab === id ? 'var(--c-text-primary)' : 'var(--c-text-muted)'};
					box-shadow:{tab === id ? 'var(--shadow-sm)' : 'none'}"
			>
				{label}
				{#if id === 'activos' && vendedor.pedidosActivos.length > 0}
					<span
						class="ml-1 rounded-full bg-[var(--c-brand)] px-1.5 py-0.5 text-[11px] font-bold text-white"
					>
						{vendedor.pedidosActivos.length}
					</span>
				{/if}
			</button>
		{/each}
	</div>

	{#if lista.length === 0}
		<div class="py-16 text-center" style="color:var(--c-text-muted)">
			<div class="mb-4 text-5xl">📦</div>
			<h3 class="mb-2 font-display text-lg font-bold">
				{tab === 'activos' ? 'Sin pedidos activos' : 'Sin historial aún'}
			</h3>
		</div>
	{:else}
		<div class="flex flex-col gap-3">
			{#each lista as pedido (pedido.id)}
				{@const trans = TRANSITIONS[pedido.status]}
				<div
					class="overflow-hidden rounded-2xl border border-[var(--c-border-soft)]"
					style="background:var(--c-bg-card)"
				>
					<!-- Header clickable -->
					<button
						onclick={() => (expandido = expandido === pedido.id ? null : pedido.id)}
						class="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-[var(--c-bg-secondary)]"
					>
						<div class="min-w-0 flex-1">
							<div class="mb-1 flex flex-wrap items-center gap-2">
								<span class="font-mono text-[12px] font-bold">{pedido.number}</span>
								<Badge variant={ESTADO_VARIANT[pedido.status]}>{ESTADO_LABEL[pedido.status]}</Badge>
							</div>
							<div class="text-xs" style="color:var(--c-text-muted)">
								{pedido.items.length} producto{pedido.items.length !== 1 ? 's' : ''} · {pedido.date}
							</div>
						</div>
						<div class="shrink-0 text-right">
							<div class="font-mono text-base font-bold">{fmtCOP(pedido.total)}</div>
							<Icon
								name={expandido === pedido.id ? 'arrowUp' : 'arrowDown'}
								size={14}
								color="var(--c-text-muted)"
							/>
						</div>
					</button>

					<!-- Detalle expandido -->
					{#if expandido === pedido.id}
						<div
							class="border-t border-[var(--c-border-soft)] px-4 pb-4"
							style="background:var(--c-bg-secondary)"
						>
							<div class="mb-3 flex flex-col gap-1.5 pt-3">
								{#each pedido.items as item, idx (idx)}
									<div class="flex items-center justify-between text-[13px]">
										<span class="text-[var(--c-text-secondary)]">
											{item.quantity}× Producto #{item.productId}
										</span>
										<span class="font-mono font-semibold">{fmtCOP(item.price * item.quantity)}</span
										>
									</div>
								{/each}
							</div>
							<div
								class="mb-3 flex items-center justify-between border-b border-[var(--c-border-soft)] pb-3 text-[12px]"
							>
								<span style="color:var(--c-text-muted)">📍 {pedido.address}</span>
							</div>

							{#if trans}
								<div class="flex gap-2">
									<button
										onclick={() => {
											vendedor.cambiarEstado(pedido.id, trans.next);
											expandido = null;
										}}
										class="flex-1 rounded-xl py-2.5 text-sm font-bold text-white"
										style="background:var(--c-brand)"
									>
										{trans.label}
									</button>
									{#if pedido.status === 'confirmed'}
										<button
											onclick={() => {
												if (confirm('¿Cancelar este pedido?'))
													vendedor.cambiarEstado(pedido.id, 'cancelled');
												expandido = null;
											}}
											class="rounded-xl border px-4 py-2.5 text-sm font-bold"
											style="border-color:var(--c-error);color:var(--c-error);background:rgba(220,38,38,.04)"
										>
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
