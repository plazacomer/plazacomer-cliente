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
		cart.add({ productoId, tiendaId, precio });
		toast.show('✓ Agregado al carrito');
	}
</script>

<div class="max-w-2xl mx-auto px-4 pt-6 pb-28 md:pb-6">

	<!-- Header -->
	<div class="mb-6">
		<div class="font-mono text-[11px] font-semibold uppercase tracking-[1.5px] mb-1" style="color:var(--c-brand)">Tus artículos guardados</div>
		<h1 class="font-display text-[26px] font-extrabold tracking-[-0.4px]">Guardados</h1>
		<p class="text-sm mt-1" style="color:var(--c-text-secondary)">
			{favoritos.ids.length} favorito{favoritos.ids.length !== 1 ? 's' : ''} · {favoritos.listas.length} lista{favoritos.listas.length !== 1 ? 's' : ''}
		</p>
	</div>

	<!-- Tabs -->
	<div class="flex p-1 rounded-xl mb-6" style="background:var(--c-bg-secondary)">
		{#each ([['productos','Favoritos'], ['listas','Mis listas']] as [Tab, string][]) as [id, label]}
			<button onclick={() => tab = id}
				class="flex-1 py-2.5 rounded-[10px] text-[13.5px] font-bold transition-all"
				style="background:{tab === id ? 'var(--c-bg-card)' : 'transparent'};
					color:{tab === id ? 'var(--c-text-primary)' : 'var(--c-text-muted)'};
					box-shadow:{tab === id ? 'var(--shadow-sm)' : 'none'}">
				{label}
			</button>
		{/each}
	</div>

	<!-- ── FAVORITOS ── -->
	{#if tab === 'productos'}
		{#if favoritos.productos.length === 0}
			<div class="text-center py-20" style="color:var(--c-text-muted)">
				<div class="text-5xl mb-4">🤍</div>
				<h3 class="font-display font-bold text-xl mb-2">Sin favoritos aún</h3>
				<p class="text-sm leading-relaxed max-w-[260px] mx-auto">
					Toca el corazón en cualquier producto para guardarlo acá.
				</p>
				<a href="/app/explore"
					class="inline-flex mt-5 items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white"
					style="background:var(--c-brand)">
					<Icon name="search" size={16}/> Explorar tiendas
				</a>
			</div>
		{:else}
			<div class="grid grid-cols-2 gap-3">
				{#each favoritos.productos as p}
					<div class="rounded-[14px] border border-[var(--c-border-soft)] overflow-hidden"
						style="background:var(--c-bg-card)">
						<div class="relative flex items-center justify-center"
							style="height:100px;background:linear-gradient(135deg,#f97316,#ea580c)">
							<div class="text-[50px]">{p.emoji}</div>
							<button onclick={() => favoritos.toggle(p.id)}
								class="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
								style="background:rgba(255,255,255,.92);color:#DC2626">
								<Icon name="heartFill" size={12}/>
							</button>
						</div>
						<div class="p-3">
							<h4 class="font-display text-[13px] font-bold leading-tight mb-1">{p.name}</h4>
							<div class="flex items-center justify-between">
								<span class="font-mono text-[13.5px] font-bold">{fmtCOP(p.price)}</span>
								<button onclick={() => addToCart(p.id, p.storeId, p.price)}
									class="w-8 h-8 rounded-[8px] flex items-center justify-center text-white"
									style="background:var(--c-brand)">
									<Icon name="plus" size={16} strokeWidth={2.5}/>
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
			<button onclick={() => (crearListaOpen = true)}
				class="flex items-center gap-3 p-4 rounded-[14px] border-2 border-dashed"
				style="border-color:var(--c-border);color:var(--c-text-muted)">
				<div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
					style="background:var(--c-bg-secondary)">+</div>
				<div class="text-left">
					<div class="font-bold text-[13.5px]" style="color:var(--c-text-primary)">Crear nueva lista</div>
					<div class="text-[12px]">Organiza tus productos favoritos</div>
				</div>
			</button>

			{#each favoritos.listas as lista}
				<div class="rounded-[14px] border border-[var(--c-border-soft)] overflow-hidden"
					style="background:var(--c-bg-card)">
					<div class="p-4 flex items-center gap-3">
						<div class="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
							style="background:var(--c-bg-secondary)">{lista.emoji}</div>
						<div class="flex-1 min-w-0">
							<h4 class="font-display text-[14px] font-bold leading-snug">{lista.nombre}</h4>
							<div class="text-[12px]" style="color:var(--c-text-muted)">
								{lista.items.length} artículo{lista.items.length !== 1 ? 's' : ''}
								{#if lista.items.length > 0}
									· {fmtCOP(favoritos.totalLista(lista))} total
								{/if}
							</div>
						</div>
						<button onclick={() => eliminarLista(lista.id)}
							class="w-9 h-9 rounded-xl flex items-center justify-center"
							style="background:var(--c-bg-secondary);color:var(--c-text-muted)">
							<Icon name="trash" size={15}/>
						</button>
					</div>

					{#if lista.items.length > 0}
						<div class="px-4 pb-4 flex flex-col gap-2">
							{#each lista.items.slice(0, 3) as item}
								{@const p = favoritos.productos.find(x => x.id === item.productoId)}
								{#if p}
									<div class="flex items-center gap-2.5 text-[12.5px]">
										<span class="text-base shrink-0">{p.emoji}</span>
										<span class="flex-1 truncate">{p.name}</span>
										<span class="font-mono font-bold shrink-0">{fmtCOP(p.price)}</span>
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
				<div class="text-center py-16" style="color:var(--c-text-muted)">
					<div class="text-5xl mb-4">📋</div>
					<h3 class="font-display font-bold text-xl mb-2">Sin listas aún</h3>
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
				<div class="text-[12px] font-bold uppercase tracking-[0.8px] mb-2" style="color:var(--c-text-muted)">Emoji</div>
				<div class="flex flex-wrap gap-2">
					{#each EMOJIS_LISTA as em}
						<button onclick={() => nuevoEmoji = em}
							class="w-9 h-9 rounded-xl flex items-center justify-center text-xl border-2 transition-all"
							style="border-color:{nuevoEmoji === em ? 'var(--c-brand)' : 'transparent'};background:{nuevoEmoji === em ? 'var(--c-bg-secondary)' : 'var(--c-bg-secondary)'}">
							{em}
						</button>
					{/each}
				</div>
			</div>

			<!-- Nombre -->
			<div>
				<div class="text-[12px] font-bold uppercase tracking-[0.8px] mb-2" style="color:var(--c-text-muted)">Nombre *</div>
				<Input bind:value={nuevoNombre} type="text" placeholder="Ej: Lista del mercado"
					class="w-full h-11 px-3.5 rounded-xl border text-[14px]"
					style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"/>
			</div>

			<div class="flex gap-2.5 mt-1">
				<button onclick={() => (crearListaOpen = false)}
					class="flex-1 h-11 rounded-xl font-bold text-[14px] border"
					style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)">
					Cancelar
				</button>
				<button onclick={crearLista} disabled={!nuevoNombre.trim()}
					class="flex-1 h-11 rounded-xl font-bold text-[14px] text-white disabled:opacity-40"
					style="background:var(--c-brand)">
					Crear lista
				</button>
			</div>
	</Dialog.Content>
</Dialog.Root>
