<script lang="ts">
	import { vendedor } from '$lib/stores/vendedor.svelte';
	import { fmtCOP } from '$lib/utils';
	import Icon from '$lib/components/ui/Icon.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';

	let modalOpen = $state(false);

	// Form
	let productoId = $state('');
	let descuento = $state('');
	let tipo = $state<'porcentaje' | 'fijo'>('porcentaje');
	let etiqueta = $state('');
	let hasta = $state('');

	function abrirModal() {
		productoId = '';
		descuento = '';
		tipo = 'porcentaje';
		etiqueta = '';
		hasta = '';
		modalOpen = true;
	}

	function guardar() {
		const prod = vendedor.catalogo.find((p) => p.id === productoId);
		if (!prod || !descuento) return;
		const desc = parseFloat(descuento);
		const precioOferta =
			tipo === 'porcentaje' ? Math.round(prod.price * (1 - desc / 100)) : prod.price - desc;
		vendedor.addOferta({
			tiendaId: prod.storeId,
			productoId,
			precioOriginal: prod.price,
			precioOferta,
			etiqueta: etiqueta || (tipo === 'porcentaje' ? `-${desc}%` : `-${fmtCOP(desc)}`),
			hasta: hasta || '31 dic. 2026',
			activa: true
		});
		modalOpen = false;
	}

	// precio con descuento en tiempo real para preview
	const precioPreview = $derived.by(() => {
		const prod = vendedor.catalogo.find((p) => p.id === productoId);
		if (!prod || !descuento) return null;
		const d = parseFloat(descuento);
		return tipo === 'porcentaje' ? Math.round(prod.price * (1 - d / 100)) : prod.price - d;
	});
</script>

