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
			lineId: item.lineId
		};
		editOpen = true;
	}

	function onEditConfirm(updated: CartLineItem) {
		if (editLineId) {
			cart.updateItem(editLineId, {
				price: updated.price,
				quantity: updated.quantity,
				selections: updated.selections,
				notes: updated.notes
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
	<div class="mx-auto max-w-md px-5 pt-16 text-center">
		<div class="mb-5 text-7xl">🛒</div>
		<h2 class="mb-3 font-display text-2xl font-bold">Tu carrito está vacío</h2>
		<p class="mb-8 text-sm" style="color:var(--c-text-secondary)">
			Explora las tiendas y agrega productos para empezar tu pedido.
		</p>
		<Button variant="brand" fullWidth onclick={() => goto('/app/explore')}>
			<Icon name="search" size={16} />
			Explorar tiendas
		</Button>
	</div>
{:else}
	<div class="mx-auto max-w-4xl px-4 pt-5 pb-10">
		<h1 class="mb-1 font-display text-[26px] font-extrabold lg:text-3xl">Tu carrito</h1>
		<p class="mb-5 text-sm" style="color:var(--c-text-secondary)">
			{cart.count} producto{cart.count !== 1 ? 's' : ''} · {storeIds.length} tienda{storeIds.length !==
			1
				? 's'
				: ''}
		</p>

		<div class="grid gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
			<!-- Items -->
			<div class="flex flex-col gap-4">
				<!-- Multi-store notice -->
				{#if storeIds.length > 1}
					<div
						class="flex items-start gap-2.5 rounded-2xl border p-3.5"
						style="background:var(--c-brand-light);border-color:var(--c-brand)"
					>
						<div class="shrink-0 text-lg">ℹ️</div>
						<div class="text-sm leading-relaxed" style="color:var(--c-brand)">
							<strong>Multi-tienda:</strong> Cada tienda procesa su pago por separado. Verás {storeIds.length}
							pagos distintos en tu estado de cuenta.
						</div>
					</div>
				{/if}

				{#each storeIds as storeId (storeId)}
					{@const store = getStore(storeId)}
					{@const items = groups[storeId]}
					{@const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)}
					{@const cat = getCategory(store.category)}
					<div
						class="overflow-hidden rounded-[18px] border"
						style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
					>
						<!-- Store header -->
						<div
							class="flex items-center gap-3 border-b p-3.5"
							style="border-color:var(--c-border-soft)"
						>
							<TiendaLogo tienda={store} size={40} />
							<div class="min-w-0 flex-1">
								<div class="text-sm font-bold">{store.name}</div>
								<div class="text-[11px]" style="color:var(--c-text-muted)">
									{cat.label} · Paga con {store.paymentMethods[0]}
								</div>
							</div>
						</div>

						<!-- Items list -->
						{#each items as item, i (item.lineId ?? item.productId)}
							{@const p = getProduct(item.productId)}
							{@const key = item.lineId ?? item.productId}
							<div
								class="flex items-start gap-3 p-3.5"
								style="border-top:{i > 0 ? '1px solid var(--c-border-soft)' : 'none'}"
							>
								<!-- Product image -->
								<div
									class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-[28px]"
									style="background:{store.bannerGradient}"
								>
									{p.emoji}
								</div>

								<!-- Info -->
								<div class="min-w-0 flex-1">
									<div class="mb-0.5 text-sm leading-snug font-semibold">{p.name}</div>
									{#if item.isDeal}
										<Badge variant="error" class="mb-1">🔥 Oferta</Badge>
									{/if}
									{#each selectionSummary(item) as line, idx (idx)}
										<div class="mt-0.5 text-[11px]" style="color:var(--c-text-muted)">· {line}</div>
									{/each}
									{#if item.notes}
										<div class="mt-1 text-[11px] italic" style="color:var(--c-warning)">
											📝 {item.notes}
										</div>
									{/if}
									<div class="mt-1 font-mono text-xs" style="color:var(--c-text-secondary)">
										{fmtCOP(item.price)} c/u
									</div>
								</div>

								<!-- Controls -->
								<div class="flex shrink-0 flex-col items-end gap-2">
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
											class="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
											style="color:{item.quantity === 1
												? 'var(--c-error)'
												: 'var(--c-text-secondary)'}"
											title={item.quantity === 1 ? 'Eliminar' : 'Disminuir'}
										>
											{#if item.quantity === 1}
												<Icon name="trash" size={14} strokeWidth={2} />
											{:else}
												<Icon name="minus" size={14} strokeWidth={2.5} />
											{/if}
										</button>
										<span class="min-w-5 text-center font-mono text-[13px] font-semibold">
											{item.quantity}
										</span>
										<button
											onclick={() => cart.updateQty(key, 1)}
											class="flex h-7 w-7 items-center justify-center rounded-lg"
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
												class="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors hover:opacity-80"
												style="background:var(--c-brand-light);color:var(--c-brand)"
											>
												<Icon name="edit" size={11} strokeWidth={2} />
												Editar
											</button>
										{/if}
										<button
											onclick={() => cart.remove(key)}
											class="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:opacity-80"
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
							class="flex items-center justify-between px-3.5 py-3"
							style="background:var(--c-bg-secondary)"
						>
							<span class="text-sm" style="color:var(--c-text-secondary)">Subtotal tienda</span>
							<span class="font-mono text-[15px] font-semibold">{fmtCOP(subtotal)}</span>
						</div>
					</div>
				{/each}
			</div>

			<!-- Summary -->
			<div
				class="rounded-[18px] border p-5 lg:sticky lg:top-5"
				style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
			>
				<h3 class="mb-3.5 font-display text-base font-bold">Resumen</h3>

				<div class="mb-3.5 flex flex-col gap-2.5">
					{#each storeIds as storeId (storeId)}
						{@const store = getStore(storeId)}
						{@const sub = groups[storeId].reduce((s, i) => s + i.price * i.quantity, 0)}
						<div class="flex justify-between text-sm">
							<span style="color:var(--c-text-secondary)">{store.name}</span>
							<span class="font-mono font-medium">{fmtCOP(sub)}</span>
						</div>
					{/each}
				</div>

				<div class="mb-4 h-px" style="background:var(--c-border-soft)"></div>

				<div class="mb-5 flex items-center justify-between">
					<span class="font-display text-[15px] font-bold">Total general</span>
					<span class="font-mono text-[22px] font-bold">{fmtCOP(cart.total)}</span>
				</div>

				<Button variant="brand" size="lg" fullWidth onclick={() => goto('/app/checkout')}>
					<Icon name="credit" size={18} />
					Ir a pagar
				</Button>

				<p class="mt-3 text-center text-[11px] leading-relaxed" style="color:var(--c-text-muted)">
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
