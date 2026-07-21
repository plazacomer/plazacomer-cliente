<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';

	export type Filtros = {
		abiertoAhora: boolean;
		ratingMin: number;
		precioMax: number | null;
		distanciaMax: number;
		tiempoMax: number;
		soloOfertas: boolean;
		siguiendo: boolean;
	};

	const DEFAULT: Filtros = {
		abiertoAhora: false,
		ratingMin: 0,
		precioMax: null,
		distanciaMax: 10,
		tiempoMax: 60,
		soloOfertas: false,
		siguiendo: false,
	};

	type Props = {
		open: boolean;
		value?: Filtros;
		onapply: (filtros: Filtros) => void;
		onclose: () => void;
	};
	let { open, value, onapply, onclose }: Props = $props();

	let f = $state<Filtros>({ ...DEFAULT, ...value });

	$effect(() => {
		if (open) f = { ...DEFAULT, ...value };
	});

	function upd<K extends keyof Filtros>(k: K, v: Filtros[K]) {
		f = { ...f, [k]: v };
	}

	const activeCount = $derived(
		(f.abiertoAhora ? 1 : 0) + (f.ratingMin > 0 ? 1 : 0) +
		(f.precioMax !== null ? 1 : 0) + (f.distanciaMax < 10 ? 1 : 0) +
		(f.tiempoMax < 60 ? 1 : 0) + (f.soloOfertas ? 1 : 0) + (f.siguiendo ? 1 : 0)
	);

	function apply() { onapply(f); onclose(); }
</script>

