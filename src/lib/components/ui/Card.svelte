<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		class?: string;
		children?: Snippet;
	};
	let { class: cls = '', children }: Props = $props();
</script>

<div
	class={cn(
		'bg-[var(--c-bg-card)] border border-[var(--c-border-soft)] rounded-[18px] overflow-hidden shadow-[var(--shadow-sm)]',
		cls
	)}
>
	{#if children}{@render children()}{/if}
</div>
