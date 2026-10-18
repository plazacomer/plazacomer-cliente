<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { authStore } from '#lib/stores/auth.svelte.js';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	$effect(() => {
		if (!authStore.loading && !authStore.isAuthenticated) {
			goto(resolve('login'));
		}
	});
</script>

{#if authStore.loading}
	<div class="flex min-h-screen items-center justify-center" style="background:var(--c-bg-primary)">
		<div
			class="h-8 w-8 animate-spin rounded-full border-2"
			style="border-color:var(--c-border);border-top-color:var(--c-brand)"
		></div>
	</div>
{:else if authStore.isAuthenticated}
	{@render children()}
{/if}
