<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { orders, toast } from '$lib/stores/app.svelte';
	import { getStore, getProduct, getCategory } from '$lib/data/mock';
	import { fmtCOP } from '$lib/utils';
	import TiendaLogo from '$lib/components/TiendaLogo.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import Icon from '$lib/components/ui/Icon.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { OrderStatus } from '$lib/stores/app.svelte';

	const id = $derived($page.params.id ?? '');
	const pedido = $derived(orders.get(id));
	const tienda = $derived(pedido ? getStore(pedido.storeId) : null);

	const estadoMap: Record<OrderStatus, { variant: 'brand' | 'accent' | 'success' | 'error' | 'default'; label: string }> = {
		confirmed: { variant: 'brand', label: '✓ Confirmado' },
		preparing: { variant: 'accent', label: '⏳ Preparando' },
		shipping:  { variant: 'brand', label: '🚚 En camino' },
		delivered: { variant: 'success', label: '✅ Entregado' },
		cancelled: { variant: 'error', label: '✕ Cancelado' },
	};

	const puedeCancelar = $derived(pedido && ['confirmed', 'preparing'].includes(pedido.status));
	const puedeCalificar = $derived(pedido?.status === 'delivered');

	// Buzón de sugerencias
	let buzonOpen = $state(false);
	let buzonRating = $state(0);
	let buzonTexto = $state('');
	let buzonError = $state('');
	let buzonSubmitted = $state(false);

	function handleBuzonSubmit() {
		if (buzonRating === 0) { buzonError = 'Selecciona una calificación'; return; }
		if (buzonTexto.trim().length < 10) { buzonError = 'Escribe al menos 10 caracteres'; return; }
		buzonError = '';
		buzonSubmitted = true;
		setTimeout(() => {
			orders.markReviewPromptSent(id, '🎁 +20 puntos de recompensa');
			buzonOpen = false;
			buzonSubmitted = false;
			buzonRating = 0;
			buzonTexto = '';
			toast.show('✓ Sugerencia enviada a ' + tienda?.name);
		}, 1500);
	}

	// Cancel modal
	let cancelOpen = $state(false);
	const MOTIVOS = [
		'Ya no lo necesito',
		'La tienda tardó mucho',
		'Pedí algo equivocado',
		'Problema con la dirección',
		'Otro',
	];
	let motivoSeleccionado = $state('');

	function handleCancelConfirm() {
		if (!motivoSeleccionado) return;
		orders.cancel(id);
		cancelOpen = false;
		toast.show('Pedido ' + pedido?.number + ' cancelado');
	}

	function handleMapCTA() {
		toast.show('🗺️ Mapa en tiempo real — Próximamente');
	}

	const EMOJIS = ['😞', '🙁', '😐', '🙂', '😍'];
</script>

