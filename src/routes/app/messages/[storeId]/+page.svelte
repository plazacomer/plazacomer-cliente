<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { messages } from '$lib/stores/app.svelte';
	import { getStore } from '$lib/data/mock';
	import Icon from '$lib/components/ui/Icon.svelte';
	import TiendaLogo from '$lib/components/TiendaLogo.svelte';

	const tiendaId = $derived($page.params.storeId ?? '');
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
	<div class="max-w-lg mx-auto px-5 pt-16 text-center">
		<div class="text-6xl mb-4">💬</div>
		<h2 class="font-display text-xl font-bold mb-2">Conversación no encontrada</h2>
		<button onclick={() => goto('/app/messages')} class="text-sm" style="color:var(--c-brand)">
			← Volver a mensajes
		</button>
	</div>
{:else}
	<div
		class="max-w-[700px] mx-auto flex flex-col"
		style="height:calc(100dvh - 60px);padding-bottom:max(0px, env(safe-area-inset-bottom))"
	>
		<!-- Header -->
		<div
			class="flex items-center gap-3 px-4 py-3 border-b sticky top-0 z-10 shrink-0"
			style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
		>
			<button
				onclick={() => goto('/app/messages')}
				class="w-9 h-9 rounded-[10px] flex items-center justify-center transition-colors hover:bg-[var(--c-bg-secondary)]"
			>
				<Icon name="arrowLeft" size={18} />
			</button>
			<TiendaLogo tienda={tienda} size={40} />
			<div class="flex-1 min-w-0">
				<div class="font-display text-sm font-bold truncate">{tienda.name}</div>
				<div class="flex items-center gap-1.5 text-[11px]" style="color:var(--c-success)">
					<span class="w-1.5 h-1.5 rounded-full" style="background:var(--c-success)"></span>
					En línea
				</div>
			</div>
		</div>

		<!-- Messages -->
		<div
			bind:this={scrollEl}
			class="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-2.5"
			style="background:var(--c-bg-primary)"
		>
			{#if msgs.length === 0}
				<div class="text-center py-8">
					<TiendaLogo tienda={tienda} size={56} />
					<div class="font-display text-sm font-bold mt-3 mb-1">{tienda.name}</div>
					<p class="text-xs" style="color:var(--c-text-muted)">
						Escribe el primer mensaje para iniciar la conversación
					</p>
				</div>
			{:else}
				{#each msgs as msg, i}
					{@const isCliente = msg.author === 'customer'}
					{@const isFirst = i === 0 || msgs[i - 1].author !== msg.author}
					<div
						class="flex animate-fade-in"
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
								class="text-[10px] mt-1 px-1"
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
							class="px-4 py-3 rounded-[16px_16px_16px_4px] border flex items-center gap-1.5"
							style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
						>
							{#each [0, 1, 2] as i}
								<span
									class="w-1.5 h-1.5 rounded-full"
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
			class="flex items-center gap-2.5 px-3 py-3 border-t shrink-0"
			style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
		>
			<input
				bind:value={input}
				onkeydown={handleKeydown}
				placeholder="Escribe un mensaje..."
				class="flex-1 px-4 py-2.5 rounded-full text-sm outline-none"
				style="background:var(--c-bg-secondary);color:var(--c-text-primary)"
			/>
			<button
				onclick={send}
				disabled={!input.trim() || sending}
				class="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all"
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
		0%, 80%, 100% { transform: translateY(0); }
		40%           { transform: translateY(-5px); }
	}
</style>
