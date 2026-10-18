<script lang="ts">
	import { favoritos, EMOJIS_LISTA, type Lista } from '$lib/stores/favoritos.svelte';
	import { cart, toast } from '$lib/stores/app.svelte';
	import { fmtCOP } from '$lib/utils';
	import Icon from '$lib/components/ui/Icon.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';

	type Tab = 'productos' | 'listas';
	let tab = $state<Tab>('productos');

	// Lista modal
	let crearListaOpen = $state(false);
	let nuevoNombre = $state('');
	let nuevoEmoji = $state('🧺');

	function crearLista() {
		if (!nuevoNombre.trim()) return;
		favoritos.createLista({ nombre: nuevoNombre.trim(), emoji: nuevoEmoji });
		nuevoNombre = '';
		nuevoEmoji = '🧺';
		crearListaOpen = false;
	}

	function eliminarLista(id: string) {
		if (confirm('¿Eliminar esta lista?')) favoritos.deleteLista(id);
	}

	function addToCart(productoId: string, tiendaId: string, precio: number) {
		cart.add({ productId: productoId, storeId: tiendaId, price: precio });
		toast.show('✓ Agregado al carrito');
	}
</script>

<div class="mx-auto max-w-2xl px-4 pt-6 pb-28 md:pb-6">
	<!-- Header -->
	<div class="mb-6">
		<div
			class="mb-1 font-mono text-[11px] font-semibold tracking-[1.5px] uppercase"
			style="color:var(--c-brand)"
		>
			Tus artículos guardados
		</div>
		<h1 class="font-display text-[26px] font-extrabold tracking-[-0.4px]">Guardados</h1>
		<p class="mt-1 text-sm" style="color:var(--c-text-secondary)">
			{favoritos.ids.length} favorito{favoritos.ids.length !== 1 ? 's' : ''} · {favoritos.listas
				.length} lista{favoritos.listas.length !== 1 ? 's' : ''}
		</p>
	</div>

	<!-- Tabs -->
	<div class="mb-6 flex rounded-xl p-1" style="background:var(--c-bg-secondary)">
		{#each [['productos', 'Favoritos'], ['listas', 'Mis listas']] as [Tab, string][] as [id, label]}
			<button
				onclick={() => (tab = id)}
				class="flex-1 rounded-[10px] py-2.5 text-[13.5px] font-bold transition-all"
				style="background:{tab === id ? 'var(--c-bg-card)' : 'transparent'};
					color:{tab === id ? 'var(--c-text-primary)' : 'var(--c-text-muted)'};
					box-shadow:{tab === id ? 'var(--shadow-sm)' : 'none'}"
			>
				{label}
			</button>
		{/each}
	</div>

	<!-- ── FAVORITOS ── -->
	{#if tab === 'productos'}
		{#if favoritos.productos.length === 0}
			<div class="py-20 text-center" style="color:var(--c-text-muted)">
				<div class="mb-4 text-5xl">🤍</div>
				<h3 class="mb-2 font-display text-xl font-bold">Sin favoritos aún</h3>
				<p class="mx-auto max-w-[260px] text-sm leading-relaxed">
					Toca el corazón en cualquier producto para guardarlo acá.
				</p>
				<a
					href="/app/explore"
					class="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white"
					style="background:var(--c-brand)"
				>
					<Icon name="search" size={16} /> Explorar tiendas
				</a>
			</div>
		{:else}
			<div class="grid grid-cols-2 gap-3">
				{#each favoritos.productos as p}
					<div
						class="overflow-hidden rounded-[14px] border border-[var(--c-border-soft)]"
						style="background:var(--c-bg-card)"
					>
						<div
							class="relative flex items-center justify-center"
							style="height:100px;background:linear-gradient(135deg,#f97316,#ea580c)"
						>
							<div class="text-[50px]">{p.emoji}</div>
							<button
								onclick={() => favoritos.toggle(p.id)}
								class="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full"
								style="background:rgba(255,255,255,.92);color:#DC2626"
							>
								<Icon name="heartFill" size={12} />
							</button>
						</div>
						<div class="p-3">
							<h4 class="mb-1 font-display text-[13px] leading-tight font-bold">{p.name}</h4>
							<div class="flex items-center justify-between">
								<span class="font-mono text-[13.5px] font-bold">{fmtCOP(p.price)}</span>
								<button
									onclick={() => addToCart(p.id, p.storeId, p.price)}
									class="flex h-8 w-8 items-center justify-center rounded-[8px] text-white"
									style="background:var(--c-brand)"
								>
									<Icon name="plus" size={16} strokeWidth={2.5} />
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- ── LISTAS ── -->
	{:else}
		<div class="flex flex-col gap-3">
			<!-- Crear lista -->
			<button
				onclick={() => (crearListaOpen = true)}
				class="flex items-center gap-3 rounded-[14px] border-2 border-dashed p-4"
				style="border-color:var(--c-border);color:var(--c-text-muted)"
			>
				<div
					class="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
					style="background:var(--c-bg-secondary)"
				>
					+
				</div>
				<div class="text-left">
					<div class="text-[13.5px] font-bold" style="color:var(--c-text-primary)">
						Crear nueva lista
					</div>
					<div class="text-[12px]">Organiza tus productos favoritos</div>
				</div>
			</button>

			{#each favoritos.listas as lista}
				<div
					class="overflow-hidden rounded-[14px] border border-[var(--c-border-soft)]"
					style="background:var(--c-bg-card)"
				>
					<div class="flex items-center gap-3 p-4">
						<div
							class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl"
							style="background:var(--c-bg-secondary)"
						>
							{lista.emoji}
						</div>
						<div class="min-w-0 flex-1">
							<h4 class="font-display text-[14px] leading-snug font-bold">{lista.nombre}</h4>
							<div class="text-[12px]" style="color:var(--c-text-muted)">
								{lista.items.length} artículo{lista.items.length !== 1 ? 's' : ''}
								{#if lista.items.length > 0}
									· {fmtCOP(favoritos.totalLista(lista))} total
								{/if}
							</div>
						</div>
						<button
							onclick={() => eliminarLista(lista.id)}
							class="flex h-9 w-9 items-center justify-center rounded-xl"
							style="background:var(--c-bg-secondary);color:var(--c-text-muted)"
						>
							<Icon name="trash" size={15} />
						</button>
					</div>

					{#if lista.items.length > 0}
						<div class="flex flex-col gap-2 px-4 pb-4">
							{#each lista.items.slice(0, 3) as item}
								{@const p = favoritos.productos.find((x) => x.id === item.productoId)}
								{#if p}
									<div class="flex items-center gap-2.5 text-[12.5px]">
										<span class="shrink-0 text-base">{p.emoji}</span>
										<span class="flex-1 truncate">{p.name}</span>
										<span class="shrink-0 font-mono font-bold">{fmtCOP(p.price)}</span>
									</div>
								{/if}
							{/each}
							{#if lista.items.length > 3}
								<div class="text-[11.5px]" style="color:var(--c-text-muted)">
									+{lista.items.length - 3} más
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/each}

			{#if favoritos.listas.length === 0}
				<div class="py-16 text-center" style="color:var(--c-text-muted)">
					<div class="mb-4 text-5xl">📋</div>
					<h3 class="mb-2 font-display text-xl font-bold">Sin listas aún</h3>
					<p class="text-sm">Crea tu primera lista para organizar lo que necesitas.</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- ── CREAR LISTA MODAL ── -->
<Dialog.Root bind:open={crearListaOpen}>
	<Dialog.Content class="flex flex-col gap-4">
		<h3 class="font-display text-[18px] font-extrabold">Nueva lista</h3>

		<!-- Emoji picker -->
		<div>
			<div
				class="mb-2 text-[12px] font-bold tracking-[0.8px] uppercase"
				style="color:var(--c-text-muted)"
			>
				Emoji
			</div>
			<div class="flex flex-wrap gap-2">
				{#each EMOJIS_LISTA as em}
					<button
						onclick={() => (nuevoEmoji = em)}
						class="flex h-9 w-9 items-center justify-center rounded-xl border-2 text-xl transition-all"
						style="border-color:{nuevoEmoji === em
							? 'var(--c-brand)'
							: 'transparent'};background:{nuevoEmoji === em
							? 'var(--c-bg-secondary)'
							: 'var(--c-bg-secondary)'}"
					>
						{em}
					</button>
				{/each}
			</div>
		</div>

		<!-- Nombre -->
		<div>
			<div
				class="mb-2 text-[12px] font-bold tracking-[0.8px] uppercase"
				style="color:var(--c-text-muted)"
			>
				Nombre *
			</div>
			<Input
				bind:value={nuevoNombre}
				type="text"
				placeholder="Ej: Lista del mercado"
				class="h-11 w-full rounded-xl border px-3.5 text-[14px]"
				style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
			/>
		</div>

		<div class="mt-1 flex gap-2.5">
			<button
				onclick={() => (crearListaOpen = false)}
				class="h-11 flex-1 rounded-xl border text-[14px] font-bold"
				style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
			>
				Cancelar
			</button>
			<button
				onclick={crearLista}
				disabled={!nuevoNombre.trim()}
				class="h-11 flex-1 rounded-xl text-[14px] font-bold text-white disabled:opacity-40"
				style="background:var(--c-brand)"
			>
				Crear lista
			</button>
		</div>
	</Dialog.Content>
</Dialog.Root>
