<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		STORES, CATEGORIES, FEED, CURRENT_USER,
		getStore, getProduct, getDeal,
		type Store
	} from '$lib/data/mock';
	import { cart, toast } from '$lib/stores/app.svelte';
	import { fmtCOP } from '$lib/utils';
	import TiendaLogo from '$lib/components/TiendaLogo.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { Card } from '$lib/components/ui/card';
	import CountdownPill from '$lib/components/CountdownPill.svelte';
	import { m } from '$lib/paraglide/messages.js';

	let filterCat = $state<string | null>(null);

	const filtered = $derived(
		filterCat
			? FEED.filter((item) => {
					if (item.kind === 'deal') {
						const o = getDeal(item.dealId);
						return getProduct(o.productId).category === filterCat;
					}
					if (item.kind === 'product') return getProduct(item.productId).category === filterCat;
					if (item.kind === 'video') return getStore(item.storeId).category === filterCat;
					return false;
				})
			: FEED
	);

	function addToCart(productId: string, storeId: string, price: number) {
		const p = getProduct(productId);
		cart.add({ productId, storeId, price });
		toast.show(m.home_added_to_cart({ product: p.name }));
	}

	function goStore(store: Store) {
		goto(`/app/store/${store.id}`);
	}

	function goProduct(productId: string, dealId?: string) {
		goto(dealId ? `/app/product/${productId}?deal=${dealId}` : `/app/product/${productId}`);
	}
</script>

