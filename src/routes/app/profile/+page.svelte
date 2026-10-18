<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { CURRENT_USER, ADDRESSES, type Address } from '$lib/data/mock';
	import { darkMode, orders } from '$lib/stores/app.svelte';
	import { citas } from '$lib/stores/citas.svelte';
	import { favoritos } from '$lib/stores/favoritos.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';

	// ── Club levels ──
	const NIVELES = [
		{ nombre: 'Bronce', min: 0, max: 100, color: '#CD7F32', emoji: '🥉' },
		{ nombre: 'Plata', min: 100, max: 250, color: '#94A3B8', emoji: '🥈' },
		{ nombre: 'Oro', min: 250, max: 500, color: '#F59E0B', emoji: '🥇' },
		{ nombre: 'Platino', min: 500, max: 1000, color: '#06B6D4', emoji: '💎' }
	];
	const nivelActual = NIVELES.find((n) => n.nombre === CURRENT_USER.tier) ?? NIVELES[2];
	const puntosParaSiguiente = nivelActual.max - CURRENT_USER.rewards;
	const progresoBar = Math.min(
		100,
		Math.round(
			((CURRENT_USER.rewards - nivelActual.min) / (nivelActual.max - nivelActual.min)) * 100
		)
	);
	const nivelSig = NIVELES[NIVELES.indexOf(nivelActual) + 1];

	// ── Direcciones ──
	let direcciones = $state<Address[]>([...ADDRESSES]);
	let dirModalOpen = $state(false);
	let dirEditando = $state<Address | null>(null);

	// form state
	let dirLabel = $state('');
	let dirDireccion = $state('');
	let dirBarrio = $state('');
	let dirCiudad = $state('Medellín');

	function abrirNuevaDireccion() {
		dirEditando = null;
		dirLabel = '';
		dirDireccion = '';
		dirBarrio = '';
		dirCiudad = 'Medellín';
		dirModalOpen = true;
	}

	function abrirEditarDireccion(d: Address) {
		dirEditando = d;
		dirLabel = d.label;
		dirDireccion = d.address;
		dirBarrio = d.neighborhood;
		dirCiudad = d.city;
		dirModalOpen = true;
	}

	function guardarDireccion() {
		if (!dirLabel.trim() || !dirDireccion.trim()) return;
		if (dirEditando) {
			direcciones = direcciones.map((d) =>
				d.id === dirEditando!.id
					? {
							...d,
							label: dirLabel,
							address: dirDireccion,
							neighborhood: dirBarrio,
							city: dirCiudad
						}
					: d
			);
		} else {
			const nueva: Address = {
				id: `d${Date.now()}`,
				label: dirLabel,
				address: dirDireccion,
				neighborhood: dirBarrio,
				city: dirCiudad,
				isPrimary: false
			};
			direcciones = [...direcciones, nueva];
		}
		dirModalOpen = false;
	}

	function eliminarDireccion(id: string) {
		if (confirm('¿Eliminar esta dirección?')) {
			direcciones = direcciones.filter((d) => d.id !== id);
		}
	}

	function marcarPrincipal(id: string) {
		direcciones = direcciones.map((d) => ({ ...d, isPrimary: d.id === id }));
	}
</script>

