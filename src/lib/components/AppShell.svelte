<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Icon from './ui/Icon.svelte';
	import Logo from './Logo.svelte';
	import GlobalSearch from './GlobalSearch.svelte';
	import { darkMode, cart, orders, messages } from '#lib/stores/app.svelte.js';
	import { citas } from '#lib/stores/citas.svelte.js';
	import { storeUi } from '#lib/stores/storeUi.svelte.js';
	import { CURRENT_USER } from '#lib/data/mock.js';
	import type { Snippet } from 'svelte';

	type Props = { children: Snippet };
	let { children }: Props = $props();

	let searchOpen = $state(false);

	const NAV = [
		{ id: 'inicio', label: 'Inicio', icon: 'home', path: '/app/home' },
		{ id: 'explorar', label: 'Explorar', icon: 'search', path: '/app/explore' },
		{ id: 'carrito', label: 'Carrito', icon: 'cart', path: '/app/cart' },
		{ id: 'mensajes', label: 'Mensajes', icon: 'message', path: '/app/messages' },
		{ id: 'perfil', label: 'Perfil', icon: 'user', path: '/app/profile' }
	] as const;

	// Dentro de una tienda, la barra inferior se dedica a esa tienda en vez
	// de a la navegación global — más espacio y más foco para comprar.
	const STORE_NAV = [
		{ id: 'search', label: 'Buscar', icon: 'search' },
		{ id: 'promos', label: 'Promos', icon: 'fire' },
		{ id: 'carrito', label: 'Carrito', icon: 'cart', path: '/app/cart' },
		{ id: 'mensajes', label: 'Mensajes', icon: 'message', path: '/app/messages' },
		{ id: 'info', label: 'Tienda', icon: 'store' }
	] as const;

	const isStoreDetail = $derived(page.url.pathname.startsWith('/app/store/'));

	function currentId() {
		const seg = page.url.pathname.split('/')[2] ?? 'inicio';
		return seg;
	}

	function navActive(item: { id: string }) {
		return isStoreDetail ? storeUi.tab === item.id : currentId() === item.id;
	}

	function onNavClick(item: { id: string; path?: (typeof NAV)[number]['path'] }) {
		if (item.path) goto(resolve(item.path));
		else storeUi.setTab(item.id as 'search' | 'promos' | 'info');
	}

	function badge(id: string) {
		if (id === 'carrito') return cart.count;
		if (id === 'pedidos') return orders.activeCount;
		if (id === 'mensajes') return messages.totalUnread;
		return 0;
	}
</script>

