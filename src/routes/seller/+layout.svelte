<script lang="ts">
	import { resolve } from '$app/paths';
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
		{ id: '', label: 'Dashboard', icon: 'home', path: '/seller' },
		{ id: 'pedidos', label: 'Pedidos', icon: 'package', path: '/seller/orders' },
		{ id: 'citas', label: 'Citas', icon: 'calendar', path: '/seller/appointments' },
		{ id: 'catalogo', label: 'Catálogo', icon: 'store', path: '/seller/catalog' },
		{ id: 'ofertas', label: 'Ofertas', icon: 'tag', path: '/seller/deals' },
		{ id: 'fidelidad', label: 'Fidelidad', icon: 'heart', path: '/seller/loyalty' }
	] as const;

	function currentId() {
		const segs = $page.url.pathname.split('/');
		return segs[2] ?? '';
	}
</script>

<AuthGuard>
	<div class="flex min-h-screen" style="background:var(--c-bg-primary)">
		<!-- Sidebar desktop -->
		<aside
			class="sticky top-0 hidden h-screen w-56 shrink-0 flex-col gap-1 border-r border-[var(--c-border)] p-4 lg:flex"
			style="background:var(--c-bg-card)"
		>
			<div class="flex items-center gap-2 px-2 pt-1 pb-5">
				<Logo size={30} />
				<div>
					<div class="font-display text-[13px] font-extrabold tracking-wide">PLAZACOMER</div>
					<div
						class="text-[9.5px] font-bold tracking-widest uppercase"
						style="color:var(--c-brand)"
					>
						Panel Vendedor
					</div>
				</div>
			</div>

			<!-- Tienda chip -->
			<div
				class="mb-2 flex items-center gap-2.5 rounded-xl px-3 py-2.5"
				style="background:var(--c-bg-secondary)"
			>
				<div class="text-xl">{vendedor.tienda?.emoji}</div>
				<div class="min-w-0 flex-1">
					<div class="truncate text-[12.5px] font-bold">{vendedor.tienda?.name}</div>
					<div
						class="mt-0.5 flex items-center gap-1 text-[10px]"
						style="color:{vendedor.abierto ? 'var(--c-success)' : 'var(--c-error)'}"
					>
						<div class="h-1.5 w-1.5 rounded-full" style="background:currentColor"></div>
						{vendedor.abierto ? 'Abierto' : 'Cerrado'}
					</div>
				</div>
			</div>

			{#each NAV as item (item.id)}
				{@const active = currentId() === item.id}
				<button
					onclick={() => goto(resolve(item.path))}
					class="relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors"
					style="background:{active ? 'var(--c-brand-light)' : 'transparent'};color:{active
						? 'var(--c-brand)'
						: 'var(--c-text-primary)'}"
				>
					<Icon name={item.icon} size={18} strokeWidth={active ? 2.2 : 1.8} />
					<span class={active ? 'font-semibold' : ''}>{item.label}</span>
					{#if item.id === 'pedidos' && vendedor.pedidosActivos.length > 0}
						<span
							class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--c-brand)] px-1.5 text-[10px] font-bold text-white"
						>
							{vendedor.pedidosActivos.length}
						</span>
					{:else if item.id === 'citas' && vendedor.citasPendientes.length > 0}
						<span
							class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--c-error)] px-1.5 text-[10px] font-bold text-white"
						>
							{vendedor.citasPendientes.length}
						</span>
					{/if}
				</button>
			{/each}

			<div class="mt-auto border-t border-[var(--c-border-soft)] pt-3">
				<button
					onclick={() => goto(resolve('/app/home'))}
					class="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm"
					style="color:var(--c-text-secondary)"
				>
					<Icon name="arrowLeft" size={18} />
					Volver a la app
				</button>
			</div>
		</aside>

		<!-- Main -->
		<main class="flex min-w-0 flex-1 flex-col">
			<!-- Mobile header -->
			<header
				class="sticky top-0 z-40 flex items-center gap-3 border-b border-[var(--c-border-soft)] px-4 py-3 lg:hidden"
				style="background:var(--c-bg-card)"
			>
				<Logo size={28} />
				<div>
					<div class="font-display text-[14px] font-extrabold">PLAZACOMER</div>
					<div class="text-[9px] font-bold tracking-widest uppercase" style="color:var(--c-brand)">
						Panel Vendedor
					</div>
				</div>
				<div class="ml-auto flex items-center gap-2">
					<div
						class="rounded-full px-2.5 py-1 text-[11px] font-semibold"
						style="background:{vendedor.abierto
							? 'rgba(22,163,74,.1)'
							: 'rgba(220,38,38,.08)'};color:{vendedor.abierto
							? 'var(--c-success)'
							: 'var(--c-error)'}"
					>
						● {vendedor.abierto ? 'Abierto' : 'Cerrado'}
					</div>
				</div>
			</header>

			<div class="flex-1 pb-24 lg:pb-0">
				{@render children()}
			</div>

			<!-- Mobile bottom nav -->
			<nav
				class="fixed right-0 bottom-0 left-0 z-30 flex items-center justify-around border-t border-[var(--c-border-soft)] px-1 lg:hidden"
				style="background:var(--c-bg-card);padding-bottom:max(12px,env(safe-area-inset-bottom));padding-top:8px"
			>
				{#each NAV as item (item.id)}
					{@const active = currentId() === item.id}
					<button
						onclick={() => goto(resolve(item.path))}
						class="relative flex min-w-14 flex-col items-center gap-0.5 px-2.5 py-1.5"
						style="color:{active ? 'var(--c-brand)' : 'var(--c-text-muted)'}"
					>
						<div class="relative">
							<Icon name={item.icon} size={22} strokeWidth={active ? 2.3 : 1.8} />
							{#if item.id === 'pedidos' && vendedor.pedidosActivos.length > 0}
								<span
									class="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--c-error)] px-1 text-[9px] font-bold text-white"
								>
									{vendedor.pedidosActivos.length}
								</span>
							{:else if item.id === 'citas' && vendedor.citasPendientes.length > 0}
								<span
									class="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--c-error)] px-1 text-[9px] font-bold text-white"
								>
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
