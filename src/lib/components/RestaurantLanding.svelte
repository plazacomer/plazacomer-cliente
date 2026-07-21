<script lang="ts">
	import { goto } from '$app/navigation';
	import { favoritos } from '$lib/stores/favoritos.svelte';
	import { cart, toast } from '$lib/stores/app.svelte';
	import { loyalty } from '$lib/stores/loyalty.svelte';
	import { fmtCOP } from '$lib/utils';
	import type { Product, Store, Deal } from '$lib/data/mock';
	import TiendaLogo from '$lib/components/TiendaLogo.svelte';
	import CountdownPill from '$lib/components/CountdownPill.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	type Props = {
		tienda: Store;
		productos: Product[];
		ofertas: Deal[];
		accent: string;
		isOpen: boolean;
		onOpenProduct: (p: Product) => void;
	};

	let { tienda, productos, ofertas, accent, isOpen, onOpenProduct }: Props = $props();

	let siguiendo = $state(false);
	$effect(() => {
		siguiendo = tienda.following;
	});

	// Platos con oferta primero — lo más relevante para decidir rápido
	const menu = $derived(() => {
		const conOferta = productos.filter((p) => ofertas.some((o) => o.productId === p.id));
		const resto = productos.filter((p) => !conOferta.find((x) => x.id === p.id));
		return [...conOferta, ...resto];
	});

	const deliveryTime = $derived((tienda.hours ?? '').includes('24') ? '24/7' : '30–45 min');
	const loyaltyProgress = $derived(loyalty.progress(tienda.id));

	function goBack() {
		history.back();
	}

	function goChat() {
		goto(`/app/messages/${tienda.id}`);
	}

	async function share() {
		const url = window.location.href;
		if (navigator.share) {
			try {
				await navigator.share({ title: tienda.name, url });
			} catch {
				/* usuario canceló */
			}
		} else if (navigator.clipboard) {
			await navigator.clipboard.writeText(url);
			toast.show('🔗 Link copiado');
		}
	}

</script>

