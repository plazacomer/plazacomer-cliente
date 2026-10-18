<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { cart, orders } from '$lib/stores/app.svelte';
	import type { CartItem } from '$lib/stores/app.svelte';
	import { getStore, getProduct, ADDRESSES, COUPONS } from '$lib/data/mock';
	import { fmtCOP } from '$lib/utils';
	import TiendaLogo from '$lib/components/TiendaLogo.svelte';
	import { Button } from '$lib/components/ui/button';
	import Icon from '$lib/components/ui/Icon.svelte';
	import * as Dialog from '$lib/components/ui/dialog';

	// Snapshot cart on mount so clearing it doesn't break the flow
	let snapshot = $state<CartItem[]>([]);
	let mounted = $state(false);

	const groups = $derived.by(() => {
		const g: Record<string, CartItem[]> = {};
		snapshot.forEach((item) => {
			if (!g[item.storeId]) g[item.storeId] = [];
			g[item.storeId].push(item);
		});
		return g;
	});

	const storeIds = $derived(Object.keys(groups));

	let step = $state(0);
	let processed = $state<string[]>([]);

	let form = $state({
		address: 'Cra 10 #45-23, El Poblado, Medellín',
		telefono: '+57 320 456 7890',
		notas: ''
	});
	let errors = $state<Record<string, string>>({});
	let entregaModo = $state<'ahora' | 'programado'>('ahora');
	let fechaProgramada = $state('');
	let horaProgramada = $state('');
	let selectedPago = $state('');
	let selectedDireccionId = $state<string | null>(null);
	let cuponPorTienda = $state<Record<string, string>>({});
	let cuponInput = $state('');
	let cuponError = $state('');

	// PaymentFlow modal
	let paymentOpen = $state(false);
	let paymentPhase = $state<'methods' | 'processing' | 'approved' | 'rejected'>('methods');
	let paymentMethod = $state('tarjeta');
	let paymentAttempt = $state(0);
	let comprobantes = $state<Array<{ storeId: string; metodo: string; total: number; ref: string }>>(
		[]
	);

	const currentStoreId = $derived(storeIds[step] ?? null);
	const currentTienda = $derived(currentStoreId ? getStore(currentStoreId) : null);
	const currentItems = $derived(currentStoreId ? (groups[currentStoreId] ?? []) : []);
	const currentSubtotal = $derived(currentItems.reduce((s, i) => s + i.price * i.quantity, 0));
	const cuponActivoId = $derived(currentStoreId ? (cuponPorTienda[currentStoreId] ?? null) : null);
	const cuponActivo = $derived(
		cuponActivoId ? (COUPONS.find((c) => c.id === cuponActivoId) ?? null) : null
	);
	const descuento = $derived(
		!cuponActivo
			? 0
			: cuponActivo.type === 'percentage'
				? Math.round((currentSubtotal * cuponActivo.value) / 100)
				: cuponActivo.type === 'fixed'
					? cuponActivo.value
					: 0
	);
	const envio = $derived(cuponActivo?.type === 'shipping' ? 0 : 4000);
	const currentTotal = $derived(Math.max(0, currentSubtotal + envio - descuento));
	const allDone = $derived(mounted && storeIds.length > 0 && step >= storeIds.length);

	const PAYMENT_METHODS = [
		{ id: 'nequi', label: 'Nequi', emoji: '💜', bg: '#7C3AED' },
		{ id: 'daviplata', label: 'Daviplata', emoji: '❤️', bg: '#DC2626' },
		{ id: 'pse', label: 'PSE', emoji: '🏦', bg: '#0EA5E9' },
		{ id: 'tarjeta', label: 'Tarjeta', emoji: '💳', bg: '#1F2937' },
		{ id: 'efectivo', label: 'Contraentrega', emoji: '💵', bg: '#16A34A' }
	];

	const currentMethodInfo = $derived(
		PAYMENT_METHODS.find((m) => m.id === paymentMethod) ?? PAYMENT_METHODS[3]
	);

	function mapPagoToMethod(pago: string): string {
		const l = pago.toLowerCase();
		if (l.includes('nequi')) return 'nequi';
		if (l.includes('daviplata')) return 'daviplata';
		if (l.includes('pse')) return 'pse';
		if (l.includes('efectivo') || l.includes('contraentrega')) return 'efectivo';
		return 'tarjeta';
	}

	$effect(() => {
		if (currentTienda) {
			selectedPago = currentTienda.paymentMethods[0];
			paymentMethod = mapPagoToMethod(currentTienda.paymentMethods[0]);
			cuponInput = '';
			cuponError = '';
		}
	});

	$effect(() => {
		if (selectedDireccionId) {
			const dir = ADDRESSES.find((d) => d.id === selectedDireccionId);
			if (dir) form.address = `${dir.address}, ${dir.neighborhood}, ${dir.city}`;
		}
	});

	function validate(): boolean {
		const e: Record<string, string> = {};
		if (!selectedDireccionId && !form.address.trim())
			e.direccion = 'Selecciona o ingresa una dirección de entrega';
		if (!form.telefono.trim()) e.telefono = 'Teléfono requerido';
		else if (!/^[+\d\s()-]{7,}$/.test(form.telefono)) e.telefono = 'Teléfono inválido';
		if (!selectedPago) e.pago = 'Selecciona un método de pago';
		if (entregaModo === 'programado' && (!fechaProgramada || !horaProgramada)) {
			e.entrega = 'Selecciona fecha y hora de entrega';
		}
		errors = e;
		return Object.keys(e).length === 0;
	}

	function aplicarCupon() {
		cuponError = '';
		const code = cuponInput.trim().toUpperCase();
		if (!code) {
			cuponError = 'Ingresa un código de cupón';
			return;
		}
		const cupon = COUPONS.find((c) => c.code === code && c.active);
		if (!cupon) {
			cuponError = 'Cupón inválido o expirado';
			return;
		}
		if (cupon.storeId && cupon.storeId !== currentStoreId) {
			cuponError = 'Este cupón no aplica para esta tienda';
			return;
		}
		if (currentSubtotal < cupon.minimum) {
			cuponError = `Monto mínimo: ${fmtCOP(cupon.minimum)}`;
			return;
		}
		if (currentStoreId) cuponPorTienda[currentStoreId] = cupon.id;
		cuponInput = '';
	}

	function quitarCupon() {
		if (currentStoreId) delete cuponPorTienda[currentStoreId];
		cuponError = '';
	}

	function handlePay() {
		if (!validate()) return;
		paymentPhase = 'methods';
		paymentAttempt = 0;
		paymentOpen = true;
	}

	function procesarPago() {
		paymentPhase = 'processing';
		setTimeout(() => {
			const aprueba = paymentMethod === 'efectivo' || paymentAttempt > 0 || Math.random() > 0.3;
			if (!aprueba) paymentAttempt++;
			paymentPhase = aprueba ? 'approved' : 'rejected';
		}, 2400);
	}

	function handlePaymentSuccess() {
		const ref = 'PC-' + Math.random().toString(36).slice(2, 8).toUpperCase();
		comprobantes.push({
			storeId: currentStoreId!,
			metodo: currentMethodInfo.label,
			total: currentTotal,
			ref
		});
		processed.push(currentStoreId!);
		paymentOpen = false;
		paymentPhase = 'methods';
		if (step + 1 >= storeIds.length) {
			createOrders();
			step = storeIds.length;
		} else {
			step++;
		}
	}

	function createOrders() {
		const now = new Date();
		const dateStr =
			now.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) +
			', ' +
			now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
		const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

		comprobantes.forEach((comp) => {
			const storeItems = groups[comp.storeId] ?? [];
			orders.add({
				number: comp.ref,
				storeId: comp.storeId,
				items: storeItems.map((i) => ({
					productId: i.productId,
					quantity: i.quantity,
					price: i.price
				})),
				status: 'confirmed',
				date: dateStr,
				total: comp.total,
				paymentGateway: comp.metodo,
				address: form.address,
				notes: form.notas || undefined,
				timeline: [
					{ label: 'Pedido confirmado', time: timeStr, done: true, active: true },
					{ label: 'Tienda preparando', time: '', done: false, active: false },
					{ label: 'Repartidor en camino', time: '', done: false, active: false },
					{ label: 'Entregado', time: '', done: false, active: false }
				],
				reviewPromptPending: false
			});
		});
		cart.clear();
	}

	onMount(() => {
		if (cart.items.length === 0) {
			goto(resolve('/app/cart'));
			return;
		}
		snapshot = [...cart.items];
		mounted = true;
		selectedDireccionId = ADDRESSES.find((d) => d.isPrimary)?.id ?? ADDRESSES[0]?.id ?? null;
	});
