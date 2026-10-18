<script lang="ts">
	import { goto } from '$app/navigation';
	import { favoritos } from '$lib/stores/favoritos.svelte';
	import { cart, toast } from '$lib/stores/app.svelte';
	import { loyalty } from '$lib/stores/loyalty.svelte';
	import { storeUi } from '$lib/stores/storeUi.svelte';
	import { fmtCOP } from '$lib/utils';
	import type { Product, Store, Deal } from '$lib/data/mock';
	import TiendaLogo from '$lib/components/TiendaLogo.svelte';
	import CategoryBadge from '$lib/components/CategoryBadge.svelte';
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

	// Cada vez que se entra a una tienda (o se cambia de tienda) arrancamos en "menu"
	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions -- lectura intencional: registra tienda.id como dependencia del efecto
		tienda.id;
		storeUi.reset();
	});

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

	const searchResults = $derived.by(() => {
		const q = storeUi.query.trim().toLowerCase();
		if (!q) return productos;
		return productos.filter(
			(p) => p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q)
		);
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

{#snippet menuItem(p: Product)}
	{@const oferta = ofertas.find((o) => o.productId === p.id)}
	{@const precio = oferta ? oferta.dealPrice : p.price}
	{@const isFav = favoritos.isFavorito(p.id)}
	{@const agotado = p.stock === 0}
	<div
		class="flex gap-3 rounded-2xl border p-3"
		style="background:var(--c-bg-card);border-color:{oferta
			? 'var(--c-error)'
			: 'var(--c-border-soft)'}"
	>
		<div
			class="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-3xl"
			style="background:{tienda.bannerGradient}"
		>
			{p.emoji}
			<button
				onclick={() => favoritos.toggle(p.id)}
				aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
				class="absolute -right-1.5 -bottom-1.5 flex h-6 w-6 items-center justify-center rounded-full shadow-md"
				style="background:rgba(255,255,255,.95);color:{isFav ? '#DC2626' : 'var(--c-text-muted)'}"
			>
				<Icon name={isFav ? 'heartFill' : 'heart'} size={11} />
			</button>
		</div>
		<div class="flex min-w-0 flex-1 flex-col">
			<div class="flex items-start justify-between gap-2">
				<h4 class="font-display text-[14px] leading-tight font-bold">{p.name}</h4>
			</div>
			{#if p.description}
				<p class="mt-0.5 line-clamp-2 text-[11.5px] leading-snug" style="color:var(--c-text-muted)">
					{p.description}
				</p>
			{/if}
			<div class="flex-1"></div>
			<div class="mt-2 flex items-center justify-between gap-2">
				<div class="flex items-baseline gap-1.5">
					{#if oferta}
						<span class="font-mono text-[11px] line-through" style="color:var(--c-text-muted)"
							>{fmtCOP(oferta.originalPrice)}</span
						>
					{/if}
					<span
						class="font-mono text-[14px] font-bold"
						style="color:{oferta ? 'var(--c-error)' : 'var(--c-text-primary)'}"
						>{fmtCOP(precio)}</span
					>
				</div>
				{#if agotado}
					<span
						class="rounded-lg px-2.5 py-1 text-[11px] font-bold"
						style="background:var(--c-error-light);color:var(--c-error)">Agotado</span
					>
				{:else}
					<button
						onclick={() => onOpenProduct(p)}
						disabled={!isOpen}
						class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
						style="background:{accent};box-shadow:0 3px 10px {accent}55"
					>
						<Icon name="plus" size={16} strokeWidth={2.5} />
					</button>
				{/if}
			</div>
			{#if oferta}
				<div class="mt-1.5 flex items-center gap-2">
					<CountdownPill finishAt={oferta.finishAt} />
					{#if oferta.dealStock <= 5}
						<span class="text-[10.5px] font-bold" style="color:var(--c-error)"
							>solo {oferta.dealStock} disp.</span
						>
					{/if}
				</div>
			{:else if p.stock !== undefined && p.stock > 0 && p.stock <= 3}
				<div class="mt-1 text-[10.5px] font-semibold" style="color:var(--c-warning)">
					⚠️ Solo quedan {p.stock}
				</div>
			{/if}
		</div>
	</div>
{/snippet}

{#snippet backToMenu()}
	<button
		onclick={() => storeUi.setTab('menu')}
		class="mb-4 flex items-center gap-1.5 text-[13px] font-semibold"
		style="color:var(--c-text-secondary)"
	>
		<Icon name="arrowLeft" size={15} /> Volver al menú
	</button>
{/snippet}

<div class="mx-auto max-w-5xl pb-28 md:pb-16">
	<!-- ── Banner compacto ── -->
	<div
		class="relative h-[150px] overflow-hidden md:h-[220px] md:rounded-b-[22px]"
		style="background:{tienda.bannerGradient}"
	>
		<div
			class="absolute inset-0"
			style="background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.05) 0,rgba(255,255,255,.05) 1px,transparent 1px,transparent 14px)"
		></div>
		<div
			class="absolute right-4 bottom-2 text-[72px] leading-none drop-shadow-[0_8px_20px_rgba(0,0,0,.25)] select-none md:right-10 md:bottom-4 md:text-[110px]"
		>
			{tienda.emoji}
		</div>
		<button
			onclick={goBack}
			aria-label="Volver"
			class="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-xl shadow-md"
			style="background:rgba(255,255,255,.95);color:var(--c-text-primary)"
		>
			<Icon name="arrowLeft" size={18} />
		</button>
		<button
			onclick={share}
			aria-label="Compartir"
			class="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl shadow-md"
			style="background:rgba(255,255,255,.95);color:var(--c-text-primary)"
		>
			<Icon name="share" size={18} />
		</button>
	</div>

	<div class="px-5 md:px-6">
		<!-- ── Identidad ── -->
		<div class="relative -mt-7 flex items-end gap-3">
			<div class="rounded-full p-0.5 shadow-[var(--shadow-sm)]" style="background:var(--c-bg-card)">
				<TiendaLogo {tienda} size={64} />
			</div>
			<div class="min-w-0 flex-1 pb-1">
				<h1 class="truncate font-display text-xl leading-tight font-extrabold md:text-2xl">
					{tienda.name}
				</h1>
			</div>
		</div>

		<!-- ── Datos vitales ── -->
		<div
			class="mt-3 flex flex-wrap items-center gap-3 text-[12.5px] font-semibold"
			style="color:var(--c-text-secondary)"
		>
			{#if isOpen}
				<span class="flex items-center gap-1.5" style="color:var(--c-success)">
					<span class="h-[6px] w-[6px] rounded-full bg-current"></span>Abierto ahora
				</span>
			{:else}
				<span style="color:var(--c-error)">Cerrado</span>
			{/if}
			<span class="flex items-center gap-1"
				><Icon name="starFill" size={13} color="var(--c-accent)" />{tienda.rating}
				<span style="color:var(--c-text-muted)">({tienda.ratingSummary?.total ?? 0})</span></span
			>
			<span class="flex items-center gap-1"><Icon name="clock" size={13} />{deliveryTime}</span>
			<span class="flex items-center gap-1 truncate"
				><Icon name="location" size={13} />{tienda.location}</span
			>
		</div>

		<!-- ── Acciones ── -->
		<div class="mt-3.5 flex gap-2">
			<button
				onclick={() => (siguiendo = !siguiendo)}
				class="flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[13px] font-semibold md:min-w-[160px] md:flex-none"
				style="background:{siguiendo
					? 'var(--c-bg-secondary)'
					: 'var(--c-bg-card)'};border-color:var(--c-border);color:var(--c-text-primary)"
			>
				<Icon name={siguiendo ? 'check' : 'heart'} size={15} />
				{siguiendo ? 'Siguiendo' : 'Seguir'}
			</button>
			<button
				onclick={goChat}
				class="flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[13px] font-semibold md:min-w-[160px] md:flex-none"
				style="background:var(--c-bg-card);border-color:var(--c-border);color:var(--c-text-primary)"
			>
				<Icon name="chat" size={15} />
				Mensaje
			</button>
		</div>

		{#if storeUi.tab === 'menu'}
			<!-- ── Tarjeta de fidelidad ── -->
			{#if loyaltyProgress}
				<div
					class="mt-3.5 rounded-xl border p-3.5"
					style="background:var(--c-promo-light);border-color:var(--c-promo)"
				>
					<div class="mb-2 flex items-center justify-between gap-2">
						<span class="text-[12.5px] font-bold" style="color:var(--c-promo)">
							🎁 A {loyaltyProgress.config.threshold} compras: {loyaltyProgress.rewardLabel}
						</span>
						<span class="shrink-0 text-[11px] font-bold" style="color:var(--c-promo)">
							{loyaltyProgress.stamps}/{loyaltyProgress.config.threshold}
						</span>
					</div>
					<div class="mb-2.5 flex gap-1.5">
						{#each Array(loyaltyProgress.config.threshold) as _, i}
							<div
								class="h-1.5 flex-1 rounded-full"
								style="background:{i < loyaltyProgress.stamps
									? 'var(--c-promo)'
									: 'var(--c-border)'}"
							></div>
						{/each}
					</div>
					{#if loyaltyProgress.hasRewardAvailable}
						<button
							onclick={() => loyalty.claim(tienda.id)}
							class="w-full rounded-lg py-2 text-[13px] font-bold text-white"
							style="background:var(--c-promo)"
						>
							Reclamar premio
						</button>
					{/if}
				</div>
			{/if}

			<!-- ── Menú ── -->
			<section class="mt-6">
				<div class="mb-3 flex items-baseline justify-between">
					<h2 class="font-display text-lg font-extrabold">Menú</h2>
					<span class="text-xs" style="color:var(--c-text-muted)">{productos.length} platos</span>
				</div>

				{#if productos.length === 0}
					<div class="py-14 text-center" style="color:var(--c-text-muted)">
						<div class="mb-3 text-4xl">🍽️</div>
						<h3 class="font-display text-base font-bold">Aún no hay platos</h3>
						<p class="mt-1 text-sm">Esta tienda está armando su menú.</p>
					</div>
				{:else}
					<div class="flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3 lg:grid-cols-3">
						{#each menu() as p}
							{@render menuItem(p)}
						{/each}
					</div>
				{/if}
			</section>
		{:else if storeUi.tab === 'search'}
			{@render backToMenu()}
			<div class="relative mb-4">
				<Icon
					name="search"
					size={17}
					color="var(--c-text-muted)"
					class="absolute top-1/2 left-3.5 -translate-y-1/2"
				/>
				<input
					value={storeUi.query}
					oninput={(e) => storeUi.setQuery((e.target as HTMLInputElement).value)}
					type="text"
					autofocus
					placeholder="Buscar un plato en {tienda.name}..."
					class="h-12 w-full rounded-xl border pr-4 pl-10 outline-none"
					style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
				/>
			</div>

			{#if searchResults.length === 0}
				<div class="py-14 text-center" style="color:var(--c-text-muted)">
					<div class="mb-3 text-4xl">🔍</div>
					<h3 class="font-display text-base font-bold">Sin resultados</h3>
					<p class="mt-1 text-sm">Prueba con otro nombre.</p>
				</div>
			{:else}
				<div class="flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3 lg:grid-cols-3">
					{#each searchResults as p}
						{@render menuItem(p)}
					{/each}
				</div>
			{/if}
		{:else if storeUi.tab === 'promos'}
			{@render backToMenu()}
			{#if ofertas.length === 0}
				<div class="py-14 text-center" style="color:var(--c-text-muted)">
					<div class="mb-3 text-4xl">🔥</div>
					<h3 class="font-display text-base font-bold">Sin promos activas</h3>
					<p class="mt-1 text-sm">{tienda.name} no tiene promos por ahora, vuelve pronto.</p>
				</div>
			{:else}
				<div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
					{#each ofertas as o}
						{@const p = productos.find((pr) => pr.id === o.productId)}
						{#if p}
							{@const disc = Math.round((1 - o.dealPrice / o.originalPrice) * 100)}
							{@const agotado = p.stock === 0}
							<div
								class="overflow-hidden rounded-xl border"
								style="background:var(--c-bg-card);border-color:var(--c-error)"
							>
								<div
									class="relative flex h-24 items-center justify-center text-4xl"
									style="background:{tienda.bannerGradient}"
								>
									{p.emoji}
									<span
										class="absolute top-1.5 left-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold text-white"
										style="background:var(--c-error)">-{disc}%</span
									>
								</div>
								<div class="p-2.5">
									<div class="line-clamp-1 text-[12px] leading-tight font-bold">{p.name}</div>
									<div class="mt-1 flex items-baseline gap-1">
										<span
											class="font-mono text-[10px] line-through"
											style="color:var(--c-text-muted)">{fmtCOP(o.originalPrice)}</span
										>
										<span class="font-mono text-[13.5px] font-bold" style="color:var(--c-error)"
											>{fmtCOP(o.dealPrice)}</span
										>
									</div>
									<div class="mt-1.5 flex items-center justify-between">
										<CountdownPill finishAt={o.finishAt} />
										{#if !agotado}
											<button
												onclick={() => onOpenProduct(p)}
												disabled={!isOpen}
												class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white"
												style="background:{accent}"
											>
												<Icon name="plus" size={13} strokeWidth={2.5} />
											</button>
										{/if}
									</div>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		{:else if storeUi.tab === 'info'}
			{@render backToMenu()}
			<div class="flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3">
				<div
					class="flex gap-3 rounded-xl border p-3.5"
					style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
				>
					<div
						class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
						style="background:{accent}18;color:{accent}"
					>
						<Icon name="location" size={16} />
					</div>
					<div>
						<div
							class="mb-0.5 text-[11px] font-bold tracking-wide uppercase"
							style="color:var(--c-text-muted)"
						>
							Ubicación
						</div>
						<div class="text-[13px] font-medium">{tienda.location}</div>
					</div>
				</div>
				<div
					class="flex gap-3 rounded-xl border p-3.5"
					style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
				>
					<div
						class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
						style="background:{accent}18;color:{accent}"
					>
						<Icon name="clock" size={16} />
					</div>
					<div>
						<div
							class="mb-0.5 text-[11px] font-bold tracking-wide uppercase"
							style="color:var(--c-text-muted)"
						>
							Horario
						</div>
						<div class="text-[13px] font-medium">{tienda.hours}</div>
					</div>
				</div>
				<div
					class="flex gap-3 rounded-xl border p-3.5"
					style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
				>
					<div
						class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
						style="background:{accent}18;color:{accent}"
					>
						<Icon name="credit" size={16} />
					</div>
					<div>
						<div
							class="mb-0.5 text-[11px] font-bold tracking-wide uppercase"
							style="color:var(--c-text-muted)"
						>
							Pagos
						</div>
						<div class="text-[13px] font-medium">{tienda.paymentMethods.join(' · ')}</div>
					</div>
				</div>
				<div
					class="flex gap-3 rounded-xl border p-3.5"
					style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
				>
					<div
						class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
						style="background:{accent}18;color:{accent}"
					>
						<Icon name="starFill" size={16} />
					</div>
					<div>
						<div
							class="mb-0.5 text-[11px] font-bold tracking-wide uppercase"
							style="color:var(--c-text-muted)"
						>
							Calificación
						</div>
						<div class="text-[13px] font-medium">
							{tienda.rating} · {tienda.ratingSummary?.total ?? 0} reseñas · {tienda.followers.toLocaleString()}
							siguiendo
						</div>
					</div>
				</div>
				<div
					class="flex items-center gap-3 rounded-xl border p-3.5"
					style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
				>
					<div
						class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
						style="background:{accent}18;color:{accent}"
					>
						<Icon name="tag" size={16} />
					</div>
					<div>
						<div
							class="mb-0.5 text-[11px] font-bold tracking-wide uppercase"
							style="color:var(--c-text-muted)"
						>
							Categoría
						</div>
						<CategoryBadge catKey={tienda.category} />
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

{#if cart.count > 0}
	<button
		onclick={() => goto('/app/cart')}
		class="fixed right-4 bottom-[calc(70px+env(safe-area-inset-bottom))] left-4 z-50 flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[14px] font-semibold text-white md:right-auto md:left-1/2 md:w-full md:max-w-md md:-translate-x-1/2 lg:bottom-6"
		style="background:{accent};box-shadow:0 8px 24px {accent}66"
	>
		<span
			class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold"
			style="background:rgba(255,255,255,.25)">{cart.count}</span
		>
		<span class="flex-1 text-left">Ver carrito</span>
		<span class="font-mono">{fmtCOP(cart.total)}</span>
	</button>
{/if}
