<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<div class="min-h-screen" style="background:var(--c-bg-primary)">
	{@render children()}
</div>
