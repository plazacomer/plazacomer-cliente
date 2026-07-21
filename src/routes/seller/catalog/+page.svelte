<script lang="ts">
	import { vendedor, type ProductoVendedor } from '$lib/stores/vendedor.svelte';
	import { fmtCOP } from '$lib/utils';
	import Icon from '$lib/components/ui/Icon.svelte';

	// Nuevo producto modal
	let modalOpen = $state(false);
	let editando = $state<ProductoVendedor | null>(null);

	let nombre = $state('');
	let descripcion = $state('');
	let precio = $state('');
	let emoji = $state('🍽️');
	let stock = $state('10');

	function abrirNuevo() {
		editando = null;
		nombre = ''; descripcion = ''; precio = ''; emoji = '🍽️'; stock = '10';
		modalOpen = true;
	}

	function abrirEditar(p: ProductoVendedor) {
		editando = p;
		nombre = p.name; descripcion = p.description; precio = String(p.price);
		emoji = p.emoji; stock = String(p.stock);
		modalOpen = true;
	}

	function guardar() {
		const precioNum = parseInt(precio.replace(/\D/g, ''), 10);
		const stockNum = parseInt(stock, 10);
		if (!nombre.trim() || !precioNum) return;

		if (editando) {
			vendedor.updatePrecio(editando.id, precioNum);
			vendedor.updateStock(editando.id, stockNum);
			// update nombre/desc in place
			const p = vendedor.catalogo.find(p => p.id === editando!.id);
			if (p) { p.name = nombre; p.description = descripcion; p.emoji = emoji; }
		} else {
			vendedor.addProducto({
				name: nombre, description: descripcion,
				price: precioNum,
				emoji,
				stock: stockNum,
				category: 'food',
				disponible: stockNum > 0,
			});
		}
		modalOpen = false;
	}

	const disponibles = $derived(vendedor.catalogo.filter(p => p.disponible).length);
	const agotados = $derived(vendedor.catalogo.filter(p => !p.disponible || p.stock === 0).length);

	const EMOJIS = ['🍽️','🍛','🥘','🥟','🍲','🍕','🥑','🛒','🍊','🧃','🍺','☕','🎂','🍰','🥗','🍗'];
</script>

