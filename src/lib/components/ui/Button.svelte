<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Variant = 'brand' | 'accent' | 'ghost' | 'outline' | 'danger' | 'dark' | 'promo';
	type Size = 'sm' | 'md' | 'lg';

	type Props = {
		variant?: Variant;
		size?: Size;
		fullWidth?: boolean;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
		onclick?: () => void;
		children?: Snippet;
	};

	let {
		variant = 'brand',
		size = 'md',
		fullWidth = false,
		disabled = false,
		type = 'button',
		class: cls = '',
		onclick,
		children,
	}: Props = $props();

	const variantStyles: Record<Variant, string> = {
		brand:   'bg-[var(--c-brand)] text-white hover:bg-[var(--c-brand-hover)] shadow-[var(--shadow-brand)]',
		accent:  'bg-[var(--c-accent)] text-white hover:opacity-90',
		ghost:   'bg-[var(--c-bg-secondary)] text-[var(--c-text-primary)] hover:bg-[var(--c-border)]',
		outline: 'bg-transparent text-[var(--c-brand)] border border-[var(--c-brand)] hover:bg-[var(--c-brand-light)]',
		danger:  'bg-[var(--c-error)] text-white hover:opacity-90',
		dark:    'bg-[var(--c-text-primary)] text-[var(--c-bg-card)] hover:opacity-90',
		promo:   'bg-[var(--c-promo)] text-white hover:opacity-90',
	};

	const sizeStyles: Record<Size, string> = {
		sm: 'px-3.5 py-1.5 text-xs rounded-lg',
		md: 'px-5 py-2.5 text-sm rounded-xl',
		lg: 'px-6 py-3.5 text-[15px] rounded-[14px]',
	};
</script>

<button
	{type}
	{disabled}
	{onclick}
	class={cn(
		'inline-flex items-center justify-center gap-2 font-semibold font-sans cursor-pointer transition-all duration-150 select-none',
		variantStyles[variant],
		sizeStyles[size],
		fullWidth && 'w-full',
		disabled && 'opacity-50 cursor-not-allowed',
		cls
	)}
>
	{#if children}
		{@render children()}
	{/if}
</button>
