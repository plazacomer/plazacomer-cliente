<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { orders, toast } from '#lib/stores/app.svelte.js';
	import { getStore, getProduct, getCategory } from '#lib/data/mock.js';
	import { fmtCOP } from '#lib/utils.js';
	import TiendaLogo from '#lib/components/TiendaLogo.svelte';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import Icon from '#lib/components/ui/Icon.svelte';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import type { OrderStatus } from '#lib/stores/app.svelte.js';

	const id = $derived(page.params.id ?? '');
	const pedido = $derived(orders.get(id));
	const tienda = $derived(pedido ? getStore(pedido.storeId) : null);

	const estadoMap: Record<
		OrderStatus,
		{ variant: 'brand' | 'accent' | 'success' | 'error' | 'default'; label: string }
	> = {
		confirmed: { variant: 'brand', label: '✓ Confirmado' },
		preparing: { variant: 'accent', label: '⏳ Preparando' },
		shipping: { variant: 'brand', label: '🚚 En camino' },
		delivered: { variant: 'success', label: '✅ Entregado' },
		cancelled: { variant: 'error', label: '✕ Cancelado' }
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
		if (buzonRating === 0) {
			buzonError = 'Selecciona una calificación';
			return;
		}
		if (buzonTexto.trim().length < 10) {
			buzonError = 'Escribe al menos 10 caracteres';
			return;
		}
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
		'Otro'
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
	<div class="mx-auto max-w-lg px-5 pt-16 text-center">
		<div class="mb-4 text-6xl">📦</div>
		<h2 class="mb-2 font-display text-xl font-bold">Pedido no encontrado</h2>

		<Button variant="ghost" onclick={() => goto(resolve('app/orders'))}>
			<Icon name="arrowLeft" size={16} />
			Volver a pedidos
		</Button>
	</div>
{:else}
	{@const estado = estadoMap[pedido.status]}

	<div class="animate-fade-in mx-auto max-w-[800px] px-4 pt-5 pb-12">
		<!-- Header -->
		<div class="mb-5 flex items-center gap-3">
			<button
				onclick={() => goto(resolve('app/orders'))}
				class="flex h-9 w-9 items-center justify-center rounded-[10px] border"
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
					class="flex items-center gap-3 rounded-2xl border p-4"
					style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
				>
					<TiendaLogo {tienda} size={44} />
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
						class="relative flex w-full items-center gap-3.5 overflow-hidden rounded-2xl border p-3.5 text-left"
						style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
					>
						<div
							class="absolute inset-0 opacity-[0.07]"
							style="background:radial-gradient(circle at 30% 50%, var(--c-brand) 0%, transparent 40%), radial-gradient(circle at 70% 50%, var(--c-accent) 0%, transparent 40%)"
						></div>
						<div
							class="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
							style="background:var(--c-brand)"
						>
							<Icon name="location" size={22} color="#fff" />
						</div>
						<div class="relative flex-1">
							<div class="font-display text-[15px] font-bold">Ver en el mapa</div>
							<div class="mt-0.5 text-xs" style="color:var(--c-text-secondary)">
								Sigue a tu repartidor en tiempo real
							</div>
						</div>
						<div
							class="relative flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
							style="background:var(--c-success-light);color:var(--c-success)"
						>
							<span
								class="h-1.5 w-1.5 animate-pulse rounded-full"
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
					<h3 class="mb-4 font-display text-[15px] font-bold">Estado del pedido</h3>
					<div class="relative">
						{#each pedido.timeline as step, i (i)}
							{@const isLast = i === pedido.timeline.length - 1}
							<div class="relative flex gap-3.5" style="padding-bottom:{isLast ? '0' : '18px'}">
								{#if !isLast}
									<div
										class="absolute top-6 bottom-0 left-[11px] w-0.5"
										style="background:{step.done ? 'var(--c-success)' : 'var(--c-border)'}"
									></div>
								{/if}
								<div
									class="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
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
										<div class="mt-0.5 text-xs" style="color:var(--c-text-muted)">{step.time}</div>
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
						<div class="mb-3 flex items-center gap-3">
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-xl"
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
							<Button variant="promo" fullWidth onclick={() => (buzonOpen = true)}
								>Escribir sugerencia</Button
							>
						{:else}
							<div class="py-2 text-center text-xs" style="color:var(--c-text-muted)">
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
				<h3 class="mb-3.5 font-display text-[15px] font-bold">Productos</h3>
				<div class="mb-3.5 flex flex-col gap-2.5">
					{#each pedido.items as item, idx (idx)}
						{@const p = getProduct(item.productId)}
						<div class="flex items-center gap-2.5">
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-xl"
								style="background:{tienda.bannerGradient}"
							>
								{p.emoji}
							</div>
							<div class="min-w-0 flex-1">
								<div class="truncate text-sm font-semibold">{p.name}</div>
								<div class="text-xs" style="color:var(--c-text-muted)">x{item.quantity}</div>
							</div>
							<span class="font-mono text-sm">{fmtCOP(item.price * item.quantity)}</span>
						</div>
					{/each}
				</div>

				<div class="mb-3 h-0.5" style="background:var(--c-border-soft)"></div>

				<div class="mb-2 flex justify-between text-sm">
					<span style="color:var(--c-text-secondary)">Pagado con</span>
					<span class="font-semibold">{pedido.paymentGateway}</span>
				</div>
				{#if pedido.address}
					<div class="mb-3 flex items-start justify-between text-sm">
						<span style="color:var(--c-text-secondary)">Entrega</span>
						<span
							class="max-w-[160px] text-right text-xs font-medium"
							style="color:var(--c-text-primary)"
						>
							{pedido.address}
						</span>
					</div>
				{/if}
				<div
					class="flex items-center justify-between pt-3"
					style="border-top:2px solid var(--c-border-soft)"
				>
					<span class="font-bold">Total</span>
					<span class="font-mono text-lg font-bold">{fmtCOP(pedido.total)}</span>
				</div>

				{#if puedeCancelar}
					<button
						onclick={() => (cancelOpen = true)}
						class="mt-4 w-full rounded-xl border-[1.5px] px-3.5 py-2.5 text-sm font-bold transition-colors"
						style="color:var(--c-error);border-color:var(--c-error);background:transparent"
					>
						Cancelar pedido
					</button>
				{/if}

				{#if puedeCalificar}
					<button
						onclick={() => (buzonOpen = true)}
						class="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-3.5 py-3 text-sm font-bold text-white"
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
			onInteractOutside={(e) => {
				if (buzonSubmitted) e.preventDefault();
			}}
			class="max-w-lg"
			style="padding-bottom:max(24px,env(safe-area-inset-bottom))"
		>
			{#if buzonSubmitted}
				<div class="py-6 text-center">
					<div class="mb-4 text-6xl">🙏</div>
					<h3 class="mb-2 font-display text-xl font-extrabold">¡Gracias por tu sugerencia!</h3>
					<p class="text-sm" style="color:var(--c-text-secondary)">
						{tienda.name} la recibirá en privado.
					</p>
				</div>
			{:else}
				<div class="mx-auto mb-4 h-1 w-10 rounded-full" style="background:var(--c-border)"></div>
				<div class="mb-4 flex items-center gap-3">
					<TiendaLogo {tienda} size={44} />
					<div>
						<h2 class="font-display text-lg font-extrabold">Buzón de sugerencia</h2>
						<div class="text-xs" style="color:var(--c-text-muted)">
							{pedido.number} · {tienda.name}
						</div>
					</div>
				</div>
				<div
					class="mb-4 flex items-start gap-2 rounded-xl p-3 text-xs leading-relaxed"
					style="background:var(--c-promo-light);color:var(--c-promo)"
				>
					🔒 Tu sugerencia es <strong>privada</strong>. Solo la verá {tienda.name}, no otros
					clientes.
				</div>

				<div class="mb-4">
					<div class="mb-3 text-sm font-semibold">¿Cómo fue tu experiencia?</div>
					<div class="flex justify-center gap-2">
						{#each EMOJIS as emoji, i (i)}
							<button
								onclick={() => (buzonRating = i + 1)}
								class="p-1 text-4xl transition-all"
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
					<div class="mb-2 text-sm font-semibold">Tu sugerencia</div>
					<textarea
						bind:value={buzonTexto}
						rows={4}
						placeholder="Cuéntale a la tienda qué puede mejorar o qué hiciste bien..."
						class="w-full resize-none rounded-xl border px-3.5 py-3 text-sm outline-none"
						style="background:var(--c-bg-primary);border-color:var(--c-border);color:var(--c-text-primary)"
					></textarea>
					<div class="mt-1 text-right text-[11px]" style="color:var(--c-text-muted)">
						{buzonTexto.length} caracteres
					</div>
				</div>

				{#if buzonError}
					<p class="mb-3 text-sm" style="color:var(--c-error)">⚠️ {buzonError}</p>
				{/if}

				<Button variant="promo" size="lg" fullWidth onclick={handleBuzonSubmit}>
					Enviar sugerencia
				</Button>
				<button
					onclick={() => (buzonOpen = false)}
					class="mt-2 w-full py-3 text-sm"
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
			<h2 class="mb-1 font-display text-xl font-bold">Cancelar pedido</h2>
			<div class="mb-4 rounded-xl p-3 text-sm" style="background:var(--c-bg-secondary)">
				<div class="mb-0.5 text-xs" style="color:var(--c-text-muted)">Pedido</div>
				<div class="font-semibold">{pedido.number} · {tienda.name}</div>
				<div class="mt-0.5 font-mono text-sm" style="color:var(--c-text-secondary)">
					{fmtCOP(pedido.total)}
				</div>
			</div>

			<div class="mb-2 text-sm font-semibold">¿Por qué quieres cancelar?</div>
			<div class="mb-5 flex flex-col gap-1.5">
				{#each MOTIVOS as motivo (motivo)}
					{@const isSelected = motivoSeleccionado === motivo}
					<label
						class="flex cursor-pointer items-center gap-3 rounded-xl border-[1.5px] p-3 transition-all"
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
							class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
							style="border-color:{isSelected ? 'var(--c-error)' : 'var(--c-border)'}"
						>
							{#if isSelected}
								<div class="h-2 w-2 rounded-full" style="background:var(--c-error)"></div>
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
