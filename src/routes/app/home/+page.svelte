<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		STORES, CATEGORIES, FEED, USUARIO,
		getStore, getProduct, getDeal,
		type FeedItem, type Store
	} from '$lib/data/mock';
	import { cart, toast } from '$lib/stores/app.svelte';
	import { fmtCOP } from '$lib/utils';
	import TiendaLogo from '$lib/components/TiendaLogo.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import CountdownPill from '$lib/components/CountdownPill.svelte';
	import CategoryBadge from '$lib/components/CategoryBadge.svelte';

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

	function addToCart(productoId: string, tiendaId: string, precio: number) {
		const p = getProduct(productoId);
		cart.add({ productoId, tiendaId, precio });
		toast.show(`✓ ${p.name} agregado al carrito`);
	}

	function goTienda(tienda: Store) {
		goto(`/app/store/${tienda.id}`);
	}
</script>

<div class="max-w-2xl mx-auto pb-6">
	<!-- Header greeting -->
	<div class="px-5 pt-5 pb-0">
		<h1 class="font-display text-3xl font-extrabold mb-1">Hola, {USUARIO.nombre.split(' ')[0]} 👋</h1>
		<p class="text-sm" style="color:var(--c-text-secondary)">Tus tiendas favoritas tienen novedades hoy.</p>
	</div>

	<!-- Stories rail -->
	<div class="flex gap-3.5 px-5 py-4 overflow-x-auto no-scrollbar">
		{#each STORES.filter((t) => t.following) as t}
			<button onclick={() => goTienda(t)} class="flex flex-col items-center gap-1.5 shrink-0 min-w-[68px]">
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
		>Todas</button>
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
				<h3 class="font-display font-bold text-lg mb-2">Sin novedades en esta categoría</h3>
				<p class="text-sm" style="color:var(--c-text-secondary)">Prueba con otra o explora todas las tiendas</p>
				<div class="mt-4">
					<Button variant="brand" onclick={() => goto('/app/explore')}>Ir a Explorar</Button>
				</div>
			</div>
		{:else}
			{#each filtered as item}
				{#if item.kind === 'deal'}
					{@const oferta = getDeal(item.dealId)}
					{@const producto = getProduct(oferta.productId)}
					{@const tienda = getStore(oferta.storeId)}
					{@const discount = Math.round((1 - oferta.dealPrice / oferta.originalPrice) * 100)}
					{@const stockPct = (oferta.dealStock / oferta.initialStock) * 100}
					{@const stockCritical = oferta.dealStock <= 5}
					<Card class="animate-slide-up">
						<!-- Store header -->
						<div class="flex items-center gap-2.5 p-4">
							<TiendaLogo tienda={tienda} size={36}/>
							<button class="flex-1 min-w-0 text-left" onclick={() => goTienda(tienda)}>
								<div class="font-semibold text-sm">{tienda.name}</div>
								<div class="text-[11px] flex items-center gap-1.5" style="color:var(--c-text-muted)">
									<Icon name="location" size={11}/>{tienda.location}
								</div>
							</button>
							<Badge variant="error">
								<Icon name="fire" size={11} strokeWidth={2.5}/>
								-{discount}%
							</Badge>
						</div>

						<!-- Product visual -->
						<div
							class="relative flex items-center justify-center overflow-hidden"
							style="height:220px;background:{tienda.bannerGradient}"
						>
							<div class="text-[110px] drop-shadow-lg">{producto.emoji}</div>
							<div class="absolute top-3.5 left-3.5">
								<span class="text-[11px] font-semibold px-3 py-1 rounded-full text-white"
									style="background:rgba(0,0,0,.55);backdrop-filter:blur(6px)">
									{oferta.label}
								</span>
							</div>
							<div class="absolute top-3.5 right-3.5">
								<CountdownPill finishAt={oferta.finishAt}/>
							</div>
						</div>

						<div class="p-4">
							<h3 class="font-display text-base font-bold mb-2">{producto.name}</h3>
							<p class="text-[13px] leading-relaxed mb-3.5" style="color:var(--c-text-secondary)">{producto.description}</p>

							<div class="flex items-baseline gap-2.5 mb-2.5">
								<span class="font-mono text-2xl font-medium" style="color:var(--c-error)">{fmtCOP(oferta.dealPrice)}</span>
								<span class="font-mono text-sm line-through" style="color:var(--c-text-muted)">{fmtCOP(oferta.originalPrice)}</span>
							</div>

							<div class="flex items-center gap-1.5 text-[11px] font-semibold mb-1.5"
								style="color:{stockCritical ? 'var(--c-warning)' : 'var(--c-text-secondary)'}">
								{#if stockCritical}⚠️{/if}
								Quedan {oferta.dealStock} de {oferta.initialStock}
							</div>
							<div class="h-1.5 rounded-full mb-4 overflow-hidden" style="background:var(--c-bg-secondary)">
								<div class="h-full rounded-full transition-all"
									style="width:{stockPct}%;background:{stockCritical ? 'var(--c-warning)' : 'var(--c-success)'}"></div>
							</div>

							<div class="flex gap-2">
								<Button variant="brand" fullWidth
									onclick={() => addToCart(producto.id, tienda.id, oferta.dealPrice)}>
									<Icon name="cart" size={16}/>
									Aprovechar oferta
								</Button>
								<button class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
									style="background:var(--c-bg-secondary);color:var(--c-text-secondary)">
									<Icon name="heart" size={18}/>
								</button>
							</div>
						</div>
					</Card>

				{:else if item.kind === 'product'}
					{@const producto = getProduct(item.productId)}
					{@const tienda = getStore(producto.storeId)}
					<Card class="animate-slide-up">
						<div class="flex items-center gap-2.5 p-4">
							<TiendaLogo tienda={tienda} size={36}/>
							<button class="flex-1 text-left" onclick={() => goTienda(tienda)}>
								<div class="font-semibold text-sm">{tienda.name}</div>
								<div class="text-[11px]" style="color:var(--c-text-muted)">{item.timeAgo}</div>
							</button>
							<Badge variant="promo">
								<Icon name="sparkle" size={11} strokeWidth={2.5}/>
								Nuevo
							</Badge>
						</div>

						<div class="flex items-center justify-center overflow-hidden"
							style="height:180px;background:{tienda.bannerGradient}">
							<div class="text-[90px] drop-shadow-lg">{producto.emoji}</div>
						</div>

						<div class="p-4">
							<h3 class="font-display text-[15px] font-bold mb-1">{producto.name}</h3>
							{#if item.extra}
								<div class="text-xs font-semibold mb-2.5" style="color:var(--c-promo)">{item.extra}</div>
							{/if}
							<div class="flex items-center justify-between">
								<span class="font-mono text-lg font-medium">{fmtCOP(producto.price)}</span>
								{#if producto.stock === 0}
									<Button variant="ghost" size="sm" disabled>Agotado</Button>
								{:else}
									<Button variant="brand" size="sm"
										onclick={() => addToCart(producto.id, tienda.id, producto.price)}>
										<Icon name="plus" size={14} strokeWidth={2.5}/>
										Agregar
									</Button>
								{/if}
							</div>
							{#if producto.stock !== undefined && producto.stock <= 3 && producto.stock > 0}
								<div class="mt-2 text-[11px] font-semibold" style="color:var(--c-warning)">
									⚠️ Solo quedan {producto.stock}
								</div>
							{/if}
						</div>
					</Card>

				{:else if item.kind === 'video'}
					{@const tienda = getStore(item.storeId)}
					<Card class="animate-slide-up">
						<div class="flex items-center gap-2.5 p-4">
							<TiendaLogo tienda={tienda} size={36}/>
							<button class="flex-1 text-left" onclick={() => goTienda(tienda)}>
								<div class="font-semibold text-sm">{tienda.name}</div>
								<div class="text-[11px]" style="color:var(--c-text-muted)">{item.timeAgo} · 🎬 Video</div>
							</button>
						</div>

						<div class="relative flex items-center justify-center overflow-hidden"
							style="height:300px;background:{tienda.bannerGradient}">
							<div class="absolute inset-0"
								style="background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,transparent 1px,transparent 10px)">
							</div>
							<div class="text-[110px] drop-shadow-lg z-10">{tienda.emoji}</div>
							<button class="absolute z-20 w-[72px] h-[72px] rounded-full bg-white/95 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,.3)]">
								<Icon name="play" size={30} color="var(--c-text-primary)"/>
							</button>
							<div class="absolute bottom-3.5 left-3.5 right-3.5 text-white z-10">
								<div class="font-display text-[17px] font-bold mb-1">{item.title}</div>
								<div class="text-xs opacity-85">👀 {item.views.toLocaleString()} vistas</div>
							</div>
						</div>
					</Card>
				{/if}
			{/each}
		{/if}
	</div>
</div>
