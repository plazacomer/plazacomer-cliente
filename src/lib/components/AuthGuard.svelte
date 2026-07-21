<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	$effect(() => {
		if (!authStore.loading && !authStore.isAuthenticated) {
			goto('/login');
		}
	});
</script>

{#if authStore.loading}
	<div class="min-h-screen flex items-center justify-center" style="background:var(--c-bg-primary)">
		<div
			class="w-8 h-8 border-2 rounded-full animate-spin"
			style="border-color:var(--c-border);border-top-color:var(--c-brand)"
		></div>
	</div>
{:else if authStore.isAuthenticated}
	{@render children()}
{/if}