{#if !pedido || !tienda}
	<div class="max-w-lg mx-auto px-5 pt-16 text-center">
		<div class="text-6xl mb-4">📦</div>
		<h2 class="font-display text-xl font-bold mb-2">Pedido no encontrado</h2>
		<Button variant="ghost" onclick={() => goto('/app/orders')}>
			<Icon name="arrowLeft" size={16} />
			Volver a pedidos
		</Button>
	</div>
{:else}
	{@const estado = estadoMap[pedido.status]}

	<div class="max-w-[800px] mx-auto px-4 pt-5 pb-12 animate-fade-in">
		<!-- Header -->
		<div class="flex items-center gap-3 mb-5">
			<button
				onclick={() => goto('/app/orders')}
				class="w-9 h-9 rounded-[10px] flex items-center justify-center border"
				style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
			>
				<Icon name="arrowLeft" size={18} />
			</button>
			<div>
				<h1 class="font-display text-xl font-extrabold">Pedido {pedido.number}</h1>
				<div class="text-xs" style="color:var(--c-text-muted)">{pedido.date}</div>
			</div>
		</div>

		<div class="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
			<!-- Left column -->
			<div class="flex flex-col gap-4">
				<!-- Store card -->
				<div
					class="flex items-center gap-3 p-4 rounded-2xl border"
					style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
				>
					<TiendaLogo tienda={tienda} size={44} />
					<div class="flex-1">
						<div class="font-display text-base font-bold">{tienda.name}</div>
						<div class="text-xs" style="color:var(--c-text-muted)">
							{getCategory(tienda.category).label}
						</div>
					</div>
					<Badge variant={estado.variant}>{estado.label}</Badge>
				</div>

				<!-- Map CTA -->
				{#if pedido.status === 'shipping' || pedido.status === 'preparing'}
					<button
						onclick={handleMapCTA}
						class="relative overflow-hidden flex items-center gap-3.5 p-3.5 rounded-2xl border text-left w-full"
						style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
					>
						<div
							class="absolute inset-0 opacity-[0.07]"
							style="background:radial-gradient(circle at 30% 50%, var(--c-brand) 0%, transparent 40%), radial-gradient(circle at 70% 50%, var(--c-accent) 0%, transparent 40%)"
						></div>
						<div
							class="relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
							style="background:var(--c-brand)"
						>
							<Icon name="location" size={22} color="#fff" />
						</div>
						<div class="relative flex-1">
							<div class="font-display text-[15px] font-bold">Ver en el mapa</div>
							<div class="text-xs mt-0.5" style="color:var(--c-text-secondary)">
								Sigue a tu repartidor en tiempo real
							</div>
						</div>
						<div
							class="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
							style="background:var(--c-success-light);color:var(--c-success)"
						>
							<span
								class="w-1.5 h-1.5 rounded-full animate-pulse"
								style="background:var(--c-success)"
							></span>
							EN VIVO
						</div>
					</button>
				{/if}

				<!-- Timeline -->
				<div
					class="rounded-2xl border p-5"
					style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
				>
					<h3 class="font-display text-[15px] font-bold mb-4">Estado del pedido</h3>
					<div class="relative">
						{#each pedido.timeline as step, i}
							{@const isLast = i === pedido.timeline.length - 1}
							<div class="flex gap-3.5 relative" style="padding-bottom:{isLast ? '0' : '18px'}">
								{#if !isLast}
									<div
										class="absolute left-[11px] top-6 bottom-0 w-0.5"
										style="background:{step.done ? 'var(--c-success)' : 'var(--c-border)'}"
									></div>
								{/if}
								<div
									class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10"
									style="
										background:{step.done
											? step.active
												? 'var(--c-brand)'
												: 'var(--c-success)'
											: 'var(--c-bg-secondary)'};
										border:{step.done ? 'none' : '2px solid var(--c-border)'}
									"
								>
									{#if step.done}
										<Icon name="check" size={13} color="#fff" strokeWidth={3} />
									{/if}
								</div>
								<div class="flex-1 pt-0.5">
									<div
										class="text-sm"
										style="font-weight:{step.active ? 700 : 500};color:{step.done
											? 'var(--c-text-primary)'
											: 'var(--c-text-muted)'}"
									>
										{step.label}
									</div>
									{#if step.time}
										<div class="text-xs mt-0.5" style="color:var(--c-text-muted)">{step.time}</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Buzón sugerencias (delivered) -->
				{#if pedido.status === 'delivered'}
					<div
						class="rounded-2xl border p-5"
						style="background:linear-gradient(135deg, var(--c-promo-light), var(--c-bg-card));border-color:var(--c-promo)"
					>
						<div class="flex items-center gap-3 mb-3">
							<div
								class="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl shrink-0"
								style="background:var(--c-promo)"
							>
								💬
							</div>
							<div>
								<div class="font-display text-[15px] font-bold">¿Cómo fue tu experiencia?</div>
								<div class="text-xs" style="color:var(--c-text-secondary)">
									Deja una sugerencia privada a {tienda.name}
								</div>
							</div>
						</div>
						{#if pedido.reviewPromptPending}
							<Button variant="promo" fullWidth onclick={() => (buzonOpen = true)}>
								Escribir sugerencia
							</Button>
						{:else}
							<div
								class="text-xs text-center py-2"
								style="color:var(--c-text-muted)"
							>
								✓ Ya enviaste tu sugerencia
								{#if pedido.reward}
									<div class="mt-1.5 font-semibold" style="color:var(--c-accent)">
										{pedido.reward}
									</div>
								{/if}
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Right column: items + actions -->
			<div
				class="rounded-2xl border p-4 lg:sticky lg:top-5"
				style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
			>
				<h3 class="font-display text-[15px] font-bold mb-3.5">Productos</h3>
				<div class="flex flex-col gap-2.5 mb-3.5">
					{#each pedido.items as item}
						{@const p = getProduct(item.productId)}
						<div class="flex items-center gap-2.5">
							<div
								class="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl shrink-0"
								style="background:{tienda.bannerGradient}"
							>
								{p.emoji}
							</div>
							<div class="flex-1 min-w-0">
								<div class="text-sm font-semibold truncate">{p.name}</div>
								<div class="text-xs" style="color:var(--c-text-muted)">x{item.quantity}</div>
							</div>
							<span class="font-mono text-sm">{fmtCOP(item.price * item.quantity)}</span>
						</div>
					{/each}
				</div>

				<div class="h-0.5 mb-3" style="background:var(--c-border-soft)"></div>

				<div class="flex justify-between text-sm mb-2">
					<span style="color:var(--c-text-secondary)">Pagado con</span>
					<span class="font-semibold">{pedido.paymentGateway}</span>
				</div>
				{#if pedido.address}
					<div class="flex justify-between items-start text-sm mb-3">
						<span style="color:var(--c-text-secondary)">Entrega</span>
						<span class="text-right text-xs font-medium max-w-[160px]" style="color:var(--c-text-primary)">
							{pedido.address}
						</span>
					</div>
				{/if}
				<div class="flex justify-between items-center pt-3" style="border-top:2px solid var(--c-border-soft)">
					<span class="font-bold">Total</span>
					<span class="font-mono text-lg font-bold">{fmtCOP(pedido.total)}</span>
				</div>

				{#if puedeCancelar}
					<button
						onclick={() => (cancelOpen = true)}
						class="w-full mt-4 py-2.5 px-3.5 rounded-xl text-sm font-bold border-[1.5px] transition-colors"
						style="color:var(--c-error);border-color:var(--c-error);background:transparent"
					>
						Cancelar pedido
					</button>
				{/if}

				{#if puedeCalificar}
					<button
						onclick={() => (buzonOpen = true)}
						class="w-full mt-4 py-3 px-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
						style="background:linear-gradient(120deg,#F59E0B,#D97706)"
					>
						⭐ Calificar este pedido
					</button>
				{/if}
			</div>
		</div>
	</div>

	<!-- ── BUZÓN SUGERENCIAS ── -->
	<Dialog.Root bind:open={buzonOpen}>
		<Dialog.Content
			showCloseButton={false}
			onInteractOutside={(e) => { if (buzonSubmitted) e.preventDefault(); }}
			class="max-w-lg"
			style="padding-bottom:max(24px,env(safe-area-inset-bottom))"
		>
				{#if buzonSubmitted}
					<div class="text-center py-6">
						<div class="text-6xl mb-4">🙏</div>
						<h3 class="font-display text-xl font-extrabold mb-2">¡Gracias por tu sugerencia!</h3>
						<p class="text-sm" style="color:var(--c-text-secondary)">
							{tienda.name} la recibirá en privado.
						</p>
					</div>
				{:else}
					<div
						class="w-10 h-1 rounded-full mx-auto mb-4"
						style="background:var(--c-border)"
					></div>
					<div class="flex items-center gap-3 mb-4">
						<TiendaLogo tienda={tienda} size={44} />
						<div>
							<h2 class="font-display text-lg font-extrabold">Buzón de sugerencia</h2>
							<div class="text-xs" style="color:var(--c-text-muted)">
								{pedido.number} · {tienda.name}
							</div>
						</div>
					</div>
					<div
						class="flex items-start gap-2 p-3 rounded-xl mb-4 text-xs leading-relaxed"
						style="background:var(--c-promo-light);color:var(--c-promo)"
					>
						🔒 Tu sugerencia es <strong>privada</strong>. Solo la verá {tienda.name}, no otros clientes.
					</div>

					<div class="mb-4">
						<div class="text-sm font-semibold mb-3">¿Cómo fue tu experiencia?</div>
						<div class="flex justify-center gap-2">
							{#each EMOJIS as emoji, i}
								<button
									onclick={() => (buzonRating = i + 1)}
									class="text-4xl p-1 transition-all"
									style="
										filter:{buzonRating >= i + 1 ? 'none' : 'grayscale(1) opacity(0.3)'};
										transform:{buzonRating === i + 1 ? 'scale(1.2)' : 'scale(1)'}
									"
								>
									{emoji}
								</button>
							{/each}
						</div>
					</div>

					<div class="mb-4">
						<div class="text-sm font-semibold mb-2">Tu sugerencia</div>
						<textarea
							bind:value={buzonTexto}
							rows={4}
							placeholder="Cuéntale a la tienda qué puede mejorar o qué hiciste bien..."
							class="w-full px-3.5 py-3 rounded-xl text-sm border resize-none outline-none"
							style="background:var(--c-bg-primary);border-color:var(--c-border);color:var(--c-text-primary)"
						></textarea>
						<div class="text-[11px] text-right mt-1" style="color:var(--c-text-muted)">
							{buzonTexto.length} caracteres
						</div>
					</div>

					{#if buzonError}
						<p class="text-sm mb-3" style="color:var(--c-error)">⚠️ {buzonError}</p>
					{/if}

					<Button variant="promo" size="lg" fullWidth onclick={handleBuzonSubmit}>
						Enviar sugerencia
					</Button>
					<button
						onclick={() => (buzonOpen = false)}
						class="w-full py-3 mt-2 text-sm"
						style="color:var(--c-text-muted)"
					>
						Cancelar
					</button>
				{/if}
		</Dialog.Content>
	</Dialog.Root>

	<!-- ── CANCEL MODAL ── -->
	<Dialog.Root bind:open={cancelOpen}>
		<Dialog.Content showCloseButton={false} class="max-w-sm">
				<h2 class="font-display text-xl font-bold mb-1">Cancelar pedido</h2>
				<div
					class="text-sm rounded-xl p-3 mb-4"
					style="background:var(--c-bg-secondary)"
				>
					<div class="text-xs mb-0.5" style="color:var(--c-text-muted)">Pedido</div>
					<div class="font-semibold">{pedido.number} · {tienda.name}</div>
					<div class="font-mono text-sm mt-0.5" style="color:var(--c-text-secondary)">
						{fmtCOP(pedido.total)}
					</div>
				</div>

				<div class="text-sm font-semibold mb-2">¿Por qué quieres cancelar?</div>
				<div class="flex flex-col gap-1.5 mb-5">
					{#each MOTIVOS as motivo}
						{@const isSelected = motivoSeleccionado === motivo}
						<label
							class="flex items-center gap-3 p-3 rounded-xl cursor-pointer border-[1.5px] transition-all"
							style="
								border-color:{isSelected ? 'var(--c-error)' : 'var(--c-border)'};
								background:{isSelected ? 'var(--c-error-light)' : 'transparent'}
							"
						>
							<input
								type="radio"
								name="motivo"
								value={motivo}
								bind:group={motivoSeleccionado}
								class="hidden"
							/>
							<div
								class="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
								style="border-color:{isSelected ? 'var(--c-error)' : 'var(--c-border)'}"
							>
								{#if isSelected}
									<div class="w-2 h-2 rounded-full" style="background:var(--c-error)"></div>
								{/if}
							</div>
							<span class="text-sm">{motivo}</span>
						</label>
					{/each}
				</div>

				<div class="flex gap-2">
					<Button variant="ghost" fullWidth onclick={() => (cancelOpen = false)}>Volver</Button>
					<Button
						variant="danger"
						fullWidth
						disabled={!motivoSeleccionado}
						onclick={handleCancelConfirm}
					>
						Sí, cancelar
					</Button>
				</div>
		</Dialog.Content>
	</Dialog.Root>
{/if}
