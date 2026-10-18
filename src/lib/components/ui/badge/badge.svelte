<script lang="ts" module>
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { type VariantProps, tv } from 'tailwind-variants';
	import { cn, type WithElementRef } from '$lib/utils.js';

	export const badgeVariants = tv({
		base: 'inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 gap-1 [&>svg]:size-3 [&>svg]:pointer-events-none transition-[color,box-shadow] overflow-hidden',
		variants: {
			variant: {
				default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
				secondary:
					'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
				destructive: 'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90',
				outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
				brand: 'border-transparent bg-[var(--c-brand-light)] text-[var(--c-brand)]',
				accent: 'border-transparent bg-[var(--c-accent-light)] text-[var(--c-accent)]',
				success: 'border-transparent bg-[var(--c-success-light)] text-[var(--c-success)]',
				warning: 'border-transparent bg-[var(--c-warning-light)] text-[var(--c-warning)]',
				error: 'border-transparent bg-[var(--c-error-light)] text-[var(--c-error)]',
				promo: 'border-transparent bg-[var(--c-promo-light)] text-[var(--c-promo)]',
				beauty: 'border-transparent bg-[var(--c-beauty-light)] text-[var(--c-beauty)]'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		href,
		class: className,
		variant = 'default',
		children,
		...restProps
	}: WithElementRef<HTMLAnchorAttributes> & {
		variant?: BadgeVariant;
	} = $props();
</script>

{#if href}
	<!-- Wrapper genérico: quien lo usa pasa un href ya resuelto con resolve(). -->
	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<a
		bind:this={ref}
		data-slot="badge"
		class={cn(badgeVariants({ variant }), className)}
		{href}
		{...restProps}
	>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
		{@render children?.()}
	</a>
{:else}
	<span
		bind:this={ref}
		data-slot="badge"
		class={cn(badgeVariants({ variant }), className)}
		{...restProps as Record<string, unknown>}
	>
		{@render children?.()}
	</span>
{/if}
