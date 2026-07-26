<script lang="ts">
	import { goto } from '$app/navigation';
	import { messages } from '$lib/stores/app.svelte';
	import { getStore } from '$lib/data/mock';
	import TiendaLogo from '$lib/components/TiendaLogo.svelte';
</script>

<div class="max-w-[700px] mx-auto px-4 pt-5 pb-12">
	<h1 class="font-display text-[26px] font-extrabold mb-1">Mensajes</h1>
	<p class="text-sm mb-5" style="color:var(--c-text-secondary)">
		Chatea directamente con tus tiendas
	</p>

	{#if messages.conversations.length === 0}
		<div class="text-center pt-10">
			<div class="text-6xl mb-4">💬</div>
			<p class="text-sm" style="color:var(--c-text-secondary)">
				Aún no tienes conversaciones. Escríbele a una tienda desde su perfil.
			</p>
		</div>
	{:else}
		<div class="flex flex-col gap-2">
			{#each messages.conversations as conv}
				{@const tienda = getStore(conv.storeId)}
				<button
					onclick={() => goto(`/app/messages/${conv.storeId}`)}
					class="flex items-center gap-3 p-3.5 rounded-xl border text-left w-full transition-all hover:border-[var(--c-brand)]"
					style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
				>
					<!-- Avatar with unread badge -->
					<div class="relative shrink-0">
						<TiendaLogo tienda={tienda} size={48} />
						{#if conv.unreadCount > 0}
							<span
								class="absolute -top-0.5 -right-0.5 flex items-center justify-center text-[10px] font-bold text-white min-w-5 h-5 rounded-full px-1.5 border-2"
								style="background:var(--c-error);border-color:var(--c-bg-card)"
							>
								{conv.unreadCount}
							</span>
						{/if}
					</div>

					<!-- Content -->
					<div class="flex-1 min-w-0">
						<div class="flex items-center justify-between mb-0.5">
							<span
								class="font-display text-sm"
								style="font-weight:{conv.unreadCount > 0 ? 700 : 600}"
							>
								{tienda.name}
							</span>
							<span class="text-[11px] shrink-0 ml-2" style="color:var(--c-text-muted)">
								{conv.timeAgo}
							</span>
						</div>
						<div
							class="text-[13px] truncate"
							style="color:{conv.unreadCount > 0 ? 'var(--c-text-primary)' : 'var(--c-text-secondary)'};font-weight:{conv.unreadCount > 0 ? 500 : 400}"
						>
							{conv.lastMessage}
						</div>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>
