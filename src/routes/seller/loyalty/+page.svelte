<script lang="ts">
	import { vendedor } from '$lib/stores/vendedor.svelte';
	import { loyalty, rewardLabel } from '$lib/stores/loyalty.svelte';
	import { fmtCOP } from '$lib/utils';
	import type { LoyaltyCountingMode, LoyaltyRewardType } from '$lib/data/mock';
	import Icon from '$lib/components/ui/Icon.svelte';

	const storeId = $derived(vendedor.tienda.id);
	const existing = $derived(loyalty.config(storeId));

	let active = $state(false);
	let threshold = $state('5');
	let countingMode = $state<LoyaltyCountingMode>('all');
	let eligibleProductIds = $state<string[]>([]);
	let minimumAmount = $state('');
	let rewardType = $state<LoyaltyRewardType>('free_shipping');
	let rewardProductId = $state('');
	let rewardValue = $state('');
	let loaded = $state(false);

	$effect(() => {
		if (loaded) return;
		const cfg = existing;
		if (cfg) {
			active = cfg.active;
			threshold = String(cfg.threshold);
			countingMode = cfg.countingMode;
			eligibleProductIds = cfg.eligibleProductIds ?? [];
			minimumAmount = cfg.minimumAmount != null ? String(cfg.minimumAmount) : '';
			rewardType = cfg.rewardType;
			rewardProductId = cfg.rewardProductId ?? '';
			rewardValue = cfg.rewardValue != null ? String(cfg.rewardValue) : '';
		}
		loaded = true;
	});

	function toggleProducto(id: string) {
		eligibleProductIds = eligibleProductIds.includes(id)
			? eligibleProductIds.filter((x) => x !== id)
			: [...eligibleProductIds, id];
	}

	const previewLabel = $derived(
		rewardLabel({
			storeId,
			active,
			threshold: parseInt(threshold) || 1,
			countingMode,
			rewardType,
			rewardProductId: rewardProductId || undefined,
			rewardValue: rewardValue ? parseFloat(rewardValue) : undefined,
		})
	);

	function guardar() {
		loyalty.upsertConfig(storeId, {
			active,
			threshold: Math.max(1, parseInt(threshold) || 5),
			countingMode,
			eligibleProductIds: countingMode === 'selected_products' ? eligibleProductIds : undefined,
			minimumAmount: countingMode === 'minimum_amount' ? parseFloat(minimumAmount) || 0 : undefined,
			rewardType,
			rewardProductId: rewardType === 'product' ? rewardProductId || undefined : undefined,
			rewardValue: rewardType === 'discount_percent' || rewardType === 'discount_fixed' ? parseFloat(rewardValue) || 0 : undefined,
		});
	}
</script>

