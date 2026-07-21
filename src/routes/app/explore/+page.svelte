<script lang="ts">
	import { goto } from '$app/navigation';
	import { STORES, CATEGORIES, DEALS, isServiceStore, type Store } from '$lib/data/mock';
	import Icon from '$lib/components/ui/Icon.svelte';
	import CategoryBadge from '$lib/components/CategoryBadge.svelte';
	import FiltrosAvanzados, { type Filtros } from '$lib/components/FiltrosAvanzados.svelte';

	let query = $state('');
	let filterCat = $state<string | null>(null);
	let filtrosOpen = $state(false);
	let filtros = $state<Filtros | null>(null);

	const tiendaConOfertas = new Set(DEALS.map((o) => o.storeId));

	const activeCount = $derived(
		filtros
			? (filtros.abiertoAhora ? 1 : 0) + (filtros.ratingMin > 0 ? 1 : 0) +
			  (filtros.precioMax !== null ? 1 : 0) + (filtros.distanciaMax < 10 ? 1 : 0) +
			  (filtros.tiempoMax < 60 ? 1 : 0) + (filtros.soloOfertas ? 1 : 0) +
			  (filtros.siguiendo ? 1 : 0)
			: 0
	);

	const filtered = $derived(
		STORES.filter((t) => {
			if (filterCat && t.category !== filterCat) return false;
			if (query) {
				const q = query.toLowerCase();
				if (!t.name.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) return false;
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

<div class="max-w-5xl mx-auto px-5 pt-5 pb-10">
	<h1 class="font-display text-3xl font-extrabold mb-1">Explorar</h1>
	<p class="text-sm mb-5" style="color:var(--c-text-secondary)">Descubre todas las tiendas de la plaza</p>

	<!-- Search bar + filter button -->
	<div class="flex gap-2 mb-4">
		<div class="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border"
			style="background:var(--c-bg-card);border-color:var(--c-border)">
			<Icon name="search" size={18} color="var(--c-text-muted)"/>
			<input
				bind:value={query}
				placeholder="Busca tiendas o categorías…"
				class="flex-1 text-sm bg-transparent outline-none"
				style="color:var(--c-text-primary)"
			/>
			{#if query}
				<button onclick={() => (query = '')} style="color:var(--c-text-muted)">
					<Icon name="close" size={16}/>
				</button>
			{/if}
		</div>
		<button
			onclick={() => (filtrosOpen = true)}
			class="flex items-center justify-center gap-1.5 px-3.5 rounded-2xl border font-semibold text-sm relative"
			style="background:{activeCount > 0 ? 'var(--c-brand)' : 'var(--c-bg-card)'};color:{activeCount > 0 ? '#fff' : 'var(--c-text-primary)'};border-color:{activeCount > 0 ? 'var(--c-brand)' : 'var(--c-border)'}"
		>
			<Icon name="filter" size={16} color={activeCount > 0 ? '#fff' : 'var(--c-text-primary)'}/>
			{#if activeCount > 0}
				<span>{activeCount}</span>
			{/if}
		</button>
	</div>

	<!-- Categories -->
	<div class="flex gap-2 pb-2 mb-5 overflow-x-auto no-scrollbar">
		<button
			onclick={() => (filterCat = null)}
			class="px-4 py-2 rounded-full text-[13px] font-semibold shrink-0 border border-[var(--c-border-soft)]"
			style="background:{!filterCat ? 'var(--c-text-primary)' : 'var(--c-bg-card)'};color:{!filterCat ? 'var(--c-bg-card)' : 'var(--c-text-primary)'}"
		>Todas</button>
		{#each Object.entries(CATEGORIES) as [key, cat]}
			<button
				onclick={() => (filterCat = filterCat === key ? null : key)}
				class="px-3.5 py-2 rounded-full text-[13px] font-semibold flex items-center gap-1.5 shrink-0 border border-[var(--c-border-soft)]"
				style="background:{filterCat === key ? cat.color : 'var(--c-bg-card)'};color:{filterCat === key ? '#fff' : 'var(--c-text-primary)'}"
			>
				<span>{cat.emoji}</span>{cat.label}
			</button>
		{/each}
	</div>

	<!-- Store grid -->
	{#if filtered.length === 0}
		<div class="text-center py-16">
			<div class="text-5xl mb-4">🔍</div>
			<h3 class="font-display font-bold text-lg mb-2">Sin resultados</h3>
			<p class="text-sm" style="color:var(--c-text-secondary)">Prueba con otras palabras o cambia la categoría</p>
		</div>
	{:else}
		<div class="grid gap-4" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">
			{#each filtered as t}
				<button
					onclick={() => goTienda(t)}
					class="text-left rounded-[18px] overflow-hidden border border-[var(--c-border-soft)] shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
					style="background:var(--c-bg-card)"
				>
					<!-- Banner -->
					<div class="relative flex items-center justify-center overflow-hidden" style="height:120px;background:{t.bannerGradient}">
						<div class="text-7xl drop-shadow-md">{t.emoji}</div>
						{#if t.following}
							<div class="absolute top-2.5 right-2.5">
								<span class="text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
									style="background:rgba(255,255,255,.95);color:var(--c-text-primary)">
									<Icon name="check" size={10} strokeWidth={3}/>Siguiendo
								</span>
							</div>
						{/if}
						<div class="absolute top-2.5 left-2.5 flex gap-1.5">
							<CategoryBadge catKey={t.category}/>
							{#if isServiceStore(t)}
								<span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
									style="background:rgba(255,255,255,.95);color:#2563EB">
									Servicio
								</span>
							{/if}
						</div>
					</div>

					<!-- Info -->
					<div class="p-3.5">
						<div class="flex items-center justify-between mb-1">
							<h3 class="font-display text-base font-bold">{t.name}</h3>
							<div class="flex items-center gap-1 text-xs font-semibold" style="color:var(--c-accent)">
								<Icon name="starFill" size={13}/>
								{t.rating}
							</div>
						</div>
						<p class="text-xs leading-relaxed mb-2.5 min-h-[36px]" style="color:var(--c-text-secondary)">{t.description}</p>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-1 text-[11px]" style="color:var(--c-text-muted)">
								<Icon name="user" size={11}/>
								{t.followers.toLocaleString()} siguiendo
							</div>
							{#if isServiceStore(t)}
								<span class="text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1"
									style="background:#EFF4FE;color:#2563EB">
									<Icon name="calendar" size={11} color="#2563EB"/>
									Agenda cita
								</span>
							{/if}
						</div>
						{#if t.status === 'closed'}
							<div class="mt-2 text-[11px] font-semibold" style="color:var(--c-error)">● Cerrado ahora</div>
						{/if}
					</div>
				</button>
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
