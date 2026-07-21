<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Variant = 'default' | 'brand' | 'accent' | 'success' | 'warning' | 'error' | 'promo' | 'beauty';

	type Props = {
		variant?: Variant;
		class?: string;
		children?: Snippet;
	};

	let { variant = 'default', class: cls = '', children }: Props = $props();

	const styles: Record<Variant, string> = {
		default:  'bg-[var(--c-bg-secondary)] text-[var(--c-text-primary)]',
		brand:    'bg-[var(--c-brand-light)] text-[var(--c-brand)]',
		accent:   'bg-[var(--c-accent-light)] text-[var(--c-accent)]',
		success:  'bg-[var(--c-success-light)] text-[var(--c-success)]',
		warning:  'bg-[var(--c-warning-light)] text-[var(--c-warning)]',
		error:    'bg-[var(--c-error-light)] text-[var(--c-error)]',
		promo:    'bg-[var(--c-promo-light)] text-[var(--c-promo)]',
		beauty:   'bg-[var(--c-beauty-light)] text-[var(--c-beauty)]',
	};
</script>

<span
	class={cn(
		'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-sans',
		styles[variant],
		cls
	)}
>
	{#if children}{@render children()}{/if}
</span>
