<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import DialogPortal from './dialog-portal.svelte';
	import type { Snippet } from 'svelte';
	import * as Dialog from './index.js';
	import { cn, type WithoutChildrenOrChild } from '$lib/utils.js';
	import type { ComponentProps } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import XIcon from '@lucide/svelte/icons/x';

	let {
		ref = $bindable(null),
		class: className,
		portalProps,
		children,
		showCloseButton = true,
		...restProps
	}: WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof DialogPortal>>;
		children: Snippet;
		showCloseButton?: boolean;
	} = $props();
</script>

<DialogPortal {...portalProps}>
	<Dialog.Overlay />
	<DialogPrimitive.Content
		bind:ref
		data-slot="dialog-content"
		class={cn(
			'fixed inset-x-0 bottom-0 z-modal grid max-h-[90vh] w-full gap-4 overflow-y-auto rounded-t-[24px] bg-[var(--c-bg-card)] p-6 text-[var(--c-text-primary)] shadow-[var(--shadow-lg)] duration-150 outline-none md:top-1/2 md:bottom-auto md:left-1/2 md:w-full md:max-w-sm md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[24px] data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom md:data-open:slide-in-from-bottom-0 md:data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-bottom md:data-closed:slide-out-to-bottom-0 md:data-closed:zoom-out-95',
			className
		)}
		{...restProps}
	>
		{@render children?.()}
		{#if showCloseButton}
			<DialogPrimitive.Close data-slot="dialog-close">
				{#snippet child({ props })}
					<Button
						variant="ghost"
						class="absolute top-3 right-3 h-8 w-8 rounded-full p-0"
						size="icon-sm"
						{...props}
					>
						<XIcon />
						<span class="sr-only">Cerrar</span>
					</Button>
				{/snippet}
			</DialogPrimitive.Close>
		{/if}
	</DialogPrimitive.Content>
</DialogPortal>
