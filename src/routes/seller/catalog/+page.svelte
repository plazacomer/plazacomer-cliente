<script lang="ts">
	import { vendedor, type ProductoVendedor } from '$lib/stores/vendedor.svelte';
	import { fmtCOP } from '$lib/utils';
	import Icon from '$lib/components/ui/Icon.svelte';
	import * as Select from '$lib/components/ui/select';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';

	// Nuevo producto modal
	let modalOpen = $state(false);
	let editando = $state<ProductoVendedor | null>(null);

	let nombre = $state('');
	let descripcion = $state('');
	let precio = $state('');
	let emoji = $state('🍽️');
	let stock = $state('10');
	let categoria = $state('food');

	const CATEGORIAS = [
		{ value: 'food', label: 'Plato fuerte' },
		{ value: 'drinks', label: 'Bebida' },
		{ value: 'dessert', label: 'Postre' },
		{ value: 'other', label: 'Otro' }
	];
	const categoriaLabel = $derived(
		CATEGORIAS.find((c) => c.value === categoria)?.label ?? 'Categoría'
	);

	// Filtro por disponibilidad (tabs)
	let filtro = $state<'todos' | 'disponibles' | 'agotados'>('todos');
	const productosFiltrados = $derived(
		vendedor.catalogo.filter((p) => {
			if (filtro === 'disponibles') return p.disponible;
			if (filtro === 'agotados') return !p.disponible || p.stock === 0;
			return true;
		})
	);

	function abrirNuevo() {
		editando = null;
		nombre = '';
		descripcion = '';
		precio = '';
		emoji = '🍽️';
		stock = '10';
		categoria = 'food';
		modalOpen = true;
	}

	function abrirEditar(p: ProductoVendedor) {
		editando = p;
		nombre = p.name;
		descripcion = p.description;
		precio = String(p.price);
		emoji = p.emoji;
		stock = String(p.stock);
		categoria = p.category;
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
			const p = vendedor.catalogo.find((p) => p.id === editando!.id);
			if (p) {
				p.name = nombre;
				p.description = descripcion;
				p.emoji = emoji;
				p.category = categoria;
			}
		} else {
			vendedor.addProducto({
				name: nombre,
				description: descripcion,
				price: precioNum,
				emoji,
				stock: stockNum,
				category: categoria,
				disponible: stockNum > 0
			});
		}
		modalOpen = false;
	}

	const disponibles = $derived(vendedor.catalogo.filter((p) => p.disponible).length);
	const agotados = $derived(vendedor.catalogo.filter((p) => !p.disponible || p.stock === 0).length);

	const EMOJIS = [
		'🍽️',
		'🍛',
		'🥘',
		'🥟',
		'🍲',
		'🍕',
		'🥑',
		'🛒',
		'🍊',
		'🧃',
		'🍺',
		'☕',
		'🎂',
		'🍰',
		'🥗',
		'🍗'
	];
</script>