</script>

<!-- ── SUCCESS SCREEN ── -->
{#if allDone}
	<div class="animate-fade-in mx-auto max-w-lg px-5 py-10">
		<div class="mb-6 text-center">
			<div
				class="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full text-5xl"
				style="background:var(--c-success-light);color:var(--c-success)"
			>
				✓
			</div>
			<h2 class="mb-2 font-display text-2xl font-extrabold">¡Pedidos confirmados!</h2>
			<p class="text-sm leading-relaxed" style="color:var(--c-text-secondary)">
				{#if entregaModo === 'programado' && fechaProgramada && horaProgramada}
					📅 Programado para el
					<strong>
						{new Date(fechaProgramada + 'T' + horaProgramada).toLocaleString('es-CO', {
							weekday: 'long',
							day: 'numeric',
							month: 'long',
							hour: 'numeric',
							minute: '2-digit'
						})}
					</strong>
				{:else}
					Recibirás notificaciones del estado de cada pedido.
				{/if}
			</p>
		</div>

		<div
			class="mb-4 rounded-[18px] border p-4"
			style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
		>
			<div
				class="mb-3 text-[11px] font-bold tracking-widest uppercase"
				style="color:var(--c-text-muted)"
			>
				Comprobantes
			</div>
			{#each comprobantes as comp, i (i)}
				{@const t = getStore(comp.storeId)}
				<div
					class="flex items-center gap-3 py-3"
					style="border-top:{i > 0 ? '1px solid var(--c-border-soft)' : 'none'}"
				>
					<TiendaLogo tienda={t} size={36} />
					<div class="min-w-0 flex-1">
						<div class="text-sm font-semibold">{t.name}</div>
						<div class="font-mono text-[11px]" style="color:var(--c-text-muted)">
							{comp.ref} · {comp.metodo}
						</div>
					</div>
					<span class="font-mono text-sm font-semibold">{fmtCOP(comp.total)}</span>
				</div>
			{/each}
			<div
				class="mt-2 flex items-center justify-between pt-3"
				style="border-top:2px solid var(--c-border-soft)"
			>
				<span class="text-sm font-bold">Total pagado</span>
				<span class="font-mono text-lg font-bold">
					{fmtCOP(comprobantes.reduce((s, c) => s + c.total, 0))}
				</span>
			</div>
		</div>

		<Button variant="brand" size="lg" fullWidth onclick={() => goto(resolve('/app/orders'))}>
			<Icon name="package" size={18} />
			Ver mis pedidos
		</Button>
	</div>

	<!-- ── CHECKOUT FORM ── -->
{:else if mounted && currentTienda}
	<div class="mx-auto max-w-[900px] px-4 pt-5 pb-12">
		<!-- Header -->
		<div class="mb-4 flex items-center gap-3">
			<button
				onclick={() => goto(resolve('/app/cart'))}
				class="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--c-border-soft)]"
				style="background:var(--c-bg-card)"
			>
				<Icon name="arrowLeft" size={18} />
			</button>
			<h1 class="font-display text-2xl font-extrabold">Checkout</h1>
		</div>

		<!-- Multi-store progress -->
		{#if storeIds.length > 1}
			<div
				class="mb-5 rounded-2xl border p-3.5"
				style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
			>
				<div
					class="mb-2.5 text-[11px] font-bold tracking-wider uppercase"
					style="color:var(--c-text-muted)"
				>
					Paso {step + 1} de {storeIds.length} — Paga cada tienda por separado
				</div>
				<div class="flex gap-2">
					{#each storeIds as tid, i (tid)}
						{@const t = getStore(tid)}
						{@const isDone = processed.includes(tid)}
						{@const isCurrent = i === step}
						<div
							class="flex min-w-0 flex-1 items-center gap-2 rounded-xl border-[1.5px] p-2.5 transition-colors"
							style="
								background:{isDone
								? 'var(--c-success-light)'
								: isCurrent
									? 'var(--c-brand-light)'
									: 'var(--c-bg-secondary)'};
								border-color:{isCurrent ? 'var(--c-brand)' : 'transparent'}
							"
						>
							<div
								class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
								style="background:{isDone
									? 'var(--c-success)'
									: isCurrent
										? 'var(--c-brand)'
										: 'var(--c-border)'}"
							>
								{#if isDone}
									<Icon name="check" size={13} strokeWidth={3} />
								{:else}
									{i + 1}
								{/if}
							</div>
							<span
								class="truncate text-[11px] font-semibold"
								style="color:{isDone
									? 'var(--c-success)'
									: isCurrent
										? 'var(--c-brand)'
										: 'var(--c-text-muted)'}"
							>
								{t.name}
							</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<div class="grid gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
			<!-- Left column -->
			<div class="flex flex-col gap-4">
				<!-- Store header -->
				<div
					class="rounded-[18px] border p-5"
					style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
				>
					<div class="mb-5 flex items-center gap-3">
						<TiendaLogo tienda={currentTienda} size={48} />
						<div>
							<div class="font-display text-[17px] font-bold">{currentTienda.name}</div>
							<div class="text-xs" style="color:var(--c-text-muted)">Pagando ahora</div>
						</div>
					</div>

					<div class="flex flex-col gap-4">
						<!-- Address -->
						<div>
							<div class="mb-1.5 text-xs font-semibold" style="color:var(--c-text-secondary)">
								Dirección de entrega
							</div>
							<div class="mb-2 flex flex-col gap-1.5">
								{#each ADDRESSES as dir (dir.id)}
									{@const isSelected = selectedDireccionId === dir.id}
									<button
										type="button"
										onclick={() => {
											selectedDireccionId = dir.id;
										}}
										class="flex w-full items-center gap-2.5 rounded-xl border-[1.5px] p-2.5 text-left transition-all"
										style="border-color:{isSelected
											? 'var(--c-brand)'
											: 'var(--c-border)'};background:{isSelected
											? 'var(--c-brand-light)'
											: 'transparent'}"
									>
										<div
											class="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px]"
											style="background:var(--c-bg-secondary)"
										>
											<Icon
												name="location"
												size={15}
												color={isSelected ? 'var(--c-brand)' : 'var(--c-text-muted)'}
											/>
										</div>
										<div class="min-w-0 flex-1">
											<div class="text-xs font-bold">{dir.label}</div>
											<div class="truncate text-[11px]" style="color:var(--c-text-muted)">
												{dir.address}, {dir.neighborhood}
											</div>
										</div>
										{#if dir.isPrimary}
											<span
												class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
												style="background:var(--c-brand-light);color:var(--c-brand)">Principal</span
											>
										{/if}
										{#if isSelected}
											<Icon name="check" size={14} color="var(--c-brand)" />
										{/if}
									</button>
								{/each}
								<button
									type="button"
									onclick={() => {
										selectedDireccionId = null;
									}}
									class="flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left"
									style="border-color:{!selectedDireccionId
										? 'var(--c-brand)'
										: 'var(--c-border-soft)'};background:{!selectedDireccionId
										? 'var(--c-brand-light)'
										: 'transparent'};color:{!selectedDireccionId
										? 'var(--c-brand)'
										: 'var(--c-text-muted)'}"
								>
									<Icon name="plus" size={13} />
									<span class="text-xs font-medium">Otra dirección</span>
								</button>
							</div>
							{#if !selectedDireccionId}
								<input
									bind:value={form.address}
									placeholder="Calle, número, barrio, ciudad"
									class="w-full rounded-[10px] border px-3.5 py-2.5 text-sm transition-colors outline-none"
									style="background:var(--c-bg-primary);border-color:{errors.direccion
										? 'var(--c-error)'
										: 'var(--c-border)'};"
								/>
							{/if}
							{#if errors.direccion}
								<p class="mt-1 text-xs" style="color:var(--c-error)">{errors.direccion}</p>
							{/if}
						</div>

						<!-- Phone -->
						<label class="block">
							<div class="mb-1.5 text-xs font-semibold" style="color:var(--c-text-secondary)">
								Teléfono de contacto
							</div>
							<input
								bind:value={form.telefono}
								placeholder="+57 ..."
								class="w-full rounded-[10px] border px-3.5 py-2.5 text-sm transition-colors outline-none"
								style="background:var(--c-bg-primary);border-color:{errors.telefono
									? 'var(--c-error)'
									: 'var(--c-border)'};"
							/>
							{#if errors.telefono}
								<p class="mt-1 text-xs" style="color:var(--c-error)">{errors.telefono}</p>
							{/if}
						</label>

						<!-- Notes -->
						<label class="block">
							<div class="mb-1.5 text-xs font-semibold" style="color:var(--c-text-secondary)">
								Notas para la tienda <span style="color:var(--c-text-muted)">(opcional)</span>
							</div>
							<textarea
								bind:value={form.notas}
								rows={2}
								placeholder="Instrucciones especiales, timbre, piso..."
								class="w-full resize-none rounded-[10px] border px-3.5 py-2.5 text-sm transition-colors outline-none"
								style="background:var(--c-bg-primary);border-color:var(--c-border)"
							></textarea>
						</label>
					</div>
				</div>

				<!-- Coupon -->
				<div
					class="rounded-[18px] border p-5"
					style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
				>
					<h3 class="mb-3 font-display text-[15px] font-bold">🎟️ ¿Tienes un cupón?</h3>
					{#if cuponActivo}
						<div
							class="flex items-center gap-2.5 rounded-xl border p-3"
							style="background:var(--c-success-light);border-color:var(--c-success)"
						>
							<Icon name="tag" size={16} color="var(--c-success)" />
							<div class="min-w-0 flex-1">
								<div class="text-xs font-bold" style="color:var(--c-success)">
									{cuponActivo.code}
								</div>
								<div class="text-[11px]" style="color:var(--c-success)">
									{cuponActivo.description}
								</div>
							</div>
							<button
								type="button"
								onclick={quitarCupon}
								class="rounded-lg p-1.5"
								style="color:var(--c-success)"
								title="Quitar cupón"
							>
								<Icon name="close" size={14} />
							</button>
						</div>
					{:else}
						<div class="flex gap-2">
							<input
								bind:value={cuponInput}
								placeholder="Código de cupón"
								onkeydown={(e) => e.key === 'Enter' && aplicarCupon()}
								class="flex-1 rounded-[10px] border px-3.5 py-2.5 text-sm outline-none"
								style="background:var(--c-bg-primary);border-color:{cuponError
									? 'var(--c-error)'
									: 'var(--c-border)'};text-transform:uppercase"
							/>
							<button
								type="button"
								onclick={aplicarCupon}
								class="shrink-0 rounded-[10px] px-4 py-2.5 text-sm font-bold"
								style="background:var(--c-brand);color:#fff"
							>
								Aplicar
							</button>
						</div>
						{#if cuponError}
							<p class="mt-1.5 text-xs" style="color:var(--c-error)">{cuponError}</p>
						{/if}
						<p class="mt-2 text-[11px]" style="color:var(--c-text-muted)">
							Prueba: BIENVENIDO10, ENVIOGRATIS, DESCUENTO5, CASERO20
						</p>
					{/if}
				</div>

				<!-- Delivery mode -->
				<div
					class="rounded-[18px] border p-5"
					style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
				>
					<h3 class="mb-3 font-display text-[15px] font-bold">¿Cuándo lo quieres?</h3>
					<div class="mb-3 grid grid-cols-2 gap-2">
						<button
							onclick={() => (entregaModo = 'ahora')}
							class="flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all"
							style="
								background:{entregaModo === 'ahora' ? 'var(--c-brand)' : 'var(--c-bg-secondary)'};
								border-color:{entregaModo === 'ahora' ? 'var(--c-brand)' : 'transparent'};
								color:{entregaModo === 'ahora' ? '#fff' : 'var(--c-text-primary)'}
							"
						>
							<span class="text-xl">🛵</span>
							<span class="text-[13px] font-bold">Ahora</span>
							<span class="text-[11px] opacity-80">~30 min</span>
						</button>
						<button
							onclick={() => (entregaModo = 'programado')}
							class="flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all"
							style="
								background:{entregaModo === 'programado' ? 'var(--c-brand)' : 'var(--c-bg-secondary)'};
								border-color:{entregaModo === 'programado' ? 'var(--c-brand)' : 'transparent'};
								color:{entregaModo === 'programado' ? '#fff' : 'var(--c-text-primary)'}
							"
						>
							<span class="text-xl">📅</span>
							<span class="text-[13px] font-bold">Programar</span>
							<span class="text-[11px] opacity-80">Hora exacta</span>
						</button>
					</div>
					{#if entregaModo === 'programado'}
						<div class="grid grid-cols-2 gap-3">
							<label class="block">
								<div class="mb-1.5 text-xs font-semibold" style="color:var(--c-text-secondary)">
									Fecha
								</div>
								<input
									type="date"
									bind:value={fechaProgramada}
									min={new Date().toISOString().slice(0, 10)}
									class="w-full rounded-[10px] border px-3 py-2.5 text-sm outline-none"
									style="background:var(--c-bg-primary);border-color:var(--c-border)"
								/>
							</label>
							<label class="block">
								<div class="mb-1.5 text-xs font-semibold" style="color:var(--c-text-secondary)">
									Hora
								</div>
								<input
									type="time"
									bind:value={horaProgramada}
									class="w-full rounded-[10px] border px-3 py-2.5 text-sm outline-none"
									style="background:var(--c-bg-primary);border-color:var(--c-border)"
								/>
							</label>
						</div>
						{#if errors.entrega}
							<p class="mt-2 text-xs" style="color:var(--c-error)">{errors.entrega}</p>
						{/if}
					{/if}
				</div>

				<!-- Payment method -->
				<div
					class="rounded-[18px] border p-5"
					style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
				>
					<h3 class="mb-1 font-display text-[15px] font-bold">Método de pago</h3>
					<p class="mb-3.5 text-xs" style="color:var(--c-text-muted)">
						{currentTienda.name} acepta:
					</p>
					<div class="flex flex-col gap-2">
						{#each currentTienda.paymentMethods as pago (pago)}
							{@const isSelected = selectedPago === pago}
							<label
								class="flex cursor-pointer items-center gap-3 rounded-xl border-[1.5px] p-3 transition-all"
								style="
									border-color:{isSelected ? 'var(--c-brand)' : 'var(--c-border)'};
									background:{isSelected ? 'var(--c-brand-light)' : 'transparent'}
								"
							>
								<input
									type="radio"
									name="pago"
									value={pago}
									bind:group={selectedPago}
									class="hidden"
								/>
								<div
									class="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2"
									style="border-color:{isSelected ? 'var(--c-brand)' : 'var(--c-border)'}"
								>
									{#if isSelected}
										<div class="h-2.5 w-2.5 rounded-full" style="background:var(--c-brand)"></div>
									{/if}
								</div>
								<span class="flex-1 text-sm font-semibold">{pago}</span>
								<span class="text-[11px]" style="color:var(--c-text-muted)">
									{pago === 'ePayco'
										? '💳 Tarjeta / PSE'
										: pago === 'PayU'
											? '💳 Todas las tarjetas'
											: pago === 'Wompi'
												? '💳 Tarjeta / PSE'
												: pago === 'Nequi'
													? '📱 Billetera digital'
													: pago === 'Efectivo'
														? '💵 Contraentrega'
														: '🔗 Link de pago'}
								</span>
							</label>
						{/each}
					</div>
					{#if errors.pago}
						<p class="mt-2 text-xs" style="color:var(--c-error)">{errors.pago}</p>
					{/if}
				</div>
			</div>

			<!-- Right column: summary -->
			<div
				class="rounded-[18px] border p-5 lg:sticky lg:top-5"
				style="background:var(--c-bg-card);border-color:var(--c-border-soft)"
			>
				<h3 class="mb-3.5 font-display text-base font-bold">Tu pedido</h3>
				<div class="mb-3.5 flex flex-col gap-2.5">
					{#each currentItems as item (item.lineId ?? item.productId)}
						{@const p = getProduct(item.productId)}
						<div class="flex items-center gap-2.5">
							<div
								class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl"
								style="background:{currentTienda.bannerGradient}"
							>
								{p.emoji}
							</div>
							<div class="min-w-0 flex-1">
								<div class="truncate text-xs font-semibold">{p.name}</div>
								<div class="text-[11px]" style="color:var(--c-text-muted)">x{item.quantity}</div>
							</div>
							<span class="font-mono text-xs font-medium">
								{fmtCOP(item.price * item.quantity)}
							</span>
						</div>
					{/each}
				</div>

				<div class="mb-3 h-px" style="background:var(--c-border-soft)"></div>
				<div class="mb-2 flex justify-between text-sm">
					<span style="color:var(--c-text-muted)">Subtotal</span>
					<span class="font-mono">{fmtCOP(currentSubtotal)}</span>
				</div>
				<div class="mb-2 flex justify-between text-sm">
					<span style="color:var(--c-text-muted)">Envío</span>
					<span class="font-mono" style="color:{envio === 0 ? 'var(--c-success)' : 'inherit'}">
						{envio === 0 ? 'GRATIS' : fmtCOP(envio)}
					</span>
				</div>
				{#if descuento > 0 && cuponActivo}
					<div class="mb-2 flex justify-between text-sm" style="color:var(--c-success)">
						<span>🎟️ {cuponActivo.code}</span>
						<span class="font-mono">−{fmtCOP(descuento)}</span>
					</div>
				{/if}
				<div
					class="mb-5 flex items-center justify-between pt-3"
					style="border-top:2px solid var(--c-border-soft)"
				>
					<span class="font-bold">Total</span>
					<span class="font-mono text-xl font-bold" style="color:var(--c-brand)">
						{fmtCOP(currentTotal)}
					</span>
				</div>

				<Button variant="brand" size="lg" fullWidth onclick={handlePay}>
					Pagar {fmtCOP(currentTotal)}
				</Button>

				{#if storeIds.length > 1}
					<p class="mt-2.5 text-center text-[11px]" style="color:var(--c-text-muted)">
						{storeIds.length - step - 1} tienda{storeIds.length - step - 1 !== 1 ? 's' : ''} más por pagar
					</p>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- ── PAYMENT FLOW MODAL ── -->
<!-- No se puede cerrar con click afuera ni Escape: es un flujo de pago en curso -->
<Dialog.Root bind:open={paymentOpen}>
	<Dialog.Content
		showCloseButton={false}
		interactOutsideBehavior="ignore"
		escapeKeydownBehavior="ignore"
		class="flex flex-col"
		style="padding-bottom:max(24px,env(safe-area-inset-bottom))"
	>
		{#if paymentPhase === 'methods'}
			<h2 class="mb-1 font-display text-xl font-bold">Elige cómo pagar</h2>
			<p class="mb-5 text-sm" style="color:var(--c-text-muted)">
				Total:
				<span class="font-mono font-bold" style="color:var(--c-text-primary)"
					>{fmtCOP(currentTotal)}</span
				>
			</p>
			<div class="mb-5 flex flex-col gap-2">
				{#each PAYMENT_METHODS as m (m.id)}
					{@const isSelected = paymentMethod === m.id}
					<button
						onclick={() => (paymentMethod = m.id)}
						class="flex items-center gap-3 rounded-xl border-[1.5px] p-3.5 text-left transition-all"
						style="
								background:{isSelected ? 'var(--c-brand-light)' : 'var(--c-bg-secondary)'};
								border-color:{isSelected ? 'var(--c-brand)' : 'transparent'};
								color:var(--c-text-primary)
							"
					>
						<div
							class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-xl"
							style="background:{m.bg}"
						>
							{m.emoji}
						</div>
						<span class="flex-1 text-sm font-semibold">{m.label}</span>
						{#if isSelected}
							<Icon name="check" size={18} color="var(--c-brand)" />
						{/if}
					</button>
				{/each}
			</div>
			<Button variant="brand" size="lg" fullWidth onclick={procesarPago}>
				Pagar {fmtCOP(currentTotal)}
			</Button>
			<button
				onclick={() => (paymentOpen = false)}
				class="mt-2 w-full py-3 text-sm"
				style="color:var(--c-text-muted)"
			>
				Cancelar
			</button>
		{:else if paymentPhase === 'processing'}
			<div class="py-8 text-center">
				<div
					class="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4"
					style="border-color:var(--c-border);border-top-color:var(--c-brand)"
				></div>
				<div class="mb-2 font-display text-lg font-bold">Procesando tu pago…</div>
				<p class="text-sm leading-relaxed" style="color:var(--c-text-muted)">
					No cierres ni recargues esta ventana.
				</p>
				<div
					class="mt-4 inline-flex items-center gap-2 rounded-[10px] px-3.5 py-2 font-mono text-xs"
					style="background:var(--c-bg-secondary);color:var(--c-text-muted)"
				>
					🔒 Conexión segura con {currentMethodInfo.label}
				</div>
			</div>
		{:else if paymentPhase === 'approved'}
			<div class="py-4 text-center">
				<div
					class="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full text-5xl"
					style="background:var(--c-success-light);color:var(--c-success)"
				>
					✓
				</div>
				<div class="mb-2 font-display text-xl font-bold">¡Pago aprobado!</div>
				<p class="mb-5 text-sm" style="color:var(--c-text-secondary)">
					Tu pedido se está preparando.
				</p>
				<div
					class="mb-5 grid grid-cols-2 gap-2.5 rounded-xl p-3.5 text-left text-xs"
					style="background:var(--c-bg-secondary)"
				>
					<div>
						<div style="color:var(--c-text-muted)">Método</div>
						<div class="mt-0.5 font-semibold">{currentMethodInfo.label}</div>
					</div>
					<div>
						<div style="color:var(--c-text-muted)">Total</div>
						<div class="mt-0.5 font-mono font-semibold">{fmtCOP(currentTotal)}</div>
					</div>
				</div>
				<Button variant="brand" size="lg" fullWidth onclick={handlePaymentSuccess}>
					{step + 1 < storeIds.length ? 'Siguiente tienda' : 'Ver resumen'}
				</Button>
			</div>
		{:else if paymentPhase === 'rejected'}
			<div class="py-4 text-center">
				<div
					class="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full text-5xl"
					style="background:var(--c-error-light);color:var(--c-error)"
				>
					✕
				</div>
				<div class="mb-2 font-display text-xl font-bold">Pago rechazado</div>
				<p class="mb-5 text-sm leading-relaxed" style="color:var(--c-text-secondary)">
					Tu banco rechazó la transacción. Puede ser por fondos insuficientes o restricciones de
					seguridad.
				</p>
				<div class="flex flex-col gap-2">
					<Button variant="brand" fullWidth onclick={procesarPago}>Reintentar pago</Button>
					<Button variant="ghost" fullWidth onclick={() => (paymentPhase = 'methods')}>
						Cambiar método
					</Button>
					<Button variant="ghost" fullWidth onclick={() => (paymentOpen = false)}>Cancelar</Button>
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