<div class="flex min-h-screen" style="background:var(--c-bg-primary)">
	<!-- Desktop sidebar -->
	<aside
		class="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-1 border-r border-[var(--c-border)] p-4 lg:flex"
		style="background:var(--c-bg-card)"
	>
		<a href={resolve('app/home')} class="flex items-center gap-2.5 px-3 pt-2 pb-6">
			<Logo size={36} />
			<div>
				<div class="font-display text-base font-extrabold tracking-wide">PLAZACOMER</div>
				<div class="text-[10px] tracking-widest text-[var(--c-text-muted)] uppercase">
					Tiendas · Servicios
				</div>
			</div>
		</a>

		{#each NAV as item (item.id)}
			{@const active = currentId() === item.id}
			{@const count = badge(item.id)}
			<button
				onclick={() => goto(resolve(item.path))}
				class="relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors"
				style="background:{active ? 'var(--c-brand-light)' : 'transparent'};color:{active
					? 'var(--c-brand)'
					: 'var(--c-text-primary)'};"
			>
				<Icon name={item.icon} size={20} strokeWidth={active ? 2.2 : 1.8} />
				<span class={active ? 'font-semibold' : ''}>{item.label}</span>
				{#if count > 0}
					<span
						class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--c-error)] px-1.5 text-[10px] font-bold text-white"
					>
						{count}
					</span>
				{/if}
			</button>
		{/each}

		<!-- Pedidos (desktop sidebar only) -->
		<button
			onclick={() => goto(resolve('app/orders'))}
			class="relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors"
			style="background:{currentId() === 'pedidos'
				? 'var(--c-brand-light)'
				: 'transparent'};color:{currentId() === 'pedidos'
				? 'var(--c-brand)'
				: 'var(--c-text-primary)'};"
		>
			<Icon name="package" size={20} strokeWidth={currentId() === 'pedidos' ? 2.2 : 1.8} />
			<span class={currentId() === 'pedidos' ? 'font-semibold' : ''}>Pedidos</span>
			{#if orders.activeCount > 0}
				<span
					class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--c-brand)] px-1.5 text-[10px] font-bold text-white"
				>
					{orders.activeCount}
				</span>
			{/if}
		</button>

		<!-- Mis Citas (desktop sidebar) -->
		<button
			onclick={() => goto(resolve('app/appointments'))}
			class="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors"
			style="background:{currentId() === 'mis-citas'
				? 'var(--c-brand-light)'
				: 'transparent'};color:{currentId() === 'mis-citas'
				? 'var(--c-brand)'
				: 'var(--c-text-primary)'};"
		>
			<Icon name="calendar" size={20} strokeWidth={currentId() === 'mis-citas' ? 2.2 : 1.8} />
			<span class={currentId() === 'mis-citas' ? 'font-semibold' : ''}>Mis citas</span>
			{#if citas.proximas.length > 0}
				<span
					class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--c-brand)] px-1.5 text-[10px] font-bold text-white"
				>
					{citas.proximas.length}
				</span>
			{/if}
		</button>

		<!-- Guardados (desktop sidebar) -->
		<button
			onclick={() => goto(resolve('app/saved'))}
			class="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors"
			style="background:{currentId() === 'guardados'
				? 'var(--c-brand-light)'
				: 'transparent'};color:{currentId() === 'guardados'
				? 'var(--c-brand)'
				: 'var(--c-text-primary)'};"
		>
			<Icon name="heart" size={20} strokeWidth={currentId() === 'guardados' ? 2.2 : 1.8} />
			<span class={currentId() === 'guardados' ? 'font-semibold' : ''}>Guardados</span>
		</button>

		<!-- Search button (desktop sidebar) -->
		<button
			onclick={() => (searchOpen = true)}
			class="mt-2 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors"
			style="color:var(--c-text-secondary)"
		>
			<Icon name="search" size={20} strokeWidth={1.8} />
			Buscar
		</button>

		<div class="mt-auto flex flex-col gap-1 border-t border-[var(--c-border-soft)] pt-3">
			<button
				onclick={() => darkMode.toggle()}
				class="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-[var(--c-text-primary)]"
			>
				<Icon name={darkMode.value ? 'sun' : 'moon'} size={20} />
				{darkMode.value ? 'Modo claro' : 'Modo oscuro'}
			</button>
			<div
				class="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5"
				style="background:var(--c-bg-secondary)"
			>
				<div
					class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold text-white"
					style="background:{CURRENT_USER.color}"
				>
					{CURRENT_USER.initials}
				</div>
				<div class="min-w-0 flex-1">
					<div class="truncate text-sm font-semibold">{CURRENT_USER.name}</div>
					<div class="text-[11px] text-[var(--c-text-muted)]">
						{CURRENT_USER.rewards} recompensas
					</div>
				</div>
			</div>
		</div>
	</aside>

	<!-- Main -->
	<main class="flex min-w-0 flex-1 flex-col">
		<!-- Mobile header (oculto dentro de una tienda para ganar espacio) -->
		{#if !isStoreDetail}
			<header
				class="sticky top-0 z-40 flex items-center gap-2.5 border-b border-[var(--c-border-soft)] px-4 py-3 lg:hidden"
				style="background:var(--c-bg-card)"
			>
				<Logo size={32} />
				<span class="font-display text-[17px] font-extrabold tracking-wide">PLAZACOMER</span>
				<div class="ml-auto flex gap-1.5">
					<button
						onclick={() => (searchOpen = true)}
						class="flex h-9 w-9 items-center justify-center rounded-[10px] text-[var(--c-text-secondary)]"
					>
						<Icon name="search" size={19} />
					</button>
					<button
						onclick={() => darkMode.toggle()}
						class="flex h-9 w-9 items-center justify-center rounded-[10px] text-[var(--c-text-secondary)]"
					>
						<Icon name={darkMode.value ? 'sun' : 'moon'} size={19} />
					</button>
				</div>
			</header>
		{/if}

		<div class="flex-1 pb-20 lg:pb-0">
			{@render children()}
		</div>

		<!-- Mobile bottom nav -->
		<nav
			class="fixed right-0 bottom-0 left-0 z-30 flex items-center justify-around border-t border-[var(--c-border-soft)] px-1 lg:hidden"
			style="background:var(--c-bg-card);padding-bottom:max(12px,env(safe-area-inset-bottom));padding-top:8px;box-shadow:0 -4px 20px rgba(0,0,0,.04)"
		>
			{#each isStoreDetail ? STORE_NAV : NAV as item (item.id)}
				{@const active = navActive(item)}
				{@const count = badge(item.id)}
				<button
					onclick={() => onNavClick(item)}
					class="relative flex min-w-14 flex-col items-center gap-0.5 px-2.5 py-1.5"
					style="color:{active ? 'var(--c-brand)' : 'var(--c-text-muted)'}"
				>
					<div class="relative">
						<Icon name={item.icon} size={22} strokeWidth={active ? 2.3 : 1.8} />
						{#if count > 0}
							<span
								class="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--c-error)] px-1 text-[9px] font-bold text-white"
							>
								{count}
							</span>
						{/if}
					</div>
					<span class="text-[10px]" class:font-semibold={active}>{item.label}</span>
				</button>
			{/each}
		</nav>
	</main>
</div>

<GlobalSearch open={searchOpen} onclose={() => (searchOpen = false)} />