<div class="mx-auto max-w-2xl px-4 pt-6 pb-10">
	<!-- Header -->
	<div class="mb-1 flex items-center justify-between">
		<h1 class="font-display text-[24px] font-extrabold">Catálogo</h1>
		<button
			onclick={abrirNuevo}
			class="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white"
			style="background:var(--c-brand)"
		>
			<Icon name="plus" size={15} strokeWidth={2.5} />
			Nuevo producto
		</button>
	</div>
	<p class="mb-5 text-sm" style="color:var(--c-text-secondary)">
		{disponibles} disponibles · {agotados} agotados
	</p>

	<!-- Filtro por disponibilidad -->
	<Tabs.Root bind:value={filtro} class="mb-4">
		<Tabs.List>
			<Tabs.Trigger value="todos">Todos</Tabs.Trigger>
			<Tabs.Trigger value="disponibles">Disponibles</Tabs.Trigger>
			<Tabs.Trigger value="agotados">Agotados</Tabs.Trigger>
		</Tabs.List>
	</Tabs.Root>

	<!-- Grid -->
	<div class="flex flex-col gap-3">
		{#each productosFiltrados as prod (prod.id)}
			<Card.Root
				class="flex-row items-center gap-3.5 rounded-2xl border border-[var(--c-border-soft)] p-3.5 ring-0"
				style="opacity:{prod.disponible ? 1 : 0.55}"
			>
				<!-- Emoji -->
				<div
					class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
					style="background:var(--c-bg-secondary)"
				>
					{prod.emoji}
				</div>

				<!-- Info -->
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-2">
						<span class="truncate font-display text-[14px] font-bold">{prod.name}</span>
					</div>
					<div class="mb-1.5 truncate text-[11.5px]" style="color:var(--c-text-muted)">
						{prod.description}
					</div>
					<div class="flex flex-wrap items-center gap-2">
						<span class="font-mono text-[13px] font-bold">{fmtCOP(prod.price)}</span>
						<span
							class="rounded-full px-2 py-0.5 text-[11px] font-semibold"
							style="background:{prod.stock === 0 ? 'rgba(220,38,38,.08)' : 'rgba(22,163,74,.08)'};
								color:{prod.stock === 0 ? 'var(--c-error)' : 'var(--c-success)'}"
						>
							{prod.stock === 0 ? 'Agotado' : `${prod.stock} en stock`}
						</span>
					</div>
				</div>

				<!-- Acciones -->
				<div class="flex shrink-0 flex-col gap-2">
					<!-- Toggle disponible -->
					<button
						onclick={() => vendedor.toggleDisponible(prod.id)}
						class="relative h-6 w-10 rounded-full transition-colors"
						style="background:{prod.disponible ? 'var(--c-brand)' : 'var(--c-border)'}"
					>
						<div
							class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
							style="left:{prod.disponible ? '18px' : '2px'}"
						></div>
					</button>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger
							class="flex h-9 w-10 items-center justify-center rounded-xl"
							style="background:var(--c-bg-secondary);color:var(--c-text-secondary)"
						>
							<EllipsisVertical size={16} />
						</DropdownMenu.Trigger>
						<DropdownMenu.Content>
							<DropdownMenu.Item onclick={() => abrirEditar(prod)}>
								<Icon name="edit" size={14} />
								Editar
							</DropdownMenu.Item>
							<DropdownMenu.Item
								variant="destructive"
								onclick={() => {
									if (confirm(`¿Eliminar ${prod.name}?`)) vendedor.removeProducto(prod.id);
								}}
							>
								<Icon name="trash" size={14} />
								Eliminar
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			</Card.Root>
		{/each}
	</div>
</div>

<!-- Modal nuevo/editar producto -->
<Dialog.Root bind:open={modalOpen}>
	<Dialog.Content showCloseButton={false} class="flex flex-col gap-4">
		<div class="flex items-center justify-between">
			<h3 class="font-display text-[18px] font-extrabold">
				{editando ? 'Editar producto' : 'Nuevo producto'}
			</h3>
			<button
				onclick={() => (modalOpen = false)}
				class="flex h-8 w-8 items-center justify-center rounded-full"
				style="background:var(--c-bg-secondary);color:var(--c-text-muted)"
			>
				<Icon name="close" size={15} />
			</button>
		</div>

		<!-- Emoji picker -->
		<div>
			<div
				class="mb-2 text-[11px] font-bold tracking-widest uppercase"
				style="color:var(--c-text-muted)"
			>
				Emoji
			</div>
			<div class="flex flex-wrap gap-1.5">
				{#each EMOJIS as em, idx (idx)}
					<button
						onclick={() => (emoji = em)}
						class="flex h-9 w-9 items-center justify-center rounded-xl border-2 text-lg transition-all"
						style="border-color:{emoji === em
							? 'var(--c-brand)'
							: 'transparent'};background:var(--c-bg-secondary)"
					>
						{em}
					</button>
				{/each}
			</div>
		</div>

		<!-- Nombre -->
		<div>
			<div
				class="mb-1.5 text-[11px] font-bold tracking-widest uppercase"
				style="color:var(--c-text-muted)"
			>
				Nombre *
			</div>
			<Input
				bind:value={nombre}
				type="text"
				placeholder="Ej: Bandeja Paisa"
				class="h-11 w-full rounded-xl border px-3.5 text-[14px]"
				style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
			/>
		</div>

		<!-- Descripción -->
		<div>
			<div
				class="mb-1.5 text-[11px] font-bold tracking-widest uppercase"
				style="color:var(--c-text-muted)"
			>
				Descripción
			</div>
			<Input
				bind:value={descripcion}
				type="text"
				placeholder="Ej: Con fríjoles, chicharrón..."
				class="h-11 w-full rounded-xl border px-3.5 text-[14px]"
				style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
			/>
		</div>

		<div class="flex gap-3">
			<!-- Precio -->
			<div class="flex-1">
				<div
					class="mb-1.5 text-[11px] font-bold tracking-widest uppercase"
					style="color:var(--c-text-muted)"
				>
					Precio *
				</div>
				<Input
					bind:value={precio}
					type="number"
					placeholder="28000"
					class="h-11 w-full rounded-xl border px-3.5 text-[14px]"
					style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
				/>
			</div>
			<!-- Stock -->
			<div class="flex-1">
				<div
					class="mb-1.5 text-[11px] font-bold tracking-widest uppercase"
					style="color:var(--c-text-muted)"
				>
					Stock
				</div>
				<Input
					bind:value={stock}
					type="number"
					placeholder="10"
					class="h-11 w-full rounded-xl border px-3.5 text-[14px]"
					style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
				/>
			</div>
		</div>

		<!-- Categoría -->
		<div>
			<div
				class="mb-1.5 text-[11px] font-bold tracking-widest uppercase"
				style="color:var(--c-text-muted)"
			>
				Categoría
			</div>
			<Select.Root type="single" bind:value={categoria}>
				<Select.Trigger class="h-11 w-full rounded-xl">
					{categoriaLabel}
				</Select.Trigger>
				<Select.Content>
					{#each CATEGORIAS as c (c.value)}
						<Select.Item value={c.value} label={c.label}>{c.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
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
				disabled={!nombre.trim() || !precio}
				class="h-11 flex-1 rounded-xl text-[14px] font-bold text-white disabled:opacity-40"
				style="background:var(--c-brand)"
			>
				{editando ? 'Guardar' : 'Agregar'}
			</button>
		</div>
	</Dialog.Content>
</Dialog.Root>
