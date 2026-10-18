<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { vendedor } from '#lib/stores/vendedor.svelte.js';
	import { ESTADOS_CITA, fmtFechaCita } from '#lib/stores/citas.svelte.js';
	import { fmtCOP } from '#lib/utils.js';
	import type { OrderStatus } from '#lib/stores/app.svelte.js';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { Badge } from '#lib/components/ui/badge/index.js';

	const ESTADO_STEPS: Partial<Record<OrderStatus, OrderStatus>> = {
		confirmed: 'preparing',
		preparing: 'shipping',
		shipping: 'delivered'
	};

	const ESTADO_LABEL: Record<string, string> = {
		confirmed: '✓ Confirmado',
		preparing: '⏳ Preparando',
		shipping: '🚚 En camino',
		delivered: '✅ Entregado',
		cancelled: '✕ Cancelado'
	};

	const ESTADO_VARIANT: Record<string, 'brand' | 'accent' | 'success' | 'error' | 'default'> = {
		confirmed: 'brand',
		preparing: 'accent',
		shipping: 'brand',
		delivered: 'success',
		cancelled: 'error'
	};

	const NEXT_ACTION: Record<string, string> = {
		confirmed: 'Empezar preparación',
		preparing: 'Enviar a domicilio',
		shipping: 'Marcar entregado'
	};
</script>