<div class="mx-auto max-w-2xl px-4 pt-6 pb-10">
	<div class="mb-1 flex items-center justify-between">
		<h1 class="font-display text-[24px] font-extrabold">Ofertas</h1>
		<button
			onclick={abrirModal}
			class="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white"
			style="background:var(--c-brand)"
		>
			<Icon name="plus" size={15} strokeWidth={2.5} />
			Nueva oferta
		</button>
	</div>
	<p class="mb-6 text-sm" style="color:var(--c-text-secondary)">
		{vendedor.ofertas.length} oferta{vendedor.ofertas.length !== 1 ? 's' : ''} creada{vendedor
			.ofertas.length !== 1
			? 's'
			: ''}
	</p>

	{#if vendedor.ofertas.length === 0}
		<div class="rounded-2xl border border-dashed border-[var(--c-border)] py-20 text-center">
			<div class="mb-4 text-5xl">🏷️</div>
			<h3 class="mb-2 font-display text-lg font-bold">Sin ofertas activas</h3>
			<p class="mb-5 text-sm" style="color:var(--c-text-muted)">
				Crea tu primera oferta para atraer más clientes.
			</p>
			<button
				onclick={abrirModal}
				class="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white"
				style="background:var(--c-brand)"
			>
				<Icon name="plus" size={15} />
				Crear oferta
			</button>
		</div>
	{:else}
		<div class="flex flex-col gap-3">
			{#each vendedor.ofertas as oferta (oferta.id)}
				{@const prod = vendedor.catalogo.find((p) => p.id === oferta.productoId)}
				<div
					class="overflow-hidden rounded-2xl border border-[var(--c-border-soft)]"
					style="background:var(--c-bg-card);opacity:{oferta.activa ? 1 : 0.55}"
				>
					<div class="flex items-center gap-3.5 p-4">
						<div
							class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
							style="background:var(--c-bg-secondary)"
						>
							{prod?.emoji ?? '🏷️'}
						</div>
						<div class="min-w-0 flex-1">
							<div class="mb-0.5 truncate font-display text-[14px] font-bold">
								{prod?.name ?? 'Producto'}
							</div>
							<div class="flex flex-wrap items-center gap-2">
								<span class="font-mono text-[13px] font-bold" style="color:var(--c-error)"
									>{fmtCOP(oferta.precioOferta)}</span
								>
								<span class="text-[12px] line-through" style="color:var(--c-text-muted)"
									>{fmtCOP(oferta.precioOriginal)}</span
								>
								<span
									class="rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
									style="background:var(--c-error)">{oferta.etiqueta}</span
								>
							</div>
							<div class="mt-1 text-[11px]" style="color:var(--c-text-muted)">
								Hasta: {oferta.hasta}
							</div>
						</div>
						<div class="flex shrink-0 flex-col items-center gap-2">
							<!-- Toggle activa -->
							<button
								onclick={() => vendedor.toggleOfertaActiva(oferta.id)}
								class="relative h-6 w-10 rounded-full transition-colors"
								style="background:{oferta.activa ? 'var(--c-brand)' : 'var(--c-border)'}"
							>
								<div
									class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
									style="left:{oferta.activa ? '18px' : '2px'}"
								></div>
							</button>
							<button
								onclick={() => {
									if (confirm('¿Eliminar esta oferta?')) vendedor.removeOferta(oferta.id);
								}}
								class="flex h-9 w-10 items-center justify-center rounded-xl"
								style="background:rgba(220,38,38,.06);color:var(--c-error)"
							>
								<Icon name="trash" size={14} />
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Modal nueva oferta -->
<Dialog.Root bind:open={modalOpen}>
	<Dialog.Content showCloseButton={false} class="flex flex-col gap-4">
		<div class="flex items-center justify-between">
			<h3 class="font-display text-[18px] font-extrabold">Nueva oferta</h3>
			<button
				onclick={() => (modalOpen = false)}
				class="flex h-8 w-8 items-center justify-center rounded-full"
				style="background:var(--c-bg-secondary);color:var(--c-text-muted)"
			>
				<Icon name="close" size={15} />
			</button>
		</div>

		<!-- Producto -->
		<div>
			<div
				class="mb-1.5 text-[11px] font-bold tracking-widest uppercase"
				style="color:var(--c-text-muted)"
			>
				Producto *
			</div>
			<select
				bind:value={productoId}
				class="h-11 w-full rounded-xl border px-3.5 text-[14px] outline-none"
				style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
			>
				<option value="">Selecciona un producto</option>
				{#each vendedor.catalogo as p (p.id)}
					<option value={p.id}>{p.emoji} {p.name} — {fmtCOP(p.price)}</option>
				{/each}
			</select>
		</div>

		<!-- Tipo de descuento -->
		<div>
			<div
				class="mb-1.5 text-[11px] font-bold tracking-widest uppercase"
				style="color:var(--c-text-muted)"
			>
				Tipo de descuento
			</div>
			<div class="flex gap-2">
				{#each [['porcentaje', '% Porcentaje'], ['fijo', '$ Monto fijo']] as ['porcentaje' | 'fijo', string][] as [val, lbl] (val)}
					<button
						onclick={() => (tipo = val)}
						class="flex-1 rounded-xl border py-2.5 text-[13px] font-bold transition-all"
						style="background:{tipo === val ? 'var(--c-brand)' : 'var(--c-bg-secondary)'};
								color:{tipo === val ? '#fff' : 'var(--c-text-primary)'};
								border-color:{tipo === val ? 'var(--c-brand)' : 'var(--c-border)'}"
					>
						{lbl}
					</button>
				{/each}
			</div>
		</div>

		<!-- Descuento -->
		<div>
			<div
				class="mb-1.5 text-[11px] font-bold tracking-widest uppercase"
				style="color:var(--c-text-muted)"
			>
				{tipo === 'porcentaje' ? 'Porcentaje (%)' : 'Monto a descontar ($)'}
			</div>
			<Input
				bind:value={descuento}
				type="number"
				placeholder={tipo === 'porcentaje' ? '20' : '5000'}
				class="h-11 w-full rounded-xl border px-3.5 text-[14px]"
				style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
			/>
		</div>

		<!-- Preview precio -->
		{#if precioPreview !== null && productoId}
			{@const prod = vendedor.catalogo.find((p) => p.id === productoId)}
			<div
				class="flex items-center justify-between rounded-xl px-4 py-3"
				style="background:rgba(220,38,38,.06)"
			>
				<span class="text-[13px] font-semibold" style="color:var(--c-text-secondary)"
					>Precio con oferta</span
				>
				<div class="flex items-center gap-2">
					<span class="text-[12px] line-through" style="color:var(--c-text-muted)"
						>{fmtCOP(prod?.price ?? 0)}</span
					>
					<span class="font-mono text-[16px] font-extrabold" style="color:var(--c-error)"
						>{fmtCOP(precioPreview)}</span
					>
				</div>
			</div>
		{/if}

		<!-- Etiqueta + Hasta -->
		<div class="flex gap-3">
			<div class="flex-1">
				<div
					class="mb-1.5 text-[11px] font-bold tracking-widest uppercase"
					style="color:var(--c-text-muted)"
				>
					Etiqueta
				</div>
				<Input
					bind:value={etiqueta}
					type="text"
					placeholder="Ej: -20%"
					class="h-11 w-full rounded-xl border px-3.5 text-[14px]"
					style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
				/>
			</div>
			<div class="flex-1">
				<div
					class="mb-1.5 text-[11px] font-bold tracking-widest uppercase"
					style="color:var(--c-text-muted)"
				>
					Válida hasta
				</div>
				<Input
					bind:value={hasta}
					type="text"
					placeholder="31 dic. 2026"
					class="h-11 w-full rounded-xl border px-3.5 text-[14px]"
					style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
				/>
			</div>
		</div>

		<div class="mt-1 flex gap-2.5">
			<button
				onclick={() => (modalOpen = false)}
				class="h-11 flex-1 rounded-xl border text-[14px] font-bold"
				style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
			>
				Cancelar
			</button>
			<button
				onclick={guardar}
				disabled={!productoId || !descuento}
				class="h-11 flex-1 rounded-xl text-[14px] font-bold text-white disabled:opacity-40"
				style="background:var(--c-brand)"
			>
				Crear oferta
			</button>
		</div>
	</Dialog.Content>
</Dialog.Root>
