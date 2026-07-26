<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Icon from './ui/Icon.svelte';
	import Logo from './Logo.svelte';
	import GlobalSearch from './GlobalSearch.svelte';
	import { darkMode, cart, orders, messages } from '$lib/stores/app.svelte';
	import { citas } from '$lib/stores/citas.svelte';
	import { storeUi } from '$lib/stores/storeUi.svelte';
	import { CURRENT_USER } from '$lib/data/mock';
	import type { Snippet } from 'svelte';

	type Props = { children: Snippet };
	let { children }: Props = $props();

	let searchOpen = $state(false);

	const NAV = [
		{ id: 'inicio',   label: 'Inicio',   icon: 'home',    path: '/app/home' },
		{ id: 'explorar', label: 'Explorar', icon: 'search',  path: '/app/explore' },
		{ id: 'carrito',  label: 'Carrito',  icon: 'cart',    path: '/app/cart' },
		{ id: 'mensajes', label: 'Mensajes', icon: 'message', path: '/app/messages' },
		{ id: 'perfil',   label: 'Perfil',   icon: 'user',    path: '/app/profile' },
	];

	// Dentro de una tienda, la barra inferior se dedica a esa tienda en vez
	// de a la navegación global — más espacio y más foco para comprar.
	const STORE_NAV = [
		{ id: 'search',   label: 'Buscar',   icon: 'search'  },
		{ id: 'promos',   label: 'Promos',   icon: 'fire'    },
		{ id: 'carrito',  label: 'Carrito',  icon: 'cart',    path: '/app/cart' },
		{ id: 'mensajes', label: 'Mensajes', icon: 'message', path: '/app/messages' },
		{ id: 'info',     label: 'Tienda',   icon: 'store'   },
	];

	const isStoreDetail = $derived($page.url.pathname.startsWith('/app/store/'));

	function currentId() {
		const seg = $page.url.pathname.split('/')[2] ?? 'inicio';
		return seg;
	}

	function navActive(item: { id: string }) {
		return isStoreDetail ? storeUi.tab === item.id : currentId() === item.id;
	}

	function onNavClick(item: { id: string; path?: string }) {
		if (item.path) goto(item.path);
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
	<aside class="hidden lg:flex flex-col w-60 shrink-0 sticky top-0 h-screen border-r border-[var(--c-border)] p-4 gap-1"
		style="background:var(--c-bg-card)">
		<a href="/app/home" class="flex items-center gap-2.5 px-3 pb-6 pt-2">
			<Logo size={36}/>
			<div>
				<div class="font-display text-base font-extrabold tracking-wide">PLAZACOMER</div>
				<div class="text-[10px] text-[var(--c-text-muted)] tracking-widest uppercase">Tiendas · Servicios</div>
			</div>
		</a>

		{#each NAV as item}
			{@const active = currentId() === item.id}
			{@const count = badge(item.id)}
			<button
				onclick={() => goto(item.path)}
				class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors relative"
				style="background:{active ? 'var(--c-brand-light)' : 'transparent'};color:{active ? 'var(--c-brand)' : 'var(--c-text-primary)'};"
			>
				<Icon name={item.icon} size={20} strokeWidth={active ? 2.2 : 1.8}/>
				<span class={active ? 'font-semibold' : ''}>{item.label}</span>
				{#if count > 0}
					<span class="ml-auto text-[10px] font-bold text-white bg-[var(--c-error)] min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center">
						{count}
					</span>
				{/if}
			</button>
		{/each}

		<!-- Pedidos (desktop sidebar only) -->
		<button
			onclick={() => goto('/app/orders')}
			class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors relative"
			style="background:{currentId() === 'pedidos' ? 'var(--c-brand-light)' : 'transparent'};color:{currentId() === 'pedidos' ? 'var(--c-brand)' : 'var(--c-text-primary)'};"
		>
			<Icon name="package" size={20} strokeWidth={currentId() === 'pedidos' ? 2.2 : 1.8}/>
			<span class={currentId() === 'pedidos' ? 'font-semibold' : ''}>Pedidos</span>
			{#if orders.activeCount > 0}
				<span class="ml-auto text-[10px] font-bold text-white bg-[var(--c-brand)] min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center">
					{orders.activeCount}
				</span>
			{/if}
		</button>

		<!-- Mis Citas (desktop sidebar) -->
		<button
			onclick={() => goto('/app/appointments')}
			class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors"
			style="background:{currentId() === 'mis-citas' ? 'var(--c-brand-light)' : 'transparent'};color:{currentId() === 'mis-citas' ? 'var(--c-brand)' : 'var(--c-text-primary)'};"
		>
			<Icon name="calendar" size={20} strokeWidth={currentId() === 'mis-citas' ? 2.2 : 1.8}/>
			<span class={currentId() === 'mis-citas' ? 'font-semibold' : ''}>Mis citas</span>
			{#if citas.proximas.length > 0}
				<span class="ml-auto text-[10px] font-bold text-white bg-[var(--c-brand)] min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center">
					{citas.proximas.length}
				</span>
			{/if}
		</button>

		<!-- Guardados (desktop sidebar) -->
		<button
			onclick={() => goto('/app/saved')}
			class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors"
			style="background:{currentId() === 'guardados' ? 'var(--c-brand-light)' : 'transparent'};color:{currentId() === 'guardados' ? 'var(--c-brand)' : 'var(--c-text-primary)'};"
		>
			<Icon name="heart" size={20} strokeWidth={currentId() === 'guardados' ? 2.2 : 1.8}/>
			<span class={currentId() === 'guardados' ? 'font-semibold' : ''}>Guardados</span>
		</button>

		<!-- Search button (desktop sidebar) -->
		<button
			onclick={() => (searchOpen = true)}
			class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors mt-2"
			style="color:var(--c-text-secondary)"
		>
			<Icon name="search" size={20} strokeWidth={1.8}/>
			Buscar
		</button>

		<div class="mt-auto border-t border-[var(--c-border-soft)] pt-3 flex flex-col gap-1">
			<button
				onclick={() => darkMode.toggle()}
				class="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm text-[var(--c-text-primary)]"
			>
				<Icon name={darkMode.value ? 'sun' : 'moon'} size={20}/>
				{darkMode.value ? 'Modo claro' : 'Modo oscuro'}
			</button>
			<div class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mt-1" style="background:var(--c-bg-secondary)">
				<div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold font-display shrink-0"
					style="background:{CURRENT_USER.color}">
					{CURRENT_USER.initials}
				</div>
				<div class="flex-1 min-w-0">
					<div class="text-sm font-semibold truncate">{CURRENT_USER.name}</div>
					<div class="text-[11px] text-[var(--c-text-muted)]">{CURRENT_USER.rewards} recompensas</div>
				</div>
			</div>
		</div>
	</aside>

	<!-- Main -->
	<main class="flex-1 min-w-0 flex flex-col">
		<!-- Mobile header (oculto dentro de una tienda para ganar espacio) -->
		{#if !isStoreDetail}
			<header class="lg:hidden sticky top-0 z-40 flex items-center gap-2.5 px-4 py-3 border-b border-[var(--c-border-soft)]"
				style="background:var(--c-bg-card)">
				<Logo size={32}/>
				<span class="font-display text-[17px] font-extrabold tracking-wide">PLAZACOMER</span>
				<div class="ml-auto flex gap-1.5">
					<button
						onclick={() => (searchOpen = true)}
						class="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--c-text-secondary)]"
					>
						<Icon name="search" size={19}/>
					</button>
					<button
						onclick={() => darkMode.toggle()}
						class="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--c-text-secondary)]"
					>
						<Icon name={darkMode.value ? 'sun' : 'moon'} size={19}/>
					</button>
				</div>
			</header>
		{/if}

		<div class="flex-1 pb-20 lg:pb-0">
			{@render children()}
		</div>

		<!-- Mobile bottom nav -->
		<nav
			class="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex justify-around items-center px-1 border-t border-[var(--c-border-soft)]"
			style="background:var(--c-bg-card);padding-bottom:max(12px,env(safe-area-inset-bottom));padding-top:8px;box-shadow:0 -4px 20px rgba(0,0,0,.04)"
		>
			{#each (isStoreDetail ? STORE_NAV : NAV) as item}
				{@const active = navActive(item)}
				{@const count = badge(item.id)}
				<button
					onclick={() => onNavClick(item)}
					class="flex flex-col items-center gap-0.5 px-2.5 py-1.5 min-w-14 relative"
					style="color:{active ? 'var(--c-brand)' : 'var(--c-text-muted)'}"
				>
					<div class="relative">
						<Icon name={item.icon} size={22} strokeWidth={active ? 2.3 : 1.8}/>
						{#if count > 0}
							<span class="absolute -top-1 -right-2 text-[9px] font-bold text-white bg-[var(--c-error)] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
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

<GlobalSearch open={searchOpen} onclose={() => (searchOpen = false)}/>