<div class="mx-auto max-w-3xl px-5 pt-6 pb-10">
	<!-- Header -->
	<div class="mb-6 flex items-center justify-between">
		<div>
			<div
				class="mb-1 font-mono text-[11px] font-bold tracking-widest uppercase"
				style="color:var(--c-brand)"
			>
				Panel Vendedor
			</div>
			<h1 class="font-display text-[26px] font-extrabold tracking-tight">
				{vendedor.tienda?.emoji}
				{vendedor.tienda?.name}
			</h1>
		</div>
		<button
			onclick={() => vendedor.toggleAbierto()}
			class="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all"
			style="background:{vendedor.abierto ? 'rgba(22,163,74,.08)' : 'rgba(220,38,38,.06)'};
				border-color:{vendedor.abierto ? 'var(--c-success)' : 'var(--c-error)'};
				color:{vendedor.abierto ? 'var(--c-success)' : 'var(--c-error)'}"
		>
			<div class="h-2 w-2 rounded-full" style="background:currentColor"></div>
			{vendedor.abierto ? 'Abierto' : 'Cerrado'}
		</button>
	</div>

	<!-- KPI cards -->
	<div class="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
		{#each [{ label: 'Pedidos activos', value: vendedor.pedidosActivos.length.toString(), icon: 'package', color: '#2563EB', bg: 'rgba(37,99,235,.08)' }, { label: 'Ingresos de hoy', value: fmtCOP(vendedor.ingresosHoy), icon: 'coin', color: '#16A34A', bg: 'rgba(22,163,74,.08)' }, { label: 'Ventas del mes', value: vendedor.totalVentasMes.toString(), icon: 'store', color: '#7C3AED', bg: 'rgba(124,58,237,.08)' }, { label: 'Ticket promedio', value: fmtCOP(vendedor.ticketPromedio), icon: 'tag', color: '#F59E0B', bg: 'rgba(245,158,11,.08)' }] as kpi, idx (idx)}
			<div
				class="rounded-2xl border border-[var(--c-border-soft)] p-4"
				style="background:var(--c-bg-card)"
			>
				<div
					class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl"
					style="background:{kpi.bg}"
				>
					<Icon name={kpi.icon} size={17} color={kpi.color} />
				</div>
				<div class="mb-1 font-display text-[18px] leading-none font-extrabold">{kpi.value}</div>
				<div class="text-[11.5px]" style="color:var(--c-text-muted)">{kpi.label}</div>
			</div>
		{/each}
	</div>

	<!-- Acciones rápidas -->
	<div class="mb-7 grid grid-cols-4 gap-2.5">
		{#each [{ label: 'Pedidos', icon: 'package', path: '/seller/orders', color: 'var(--c-brand)' }, { label: 'Citas', icon: 'calendar', path: '/seller/appointments', color: '#2563EB' }, { label: 'Catálogo', icon: 'store', path: '/seller/catalog', color: '#7C3AED' }, { label: 'Ofertas', icon: 'tag', path: '/seller/deals', color: '#F59E0B' }] as const as a, idx (idx)}
			<button
				onclick={() => goto(resolve(a.path))}
				class="flex flex-col items-center gap-2 rounded-2xl border border-[var(--c-border-soft)] py-4 text-center transition-all hover:border-[var(--c-brand)]"
				style="background:var(--c-bg-card)"
			>
				<div
					class="flex h-10 w-10 items-center justify-center rounded-xl"
					style="background:rgba(37,99,235,.08)"
				>
					<Icon name={a.icon} size={19} color={a.color} />
				</div>
				<span class="text-[12.5px] font-bold">{a.label}</span>
			</button>
		{/each}
	</div>

	<!-- Pedidos activos -->
	<!-- Citas pendientes (tienda servicios) -->
	{#if vendedor.citasPendientes.length > 0}
		<div class="mb-7">
			<div class="mb-2 flex items-center justify-between">
				<div>
					<h2 class="font-display text-[16px] font-bold">Citas pendientes</h2>
					<div class="mt-0.5 text-[11.5px]" style="color:var(--c-text-muted)">
						{vendedor.tiendaServicio?.emoji}
						{vendedor.tiendaServicio?.name}
					</div>
				</div>
				<button
					onclick={() => goto(resolve('seller/appointments'))}
					class="text-[12px] font-semibold"
					style="color:var(--c-brand)"
				>
					Ver todas →
				</button>
			</div>

			<div class="flex flex-col gap-2.5">
				{#each vendedor.citasPendientes.slice(0, 3) as cita (cita.id)}
					{@const estadoInfo = ESTADOS_CITA[cita.estado]}
					<div
						class="flex items-center gap-3 rounded-2xl border border-[var(--c-border-soft)] p-3.5"
						style="background:var(--c-bg-card)"
					>
						<div
							class="h-2.5 w-2.5 shrink-0 rounded-full"
							style="background:{estadoInfo.color}"
						></div>
						<div class="min-w-0 flex-1">
							<div class="truncate font-display text-[13px] font-bold">{cita.servicioNombre}</div>
							<div class="text-[11.5px]" style="color:var(--c-text-muted)">
								{cita.cliente.nombre} · {estadoInfo.label}
							</div>
						</div>
						<div class="shrink-0 text-right">
							<div class="text-[12.5px] font-bold">{fmtFechaCita(cita.fecha)}</div>
							{#if cita.hora}
								<div class="text-[11px]" style="color:var(--c-text-muted)">{cita.hora}</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Pedidos activos (tienda productos) -->
	{#if vendedor.pedidosActivos.length > 0}
		<div class="mb-2 flex items-center justify-between">
			<h2 class="font-display text-[16px] font-bold">Pedidos activos</h2>
			<button
				onclick={() => goto(resolve('seller/orders'))}
				class="text-[12px] font-semibold"
				style="color:var(--c-brand)"
			>
				Ver todos →
			</button>
		</div>

		<div class="flex flex-col gap-3">
			{#each vendedor.pedidosActivos as pedido (pedido.id)}
				<div
					class="overflow-hidden rounded-2xl border border-[var(--c-border-soft)]"
					style="background:var(--c-bg-card)"
				>
					<div class="flex items-center gap-3 p-4">
						<div class="min-w-0 flex-1">
							<div class="mb-1 flex flex-wrap items-center gap-2">
								<span class="font-mono text-[12px] font-bold">{pedido.number}</span>
								<Badge variant={ESTADO_VARIANT[pedido.status]}>{ESTADO_LABEL[pedido.status]}</Badge>
							</div>
							<div class="text-xs" style="color:var(--c-text-muted)">
								{pedido.items.length} producto{pedido.items.length !== 1 ? 's' : ''} · {pedido.date}
							</div>
						</div>
						<div class="shrink-0 font-mono text-base font-bold">{fmtCOP(pedido.total)}</div>
					</div>

					{#if ESTADO_STEPS[pedido.status]}
						<div
							class="border-t border-[var(--c-border-soft)] px-4 pb-3.5"
							style="background:var(--c-bg-secondary)"
						>
							<button
								onclick={() => vendedor.cambiarEstado(pedido.id, ESTADO_STEPS[pedido.status]!)}
								class="mt-3 w-full rounded-xl py-2.5 text-sm font-bold text-white"
								style="background:var(--c-brand)"
							>
								{NEXT_ACTION[pedido.status]}
							</button>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<div
			class="rounded-2xl border border-[var(--c-border-soft)] py-10 text-center"
			style="background:var(--c-bg-card)"
		>
			<div class="mb-3 text-4xl">🎉</div>
			<div class="mb-1 font-display text-base font-bold">Todo al día</div>
			<div class="text-sm" style="color:var(--c-text-muted)">
				No hay pedidos activos en este momento
			</div>
		</div>
	{/if}
</div>
