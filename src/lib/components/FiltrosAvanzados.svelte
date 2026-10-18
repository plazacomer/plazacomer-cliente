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
		siguiendo: false
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
		(f.abiertoAhora ? 1 : 0) +
			(f.ratingMin > 0 ? 1 : 0) +
			(f.precioMax !== null ? 1 : 0) +
			(f.distanciaMax < 10 ? 1 : 0) +
			(f.tiempoMax < 60 ? 1 : 0) +
			(f.soloOfertas ? 1 : 0) +
			(f.siguiendo ? 1 : 0)
	);

	function apply() {
		onapply(f);
		onclose();
	}
</script>

<Dialog.Root
	{open}
	onOpenChange={(v) => {
		if (!v) onclose();
	}}
>
	<Dialog.Content
		showCloseButton={false}
		class="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 md:max-w-lg"
	>
		<!-- Header -->
		<div class="flex shrink-0 items-center justify-between px-5 pt-5 pb-3">
			<div>
				<h2 class="font-display text-lg font-extrabold">Filtros</h2>
				<p class="text-[12px]" style="color:var(--c-text-muted)">
					{activeCount > 0
						? `${activeCount} filtro${activeCount === 1 ? '' : 's'} activo${activeCount === 1 ? '' : 's'}`
						: 'Encuentra tu tienda perfecta'}
				</p>
			</div>
			<button
				onclick={onclose}
				class="flex h-9 w-9 items-center justify-center rounded-xl text-xl"
				style="background:var(--c-bg-secondary);color:var(--c-text-muted)">✕</button
			>
		</div>

		<div class="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-3">
			<!-- Disponibilidad -->
			<section>
				<div
					class="mb-2.5 text-[11px] font-bold tracking-wider uppercase"
					style="color:var(--c-text-muted)"
				>
					Disponibilidad
				</div>
				<div class="flex flex-col gap-2">
					<!-- toggle: abiertoAhora -->
					<div
						class="flex items-center gap-3 rounded-xl p-3"
						style="background:var(--c-bg-secondary)"
					>
						<div class="flex-1">
							<div class="text-[13px] font-semibold">Abierto ahora</div>
							<div class="text-[11.5px]" style="color:var(--c-text-muted)">
								Solo tiendas recibiendo pedidos
							</div>
						</div>
						<button
							role="switch"
							aria-label="Abierto ahora"
							aria-checked={f.abiertoAhora}
							onclick={() => upd('abiertoAhora', !f.abiertoAhora)}
							class="relative h-6 w-11 shrink-0 rounded-full transition-colors"
							style="background:{f.abiertoAhora ? 'var(--c-brand)' : 'var(--c-border)'}"
						>
							<div
								class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
								style="transform:translateX({f.abiertoAhora ? '22px' : '2px'})"
							></div>
						</button>
					</div>
					<!-- toggle: siguiendo -->
					<div
						class="flex items-center gap-3 rounded-xl p-3"
						style="background:var(--c-bg-secondary)"
					>
						<div class="flex-1">
							<div class="text-[13px] font-semibold">Solo tiendas que sigo</div>
						</div>
						<button
							role="switch"
							aria-label="Solo tiendas que sigo"
							aria-checked={f.siguiendo}
							onclick={() => upd('siguiendo', !f.siguiendo)}
							class="relative h-6 w-11 shrink-0 rounded-full transition-colors"
							style="background:{f.siguiendo ? 'var(--c-brand)' : 'var(--c-border)'}"
						>
							<div
								class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
								style="transform:translateX({f.siguiendo ? '22px' : '2px'})"
							></div>
						</button>
					</div>
				</div>
			</section>

			<!-- Rating mínimo -->
			<section>
				<div
					class="mb-2.5 text-[11px] font-bold tracking-wider uppercase"
					style="color:var(--c-text-muted)"
				>
					Calificación mínima
				</div>
				<div class="flex gap-1.5">
					{#each [0, 3, 3.5, 4, 4.5, 4.8] as r}
						<button
							onclick={() => upd('ratingMin', r)}
							class="flex-1 rounded-[10px] py-2.5 text-[11px] font-bold transition-colors"
							style="background:{f.ratingMin === r
								? 'var(--c-brand)'
								: 'var(--c-bg-secondary)'};color:{f.ratingMin === r
								? '#fff'
								: 'var(--c-text-primary)'}">{r === 0 ? 'Todas' : `${r}+⭐`}</button
						>
					{/each}
				</div>
			</section>

			<!-- Distancia -->
			<section>
				<div class="mb-2.5 flex items-center justify-between">
					<div
						class="text-[11px] font-bold tracking-wider uppercase"
						style="color:var(--c-text-muted)"
					>
						Distancia máxima
					</div>
					<span class="text-[12px] font-semibold" style="color:var(--c-brand)"
						>Hasta {f.distanciaMax} km</span
					>
				</div>
				<input
					type="range"
					min="1"
					max="20"
					value={f.distanciaMax}
					oninput={(e) => upd('distanciaMax', +(e.target as HTMLInputElement).value)}
					class="w-full"
					style="accent-color:var(--c-brand)"
				/>
				<div class="mt-1 flex justify-between text-[11px]" style="color:var(--c-text-muted)">
					<span>1 km</span><span>10 km</span><span>20+ km</span>
				</div>
			</section>

			<!-- Tiempo entrega -->
			<section>
				<div class="mb-2.5 flex items-center justify-between">
					<div
						class="text-[11px] font-bold tracking-wider uppercase"
						style="color:var(--c-text-muted)"
					>
						Tiempo de entrega
					</div>
					<span class="text-[12px] font-semibold" style="color:var(--c-brand)">
						{f.tiempoMax >= 60 ? 'Sin límite' : `≤ ${f.tiempoMax} min`}
					</span>
				</div>
				<input
					type="range"
					min="15"
					max="60"
					step="5"
					value={f.tiempoMax}
					oninput={(e) => upd('tiempoMax', +(e.target as HTMLInputElement).value)}
					class="w-full"
					style="accent-color:var(--c-brand)"
				/>
				<div class="mt-1 flex justify-between text-[11px]" style="color:var(--c-text-muted)">
					<span>15 min</span><span>30 min</span><span>Sin límite</span>
				</div>
			</section>

			<!-- Precio máximo -->
			<section>
				<div
					class="mb-2.5 text-[11px] font-bold tracking-wider uppercase"
					style="color:var(--c-text-muted)"
				>
					Precio máximo por producto
				</div>
				<div class="grid grid-cols-4 gap-1.5">
					{#each [null, 15000, 30000, 50000] as p}
						<button
							onclick={() => upd('precioMax', p)}
							class="rounded-[10px] py-2.5 text-[11.5px] font-bold transition-colors"
							style="background:{f.precioMax === p
								? 'var(--c-brand)'
								: 'var(--c-bg-secondary)'};color:{f.precioMax === p
								? '#fff'
								: 'var(--c-text-primary)'}"
							>{p === null ? 'Todos' : `≤ $${(p / 1000).toFixed(0)}k`}</button
						>
					{/each}
				</div>
			</section>

			<!-- Ofertas -->
			<section>
				<div
					class="mb-2.5 text-[11px] font-bold tracking-wider uppercase"
					style="color:var(--c-text-muted)"
				>
					Promociones
				</div>
				<div
					class="flex items-center gap-3 rounded-xl p-3"
					style="background:var(--c-bg-secondary)"
				>
					<div class="flex-1 text-[13px] font-semibold">Solo tiendas con ofertas activas</div>
					<button
						role="switch"
						aria-label="Solo tiendas con ofertas activas"
						aria-checked={f.soloOfertas}
						onclick={() => upd('soloOfertas', !f.soloOfertas)}
						class="relative h-6 w-11 shrink-0 rounded-full transition-colors"
						style="background:{f.soloOfertas ? 'var(--c-brand)' : 'var(--c-border)'}"
					>
						<div
							class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
							style="transform:translateX({f.soloOfertas ? '22px' : '2px'})"
						></div>
					</button>
				</div>
			</section>
		</div>

		<!-- Footer -->
		<div class="flex shrink-0 gap-3 border-t border-[var(--c-border-soft)] px-5 py-4">
			<button
				onclick={() => {
					f = { ...DEFAULT };
				}}
				class="rounded-xl border border-[var(--c-border-soft)] px-5 py-2.5 text-sm font-semibold"
				style="color:var(--c-text-secondary)"
			>
				Limpiar
			</button>
			<button
				onclick={apply}
				class="flex-1 rounded-xl py-2.5 text-sm font-bold text-white"
				style="background:var(--c-brand)"
			>
				Aplicar{activeCount > 0 ? ` (${activeCount})` : ''}
			</button>
		</div>
	</Dialog.Content>
</Dialog.Root>
