<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { darkMode } from '$lib/stores/app.svelte';
	import { toast } from '$lib/stores/app.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { onMount } from 'svelte';
	import { goto, beforeNavigate } from '$app/navigation';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	onMount(() => {
		document.documentElement.classList.toggle('dark', darkMode.value);
	});

	const PROTECTED = ['/app', '/seller', '/courier'];

	beforeNavigate(({ to }) => {
		if (!to) return;

		const path = to.url.pathname;
		const needsAuth = PROTECTED.some((p) => path.startsWith(p));

		if (needsAuth && !authStore.loading && !authStore.isAuthenticated) {
			goto(resolve('/login'));
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
<!-- Global toast -->

{#if toast.message}
	<div
		class="animate-slide-up fixed bottom-24 left-1/2 z-[200] -translate-x-1/2 lg:bottom-6"
		style="background:var(--c-text-primary);color:var(--c-bg-card);padding:12px 20px;border-radius:9999px;font-size:13px;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,.3);max-width:90vw;white-space:nowrap"
	>
		{toast.message}
	</div>
{/if}

<div style="display:none">
	{#each locales as locale (locale)}
		<!-- Plantilla de `sv add paraglide`: localizeHref devuelve la ruta con prefijo de idioma,
		     que no es un Pathname tipado; el cast es intencional. -->
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href={(resolve as (path: string) => string)(localizeHref(page.url.pathname, { locale }))}
			>{locale}</a
		>
	{/each}
</div>
