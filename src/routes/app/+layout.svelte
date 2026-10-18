<script lang="ts">
	import AppShell from '#lib/components/AppShell.svelte';
	import AuthGuard from '#lib/components/AuthGuard.svelte';
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<AuthGuard>
	<AppShell>
		{@render children()}
	</AppShell>
</AuthGuard>
