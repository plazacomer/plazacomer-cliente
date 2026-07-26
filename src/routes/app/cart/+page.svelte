<script lang="ts">
	import { goto } from '$app/navigation';
	import { cart } from '$lib/stores/app.svelte';
	import { getStore, getProduct, getCategory, type Product } from '$lib/data/mock';
	import { fmtCOP } from '$lib/utils';
	import TiendaLogo from '$lib/components/TiendaLogo.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import Icon from '$lib/components/ui/Icon.svelte';
	import CustomizeModal, { type CartLineItem } from '$lib/components/CustomizeModal.svelte';

	const groups = $derived.by(() => {
		const g: Record<string, typeof cart.items> = {};
		cart.items.forEach((item) => {
			if (!g[item.storeId]) g[item.storeId] = [];
			g[item.storeId].push(item);
		});
		return g;
	});

	const storeIds = $derived(Object.keys(groups));

	// Edit modal state
	let editOpen = $state(false);
	let editProduct = $state<Product | null>(null);
	let editLineId = $state<string | null>(null);
	let editInitial = $state<CartLineItem | null>(null);

	function openEdit(item: (typeof cart.items)[number]) {
		const p = getProduct(item.productId);
		editProduct = p;
		editLineId = item.lineId ?? null;
		editInitial = {
			productId: item.productId,
			storeId: item.storeId,
			quantity: item.quantity,
			price: item.price,
			selections: item.selections ?? {},
			notes: item.notes ?? '',
			lineId: item.lineId,
		};
		editOpen = true;
	}

	function onEditConfirm(updated: CartLineItem) {
		if (editLineId) {
			cart.updateItem(editLineId, {
				price: updated.price,
				quantity: updated.quantity,
				selections: updated.selections,
				notes: updated.notes,
			});
		}
		editOpen = false;
	}

	function selectionSummary(item: (typeof cart.items)[number]): string[] {
		if (!item.selections) return [];
		const p = getProduct(item.productId);
		const lines: string[] = [];
		for (const [groupId, val] of Object.entries(item.selections)) {
			const group = p.modifiers?.find((m) => m.id === groupId);
			if (!group) continue;
			const vals = Array.isArray(val) ? val : [val];
			const names = vals.map((v) => group.opciones.find((o) => o.id === v)?.nombre ?? v);
			lines.push(names.join(', '));
		}
		return lines;
	}
</script>