<div class="mx-auto max-w-lg px-5 pt-5 pb-28 md:pb-10">
	<!-- User card -->
	<div
		class="mb-4 flex items-center gap-4 rounded-2xl border border-[var(--c-border-soft)] p-5"
		style="background:var(--c-bg-card)"
	>
		<div
			class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-display text-xl font-bold text-white"
			style="background:{CURRENT_USER.color}"
		>
			{CURRENT_USER.initials}
		</div>
		<div class="min-w-0 flex-1">
			<h2 class="font-display text-[17px] font-bold">{CURRENT_USER.name}</h2>
			<div class="mt-0.5 truncate text-xs" style="color:var(--c-text-muted)">
				{CURRENT_USER.email}
			</div>
			<div class="mt-1.5 flex items-center gap-2">
				<Badge variant="accent">{nivelActual.emoji} Club {nivelActual.nombre}</Badge>
				<span class="text-xs font-semibold" style="color:var(--c-text-muted)"
					>{CURRENT_USER.rewards} pts</span
				>
			</div>
		</div>
	</div>

	<!-- ── Club PlazaComer ── -->
	<div
		class="mb-5 overflow-hidden rounded-2xl border border-[var(--c-border-soft)]"
		style="background:var(--c-bg-card)"
	>
		<div
			class="border-b border-[var(--c-border-soft)] p-4"
			style="background:linear-gradient(135deg,rgba(124,58,237,.08),rgba(245,158,11,.06))"
		>
			<div class="mb-3 flex items-center justify-between">
				<div>
					<div
						class="mb-0.5 font-mono text-[10px] font-bold tracking-widest uppercase"
						style="color:{nivelActual.color}"
					>
						Club PlazaComer
					</div>
					<div class="font-display text-[18px] font-extrabold">
						{nivelActual.emoji} Nivel {nivelActual.nombre}
					</div>
				</div>
				<div class="text-right">
					<div class="font-mono text-2xl font-black" style="color:{nivelActual.color}">
						{CURRENT_USER.rewards}
					</div>
					<div class="text-[11px]" style="color:var(--c-text-muted)">puntos</div>
				</div>
			</div>

			<!-- Progress bar -->
			<div>
				<div class="mb-1.5 flex justify-between text-[11px]" style="color:var(--c-text-muted)">
					<span>{nivelActual.nombre}</span>
					{#if nivelSig}<span>{nivelSig.nombre} en {puntosParaSiguiente} pts</span>{:else}<span
							>Nivel máximo 🏆</span
						>{/if}
				</div>
				<div class="h-2 overflow-hidden rounded-full" style="background:var(--c-bg-secondary)">
					<div
						class="h-full rounded-full transition-all duration-700"
						style="width:{progresoBar}%;background:{nivelActual.color}"
					></div>
				</div>
			</div>
		</div>

		<!-- Stats row -->
		<div class="grid grid-cols-3 divide-x" style="divide-color:var(--c-border-soft)">
			{#each [{ label: 'Pedidos', value: CURRENT_USER.totalOrders }, { label: 'Puntos', value: CURRENT_USER.rewards }, { label: 'Miembro desde', value: CURRENT_USER.memberSince }] as s, idx (idx)}
				<div class="py-3 text-center">
					<div class="font-display text-[15px] font-extrabold">{s.value}</div>
					<div class="mt-0.5 text-[10.5px]" style="color:var(--c-text-muted)">{s.label}</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- ── Quick links: Citas + Guardados ── -->
	<div class="mb-5 grid grid-cols-2 gap-3">
		<button
			onclick={() => goto(resolve('/app/appointments'))}
			class="flex flex-col gap-1.5 rounded-2xl border border-[var(--c-border-soft)] p-4 text-left"
			style="background:var(--c-bg-card)"
		>
			<div
				class="flex h-9 w-9 items-center justify-center rounded-xl"
				style="background:rgba(37,99,235,.1)"
			>
				<Icon name="calendar" size={18} color="#2563EB" />
			</div>
			<div class="mt-0.5 font-display text-[13.5px] font-bold">Mis citas</div>
			<div class="text-[11.5px]" style="color:var(--c-text-muted)">
				{citas.proximas.length > 0
					? `${citas.proximas.length} próxima${citas.proximas.length !== 1 ? 's' : ''}`
					: 'Sin citas próximas'}
			</div>
		</button>
		<button
			onclick={() => goto(resolve('/app/saved'))}
			class="flex flex-col gap-1.5 rounded-2xl border border-[var(--c-border-soft)] p-4 text-left"
			style="background:var(--c-bg-card)"
		>
			<div
				class="flex h-9 w-9 items-center justify-center rounded-xl"
				style="background:rgba(220,38,38,.08)"
			>
				<Icon name="heart" size={18} color="#DC2626" />
			</div>
			<div class="mt-0.5 font-display text-[13.5px] font-bold">Guardados</div>
			<div class="text-[11.5px]" style="color:var(--c-text-muted)">
				{favoritos.ids.length} favorito{favoritos.ids.length !== 1 ? 's' : ''} · {favoritos.listas
					.length} lista{favoritos.listas.length !== 1 ? 's' : ''}
			</div>
		</button>
	</div>

	<!-- ── Mis direcciones ── -->
	<div
		class="mb-5 overflow-hidden rounded-2xl border border-[var(--c-border-soft)]"
		style="background:var(--c-bg-card)"
	>
		<div
			class="flex items-center justify-between border-b border-[var(--c-border-soft)] px-4 py-3.5"
		>
			<div class="flex items-center gap-2">
				<Icon name="location" size={17} color="var(--c-text-secondary)" />
				<span class="font-display text-[14px] font-bold">Mis direcciones</span>
			</div>
			<button
				onclick={abrirNuevaDireccion}
				class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold"
				style="background:var(--c-bg-secondary);color:var(--c-brand)"
			>
				<Icon name="plus" size={13} strokeWidth={2.5} /> Nueva
			</button>
		</div>

		<div class="flex flex-col divide-y" style="divide-color:var(--c-border-soft)">
			{#each direcciones as dir (dir.id)}
				<div class="flex items-center gap-3 px-4 py-3">
					<button
						onclick={() => marcarPrincipal(dir.id)}
						class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all"
						style="border-color:{dir.isPrimary
							? 'var(--c-brand)'
							: 'var(--c-border)'};background:{dir.isPrimary ? 'var(--c-brand)' : 'transparent'}"
					>
						{#if dir.isPrimary}
							<div class="h-1.5 w-1.5 rounded-full bg-white"></div>
						{/if}
					</button>
					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-1.5 text-[13.5px] font-semibold">
							{dir.label}
							{#if dir.isPrimary}
								<span
									class="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
									style="background:rgba(124,58,237,.1);color:var(--c-brand)">Principal</span
								>
							{/if}
						</div>
						<div class="truncate text-[12px]" style="color:var(--c-text-muted)">
							{dir.address}, {dir.neighborhood}, {dir.city}
						</div>
					</div>
					<div class="flex shrink-0 items-center gap-1">
						<button
							onclick={() => abrirEditarDireccion(dir)}
							class="flex h-8 w-8 items-center justify-center rounded-lg"
							style="color:var(--c-text-muted);background:var(--c-bg-secondary)"
						>
							<Icon name="edit" size={13} />
						</button>
						<button
							onclick={() => eliminarDireccion(dir.id)}
							class="flex h-8 w-8 items-center justify-center rounded-lg"
							style="color:var(--c-error);background:rgba(220,38,38,.06)"
						>
							<Icon name="trash" size={13} />
						</button>
					</div>
				</div>
			{/each}

			{#if direcciones.length === 0}
				<div class="py-8 text-center" style="color:var(--c-text-muted)">
					<div class="mb-2 text-3xl">📍</div>
					<div class="text-sm">Aún no tienes direcciones guardadas</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- ── Menu items ── -->
	<div
		class="mb-4 flex flex-col gap-1 overflow-hidden rounded-2xl border border-[var(--c-border-soft)]"
		style="background:var(--c-bg-card)"
	>
		<button
			onclick={() => goto(resolve('/app/orders'))}
			class="flex items-center gap-3 border-b border-[var(--c-border-soft)] px-4 py-3.5 text-left transition-colors hover:bg-[var(--c-bg-secondary)]"
			style="color:var(--c-text-primary)"
		>
			<Icon name="package" size={19} color="var(--c-text-secondary)" />
			<span class="flex-1 text-sm font-medium">Mis pedidos</span>
			{#if orders.activeCount > 0}
				<span
					class="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white"
					style="background:var(--c-brand)">{orders.activeCount}</span
				>
			{/if}
			<Icon name="arrowRight" size={16} color="var(--c-text-muted)" />
		</button>

		{#each [{ icon: 'bell', label: 'Notificaciones', path: null }, { icon: 'tag', label: 'Mis cupones', path: null }, { icon: 'store', label: 'Panel Vendedor', path: '/seller' }, { icon: 'truck', label: 'Panel Repartidor', path: '/app/courier' }] as const as item, idx (idx)}
			<button
				onclick={() => (item.path ? goto(resolve(item.path)) : undefined)}
				class="flex items-center gap-3 border-b border-[var(--c-border-soft)] px-4 py-3.5 text-left transition-colors hover:bg-[var(--c-bg-secondary)]"
				style="color:var(--c-text-primary)"
			>
				<Icon name={item.icon} size={19} color="var(--c-text-secondary)" />
				<span class="flex-1 text-sm font-medium">{item.label}</span>
				{#if item.path}
					<span
						class="mr-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
						style="background:rgba(37,99,235,.1);color:var(--c-brand)">Abrir</span
					>
				{/if}
				<Icon name="arrowRight" size={16} color="var(--c-text-muted)" />
			</button>
		{/each}

		<button
			onclick={() => darkMode.toggle()}
			class="flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[var(--c-bg-secondary)]"
			style="color:var(--c-text-primary)"
		>
			<Icon name={darkMode.value ? 'sun' : 'moon'} size={19} color="var(--c-text-secondary)" />
			<span class="flex-1 text-sm font-medium">{darkMode.value ? 'Modo claro' : 'Modo oscuro'}</span
			>
			<div
				class="relative h-5 w-9 rounded-full transition-colors"
				style="background:{darkMode.value ? 'var(--c-brand)' : 'var(--c-border)'}"
			>
				<div
					class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all"
					style="left:{darkMode.value ? '18px' : '2px'}"
				></div>
			</div>
		</button>
	</div>

	<button
		onclick={() => goto(resolve('/'))}
		class="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-colors hover:bg-[var(--c-error-light)]"
		style="color:var(--c-error)"
	>
		<Icon name="logout" size={19} />
		<span class="text-sm font-medium">Cerrar sesión</span>
	</button>
</div>

<!-- ── Dirección modal ── -->
<Dialog.Root bind:open={dirModalOpen}>
	<Dialog.Content showCloseButton={false} class="flex flex-col gap-4">
		<div class="flex items-center justify-between">
			<h3 class="font-display text-[18px] font-extrabold">
				{dirEditando ? 'Editar dirección' : 'Nueva dirección'}
			</h3>
			<button
				onclick={() => (dirModalOpen = false)}
				class="flex h-8 w-8 items-center justify-center rounded-full"
				style="background:var(--c-bg-secondary);color:var(--c-text-muted)"
			>
				<Icon name="close" size={15} />
			</button>
		</div>

		{#each [{ key: 'label', label: 'Nombre *', placeholder: 'Ej: Casa 🏠', bind: dirLabel }, { key: 'direccion', label: 'Dirección *', placeholder: 'Ej: Cra 10 #45-23', bind: dirDireccion }, { key: 'barrio', label: 'Barrio', placeholder: 'Ej: El Poblado', bind: dirBarrio }, { key: 'ciudad', label: 'Ciudad', placeholder: 'Ej: Medellín', bind: dirCiudad }] as field, idx (idx)}
			<div>
				<div
					class="mb-1.5 text-[12px] font-bold tracking-[0.8px] uppercase"
					style="color:var(--c-text-muted)"
				>
					{field.label}
				</div>
				{#if field.key === 'label'}
					<Input
						bind:value={dirLabel}
						type="text"
						placeholder={field.placeholder}
						class="h-11 w-full rounded-xl border px-3.5 text-[14px]"
						style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
					/>
				{:else if field.key === 'direccion'}
					<Input
						bind:value={dirDireccion}
						type="text"
						placeholder={field.placeholder}
						class="h-11 w-full rounded-xl border px-3.5 text-[14px]"
						style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
					/>
				{:else if field.key === 'barrio'}
					<Input
						bind:value={dirBarrio}
						type="text"
						placeholder={field.placeholder}
						class="h-11 w-full rounded-xl border px-3.5 text-[14px]"
						style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
					/>
				{:else}
					<Input
						bind:value={dirCiudad}
						type="text"
						placeholder={field.placeholder}
						class="h-11 w-full rounded-xl border px-3.5 text-[14px]"
						style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
					/>
				{/if}
			</div>
		{/each}

		<div class="mt-1 flex gap-2.5">
			<button
				onclick={() => (dirModalOpen = false)}
				class="h-11 flex-1 rounded-xl border text-[14px] font-bold"
				style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
			>
				Cancelar
			</button>
			<button
				onclick={guardarDireccion}
				disabled={!dirLabel.trim() || !dirDireccion.trim()}
				class="h-11 flex-1 rounded-xl text-[14px] font-bold text-white disabled:opacity-40"
				style="background:var(--c-brand)"
			>
				{dirEditando ? 'Guardar cambios' : 'Agregar'}
			</button>
		</div>
	</Dialog.Content>
</Dialog.Root>
