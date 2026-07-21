<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { vendedor } from '$lib/stores/vendedor.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import AuthGuard from '$lib/components/AuthGuard.svelte';
	import type { Snippet } from 'svelte';

	type Props = { children: Snippet };
	let { children }: Props = $props();

	const NAV = [
		{ id: '',         label: 'Dashboard',  icon: 'home',     path: '/seller' },
		{ id: 'pedidos',  label: 'Pedidos',    icon: 'package',  path: '/seller/orders' },
		{ id: 'citas',    label: 'Citas',      icon: 'calendar', path: '/seller/appointments' },
		{ id: 'catalogo', label: 'Catálogo',   icon: 'store',    path: '/seller/catalog' },
		{ id: 'ofertas',  label: 'Ofertas',    icon: 'tag',      path: '/seller/deals' },
	];

	function currentId() {
		const segs = $page.url.pathname.split('/');
		return segs[2] ?? '';
	}
</script>

<AuthGuard>
<div class="flex min-h-screen" style="background:var(--c-bg-primary)">

	<!-- Sidebar desktop -->
	<aside class="hidden lg:flex flex-col w-56 shrink-0 sticky top-0 h-screen border-r border-[var(--c-border)] p-4 gap-1"
		style="background:var(--c-bg-card)">
		<div class="flex items-center gap-2 px-2 pb-5 pt-1">
			<Logo size={30}/>
			<div>
				<div class="font-display text-[13px] font-extrabold tracking-wide">PLAZACOMER</div>
				<div class="text-[9.5px] font-bold uppercase tracking-widest" style="color:var(--c-brand)">Panel Vendedor</div>
			</div>
		</div>

		<!-- Tienda chip -->
		<div class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-2"
			style="background:var(--c-bg-secondary)">
			<div class="text-xl">{vendedor.tienda?.emoji}</div>
			<div class="flex-1 min-w-0">
				<div class="text-[12.5px] font-bold truncate">{vendedor.tienda?.nombre}</div>
				<div class="text-[10px] flex items-center gap-1 mt-0.5"
					style="color:{vendedor.abierto ? 'var(--c-success)' : 'var(--c-error)'}">
					<div class="w-1.5 h-1.5 rounded-full" style="background:currentColor"></div>
					{vendedor.abierto ? 'Abierto' : 'Cerrado'}
				</div>
			</div>
		</div>

		{#each NAV as item}
			{@const active = currentId() === item.id}
			<button onclick={() => goto(item.path)}
				class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors relative"
				style="background:{active ? 'var(--c-brand-light)' : 'transparent'};color:{active ? 'var(--c-brand)' : 'var(--c-text-primary)'}">
				<Icon name={item.icon} size={18} strokeWidth={active ? 2.2 : 1.8}/>
				<span class={active ? 'font-semibold' : ''}>{item.label}</span>
				{#if item.id === 'pedidos' && vendedor.pedidosActivos.length > 0}
					<span class="ml-auto text-[10px] font-bold text-white bg-[var(--c-brand)] min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center">
						{vendedor.pedidosActivos.length}
					</span>
				{:else if item.id === 'citas' && vendedor.citasPendientes.length > 0}
					<span class="ml-auto text-[10px] font-bold text-white bg-[var(--c-error)] min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center">
						{vendedor.citasPendientes.length}
					</span>
				{/if}
			</button>
		{/each}

		<div class="mt-auto border-t border-[var(--c-border-soft)] pt-3">
			<button onclick={() => goto('/app/home')}
				class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm w-full"
				style="color:var(--c-text-secondary)">
				<Icon name="arrowLeft" size={18}/>
				Volver a la app
			</button>
		</div>
	</aside>

	<!-- Main -->
	<main class="flex-1 min-w-0 flex flex-col">
		<!-- Mobile header -->
		<header class="lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b border-[var(--c-border-soft)]"
			style="background:var(--c-bg-card)">
			<Logo size={28}/>
			<div>
				<div class="font-display text-[14px] font-extrabold">PLAZACOMER</div>
				<div class="text-[9px] font-bold uppercase tracking-widest" style="color:var(--c-brand)">Panel Vendedor</div>
			</div>
			<div class="ml-auto flex items-center gap-2">
				<div class="text-[11px] font-semibold px-2.5 py-1 rounded-full"
					style="background:{vendedor.abierto ? 'rgba(22,163,74,.1)' : 'rgba(220,38,38,.08)'};color:{vendedor.abierto ? 'var(--c-success)' : 'var(--c-error)'}">
					● {vendedor.abierto ? 'Abierto' : 'Cerrado'}
				</div>
			</div>
		</header>

		<div class="flex-1 pb-24 lg:pb-0">
			{@render children()}
		</div>

		<!-- Mobile bottom nav -->
		<nav class="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex justify-around items-center px-1 border-t border-[var(--c-border-soft)]"
			style="background:var(--c-bg-card);padding-bottom:max(12px,env(safe-area-inset-bottom));padding-top:8px">
			{#each NAV as item}
				{@const active = currentId() === item.id}
				<button onclick={() => goto(item.path)}
					class="flex flex-col items-center gap-0.5 px-2.5 py-1.5 min-w-14 relative"
					style="color:{active ? 'var(--c-brand)' : 'var(--c-text-muted)'}">
					<div class="relative">
						<Icon name={item.icon} size={22} strokeWidth={active ? 2.3 : 1.8}/>
						{#if item.id === 'pedidos' && vendedor.pedidosActivos.length > 0}
							<span class="absolute -top-1 -right-2 text-[9px] font-bold text-white bg-[var(--c-error)] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
								{vendedor.pedidosActivos.length}
							</span>
						{:else if item.id === 'citas' && vendedor.citasPendientes.length > 0}
							<span class="absolute -top-1 -right-2 text-[9px] font-bold text-white bg-[var(--c-error)] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
								{vendedor.citasPendientes.length}
							</span>
						{/if}
					</div>
					<span class="text-[10px]" class:font-semibold={active}>{item.label}</span>
				</button>
			{/each}
		</nav>
	</main>
</div>
</AuthGuard>
