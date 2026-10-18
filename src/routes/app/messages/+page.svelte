<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { messages } from '#lib/stores/app.svelte.js';
	import { getStore } from '#lib/data/mock.js';
	import TiendaLogo from '#lib/components/TiendaLogo.svelte';
</script>

<div class="mx-auto max-w-[700px] px-4 pt-5 pb-12">
	<h1 class="mb-1 font-display text-[26px] font-extrabold">Mensajes</h1>

	<p class="mb-5 text-sm" style="color:var(--c-text-secondary)">
		Chatea directamente con tus tiendas
	</p>

	{#if messages.conversations.length === 0}
		<div class="pt-10 text-center">
			<div class="mb-4 text-6xl">💬</div>
			<p class="text-sm" style="color:var(--c-text-secondary)">
				Aún no tienes conversaciones. Escríbele a una tienda desde su perfil.
			</p>
		</div>
	{:else}
		<div class="flex flex-col gap-2">
			{#each messages.conversations as conv (conv.storeId)}
				{@const tienda = getStore(conv.storeId)}
				<button
					onclick={() => goto(resolve(`app/messages/${conv.storeId}`))}
					class="flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all hover:border-[var(--c-brand)]"
					style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
				>
					<!-- Avatar with unread badge -->
					<div class="relative shrink-0">
						<TiendaLogo {tienda} size={48} />
						{#if conv.unreadCount > 0}
							<span
								class="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 px-1.5 text-[10px] font-bold text-white"
								style="background:var(--c-error);border-color:var(--c-bg-card)"
							>
								{conv.unreadCount}
							</span>
						{/if}
					</div>

					<!-- Content -->
					<div class="min-w-0 flex-1">
						<div class="mb-0.5 flex items-center justify-between">
							<span
								class="font-display text-sm"
								style="font-weight:{conv.unreadCount > 0 ? 700 : 600}"
							>
								{tienda.name}
							</span>
							<span class="ml-2 shrink-0 text-[11px]" style="color:var(--c-text-muted)">
								{conv.timeAgo}
							</span>
						</div>
						<div
							class="truncate text-[13px]"
							style="color:{conv.unreadCount > 0
								? 'var(--c-text-primary)'
								: 'var(--c-text-secondary)'};font-weight:{conv.unreadCount > 0 ? 500 : 400}"
						>
							{conv.lastMessage}
						</div>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>
