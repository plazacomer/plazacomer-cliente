<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import {
		STORES,
		CATEGORIES,
		FEED,
		CURRENT_USER,
		getStore,
		getProduct,
		getDeal,
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
		goto(resolve(`/app/store/${store.id}`));
	}

	function goProduct(productId: string, dealId?: string) {
		goto(
			resolve(dealId ? `/app/product/${productId}?deal=${dealId}` : `/app/product/${productId}`)
		);
	}
</script>

<div class="mx-auto max-w-2xl pb-6">
	<!-- Header greeting -->
	<div class="px-5 pt-5 pb-0">
		<h1 class="mb-1 font-display text-3xl font-extrabold">
			{m.home_greeting({ name: CURRENT_USER.name.split(' ')[0] })}
		</h1>
		<p class="text-sm" style="color:var(--c-text-secondary)">{m.home_subtitle()}</p>
	</div>

	<!-- Stories rail -->
	<div class="no-scrollbar flex gap-3.5 overflow-x-auto px-5 py-4">
		{#each STORES.filter((t) => t.following) as t (t.id)}
			<button
				onclick={() => goStore(t)}
				class="flex min-w-[68px] shrink-0 flex-col items-center gap-1.5"
			>
				<div
					class="rounded-full p-[2.5px]"
					style="background:conic-gradient(from 45deg,#DC2626,#EA580C,#F59E0B,#16A34A,#2563EB,#7C3AED,#EC4899,#DC2626)"
				>
					<div
						class="flex h-[62px] w-[62px] items-center justify-center rounded-full p-0.5"
						style="background:var(--c-bg-card)"
					>
						<TiendaLogo tienda={t} size={58} />
					</div>
				</div>
				<span
					class="max-w-[68px] truncate text-[11px] font-medium"
					style="color:var(--c-text-secondary)"
				>
					{t.name.split(' ')[0]}
				</span>
			</button>
		{/each}
	</div>

	<!-- Categories row -->
	<div class="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-4">
		<button
			onclick={() => (filterCat = null)}
			class="shrink-0 rounded-full border border-[var(--c-border-soft)] px-4 py-2 text-[13px] font-semibold transition-colors"
			style="background:{!filterCat
				? 'var(--c-text-primary)'
				: 'var(--c-bg-card)'};color:{!filterCat ? 'var(--c-bg-card)' : 'var(--c-text-primary)'}"
			>{m.home_category_all()}</button
		>
		{#each Object.entries(CATEGORIES) as [key, cat] (key)}
			<button
				onclick={() => (filterCat = filterCat === key ? null : key)}
				class="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--c-border-soft)] px-3.5 py-2 text-[13px] font-semibold transition-colors"
				style="background:{filterCat === key ? cat.color : 'var(--c-bg-card)'};color:{filterCat ===
				key
					? '#fff'
					: 'var(--c-text-primary)'}"
			>
				<span>{cat.emoji}</span>{cat.label}
			</button>
		{/each}
	</div>

	<!-- Feed -->
	<div class="flex flex-col gap-4 px-5">
		{#if filtered.length === 0}
			<div class="py-16 text-center">
				<div class="mb-4 text-5xl">🔍</div>
				<h3 class="mb-2 font-display text-lg font-bold">{m.home_empty_title()}</h3>
				<p class="text-sm" style="color:var(--c-text-secondary)">{m.home_empty_subtitle()}</p>
				<div class="mt-4">
					<Button variant="brand" onclick={() => goto(resolve('/app/explore'))}
						>{m.home_empty_cta()}</Button
					>
				</div>
			</div>
		{:else}
			{#each filtered as item, idx (idx)}
				{#if item.kind === 'deal'}
					{@const deal = getDeal(item.dealId)}
					{@const product = getProduct(deal.productId)}
					{@const store = getStore(deal.storeId)}
					{@const discount = Math.round((1 - deal.dealPrice / deal.originalPrice) * 100)}
					{@const stockPct = (deal.dealStock / deal.initialStock) * 100}
					{@const stockCritical = deal.dealStock <= 5}
					<Card
						class="animate-slide-up gap-0 rounded-[18px] border border-border-soft py-0 shadow-sm ring-0"
					>
						<!-- Store header -->
						<div class="flex items-center gap-2.5 p-4">
							<TiendaLogo tienda={store} size={36} />
							<button class="min-w-0 flex-1 text-left" onclick={() => goStore(store)}>
								<div class="text-sm font-semibold">{store.name}</div>
								<div
									class="flex items-center gap-1.5 text-[11px]"
									style="color:var(--c-text-muted)"
								>
									<Icon name="location" size={11} />{store.location}
								</div>
							</button>
							<Badge variant="error">
								<Icon name="fire" size={11} strokeWidth={2.5} />
								-{discount}%
							</Badge>
						</div>

						<!-- Product visual -->
						<button
							type="button"
							onclick={() => goProduct(product.id, deal.id)}
							class="relative flex w-full items-center justify-center overflow-hidden"
							style="height:220px;background:{store.bannerGradient}"
						>
							<div class="text-[110px] drop-shadow-lg">{product.emoji}</div>
							<div class="absolute top-3.5 left-3.5">
								<span
									class="rounded-full px-3 py-1 text-[11px] font-semibold text-white"
									style="background:rgba(0,0,0,.55);backdrop-filter:blur(6px)"
								>
									{deal.label}
								</span>
							</div>
							<div class="absolute top-3.5 right-3.5">
								<CountdownPill finishAt={deal.finishAt} />
							</div>
						</button>

						<div class="p-4">
							<button
								type="button"
								onclick={() => goProduct(product.id, deal.id)}
								class="mb-2 block text-left"
							>
								<h3 class="font-display text-base font-bold">{product.name}</h3>
							</button>
							<p class="mb-3.5 text-[13px] leading-relaxed" style="color:var(--c-text-secondary)">
								{product.description}
							</p>

							<div class="mb-2.5 flex items-baseline gap-2.5">
								<span class="font-mono text-2xl font-medium" style="color:var(--c-error)"
									>{fmtCOP(deal.dealPrice)}</span
								>
								<span class="font-mono text-sm line-through" style="color:var(--c-text-muted)"
									>{fmtCOP(deal.originalPrice)}</span
								>
							</div>

							<div
								class="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold"
								style="color:{stockCritical ? 'var(--c-warning)' : 'var(--c-text-secondary)'}"
							>
								{#if stockCritical}⚠️{/if}
								{m.home_deal_stock({
									remaining: deal.dealStock.toString(),
									initial: deal.initialStock.toString()
								})}
							</div>
							<div
								class="mb-4 h-1.5 overflow-hidden rounded-full"
								style="background:var(--c-bg-secondary)"
							>
								<div
									class="h-full rounded-full transition-all"
									style="width:{stockPct}%;background:{stockCritical
										? 'var(--c-warning)'
										: 'var(--c-success)'}"
								></div>
							</div>

							<div class="flex gap-2">
								<Button
									variant="brand"
									fullWidth
									onclick={() => addToCart(product.id, store.id, deal.dealPrice)}
								>
									<Icon name="cart" size={16} />
									{m.home_deal_cta()}
								</Button>
								<button
									class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
									style="background:var(--c-bg-secondary);color:var(--c-text-secondary)"
								>
									<Icon name="heart" size={18} />
								</button>
							</div>
						</div>
					</Card>
				{:else if item.kind === 'product'}
					{@const product = getProduct(item.productId)}
					{@const store = getStore(product.storeId)}
					<Card
						class="animate-slide-up gap-0 rounded-[18px] border border-border-soft py-0 shadow-sm ring-0"
					>
						<div class="flex items-center gap-2.5 p-4">
							<TiendaLogo tienda={store} size={36} />
							<button class="flex-1 text-left" onclick={() => goStore(store)}>
								<div class="text-sm font-semibold">{store.name}</div>
								<div class="text-[11px]" style="color:var(--c-text-muted)">{item.timeAgo}</div>
							</button>
							<Badge variant="promo">
								<Icon name="sparkle" size={11} strokeWidth={2.5} />
								{m.home_new_badge()}
							</Badge>
						</div>

						<button
							type="button"
							onclick={() => goProduct(product.id)}
							class="flex w-full items-center justify-center overflow-hidden"
							style="height:180px;background:{store.bannerGradient}"
						>
							<div class="text-[90px] drop-shadow-lg">{product.emoji}</div>
						</button>

						<div class="p-4">
							<button
								type="button"
								onclick={() => goProduct(product.id)}
								class="mb-1 block text-left"
							>
								<h3 class="font-display text-[15px] font-bold">{product.name}</h3>
							</button>
							{#if item.extra}
								<div class="mb-2.5 text-xs font-semibold" style="color:var(--c-promo)">
									{item.extra}
								</div>
							{/if}
							<div class="flex items-center justify-between">
								<span class="font-mono text-lg font-medium">{fmtCOP(product.price)}</span>
								{#if product.stock === 0}
									<Button variant="ghost" size="sm" disabled>{m.home_sold_out()}</Button>
								{:else}
									<Button
										variant="brand"
										size="sm"
										onclick={() => addToCart(product.id, store.id, product.price)}
									>
										<Icon name="plus" size={14} strokeWidth={2.5} />
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
					<Card
						class="animate-slide-up gap-0 rounded-[18px] border border-border-soft py-0 shadow-sm ring-0"
					>
						<div class="flex items-center gap-2.5 p-4">
							<TiendaLogo tienda={store} size={36} />
							<button class="flex-1 text-left" onclick={() => goStore(store)}>
								<div class="text-sm font-semibold">{store.name}</div>
								<div class="text-[11px]" style="color:var(--c-text-muted)">
									{item.timeAgo} · 🎬 {m.home_video_label()}
								</div>
							</button>
						</div>

						<div
							class="relative flex items-center justify-center overflow-hidden"
							style="height:300px;background:{store.bannerGradient}"
						>
							<div
								class="absolute inset-0"
								style="background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,transparent 1px,transparent 10px)"
							></div>
							<div class="z-10 text-[110px] drop-shadow-lg">{store.emoji}</div>
							<button
								class="absolute z-20 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white/95 shadow-[0_8px_32px_rgba(0,0,0,.3)]"
							>
								<Icon name="play" size={30} color="var(--c-text-primary)" />
							</button>
							<div class="absolute right-3.5 bottom-3.5 left-3.5 z-10 text-white">
								<div class="mb-1 font-display text-[17px] font-bold">{item.title}</div>
								<div class="text-xs opacity-85">
									👀 {item.views.toLocaleString()}
									{m.home_views()}
								</div>
							</div>
						</div>
					</Card>
				{/if}
			{/each}
		{/if}
	</div>
</div>
