<script lang="ts">
	import { goto } from '$app/navigation';
	import { vendedor } from '$lib/stores/vendedor.svelte';
	import { ESTADOS_CITA, fmtFechaCita } from '$lib/stores/citas.svelte';
	import { fmtCOP } from '$lib/utils';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';

	const ESTADO_STEPS: Record<string, string> = {
		confirmed: 'preparing',
		preparing: 'shipping',
		shipping: 'delivered',
	};

	const ESTADO_LABEL: Record<string, string> = {
		confirmed: '✓ Confirmado',
		preparing: '⏳ Preparando',
		shipping: '🚚 En camino',
		delivered: '✅ Entregado',
		cancelled: '✕ Cancelado',
	};

	const ESTADO_VARIANT: Record<string, 'brand' | 'accent' | 'success' | 'error' | 'default'> = {
		confirmed: 'brand', preparing: 'accent', shipping: 'brand',
		delivered: 'success', cancelled: 'error',
	};

	const NEXT_ACTION: Record<string, string> = {
		confirmed: 'Empezar preparación',
		preparing: 'Enviar a domicilio',
		shipping: 'Marcar entregado',
	};
</script>

<div class="max-w-3xl mx-auto px-5 pt-6 pb-10">
	<!-- Header -->
	<div class="flex items-center justify-between mb-6">
		<div>
			<div class="font-mono text-[11px] font-bold uppercase tracking-widest mb-1" style="color:var(--c-brand)">
				Panel Vendedor
			</div>
			<h1 class="font-display text-[26px] font-extrabold tracking-tight">
				{vendedor.tienda?.emoji} {vendedor.tienda?.nombre}
			</h1>
		</div>
		<button
			onclick={() => vendedor.toggleAbierto()}
			class="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border transition-all"
			style="background:{vendedor.abierto ? 'rgba(22,163,74,.08)' : 'rgba(220,38,38,.06)'};
				border-color:{vendedor.abierto ? 'var(--c-success)' : 'var(--c-error)'};
				color:{vendedor.abierto ? 'var(--c-success)' : 'var(--c-error)'}">
			<div class="w-2 h-2 rounded-full" style="background:currentColor"></div>
			{vendedor.abierto ? 'Abierto' : 'Cerrado'}
		</button>
	</div>

	<!-- KPI cards -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
		{#each [
			{ label: 'Pedidos activos',  value: vendedor.pedidosActivos.length.toString(), icon: 'package', color: '#2563EB', bg: 'rgba(37,99,235,.08)' },
			{ label: 'Ingresos de hoy',  value: fmtCOP(vendedor.ingresosHoy),             icon: 'coin',    color: '#16A34A', bg: 'rgba(22,163,74,.08)' },
			{ label: 'Ventas del mes',   value: vendedor.totalVentasMes.toString(),        icon: 'store',   color: '#7C3AED', bg: 'rgba(124,58,237,.08)' },
			{ label: 'Ticket promedio',  value: fmtCOP(vendedor.ticketPromedio),           icon: 'tag',     color: '#F59E0B', bg: 'rgba(245,158,11,.08)' },
		] as kpi}
			<div class="p-4 rounded-2xl border border-[var(--c-border-soft)]"
				style="background:var(--c-bg-card)">
				<div class="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
					style="background:{kpi.bg}">
					<Icon name={kpi.icon} size={17} color={kpi.color}/>
				</div>
				<div class="font-display font-extrabold text-[18px] leading-none mb-1">{kpi.value}</div>
				<div class="text-[11.5px]" style="color:var(--c-text-muted)">{kpi.label}</div>
			</div>
		{/each}
	</div>

	<!-- Acciones rápidas -->
	<div class="grid grid-cols-4 gap-2.5 mb-7">
		{#each [
			{ label: 'Pedidos',      icon: 'package',  path: '/seller/orders',  color: 'var(--c-brand)' },
			{ label: 'Citas',        icon: 'calendar', path: '/seller/appointments',    color: '#2563EB' },
			{ label: 'Catálogo',     icon: 'store',    path: '/seller/catalog', color: '#7C3AED' },
			{ label: 'Ofertas',      icon: 'tag',      path: '/seller/deals',  color: '#F59E0B' },
		] as a}
			<button onclick={() => goto(a.path)}
				class="flex flex-col items-center gap-2 py-4 rounded-2xl border border-[var(--c-border-soft)] transition-all hover:border-[var(--c-brand)] text-center"
				style="background:var(--c-bg-card)">
				<div class="w-10 h-10 rounded-xl flex items-center justify-center"
					style="background:rgba(37,99,235,.08)">
					<Icon name={a.icon} size={19} color={a.color}/>
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
					<div class="text-[11.5px] mt-0.5" style="color:var(--c-text-muted)">
						{vendedor.tiendaServicio?.emoji} {vendedor.tiendaServicio?.nombre}
					</div>
				</div>
				<button onclick={() => goto('/seller/appointments')}
					class="text-[12px] font-semibold" style="color:var(--c-brand)">
					Ver todas →
				</button>
			</div>

			<div class="flex flex-col gap-2.5">
				{#each vendedor.citasPendientes.slice(0, 3) as cita}
					{@const estadoInfo = ESTADOS_CITA[cita.estado]}
					<div class="flex items-center gap-3 p-3.5 rounded-2xl border border-[var(--c-border-soft)]"
						style="background:var(--c-bg-card)">
						<div class="w-2.5 h-2.5 rounded-full shrink-0" style="background:{estadoInfo.color}"></div>
						<div class="flex-1 min-w-0">
							<div class="font-display text-[13px] font-bold truncate">{cita.servicioNombre}</div>
							<div class="text-[11.5px]" style="color:var(--c-text-muted)">
								{cita.cliente.nombre} · {estadoInfo.label}
							</div>
						</div>
						<div class="text-right shrink-0">
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
			<button onclick={() => goto('/seller/orders')}
				class="text-[12px] font-semibold" style="color:var(--c-brand)">
				Ver todos →
			</button>
		</div>

		<div class="flex flex-col gap-3">
			{#each vendedor.pedidosActivos as pedido}
				<div class="rounded-2xl border border-[var(--c-border-soft)] overflow-hidden"
					style="background:var(--c-bg-card)">
					<div class="flex items-center gap-3 p-4">
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 mb-1 flex-wrap">
								<span class="font-mono text-[12px] font-bold">{pedido.numero}</span>
								<Badge variant={ESTADO_VARIANT[pedido.estado]}>{ESTADO_LABEL[pedido.estado]}</Badge>
							</div>
							<div class="text-xs" style="color:var(--c-text-muted)">
								{pedido.items.length} producto{pedido.items.length !== 1 ? 's' : ''} · {pedido.fecha}
							</div>
						</div>
						<div class="font-mono text-base font-bold shrink-0">{fmtCOP(pedido.total)}</div>
					</div>

					{#if ESTADO_STEPS[pedido.estado]}
						<div class="px-4 pb-3.5 border-t border-[var(--c-border-soft)]"
							style="background:var(--c-bg-secondary)">
							<button
								onclick={() => vendedor.cambiarEstado(pedido.id, ESTADO_STEPS[pedido.estado] as any)}
								class="w-full mt-3 py-2.5 rounded-xl font-bold text-sm text-white"
								style="background:var(--c-brand)">
								{NEXT_ACTION[pedido.estado]}
							</button>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<div class="text-center py-10 rounded-2xl border border-[var(--c-border-soft)]"
			style="background:var(--c-bg-card)">
			<div class="text-4xl mb-3">🎉</div>
			<div class="font-display font-bold text-base mb-1">Todo al día</div>
			<div class="text-sm" style="color:var(--c-text-muted)">No hay pedidos activos en este momento</div>
		</div>
	{/if}
</div>
