<script lang="ts">
	import { getCategory } from '#lib/data/mock.js';

	type Props = { catKey: string; showIcon?: boolean };
	let { catKey, showIcon = true }: Props = $props();

	const cat = $derived(getCategory(catKey));
</script>

<span
	style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:9999px;font-size:11px;font-weight:600;background:{cat.color};color:#fff"
>
	{#if showIcon}<span>{cat.emoji}</span>{/if}
	{cat.label}
</span>