<Dialog.Root {open} onOpenChange={(v) => { if (!v) onclose(); }}>
	<Dialog.Content showCloseButton={false} class="relative md:max-w-lg p-0 gap-0 flex flex-col max-h-[90vh] overflow-hidden">
		<!-- Header -->
		<div class="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
			<div>
				<h2 class="font-display text-lg font-extrabold">Filtros</h2>
				<p class="text-[12px]" style="color:var(--c-text-muted)">
					{activeCount > 0 ? `${activeCount} filtro${activeCount === 1 ? '' : 's'} activo${activeCount === 1 ? '' : 's'}` : 'Encuentra tu tienda perfecta'}
				</p>
			</div>
			<button onclick={onclose} class="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style="background:var(--c-bg-secondary);color:var(--c-text-muted)">✕</button>
		</div>

		<div class="flex-1 overflow-y-auto px-5 pb-3 flex flex-col gap-5">

			<!-- Disponibilidad -->
			<section>
				<div class="text-[11px] font-bold uppercase tracking-wider mb-2.5" style="color:var(--c-text-muted)">Disponibilidad</div>
				<div class="flex flex-col gap-2">
					<!-- toggle: abiertoAhora -->
					<div class="flex items-center gap-3 p-3 rounded-xl" style="background:var(--c-bg-secondary)">
						<div class="flex-1">
							<div class="text-[13px] font-semibold">Abierto ahora</div>
							<div class="text-[11.5px]" style="color:var(--c-text-muted)">Solo tiendas recibiendo pedidos</div>
						</div>
						<button
							role="switch"
							aria-label="Abierto ahora"
							aria-checked={f.abiertoAhora}
							onclick={() => upd('abiertoAhora', !f.abiertoAhora)}
							class="w-11 h-6 rounded-full transition-colors relative shrink-0"
							style="background:{f.abiertoAhora ? 'var(--c-brand)' : 'var(--c-border)'}"
						>
							<div class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
								style="transform:translateX({f.abiertoAhora ? '22px' : '2px'})"></div>
						</button>
					</div>
					<!-- toggle: siguiendo -->
					<div class="flex items-center gap-3 p-3 rounded-xl" style="background:var(--c-bg-secondary)">
						<div class="flex-1">
							<div class="text-[13px] font-semibold">Solo tiendas que sigo</div>
						</div>
						<button
							role="switch"
							aria-label="Solo tiendas que sigo"
							aria-checked={f.siguiendo}
							onclick={() => upd('siguiendo', !f.siguiendo)}
							class="w-11 h-6 rounded-full transition-colors relative shrink-0"
							style="background:{f.siguiendo ? 'var(--c-brand)' : 'var(--c-border)'}"
						>
							<div class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
								style="transform:translateX({f.siguiendo ? '22px' : '2px'})"></div>
						</button>
					</div>
				</div>
			</section>

			<!-- Rating mínimo -->
			<section>
				<div class="text-[11px] font-bold uppercase tracking-wider mb-2.5" style="color:var(--c-text-muted)">Calificación mínima</div>
				<div class="flex gap-1.5">
					{#each [0, 3, 3.5, 4, 4.5, 4.8] as r}
						<button
							onclick={() => upd('ratingMin', r)}
							class="flex-1 py-2.5 rounded-[10px] text-[11px] font-bold transition-colors"
							style="background:{f.ratingMin === r ? 'var(--c-brand)' : 'var(--c-bg-secondary)'};color:{f.ratingMin === r ? '#fff' : 'var(--c-text-primary)'}"
						>{r === 0 ? 'Todas' : `${r}+⭐`}</button>
					{/each}
				</div>
			</section>

			<!-- Distancia -->
			<section>
				<div class="flex justify-between items-center mb-2.5">
					<div class="text-[11px] font-bold uppercase tracking-wider" style="color:var(--c-text-muted)">Distancia máxima</div>
					<span class="text-[12px] font-semibold" style="color:var(--c-brand)">Hasta {f.distanciaMax} km</span>
				</div>
				<input type="range" min="1" max="20" value={f.distanciaMax}
					oninput={(e) => upd('distanciaMax', +(e.target as HTMLInputElement).value)}
					class="w-full" style="accent-color:var(--c-brand)"/>
				<div class="flex justify-between text-[11px] mt-1" style="color:var(--c-text-muted)">
					<span>1 km</span><span>10 km</span><span>20+ km</span>
				</div>
			</section>

			<!-- Tiempo entrega -->
			<section>
				<div class="flex justify-between items-center mb-2.5">
					<div class="text-[11px] font-bold uppercase tracking-wider" style="color:var(--c-text-muted)">Tiempo de entrega</div>
					<span class="text-[12px] font-semibold" style="color:var(--c-brand)">
						{f.tiempoMax >= 60 ? 'Sin límite' : `≤ ${f.tiempoMax} min`}
					</span>
				</div>
				<input type="range" min="15" max="60" step="5" value={f.tiempoMax}
					oninput={(e) => upd('tiempoMax', +(e.target as HTMLInputElement).value)}
					class="w-full" style="accent-color:var(--c-brand)"/>
				<div class="flex justify-between text-[11px] mt-1" style="color:var(--c-text-muted)">
					<span>15 min</span><span>30 min</span><span>Sin límite</span>
				</div>
			</section>

			<!-- Precio máximo -->
			<section>
				<div class="text-[11px] font-bold uppercase tracking-wider mb-2.5" style="color:var(--c-text-muted)">Precio máximo por producto</div>
				<div class="grid grid-cols-4 gap-1.5">
					{#each [null, 15000, 30000, 50000] as p}
						<button
							onclick={() => upd('precioMax', p)}
							class="py-2.5 rounded-[10px] text-[11.5px] font-bold transition-colors"
							style="background:{f.precioMax === p ? 'var(--c-brand)' : 'var(--c-bg-secondary)'};color:{f.precioMax === p ? '#fff' : 'var(--c-text-primary)'}"
						>{p === null ? 'Todos' : `≤ $${(p/1000).toFixed(0)}k`}</button>
					{/each}
				</div>
			</section>

			<!-- Ofertas -->
			<section>
				<div class="text-[11px] font-bold uppercase tracking-wider mb-2.5" style="color:var(--c-text-muted)">Promociones</div>
				<div class="flex items-center gap-3 p-3 rounded-xl" style="background:var(--c-bg-secondary)">
					<div class="flex-1 text-[13px] font-semibold">Solo tiendas con ofertas activas</div>
					<button
						role="switch"
						aria-label="Solo tiendas con ofertas activas"
						aria-checked={f.soloOfertas}
						onclick={() => upd('soloOfertas', !f.soloOfertas)}
						class="w-11 h-6 rounded-full transition-colors relative shrink-0"
						style="background:{f.soloOfertas ? 'var(--c-brand)' : 'var(--c-border)'}"
					>
						<div class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
							style="transform:translateX({f.soloOfertas ? '22px' : '2px'})"></div>
					</button>
				</div>
			</section>
		</div>

		<!-- Footer -->
		<div class="px-5 py-4 border-t border-[var(--c-border-soft)] flex gap-3 shrink-0">
			<button
				onclick={() => { f = { ...DEFAULT }; }}
				class="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[var(--c-border-soft)]"
				style="color:var(--c-text-secondary)">
				Limpiar
			</button>
			<button
				onclick={apply}
				class="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
				style="background:var(--c-brand)">
				Aplicar{activeCount > 0 ? ` (${activeCount})` : ''}
			</button>
		</div>
	</Dialog.Content>
</Dialog.Root>
