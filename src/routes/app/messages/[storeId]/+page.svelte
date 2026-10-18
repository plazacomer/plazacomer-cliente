<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { messages } from '#lib/stores/app.svelte.js';
	import { getStore } from '#lib/data/mock.js';
	import Icon from '#lib/components/ui/Icon.svelte';
	import TiendaLogo from '#lib/components/TiendaLogo.svelte';

	const tiendaId = $derived(page.params.storeId ?? '');
	const tienda = $derived(getStore(tiendaId));
	const conv = $derived(messages.getConversation(tiendaId));
	const msgs = $derived(conv?.messages ?? []);

	let input = $state('');
	let sending = $state(false);
	let scrollEl = $state<HTMLDivElement | null>(null);

	// Scroll to bottom whenever messages change
	$effect(() => {
		const _ = msgs.length;
		if (scrollEl) {
			// Use setTimeout to let DOM update first
			setTimeout(() => {
				if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
			}, 0);
		}
	});

	onMount(() => {
		messages.markRead(tiendaId);
	});

	function send() {
		const txt = input.trim();
		if (!txt || sending) return;
		input = '';
		sending = true;
		messages.send(tiendaId, txt);
		setTimeout(() => {
			messages.fakeReply(tiendaId);
			sending = false;
		}, 1400);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}
</script>

{#if !tienda}
	<div class="mx-auto max-w-lg px-5 pt-16 text-center">
		<div class="mb-4 text-6xl">💬</div>
		<h2 class="mb-2 font-display text-xl font-bold">Conversación no encontrada</h2>
		<button
			onclick={() => goto(resolve('app/messages'))}
			class="text-sm"
			style="color:var(--c-brand)"
		>
			← Volver a mensajes
		</button>
	</div>
{:else}
	<div
		class="mx-auto flex max-w-[700px] flex-col"
		style="height:calc(100dvh - 60px);padding-bottom:max(0px, env(safe-area-inset-bottom))"
	>
		<!-- Header -->
		<div
			class="sticky top-0 z-10 flex shrink-0 items-center gap-3 border-b px-4 py-3"
			style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
		>
			<button
				onclick={() => goto(resolve('app/messages'))}
				class="flex h-9 w-9 items-center justify-center rounded-[10px] transition-colors hover:bg-[var(--c-bg-secondary)]"
				><Icon name="arrowLeft" size={18} /></button
			>

			<TiendaLogo {tienda} size={40} />

			<div class="min-w-0 flex-1">
				<div class="truncate font-display text-sm font-bold">{tienda.name}</div>
				<div class="flex items-center gap-1.5 text-[11px]" style="color:var(--c-success)">
					<span class="h-1.5 w-1.5 rounded-full" style="background:var(--c-success)"></span>
					En línea
				</div>
			</div>
		</div>

		<!-- Messages -->
		<div
			bind:this={scrollEl}
			class="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-5"
			style="background:var(--c-bg-primary)"
		>
			{#if msgs.length === 0}
				<div class="py-8 text-center">
					<TiendaLogo {tienda} size={56} />
					<div class="mt-3 mb-1 font-display text-sm font-bold">{tienda.name}</div>
					<p class="text-xs" style="color:var(--c-text-muted)">
						Escribe el primer mensaje para iniciar la conversación
					</p>
				</div>
			{:else}
				{#each msgs as msg, idx (idx)}
					{@const isCliente = msg.author === 'customer'}
					<div
						class="animate-fade-in flex"
						style="justify-content:{isCliente ? 'flex-end' : 'flex-start'}"
					>
						<div style="max-width:75%">
							<div
								class="px-3.5 py-2.5 text-sm leading-relaxed"
								style="
									background:{isCliente ? 'var(--c-brand)' : 'var(--c-bg-card)'};
									color:{isCliente ? '#fff' : 'var(--c-text-primary)'};
									border-radius:{isCliente ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};
									border:{isCliente ? 'none' : '1px solid var(--c-border-soft)'};
									box-shadow:0 1px 3px rgba(0,0,0,0.06)
								"
							>
								{msg.text}
							</div>
							<div
								class="mt-1 px-1 text-[10px]"
								style="color:var(--c-text-muted);text-align:{isCliente ? 'right' : 'left'}"
							>
								{msg.time}
							</div>
						</div>
					</div>
				{/each}

				{#if sending}
					<div class="flex" style="justify-content:flex-start">
						<div
							class="flex items-center gap-1.5 rounded-[16px_16px_16px_4px] border px-4 py-3"
							style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
						>
							{#each [0, 1, 2] as i (i)}
								<span
									class="h-1.5 w-1.5 rounded-full"
									style="background:var(--c-text-muted);animation:bounce 1.2s {i * 0.2}s infinite"
								></span>
							{/each}
						</div>
					</div>
				{/if}
			{/if}
		</div>

		<!-- Input bar -->
		<div
			class="flex shrink-0 items-center gap-2.5 border-t px-3 py-3"
			style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
		>
			<input
				bind:value={input}
				onkeydown={handleKeydown}
				placeholder="Escribe un mensaje..."
				class="flex-1 rounded-full px-4 py-2.5 text-sm outline-none"
				style="background:var(--c-bg-secondary);color:var(--c-text-primary)"
			/>
			<button
				onclick={send}
				disabled={!input.trim() || sending}
				class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all"
				style="
					background:{input.trim() ? 'var(--c-brand)' : 'var(--c-bg-secondary)'};
					color:{input.trim() ? '#fff' : 'var(--c-text-muted)'};
					box-shadow:{input.trim() ? '0 4px 20px rgba(37,99,235,0.28)' : 'none'}
				"
			>
				<Icon name="send" size={18} />
			</button>
		</div>
	</div>
{/if}

<style>
	@keyframes bounce {
		0%,
		80%,
		100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(-5px);
		}
	}
</style>