<div class="max-w-2xl mx-auto px-4 pt-6 pb-10">
	<div class="flex items-center justify-between mb-1">
		<h1 class="font-display text-[24px] font-extrabold">Tarjeta de fidelidad</h1>
		<button onclick={() => (active = !active)} aria-label={active ? 'Desactivar tarjeta de fidelidad' : 'Activar tarjeta de fidelidad'}
			class="w-11 h-6 rounded-full transition-colors relative shrink-0"
			style="background:{active ? 'var(--c-brand)' : 'var(--c-border)'}">
			<div class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style="left:{active ? '22px' : '2px'}"></div>
		</button>
	</div>
	<p class="text-sm mb-6" style="color:var(--c-text-secondary)">
		Premia a tus clientes frecuentes. Define cada cuántas compras y qué reciben gratis.
	</p>

	<div class="flex flex-col gap-5" style="opacity:{active ? 1 : 0.5}">

		<!-- Umbral -->
		<div>
			<div class="text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">
				Compras necesarias para el premio
			</div>
			<input bind:value={threshold} type="number" min="1" placeholder="5"
				class="w-full h-11 px-3.5 rounded-xl border text-[14px] outline-none"
				style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"/>
		</div>

		<!-- Modo de conteo -->
		<div>
			<div class="text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">
				¿Qué compras cuentan?
			</div>
			<div class="flex flex-col gap-2">
				{#each ([
					['all', 'Todos los productos', 'Cualquier compra suma un sello.'],
					['selected_products', 'Solo productos seleccionados', 'Elige qué platos participan.'],
					['minimum_amount', 'Compras desde un monto mínimo', 'Todos los productos, pero solo si el pedido supera un monto.'],
				] as [LoyaltyCountingMode, string, string][]) as [val, label, desc]}
					<button onclick={() => (countingMode = val)}
						class="text-left p-3 rounded-xl border transition-all"
						style="background:{countingMode === val ? 'var(--c-brand-light)' : 'var(--c-bg-secondary)'};
							border-color:{countingMode === val ? 'var(--c-brand)' : 'var(--c-border)'}">
						<div class="text-[13px] font-bold">{label}</div>
						<div class="text-[11.5px] mt-0.5" style="color:var(--c-text-secondary)">{desc}</div>
					</button>
				{/each}
			</div>

			{#if countingMode === 'selected_products'}
				<div class="mt-2.5 flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
					{#each vendedor.catalogo as p}
						{@const selected = eligibleProductIds.includes(p.id)}
						<button onclick={() => toggleProducto(p.id)}
							class="flex items-center gap-2.5 p-2.5 rounded-lg border text-left"
							style="background:{selected ? 'var(--c-brand-light)' : 'var(--c-bg-card)'};border-color:{selected ? 'var(--c-brand)' : 'var(--c-border-soft)'}">
							<span class="w-5 h-5 rounded flex items-center justify-center shrink-0 border"
								style="background:{selected ? 'var(--c-brand)' : 'transparent'};border-color:{selected ? 'var(--c-brand)' : 'var(--c-border)'}">
								{#if selected}<Icon name="check" size={12} color="#fff" strokeWidth={3}/>{/if}
							</span>
							<span class="text-[13px]">{p.emoji} {p.name}</span>
						</button>
					{/each}
				</div>
			{:else if countingMode === 'minimum_amount'}
				<input bind:value={minimumAmount} type="number" min="0" placeholder="20000"
					class="w-full h-11 px-3.5 rounded-xl border text-[14px] outline-none mt-2.5"
					style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"/>
			{/if}
		</div>

		<!-- Tipo de premio -->
		<div>
			<div class="text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">
				¿Qué reciben gratis?
			</div>
			<div class="grid grid-cols-2 gap-2">
				{#each ([
					['product', 'Producto gratis'],
					['discount_percent', '% de descuento'],
					['discount_fixed', '$ de descuento'],
					['free_shipping', 'Envío gratis'],
				] as [LoyaltyRewardType, string][]) as [val, label]}
					<button onclick={() => (rewardType = val)}
						class="py-2.5 rounded-xl text-[13px] font-bold border transition-all"
						style="background:{rewardType === val ? 'var(--c-promo)' : 'var(--c-bg-secondary)'};
							color:{rewardType === val ? '#fff' : 'var(--c-text-primary)'};
							border-color:{rewardType === val ? 'var(--c-promo)' : 'var(--c-border)'}">
						{label}
					</button>
				{/each}
			</div>

			{#if rewardType === 'product'}
				<select bind:value={rewardProductId}
					class="w-full h-11 px-3.5 rounded-xl border text-[14px] outline-none mt-2.5"
					style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)">
					<option value="">Selecciona un producto</option>
					{#each vendedor.catalogo as p}
						<option value={p.id}>{p.emoji} {p.name} — {fmtCOP(p.price)}</option>
					{/each}
				</select>
			{:else if rewardType === 'discount_percent' || rewardType === 'discount_fixed'}
				<input bind:value={rewardValue} type="number" min="0"
					placeholder={rewardType === 'discount_percent' ? '20' : '10000'}
					class="w-full h-11 px-3.5 rounded-xl border text-[14px] outline-none mt-2.5"
					style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"/>
			{/if}
		</div>

		<!-- Preview -->
		<div class="p-3.5 rounded-xl" style="background:var(--c-promo-light)">
			<div class="text-[11px] font-bold uppercase tracking-widest mb-1" style="color:var(--c-promo)">Así lo verá el cliente</div>
			<div class="text-[14px] font-semibold" style="color:var(--c-promo)">
				🎁 A {threshold || '—'} compras: {previewLabel}
			</div>
		</div>

		<button onclick={guardar}
			class="w-full h-12 rounded-xl font-bold text-[14px] text-white"
			style="background:var(--c-brand)">
			Guardar cambios
		</button>
	</div>
</div>