<div class="max-w-2xl mx-auto pb-6">
	<!-- Header greeting -->
	<div class="px-5 pt-5 pb-0">
		<h1 class="font-display text-3xl font-extrabold mb-1">{m.home_greeting({ name: CURRENT_USER.name.split(' ')[0] })}</h1>
		<p class="text-sm" style="color:var(--c-text-secondary)">{m.home_subtitle()}</p>
	</div>

	<!-- Stories rail -->
	<div class="flex gap-3.5 px-5 py-4 overflow-x-auto no-scrollbar">
		{#each STORES.filter((t) => t.following) as t}
			<button onclick={() => goStore(t)} class="flex flex-col items-center gap-1.5 shrink-0 min-w-[68px]">
				<div class="p-[2.5px] rounded-full"
					style="background:conic-gradient(from 45deg,#DC2626,#EA580C,#F59E0B,#16A34A,#2563EB,#7C3AED,#EC4899,#DC2626)">
					<div class="w-[62px] h-[62px] rounded-full flex items-center justify-center p-0.5"
						style="background:var(--c-bg-card)">
						<TiendaLogo tienda={t} size={58}/>
					</div>
				</div>
				<span class="text-[11px] font-medium max-w-[68px] truncate" style="color:var(--c-text-secondary)">
					{t.name.split(' ')[0]}
				</span>
			</button>
		{/each}
	</div>

	<!-- Categories row -->
	<div class="flex gap-2 px-5 pb-4 overflow-x-auto no-scrollbar">
		<button
			onclick={() => (filterCat = null)}
			class="px-4 py-2 rounded-full text-[13px] font-semibold shrink-0 border border-[var(--c-border-soft)] transition-colors"
			style="background:{!filterCat ? 'var(--c-text-primary)' : 'var(--c-bg-card)'};color:{!filterCat ? 'var(--c-bg-card)' : 'var(--c-text-primary)'}"
		>{m.home_category_all()}</button>
		{#each Object.entries(CATEGORIES) as [key, cat]}
			<button
				onclick={() => (filterCat = filterCat === key ? null : key)}
				class="px-3.5 py-2 rounded-full text-[13px] font-semibold flex items-center gap-1.5 shrink-0 border border-[var(--c-border-soft)] transition-colors"
				style="background:{filterCat === key ? cat.color : 'var(--c-bg-card)'};color:{filterCat === key ? '#fff' : 'var(--c-text-primary)'}"
			>
				<span>{cat.emoji}</span>{cat.label}
			</button>
		{/each}
	</div>

	<!-- Feed -->
	<div class="px-5 flex flex-col gap-4">
		{#if filtered.length === 0}
			<div class="text-center py-16">
				<div class="text-5xl mb-4">🔍</div>
				<h3 class="font-display font-bold text-lg mb-2">{m.home_empty_title()}</h3>
				<p class="text-sm" style="color:var(--c-text-secondary)">{m.home_empty_subtitle()}</p>
				<div class="mt-4">
					<Button variant="brand" onclick={() => goto('/app/explore')}>{m.home_empty_cta()}</Button>
				</div>
			</div>
		{:else}
			{#each filtered as item}
				{#if item.kind === 'deal'}
					{@const deal = getDeal(item.dealId)}
					{@const product = getProduct(deal.productId)}
					{@const store = getStore(deal.storeId)}
					{@const discount = Math.round((1 - deal.dealPrice / deal.originalPrice) * 100)}
					{@const stockPct = (deal.dealStock / deal.initialStock) * 100}
					{@const stockCritical = deal.dealStock <= 5}
					<Card class="animate-slide-up py-0 ring-0 gap-0 border border-border-soft shadow-sm rounded-[18px]">
						<!-- Store header -->
						<div class="flex items-center gap-2.5 p-4">
							<TiendaLogo tienda={store} size={36}/>
							<button class="flex-1 min-w-0 text-left" onclick={() => goStore(store)}>
								<div class="font-semibold text-sm">{store.name}</div>
								<div class="text-[11px] flex items-center gap-1.5" style="color:var(--c-text-muted)">
									<Icon name="location" size={11}/>{store.location}
								</div>
							</button>
							<Badge variant="error">
								<Icon name="fire" size={11} strokeWidth={2.5}/>
								-{discount}%
							</Badge>
						</div>

						<!-- Product visual -->
						<button
							type="button"
							onclick={() => goProduct(product.id, deal.id)}
							class="relative flex items-center justify-center overflow-hidden w-full"
							style="height:220px;background:{store.bannerGradient}"
						>
							<div class="text-[110px] drop-shadow-lg">{product.emoji}</div>
							<div class="absolute top-3.5 left-3.5">
								<span class="text-[11px] font-semibold px-3 py-1 rounded-full text-white"
									style="background:rgba(0,0,0,.55);backdrop-filter:blur(6px)">
									{deal.label}
								</span>
							</div>
							<div class="absolute top-3.5 right-3.5">
								<CountdownPill finishAt={deal.finishAt}/>
							</div>
						</button>

						<div class="p-4">
							<button type="button" onclick={() => goProduct(product.id, deal.id)} class="text-left block mb-2">
								<h3 class="font-display text-base font-bold">{product.name}</h3>
							</button>
							<p class="text-[13px] leading-relaxed mb-3.5" style="color:var(--c-text-secondary)">{product.description}</p>

							<div class="flex items-baseline gap-2.5 mb-2.5">
								<span class="font-mono text-2xl font-medium" style="color:var(--c-error)">{fmtCOP(deal.dealPrice)}</span>
								<span class="font-mono text-sm line-through" style="color:var(--c-text-muted)">{fmtCOP(deal.originalPrice)}</span>
							</div>

							<div class="flex items-center gap-1.5 text-[11px] font-semibold mb-1.5"
								style="color:{stockCritical ? 'var(--c-warning)' : 'var(--c-text-secondary)'}">
								{#if stockCritical}⚠️{/if}
								{m.home_deal_stock({ remaining: deal.dealStock.toString(), initial: deal.initialStock.toString() })}
							</div>
							<div class="h-1.5 rounded-full mb-4 overflow-hidden" style="background:var(--c-bg-secondary)">
								<div class="h-full rounded-full transition-all"
									style="width:{stockPct}%;background:{stockCritical ? 'var(--c-warning)' : 'var(--c-success)'}"></div>
							</div>

							<div class="flex gap-2">
								<Button variant="brand" fullWidth
									onclick={() => addToCart(product.id, store.id, deal.dealPrice)}>
									<Icon name="cart" size={16}/>
									{m.home_deal_cta()}
								</Button>
								<button class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
									style="background:var(--c-bg-secondary);color:var(--c-text-secondary)">
									<Icon name="heart" size={18}/>
								</button>
							</div>
						</div>
					</Card>

				{:else if item.kind === 'product'}
					{@const product = getProduct(item.productId)}
					{@const store = getStore(product.storeId)}
					<Card class="animate-slide-up py-0 ring-0 gap-0 border border-border-soft shadow-sm rounded-[18px]">
						<div class="flex items-center gap-2.5 p-4">
							<TiendaLogo tienda={store} size={36}/>
							<button class="flex-1 text-left" onclick={() => goStore(store)}>
								<div class="font-semibold text-sm">{store.name}</div>
								<div class="text-[11px]" style="color:var(--c-text-muted)">{item.timeAgo}</div>
							</button>
							<Badge variant="promo">
								<Icon name="sparkle" size={11} strokeWidth={2.5}/>
								{m.home_new_badge()}
							</Badge>
						</div>

						<button type="button" onclick={() => goProduct(product.id)}
							class="flex items-center justify-center overflow-hidden w-full"
							style="height:180px;background:{store.bannerGradient}">
							<div class="text-[90px] drop-shadow-lg">{product.emoji}</div>
						</button>

						<div class="p-4">
							<button type="button" onclick={() => goProduct(product.id)} class="text-left block mb-1">
								<h3 class="font-display text-[15px] font-bold">{product.name}</h3>
							</button>
							{#if item.extra}
								<div class="text-xs font-semibold mb-2.5" style="color:var(--c-promo)">{item.extra}</div>
							{/if}
							<div class="flex items-center justify-between">
								<span class="font-mono text-lg font-medium">{fmtCOP(product.price)}</span>
								{#if product.stock === 0}
									<Button variant="ghost" size="sm" disabled>{m.home_sold_out()}</Button>
								{:else}
									<Button variant="brand" size="sm"
										onclick={() => addToCart(product.id, store.id, product.price)}>
										<Icon name="plus" size={14} strokeWidth={2.5}/>
										{m.home_add_cta()}
									</Button>
								{/if}
							</div>
							{#if product.stock !== undefined && product.stock <= 3 && product.stock > 0}
								<div class="mt-2 text-[11px] font-semibold" style="color:var(--c-warning)">
									⚠️ {m.home_low_stock({ stock: product.stock.toString() })}
								</div>
							{/if}
						</div>
					</Card>

				{:else if item.kind === 'video'}
					{@const store = getStore(item.storeId)}
					<Card class="animate-slide-up py-0 ring-0 gap-0 border border-border-soft shadow-sm rounded-[18px]">
						<div class="flex items-center gap-2.5 p-4">
							<TiendaLogo tienda={store} size={36}/>
							<button class="flex-1 text-left" onclick={() => goStore(store)}>
								<div class="font-semibold text-sm">{store.name}</div>
								<div class="text-[11px]" style="color:var(--c-text-muted)">{item.timeAgo} · 🎬 {m.home_video_label()}</div>
							</button>
						</div>

						<div class="relative flex items-center justify-center overflow-hidden"
							style="height:300px;background:{store.bannerGradient}">
							<div class="absolute inset-0"
								style="background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,transparent 1px,transparent 10px)">
							</div>
							<div class="text-[110px] drop-shadow-lg z-10">{store.emoji}</div>
							<button class="absolute z-20 w-[72px] h-[72px] rounded-full bg-white/95 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,.3)]">
								<Icon name="play" size={30} color="var(--c-text-primary)"/>
							</button>
							<div class="absolute bottom-3.5 left-3.5 right-3.5 text-white z-10">
								<div class="font-display text-[17px] font-bold mb-1">{item.title}</div>
								<div class="text-xs opacity-85">👀 {item.views.toLocaleString()} {m.home_views()}</div>
							</div>
						</div>
					</Card>
				{/if}
			{/each}
		{/if}
	</div>
</div>
