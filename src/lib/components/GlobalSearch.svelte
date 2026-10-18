<script lang="ts">
	import { goto } from '$app/navigation';
	import { STORES, PRODUCTS, CATEGORIES, getStore, type Store, type Product } from '$lib/data/mock';
	import { fmtCOP } from '$lib/utils';
	import Icon from './ui/Icon.svelte';
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import * as Dialog from '$lib/components/ui/dialog';

	type Props = { open: boolean; onclose: () => void };
	let { open, onclose }: Props = $props();

	let query = $state('');
	let historial = $state<string[]>([]);
	let inputEl = $state<HTMLInputElement | null>(null);

	$effect(() => {
		if (open) {
			try {
				historial = JSON.parse(localStorage.getItem('pc_search_hist') ?? '[]');
			} catch {
				historial = [];
			}
			query = '';
			setTimeout(() => inputEl?.focus(), 60);
		}
	});

	const q = $derived(query.trim().toLowerCase());

	const tiendasMatch = $derived(
		q
			? STORES.filter(
					(t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
				).slice(0, 5)
			: []
	);

	const productosMatch = $derived(
		q
			? PRODUCTS.filter(
					(p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
				).slice(0, 8)
			: []
	);

	const categoriasMatch = $derived(
		q ? Object.entries(CATEGORIES).filter(([, c]) => c.label.toLowerCase().includes(q)) : []
	);

	const hasResults = $derived(
		tiendasMatch.length + productosMatch.length + categoriasMatch.length > 0
	);

	function recordSearch(term: string) {
		const next = [term, ...historial.filter((h) => h !== term)].slice(0, 6);
		historial = next;
		try {
			localStorage.setItem('pc_search_hist', JSON.stringify(next));
		} catch {}
	}

	function selectTienda(t: Store) {
		recordSearch(t.name);
		goto(`/app/store/${t.id}`);
		onclose();
	}

	function selectProducto(p: Product) {
		recordSearch(p.name);
		goto(`/app/store/${p.storeId}`);
		onclose();
	}

	const TRENDING = [
		'🍔 Hamburguesas',
		'☕ Café',
		'🥑 Aguacate',
		'👕 Sudaderas',
		'💄 Labial',
		'Cerca de mí'
	];
</script>

<Dialog.Root
	{open}
	onOpenChange={(v) => {
		if (!v) onclose();
	}}
>
	<Dialog.Portal>
		<Dialog.Overlay />
		<DialogPrimitive.Content
			class="fixed inset-0 z-modal flex items-start justify-center outline-none"
		>
			<div
				class="search-panel flex w-full flex-col overflow-hidden lg:mt-16 lg:max-w-2xl lg:rounded-2xl"
				style="background:var(--c-bg-card)"
			>
				<!-- Search bar header -->
				<div class="shrink-0 border-b border-[var(--c-border-soft)] p-4">
					<div
						class="flex items-center gap-3 rounded-xl border-2 px-4 py-3"
						style="background:var(--c-bg-secondary);border-color:var(--c-brand)"
					>
						<Icon name="search" size={20} color="var(--c-brand)" />
						<input
							bind:this={inputEl}
							bind:value={query}
							placeholder="Busca tiendas, productos o categorías"
							class="flex-1 bg-transparent text-[15px] outline-none"
							style="color:var(--c-text-primary)"
						/>
						{#if query}
							<button
								onclick={() => (query = '')}
								style="color:var(--c-text-muted);font-size:18px;cursor:pointer;line-height:1"
								>✕</button
							>
						{:else}
							<button
								onclick={onclose}
								class="shrink-0 text-sm font-semibold"
								style="color:var(--c-text-muted)">Cerrar</button
							>
						{/if}
					</div>
				</div>

				<!-- Scrollable results -->
				<div class="flex-1 overflow-y-auto p-4">
					{#if !q}
						<!-- Search history -->
						{#if historial.length > 0}
							<div class="mb-5">
								<div class="mb-2 flex items-center justify-between">
									<span
										class="text-[11px] font-bold tracking-wider uppercase"
										style="color:var(--c-text-muted)">Búsquedas recientes</span
									>
									<button
										onclick={() => {
											historial = [];
											localStorage.removeItem('pc_search_hist');
										}}
										class="text-[11px] font-semibold"
										style="color:var(--c-brand)">Limpiar</button
									>
								</div>
								<div class="flex flex-col gap-0.5">
									{#each historial as h}
										<button
											onclick={() => (query = h)}
											class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:opacity-80"
											style="color:var(--c-text-primary)"
										>
											<span style="color:var(--c-text-muted)">↑</span>
											{h}
										</button>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Trending -->
						<div class="mb-5">
							<div
								class="mb-2 text-[11px] font-bold tracking-wider uppercase"
								style="color:var(--c-text-muted)"
							>
								Tendencias hoy
							</div>
							<div class="flex flex-wrap gap-1.5">
								{#each TRENDING as t}
									<button
										onclick={() => (query = t.replace(/^.{2}\s/, ''))}
										class="rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold"
										style="background:var(--c-bg-secondary);color:var(--c-text-primary)"
									>
										{t}
									</button>
								{/each}
							</div>
						</div>

						<!-- Category grid -->
						<div>
							<div
								class="mb-2 text-[11px] font-bold tracking-wider uppercase"
								style="color:var(--c-text-muted)"
							>
								Categorías
							</div>
							<div
								class="grid gap-2"
								style="grid-template-columns:repeat(auto-fill,minmax(100px,1fr))"
							>
								{#each Object.entries(CATEGORIES) as [, c]}
									<button
										onclick={() => (query = c.label)}
										class="flex flex-col items-center gap-1.5 rounded-xl border border-[var(--c-border-soft)] p-3"
										style="background:var(--c-bg-card)"
									>
										<span style="font-size:26px">{c.emoji}</span>
										<span class="text-[12px] font-semibold">{c.label}</span>
									</button>
								{/each}
							</div>
						</div>
					{:else if !hasResults}
						<div class="py-12 text-center" style="color:var(--c-text-muted)">
							<div style="font-size:48px;margin-bottom:10px">🔍</div>
							<div class="text-sm font-semibold">Sin resultados para "{query}"</div>
							<div class="mt-1 text-xs">Prueba con otras palabras o explora por categoría.</div>
						</div>
					{:else}
						<!-- Tiendas -->
						{#if tiendasMatch.length > 0}
							<div class="mb-5">
								<div
									class="mb-2 text-[11px] font-bold tracking-wider uppercase"
									style="color:var(--c-text-muted)"
								>
									Tiendas
								</div>
								<div class="flex flex-col gap-1.5">
									{#each tiendasMatch as t}
										<button
											onclick={() => selectTienda(t)}
											class="flex w-full items-center gap-3 rounded-xl border border-[var(--c-border-soft)] p-2.5 text-left"
											style="background:var(--c-bg-card)"
										>
											<div
												class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-lg"
												style="background:{t.bannerGradient}"
											>
												{t.emoji}
											</div>
											<div class="min-w-0 flex-1">
												<div class="text-[13.5px] leading-tight font-bold">{t.name}</div>
												<div class="truncate text-[11.5px]" style="color:var(--c-text-muted)">
													⭐ {t.rating} · {CATEGORIES[t.category]?.label ?? ''}
												</div>
											</div>
											<Icon name="arrowRight" size={14} color="var(--c-text-muted)" />
										</button>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Productos -->
						{#if productosMatch.length > 0}
							<div class="mb-5">
								<div
									class="mb-2 text-[11px] font-bold tracking-wider uppercase"
									style="color:var(--c-text-muted)"
								>
									Productos
								</div>
								<div class="flex flex-col gap-1.5">
									{#each productosMatch as p}
										{@const t = getStore(p.storeId)}
										<button
											onclick={() => selectProducto(p)}
											class="flex w-full items-center gap-3 rounded-xl border border-[var(--c-border-soft)] p-2.5 text-left"
											style="background:var(--c-bg-card)"
										>
											<div
												class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-lg"
												style="background:var(--c-bg-secondary)"
											>
												{p.emoji}
											</div>
											<div class="min-w-0 flex-1">
												<div class="text-[13.5px] leading-tight font-semibold">{p.name}</div>
												<div class="text-[11.5px]" style="color:var(--c-text-muted)">
													{t.name} · {fmtCOP(p.price)}
												</div>
											</div>
											<Icon name="arrowRight" size={14} color="var(--c-text-muted)" />
										</button>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Categorías -->
						{#if categoriasMatch.length > 0}
							<div>
								<div
									class="mb-2 text-[11px] font-bold tracking-wider uppercase"
									style="color:var(--c-text-muted)"
								>
									Categorías
								</div>
								<div class="flex flex-wrap gap-1.5">
									{#each categoriasMatch as [, c]}
										<button
											onclick={() => {
												recordSearch(c.label);
												onclose();
											}}
											class="rounded-full px-3.5 py-2 text-[12.5px] font-semibold"
											style="background:{c.color};color:#fff"
										>
											{c.emoji}
											{c.label}
										</button>
									{/each}
								</div>
							</div>
						{/if}
					{/if}
				</div>
			</div>
		</DialogPrimitive.Content>
	</Dialog.Portal>
</Dialog.Root>

<style>
	.search-panel {
		height: 100dvh;
		max-height: 100dvh;
	}
	@media (min-width: 1024px) {
		.search-panel {
			height: auto;
			max-height: 82dvh;
		}
	}
</style>
