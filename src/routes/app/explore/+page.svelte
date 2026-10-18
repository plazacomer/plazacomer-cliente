<script lang="ts">
	import { goto } from '$app/navigation';
	import { STORES, CATEGORIES, DEALS, isServiceStore, type Store } from '$lib/data/mock';
	import Icon from '$lib/components/ui/Icon.svelte';
	import CategoryBadge from '$lib/components/CategoryBadge.svelte';
	import FiltrosAvanzados, { type Filtros } from '$lib/components/FiltrosAvanzados.svelte';
	import * as Card from '$lib/components/ui/card';

	let query = $state('');
	let filterCat = $state<string | null>(null);
	let filtrosOpen = $state(false);
	let filtros = $state<Filtros | null>(null);

	const tiendaConOfertas = new Set(DEALS.map((o) => o.storeId));

	const activeCount = $derived(
		filtros
			? (filtros.abiertoAhora ? 1 : 0) +
					(filtros.ratingMin > 0 ? 1 : 0) +
					(filtros.precioMax !== null ? 1 : 0) +
					(filtros.distanciaMax < 10 ? 1 : 0) +
					(filtros.tiempoMax < 60 ? 1 : 0) +
					(filtros.soloOfertas ? 1 : 0) +
					(filtros.siguiendo ? 1 : 0)
			: 0
	);

	const filtered = $derived(
		STORES.filter((t) => {
			if (filterCat && t.category !== filterCat) return false;
			if (query) {
				const q = query.toLowerCase();
				if (!t.name.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q))
					return false;
			}
			if (filtros) {
				if (filtros.abiertoAhora && t.status === 'closed') return false;
				if (filtros.ratingMin > 0 && t.rating < filtros.ratingMin) return false;
				if (filtros.soloOfertas && !tiendaConOfertas.has(t.id)) return false;
				if (filtros.siguiendo && !t.following) return false;
			}
			return true;
		})
	);

	function goTienda(t: Store) {
		goto(`/app/store/${t.id}`);
	}
</script>