<div class="max-w-2xl mx-auto px-4 pt-6 pb-10">
	<!-- Header -->
	<div class="flex items-center justify-between mb-1">
		<h1 class="font-display text-[24px] font-extrabold">Catálogo</h1>
		<button onclick={abrirNuevo}
			class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm text-white"
			style="background:var(--c-brand)">
			<Icon name="plus" size={15} strokeWidth={2.5}/>
			Nuevo producto
		</button>
	</div>
	<p class="text-sm mb-5" style="color:var(--c-text-secondary)">
		{disponibles} disponibles · {agotados} agotados
	</p>

	<!-- Grid -->
	<div class="flex flex-col gap-3">
		{#each vendedor.catalogo as prod}
			<div class="flex items-center gap-3.5 p-3.5 rounded-2xl border border-[var(--c-border-soft)]"
				style="background:var(--c-bg-card);opacity:{prod.disponible ? 1 : 0.55}">
				<!-- Emoji -->
				<div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
					style="background:var(--c-bg-secondary)">{prod.emoji}</div>

				<!-- Info -->
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2">
						<span class="font-display text-[14px] font-bold truncate">{prod.nombre}</span>
					</div>
					<div class="text-[11.5px] truncate mb-1.5" style="color:var(--c-text-muted)">{prod.descripcion}</div>
					<div class="flex items-center gap-2 flex-wrap">
						<span class="font-mono text-[13px] font-bold">{fmtCOP(prod.precio)}</span>
						<span class="text-[11px] px-2 py-0.5 rounded-full font-semibold"
							style="background:{prod.stock === 0 ? 'rgba(220,38,38,.08)' : 'rgba(22,163,74,.08)'};
								color:{prod.stock === 0 ? 'var(--c-error)' : 'var(--c-success)'}">
							{prod.stock === 0 ? 'Agotado' : `${prod.stock} en stock`}
						</span>
					</div>
				</div>

				<!-- Acciones -->
				<div class="flex flex-col gap-2 shrink-0">
					<!-- Toggle disponible -->
					<button onclick={() => vendedor.toggleDisponible(prod.id)}
						class="w-10 h-6 rounded-full transition-colors relative"
						style="background:{prod.disponible ? 'var(--c-brand)' : 'var(--c-border)'}">
						<div class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
							style="left:{prod.disponible ? '18px' : '2px'}"></div>
					</button>
					<button onclick={() => abrirEditar(prod)}
						class="w-10 h-9 rounded-xl flex items-center justify-center"
						style="background:var(--c-bg-secondary);color:var(--c-text-secondary)">
						<Icon name="edit" size={14}/>
					</button>
					<button onclick={() => { if (confirm(`¿Eliminar ${prod.nombre}?`)) vendedor.removeProducto(prod.id); }}
						class="w-10 h-9 rounded-xl flex items-center justify-center"
						style="background:rgba(220,38,38,.06);color:var(--c-error)">
						<Icon name="trash" size={14}/>
					</button>
				</div>
			</div>
		{/each}
	</div>
</div>

<!-- Modal nuevo/editar producto -->
{#if modalOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
		style="background:rgba(0,0,0,.5);backdrop-filter:blur(3px)"
		onclick={(e) => { if ((e.target as HTMLElement).dataset.backdrop) modalOpen = false; }}
		data-backdrop="1">
		<div class="w-full md:max-w-sm rounded-t-[24px] md:rounded-[24px] p-6 flex flex-col gap-4"
			style="background:var(--c-bg-card)">
			<div class="flex items-center justify-between">
				<h3 class="font-display text-[18px] font-extrabold">
					{editando ? 'Editar producto' : 'Nuevo producto'}
				</h3>
				<button onclick={() => modalOpen = false}
					class="w-8 h-8 rounded-full flex items-center justify-center"
					style="background:var(--c-bg-secondary);color:var(--c-text-muted)">
					<Icon name="close" size={15}/>
				</button>
			</div>

			<!-- Emoji picker -->
			<div>
				<div class="text-[11px] font-bold uppercase tracking-widest mb-2" style="color:var(--c-text-muted)">Emoji</div>
				<div class="flex flex-wrap gap-1.5">
					{#each EMOJIS as em}
						<button onclick={() => emoji = em}
							class="w-9 h-9 rounded-xl flex items-center justify-center text-lg border-2 transition-all"
							style="border-color:{emoji === em ? 'var(--c-brand)' : 'transparent'};background:var(--c-bg-secondary)">
							{em}
						</button>
					{/each}
				</div>
			</div>

			<!-- Nombre -->
			<div>
				<div class="text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">Nombre *</div>
				<input bind:value={nombre} type="text" placeholder="Ej: Bandeja Paisa"
					class="w-full h-11 px-3.5 rounded-xl border text-[14px] outline-none"
					style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"/>
			</div>

			<!-- Descripción -->
			<div>
				<div class="text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">Descripción</div>
				<input bind:value={descripcion} type="text" placeholder="Ej: Con fríjoles, chicharrón..."
					class="w-full h-11 px-3.5 rounded-xl border text-[14px] outline-none"
					style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"/>
			</div>

			<div class="flex gap-3">
				<!-- Precio -->
				<div class="flex-1">
					<div class="text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">Precio *</div>
					<input bind:value={precio} type="number" placeholder="28000"
						class="w-full h-11 px-3.5 rounded-xl border text-[14px] outline-none"
						style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"/>
				</div>
				<!-- Stock -->
				<div class="flex-1">
					<div class="text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">Stock</div>
					<input bind:value={stock} type="number" placeholder="10"
						class="w-full h-11 px-3.5 rounded-xl border text-[14px] outline-none"
						style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"/>
				</div>
			</div>

			<div class="flex gap-2.5 mt-1">
				<button onclick={() => modalOpen = false}
					class="flex-1 h-11 rounded-xl font-bold text-[14px] border"
					style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)">
					Cancelar
				</button>
				<button onclick={guardar} disabled={!nombre.trim() || !precio}
					class="flex-1 h-11 rounded-xl font-bold text-[14px] text-white disabled:opacity-40"
					style="background:var(--c-brand)">
					{editando ? 'Guardar' : 'Agregar'}
				</button>
			</div>
		</div>
	</div>
{/if}