<div class="max-w-2xl mx-auto pb-28">

	<!-- ── Banner compacto ── -->
	<div class="relative overflow-hidden" style="height:150px;background:{tienda.bannerGradient}">
		<div class="absolute inset-0"
			style="background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.05) 0,rgba(255,255,255,.05) 1px,transparent 1px,transparent 14px)"></div>
		<div class="absolute right-4 bottom-2 text-[72px] leading-none drop-shadow-[0_8px_20px_rgba(0,0,0,.25)] select-none">
			{tienda.emoji}
		</div>
		<button onclick={goBack} aria-label="Volver"
			class="absolute top-4 left-4 w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
			style="background:rgba(255,255,255,.95);color:var(--c-text-primary)">
			<Icon name="arrowLeft" size={18}/>
		</button>
		<button onclick={share} aria-label="Compartir"
			class="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
			style="background:rgba(255,255,255,.95);color:var(--c-text-primary)">
			<Icon name="share" size={18}/>
		</button>
	</div>

	<div class="px-5">

		<!-- ── Identidad ── -->
		<div class="flex items-end gap-3 -mt-7 relative">
			<div class="p-0.5 rounded-full shadow-[var(--shadow-sm)]" style="background:var(--c-bg-card)">
				<TiendaLogo {tienda} size={64}/>
			</div>
			<div class="flex-1 min-w-0 pb-1">
				<h1 class="font-display text-xl font-extrabold leading-tight truncate">{tienda.name}</h1>
			</div>
		</div>

		<!-- ── Datos vitales ── -->
		<div class="flex items-center gap-3 flex-wrap mt-3 text-[12.5px] font-semibold" style="color:var(--c-text-secondary)">
			{#if isOpen}
				<span class="flex items-center gap-1.5" style="color:var(--c-success)">
					<span class="w-[6px] h-[6px] rounded-full bg-current"></span>Abierto ahora
				</span>
			{:else}
				<span style="color:var(--c-error)">Cerrado</span>
			{/if}
			<span class="flex items-center gap-1"><Icon name="starFill" size={13} color="var(--c-accent)"/>{tienda.rating} <span style="color:var(--c-text-muted)">({tienda.ratingSummary?.total ?? 0})</span></span>
			<span class="flex items-center gap-1"><Icon name="clock" size={13}/>{deliveryTime}</span>
			<span class="flex items-center gap-1 truncate"><Icon name="location" size={13}/>{tienda.location}</span>
		</div>

		<!-- ── Acciones ── -->
		<div class="flex gap-2 mt-3.5">
			<button onclick={() => (siguiendo = !siguiendo)}
				class="flex-1 py-2.5 rounded-xl font-semibold text-[13px] border flex items-center justify-center gap-1.5"
				style="background:{siguiendo ? 'var(--c-bg-secondary)' : 'var(--c-bg-card)'};border-color:var(--c-border);color:var(--c-text-primary)">
				<Icon name={siguiendo ? 'check' : 'heart'} size={15}/>
				{siguiendo ? 'Siguiendo' : 'Seguir'}
			</button>
			<button onclick={goChat}
				class="flex-1 py-2.5 rounded-xl font-semibold text-[13px] border flex items-center justify-center gap-1.5"
				style="background:var(--c-bg-card);border-color:var(--c-border);color:var(--c-text-primary)">
				<Icon name="chat" size={15}/>
				Mensaje
			</button>
		</div>

		<!-- ── Tarjeta de fidelidad ── -->
		{#if loyaltyProgress}
			<div class="mt-3.5 p-3.5 rounded-xl border" style="background:var(--c-promo-light);border-color:var(--c-promo)">
				<div class="flex items-center justify-between gap-2 mb-2">
					<span class="text-[12.5px] font-bold" style="color:var(--c-promo)">
						🎁 A {loyaltyProgress.config.threshold} compras: {loyaltyProgress.rewardLabel}
					</span>
					<span class="text-[11px] font-bold shrink-0" style="color:var(--c-promo)">
						{loyaltyProgress.stamps}/{loyaltyProgress.config.threshold}
					</span>
				</div>
				<div class="flex gap-1.5 mb-2.5">
					{#each Array(loyaltyProgress.config.threshold) as _, i}
						<div class="flex-1 h-1.5 rounded-full" style="background:{i < loyaltyProgress.stamps ? 'var(--c-promo)' : 'var(--c-border)'}"></div>
					{/each}
				</div>
				{#if loyaltyProgress.hasRewardAvailable}
					<button onclick={() => loyalty.claim(tienda.id)}
						class="w-full py-2 rounded-lg text-white font-bold text-[13px]"
						style="background:var(--c-promo)">
						Reclamar premio
					</button>
				{/if}
			</div>
		{/if}

		<!-- ── Promos activas ── -->
		{#if ofertas.length > 0}
			<section class="mt-4">
				<div class="flex items-center gap-1.5 mb-2.5" style="color:var(--c-error)">
					<Icon name="fire" size={15}/>
					<h2 class="font-display text-[13px] font-extrabold uppercase tracking-wide">Promos de hoy</h2>
				</div>
				<div class="flex gap-2.5 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
					{#each ofertas as o}
						{@const p = productos.find((pr) => pr.id === o.productId)}
						{#if p}
							{@const disc = Math.round((1 - o.dealPrice / o.originalPrice) * 100)}
							{@const agotado = p.stock === 0}
							<div class="w-[136px] shrink-0 rounded-xl border overflow-hidden"
								style="background:var(--c-bg-card);border-color:var(--c-error)">
								<div class="relative h-20 flex items-center justify-center text-4xl"
									style="background:{tienda.bannerGradient}">
									{p.emoji}
									<span class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-white text-[10px] font-extrabold"
										style="background:var(--c-error)">-{disc}%</span>
								</div>
								<div class="p-2">
									<div class="text-[11.5px] font-bold leading-tight line-clamp-1">{p.name}</div>
									<div class="flex items-baseline gap-1 mt-1">
										<span class="font-mono text-[10px] line-through" style="color:var(--c-text-muted)">{fmtCOP(o.originalPrice)}</span>
										<span class="font-mono text-[13px] font-bold" style="color:var(--c-error)">{fmtCOP(o.dealPrice)}</span>
									</div>
									<div class="flex items-center justify-between mt-1.5">
										<CountdownPill finishAt={o.finishAt}/>
										{#if !agotado}
											<button onclick={() => onOpenProduct(p)} disabled={!isOpen}
												class="w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0"
												style="background:{accent}">
												<Icon name="plus" size={13} strokeWidth={2.5}/>
											</button>
										{/if}
									</div>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</section>
		{/if}

		<!-- ── Menú ── -->
		<section class="mt-6" id="rl-menu">
			<div class="flex items-baseline justify-between mb-3">
				<h2 class="font-display text-lg font-extrabold">Menú</h2>
				<span class="text-xs" style="color:var(--c-text-muted)">{productos.length} platos</span>
			</div>

			{#if productos.length === 0}
				<div class="text-center py-14" style="color:var(--c-text-muted)">
					<div class="text-4xl mb-3">🍽️</div>
					<h3 class="font-display font-bold text-base">Aún no hay platos</h3>
					<p class="text-sm mt-1">Esta tienda está armando su menú.</p>
				</div>
			{:else}
				<div class="flex flex-col gap-2.5">
					{#each menu() as p}
						{@const oferta = ofertas.find((o) => o.productId === p.id)}
						{@const precio = oferta ? oferta.dealPrice : p.price}
						{@const isFav = favoritos.isFavorito(p.id)}
						{@const agotado = p.stock === 0}
						<div class="flex gap-3 p-3 rounded-2xl border"
							style="background:var(--c-bg-card);border-color:{oferta ? 'var(--c-error)' : 'var(--c-border-soft)'}">
							<div class="relative w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0"
								style="background:{tienda.bannerGradient}">
								{p.emoji}
								<button
									onclick={() => favoritos.toggle(p.id)}
									aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
									class="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
									style="background:rgba(255,255,255,.95);color:{isFav ? '#DC2626' : 'var(--c-text-muted)'}">
									<Icon name={isFav ? 'heartFill' : 'heart'} size={11}/>
								</button>
							</div>
							<div class="flex-1 min-w-0 flex flex-col">
								<div class="flex items-start justify-between gap-2">
									<h4 class="font-display text-[14px] font-bold leading-tight">{p.name}</h4>
								</div>
								{#if p.description}
									<p class="text-[11.5px] leading-snug mt-0.5 line-clamp-2" style="color:var(--c-text-muted)">{p.description}</p>
								{/if}
								<div class="flex-1"></div>
								<div class="flex items-center justify-between gap-2 mt-2">
									<div class="flex items-baseline gap-1.5">
										{#if oferta}
											<span class="font-mono text-[11px] line-through" style="color:var(--c-text-muted)">{fmtCOP(oferta.originalPrice)}</span>
										{/if}
										<span class="font-mono text-[14px] font-bold" style="color:{oferta ? 'var(--c-error)' : 'var(--c-text-primary)'}">{fmtCOP(precio)}</span>
									</div>
									{#if agotado}
										<span class="text-[11px] font-bold px-2.5 py-1 rounded-lg" style="background:var(--c-error-light);color:var(--c-error)">Agotado</span>
									{:else}
										<button onclick={() => onOpenProduct(p)} disabled={!isOpen}
											class="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
											style="background:{accent};box-shadow:0 3px 10px {accent}55">
											<Icon name="plus" size={16} strokeWidth={2.5}/>
										</button>
									{/if}
								</div>
								{#if oferta}
									<div class="flex items-center gap-2 mt-1.5">
										<CountdownPill finishAt={oferta.finishAt}/>
										{#if oferta.dealStock <= 5}
											<span class="text-[10.5px] font-bold" style="color:var(--c-error)">solo {oferta.dealStock} disp.</span>
										{/if}
									</div>
								{:else if p.stock !== undefined && p.stock > 0 && p.stock <= 3}
									<div class="text-[10.5px] font-semibold mt-1" style="color:var(--c-warning)">⚠️ Solo quedan {p.stock}</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- ── Info esencial (una línea) ── -->
		<div class="mt-8 pt-4 border-t text-[11.5px] leading-relaxed flex flex-wrap gap-x-4 gap-y-1"
			style="border-color:var(--c-border-soft);color:var(--c-text-muted)">
			<span class="flex items-center gap-1"><Icon name="location" size={12}/>{tienda.location}</span>
			<span class="flex items-center gap-1"><Icon name="clock" size={12}/>{tienda.hours}</span>
			<span class="flex items-center gap-1"><Icon name="credit" size={12}/>{tienda.paymentMethods.join(' · ')}</span>
		</div>
	</div>
</div>

{#if cart.count > 0}
	<button onclick={() => goto('/app/cart')}
		class="fixed left-4 right-4 z-50 flex items-center gap-3 px-4 py-3.5 rounded-2xl text-white font-semibold text-[14px]"
		style="bottom:calc(70px + env(safe-area-inset-bottom));background:{accent};box-shadow:0 8px 24px {accent}66">
		<span class="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0" style="background:rgba(255,255,255,.25)">{cart.count}</span>
		<span class="flex-1 text-left">Ver carrito</span>
		<span class="font-mono">{fmtCOP(cart.total)}</span>
	</button>
{/if}
