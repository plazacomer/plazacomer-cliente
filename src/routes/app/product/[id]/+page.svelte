<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getProduct, getStore, getDeal } from '$lib/data/mock';
	import { cart, toast } from '$lib/stores/app.svelte';
	import { fmtCOP } from '$lib/utils';
	import TiendaLogo from '$lib/components/TiendaLogo.svelte';
	import CustomizeModal, { type CartLineItem } from '$lib/components/CustomizeModal.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import Icon from '$lib/components/ui/Icon.svelte';
	import CountdownPill from '$lib/components/CountdownPill.svelte';
	import { m } from '$lib/paraglide/messages.js';

	const productId = $derived($page.params.id ?? '');
	const product = $derived(getProduct(productId));
	const store = $derived(getStore(product.storeId));
	const dealId = $derived($page.url.searchParams.get('deal'));
	const deal = $derived(dealId ? getDeal(dealId) : null);
	const discount = $derived(deal ? Math.round((1 - deal.dealPrice / deal.originalPrice) * 100) : 0);
	const stockPct = $derived(deal ? (deal.dealStock / deal.initialStock) * 100 : 0);
	const stockCritical = $derived(deal ? deal.dealStock <= 5 : false);
	const displayPrice = $derived(deal ? deal.dealPrice : product.price);

	let customizeOpen = $state(false);

	function goStore() {
		goto(`/app/store/${store.id}`);
	}

	function goBack() {
		history.back();
	}

	function addToCart() {
		if (product.modifiers && product.modifiers.length > 0) {
			customizeOpen = true;
			return;
		}
		cart.add({ productId: product.id, storeId: store.id, price: displayPrice });
		toast.show(m.home_added_to_cart({ product: product.name }));
	}

	function onCustomizeConfirm(item: CartLineItem) {
		cart.add({ productId: item.productId, storeId: item.storeId, price: item.price, quantity: item.quantity, selections: item.selections, notes: item.notes });
		toast.show(m.home_added_to_cart({ product: product.name }));
	}
</script>

<div class="max-w-2xl mx-auto pb-8">
	<!-- Product visual -->
	<div class="relative flex items-center justify-center overflow-hidden" style="height:280px;background:{store.bannerGradient}">
		<button type="button" onclick={goBack}
			class="absolute z-20 top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center"
			style="background:rgba(255,255,255,.92)">
			<Icon name="arrowLeft" size={18} color="var(--c-text-primary)"/>
		</button>

		<div class="text-[140px] drop-shadow-lg">{product.emoji}</div>

		{#if deal}
			<div class="absolute top-4 right-4">
				<Badge variant="error">
					<Icon name="fire" size={11} strokeWidth={2.5}/>
					-{discount}%
				</Badge>
			</div>
			<div class="absolute bottom-3.5 right-3.5">
				<CountdownPill finishAt={deal.finishAt}/>
			</div>
		{/if}
	</div>

	<div class="p-5">
		<!-- Store row -->
		<button type="button" onclick={goStore} class="flex items-center gap-2.5 mb-4 text-left">
			<TiendaLogo tienda={store} size={32}/>
			<div class="flex-1 min-w-0">
				<div class="text-[11px] font-semibold uppercase tracking-wide" style="color:var(--c-text-muted)">{m.product_detail_sold_by()}</div>
				<div class="text-sm font-bold">{store.name}</div>
			</div>
			<Icon name="arrowRight" size={16} color="var(--c-text-muted)"/>
		</button>

		<h1 class="font-display text-2xl font-extrabold mb-2">{product.name}</h1>
		<p class="text-sm leading-relaxed mb-4" style="color:var(--c-text-secondary)">{product.description}</p>

		<div class="flex items-baseline gap-2.5 mb-4">
			<span class="font-mono text-2xl font-medium" style="color:{deal ? 'var(--c-error)' : 'var(--c-text-primary)'}">{fmtCOP(displayPrice)}</span>
			{#if deal}
				<span class="font-mono text-sm line-through" style="color:var(--c-text-muted)">{fmtCOP(deal.originalPrice)}</span>
			{/if}
		</div>

		{#if deal}
			<div class="flex items-center gap-1.5 text-[11px] font-semibold mb-1.5"
				style="color:{stockCritical ? 'var(--c-warning)' : 'var(--c-text-secondary)'}">
				{#if stockCritical}⚠️{/if}
				{m.home_deal_stock({ remaining: deal.dealStock.toString(), initial: deal.initialStock.toString() })}
			</div>
			<div class="h-1.5 rounded-full mb-5 overflow-hidden" style="background:var(--c-bg-secondary)">
				<div class="h-full rounded-full transition-all"
					style="width:{stockPct}%;background:{stockCritical ? 'var(--c-warning)' : 'var(--c-success)'}"></div>
			</div>
		{:else if product.stock !== undefined && product.stock <= 3 && product.stock > 0}
			<div class="mb-5 text-[11px] font-semibold" style="color:var(--c-warning)">
				⚠️ {m.home_low_stock({ stock: product.stock.toString() })}
			</div>
		{/if}

		{#if product.stock === 0}
			<Button variant="ghost" fullWidth disabled>{m.home_sold_out()}</Button>
		{:else}
			<Button variant="brand" fullWidth onclick={addToCart}>
				<Icon name="cart" size={16}/>
				{product.modifiers && product.modifiers.length > 0 ? m.product_detail_customize_cta() : m.product_detail_add_cta()}
				· {fmtCOP(displayPrice)}
			</Button>
		{/if}
	</div>
</div>

<CustomizeModal
	open={customizeOpen}
	producto={product}
	oferta={deal}
	onclose={() => (customizeOpen = false)}
	onconfirm={onCustomizeConfirm}
/>