{#if cart.items.length === 0}
	<div class="max-w-md mx-auto px-5 pt-16 text-center">
		<div class="text-7xl mb-5">🛒</div>
		<h2 class="font-display text-2xl font-bold mb-3">Tu carrito está vacío</h2>
		<p class="text-sm mb-8" style="color:var(--c-text-secondary)">
			Explora las tiendas y agrega productos para empezar tu pedido.
		</p>
		<Button variant="brand" fullWidth onclick={() => goto('/app/explore')}>
			<Icon name="search" size={16} />
			Explorar tiendas
		</Button>
	</div>
{:else}
	<div class="max-w-4xl mx-auto px-4 pt-5 pb-10">
		<h1 class="font-display text-[26px] lg:text-3xl font-extrabold mb-1">Tu carrito</h1>
		<p class="text-sm mb-5" style="color:var(--c-text-secondary)">
			{cart.count} producto{cart.count !== 1 ? 's' : ''} · {storeIds.length} tienda{storeIds.length !== 1 ? 's' : ''}
		</p>

		<div class="grid gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
			<!-- Items -->
			<div class="flex flex-col gap-4">
				<!-- Multi-store notice -->
				{#if storeIds.length > 1}
					<div
						class="flex items-start gap-2.5 p-3.5 rounded-2xl border"
						style="background:var(--c-brand-light);border-color:var(--c-brand)"
					>
						<div class="text-lg shrink-0">ℹ️</div>
						<div class="text-sm leading-relaxed" style="color:var(--c-brand)">
							<strong>Multi-tienda:</strong> Cada tienda procesa su pago por separado.
							Verás {storeIds.length} pagos distintos en tu estado de cuenta.
						</div>
					</div>
				{/if}

				{#each storeIds as storeId}
					{@const store = getStore(storeId)}
					{@const items = groups[storeId]}
					{@const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)}
					{@const cat = getCategory(store.category)}
					<div
						class="rounded-[18px] overflow-hidden border"
						style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
					>
						<!-- Store header -->
						<div
							class="flex items-center gap-3 p-3.5 border-b"
							style="border-color:var(--c-border-soft)"
						>
							<TiendaLogo tienda={store} size={40} />
							<div class="flex-1 min-w-0">
								<div class="font-bold text-sm">{store.name}</div>
								<div class="text-[11px]" style="color:var(--c-text-muted)">
									{cat.label} · Paga con {store.paymentMethods[0]}
								</div>
							</div>
						</div>

						<!-- Items list -->
						{#each items as item, i}
							{@const p = getProduct(item.productId)}
							{@const key = item.lineId ?? item.productId}
							<div
								class="flex gap-3 items-start p-3.5"
								style="border-top:{i > 0 ? '1px solid var(--c-border-soft)' : 'none'}"
							>
								<!-- Product image -->
								<div
									class="w-14 h-14 rounded-xl flex items-center justify-center text-[28px] shrink-0"
									style="background:{store.bannerGradient}"
								>
									{p.emoji}
								</div>

								<!-- Info -->
								<div class="flex-1 min-w-0">
									<div class="font-semibold text-sm mb-0.5 leading-snug">{p.name}</div>
									{#if item.isDeal}
										<Badge variant="error" class="mb-1">🔥 Oferta</Badge>
									{/if}
									{#each selectionSummary(item) as line}
										<div class="text-[11px] mt-0.5" style="color:var(--c-text-muted)">· {line}</div>
									{/each}
									{#if item.notes}
										<div class="text-[11px] italic mt-1" style="color:var(--c-warning)">
											📝 {item.notes}
										</div>
									{/if}
									<div class="font-mono text-xs mt-1" style="color:var(--c-text-secondary)">
										{fmtCOP(item.price)} c/u
									</div>
								</div>

								<!-- Controls -->
								<div class="flex flex-col items-end gap-2 shrink-0">
									<!-- Qty stepper -->
									<div
										class="flex items-center gap-1.5 rounded-[10px] p-0.5"
										style="background:var(--c-bg-secondary)"
									>
										<button
											onclick={() => {
												if (item.quantity === 1) {
													cart.remove(key);
												} else {
													cart.updateQty(key, -1);
												}
											}}
											class="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
											style="color:{item.quantity === 1 ? 'var(--c-error)' : 'var(--c-text-secondary)'}"
											title={item.quantity === 1 ? 'Eliminar' : 'Disminuir'}
										>
											{#if item.quantity === 1}
												<Icon name="trash" size={14} strokeWidth={2} />
											{:else}
												<Icon name="minus" size={14} strokeWidth={2.5} />
											{/if}
										</button>
										<span class="font-mono text-[13px] font-semibold min-w-5 text-center">
											{item.quantity}
										</span>
										<button
											onclick={() => cart.updateQty(key, 1)}
											class="w-7 h-7 rounded-lg flex items-center justify-center"
											style="background:var(--c-bg-card);color:var(--c-text-primary)"
										>
											<Icon name="plus" size={14} strokeWidth={2.5} />
										</button>
									</div>

									<!-- Edit + Remove -->
									<div class="flex items-center gap-1.5">
										{#if item.lineId}
											<button
												onclick={() => openEdit(item)}
												class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors hover:opacity-80"
												style="background:var(--c-brand-light);color:var(--c-brand)"
											>
												<Icon name="edit" size={11} strokeWidth={2} />
												Editar
											</button>
										{/if}
										<button
											onclick={() => cart.remove(key)}
											class="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
											style="background:var(--c-bg-secondary);color:var(--c-text-muted)"
											title="Eliminar"
										>
											<Icon name="close" size={13} />
										</button>
									</div>
								</div>
							</div>
						{/each}

						<!-- Store subtotal -->
						<div
							class="flex justify-between items-center px-3.5 py-3"
							style="background:var(--c-bg-secondary)"
						>
							<span class="text-sm" style="color:var(--c-text-secondary)">Subtotal tienda</span>
							<span class="font-mono font-semibold text-[15px]">{fmtCOP(subtotal)}</span>
						</div>
					</div>
				{/each}
			</div>

			<!-- Summary -->
			<div
				class="rounded-[18px] p-5 border lg:sticky lg:top-5"
				style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
			>
				<h3 class="font-display text-base font-bold mb-3.5">Resumen</h3>

				<div class="flex flex-col gap-2.5 mb-3.5">
					{#each storeIds as storeId}
						{@const store = getStore(storeId)}
						{@const sub = groups[storeId].reduce((s, i) => s + i.price * i.quantity, 0)}
						<div class="flex justify-between text-sm">
							<span style="color:var(--c-text-secondary)">{store.name}</span>
							<span class="font-mono font-medium">{fmtCOP(sub)}</span>
						</div>
					{/each}
				</div>

				<div class="h-px mb-4" style="background:var(--c-border-soft)"></div>

				<div class="flex justify-between items-center mb-5">
					<span class="font-display font-bold text-[15px]">Total general</span>
					<span class="font-mono font-bold text-[22px]">{fmtCOP(cart.total)}</span>
				</div>

				<Button variant="brand" size="lg" fullWidth onclick={() => goto('/app/checkout')}>
					<Icon name="credit" size={18} />
					Ir a pagar
				</Button>

				<p class="text-[11px] text-center mt-3 leading-relaxed" style="color:var(--c-text-muted)">
					🔒 Pago seguro · Cada tienda procesa su propia transacción
				</p>
			</div>
		</div>
	</div>
{/if}

{#if editProduct && editInitial}
	<CustomizeModal
		producto={editProduct}
		open={editOpen}
		initial={editInitial}
		onclose={() => (editOpen = false)}
		onconfirm={onEditConfirm}
	/>
{/if}