<div class="mx-auto max-w-5xl px-5 pt-5 pb-10">
	<h1 class="mb-1 font-display text-3xl font-extrabold">Explorar</h1>
	<p class="mb-5 text-sm" style="color:var(--c-text-secondary)">
		Descubre todas las tiendas de la plaza
	</p>

	<!-- Search bar + filter button -->
	<div class="mb-4 flex gap-2">
		<div
			class="flex flex-1 items-center gap-2.5 rounded-2xl border px-3.5 py-2.5"
			style="background:var(--c-bg-card);border-color:var(--c-border)"
		>
			<Icon name="search" size={18} color="var(--c-text-muted)" />
			<input
				bind:value={query}
				placeholder="Busca tiendas o categorías…"
				class="flex-1 bg-transparent text-sm outline-none"
				style="color:var(--c-text-primary)"
			/>
			{#if query}
				<button onclick={() => (query = '')} style="color:var(--c-text-muted)">
					<Icon name="close" size={16} />
				</button>
			{/if}
		</div>
		<button
			onclick={() => (filtrosOpen = true)}
			class="relative flex items-center justify-center gap-1.5 rounded-2xl border px-3.5 text-sm font-semibold"
			style="background:{activeCount > 0
				? 'var(--c-brand)'
				: 'var(--c-bg-card)'};color:{activeCount > 0
				? '#fff'
				: 'var(--c-text-primary)'};border-color:{activeCount > 0
				? 'var(--c-brand)'
				: 'var(--c-border)'}"
		>
			<Icon name="filter" size={16} color={activeCount > 0 ? '#fff' : 'var(--c-text-primary)'} />
			{#if activeCount > 0}
				<span>{activeCount}</span>
			{/if}
		</button>
	</div>

	<!-- Categories -->
	<div class="mb-5 no-scrollbar flex gap-2 overflow-x-auto pb-2">
		<button
			onclick={() => (filterCat = null)}
			class="shrink-0 rounded-full border border-[var(--c-border-soft)] px-4 py-2 text-[13px] font-semibold"
			style="background:{!filterCat
				? 'var(--c-text-primary)'
				: 'var(--c-bg-card)'};color:{!filterCat ? 'var(--c-bg-card)' : 'var(--c-text-primary)'}"
			>Todas</button
		>
		{#each Object.entries(CATEGORIES) as [key, cat]}
			<button
				onclick={() => (filterCat = filterCat === key ? null : key)}
				class="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--c-border-soft)] px-3.5 py-2 text-[13px] font-semibold"
				style="background:{filterCat === key ? cat.color : 'var(--c-bg-card)'};color:{filterCat ===
				key
					? '#fff'
					: 'var(--c-text-primary)'}"
			>
				<span>{cat.emoji}</span>{cat.label}
			</button>
		{/each}
	</div>

	<!-- Store grid -->
	{#if filtered.length === 0}
		<div class="py-16 text-center">
			<div class="mb-4 text-5xl">🔍</div>
			<h3 class="mb-2 font-display text-lg font-bold">Sin resultados</h3>
			<p class="text-sm" style="color:var(--c-text-secondary)">
				Prueba con otras palabras o cambia la categoría
			</p>
		</div>
	{:else}
		<div class="grid gap-4" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">
			{#each filtered as t}
				<Card.Root
					role="button"
					tabindex={0}
					onclick={() => goTienda(t)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							goTienda(t);
						}
					}}
					class="cursor-pointer gap-0 rounded-[18px] p-0 text-left shadow-[var(--shadow-sm)] ring-1 ring-[var(--c-border-soft)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-md)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-brand)]"
					style="background:var(--c-bg-card)"
				>
					<!-- Banner -->
					<div
						class="relative flex items-center justify-center overflow-hidden"
						style="height:120px;background:{t.bannerGradient}"
					>
						<div class="text-7xl drop-shadow-md">{t.emoji}</div>
						{#if t.following}
							<div class="absolute top-2.5 right-2.5">
								<span
									class="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold"
									style="background:rgba(255,255,255,.95);color:var(--c-text-primary)"
								>
									<Icon name="check" size={10} strokeWidth={3} />Siguiendo
								</span>
							</div>
						{/if}
						<div class="absolute top-2.5 left-2.5 flex gap-1.5">
							<CategoryBadge catKey={t.category} />
							{#if isServiceStore(t)}
								<span
									class="rounded-full px-2 py-0.5 text-[10px] font-bold"
									style="background:rgba(255,255,255,.95);color:#2563EB"
								>
									Servicio
								</span>
							{/if}
						</div>
					</div>

					<!-- Info -->
					<div class="p-3.5">
						<div class="mb-1 flex items-center justify-between">
							<h3 class="font-display text-base font-bold">{t.name}</h3>
							<div
								class="flex items-center gap-1 text-xs font-semibold"
								style="color:var(--c-accent)"
							>
								<Icon name="starFill" size={13} />
								{t.rating}
							</div>
						</div>
						<p
							class="mb-2.5 min-h-[36px] text-xs leading-relaxed"
							style="color:var(--c-text-secondary)"
						>
							{t.description}
						</p>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-1 text-[11px]" style="color:var(--c-text-muted)">
								<Icon name="user" size={11} />
								{t.followers.toLocaleString()} siguiendo
							</div>
							{#if isServiceStore(t)}
								<span
									class="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold"
									style="background:#EFF4FE;color:#2563EB"
								>
									<Icon name="calendar" size={11} color="#2563EB" />
									Agenda cita
								</span>
							{/if}
						</div>
						{#if t.status === 'closed'}
							<div class="mt-2 text-[11px] font-semibold" style="color:var(--c-error)">
								● Cerrado ahora
							</div>
						{/if}
					</div>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>

<FiltrosAvanzados
	open={filtrosOpen}
	value={filtros ?? undefined}
	onapply={(f) => (filtros = f)}
	onclose={() => (filtrosOpen = false)}
/>
