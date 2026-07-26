<script lang="ts">
	import { goto } from '$app/navigation';
	import { repartidor, REPARTIDOR } from '$lib/stores/repartidor.svelte';
	import { fmtCOP } from '$lib/utils';
	import { getStore } from '$lib/data/mock';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { Badge } from '$lib/components/ui/badge';

	// Tiempo transcurrido desde que salió
	let ahora = $state(Date.now());
	$effect(() => {
		const t = setInterval(() => ahora = Date.now(), 10000);
		return () => clearInterval(t);
	});

	function minTranscurridos(ts: number | null): string {
		if (!ts) return '';
		const mins = Math.round((ahora - ts) / 60000);
		if (mins < 1) return 'Ahora mismo';
		return `hace ${mins} min`;
	}
</script>

<div class="max-w-lg mx-auto px-4 pt-5 pb-28">

	<!-- Header perfil repartidor -->
	<div class="flex items-center gap-4 p-4 rounded-2xl border border-[var(--c-border-soft)] mb-5"
		style="background:var(--c-bg-card)">
		<div class="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold font-display text-white shrink-0"
			style="background:{REPARTIDOR.color}">
			{REPARTIDOR.iniciales}
		</div>
		<div class="flex-1 min-w-0">
			<h2 class="font-display text-[16px] font-bold">{REPARTIDOR.nombre}</h2>
			<div class="text-[12px] mb-1.5" style="color:var(--c-text-muted)">{REPARTIDOR.vehiculo}</div>
			<div class="flex items-center gap-2">
				<div class="flex items-center gap-1 text-[12px] font-semibold" style="color:var(--c-accent)">
					<Icon name="starFill" size={12}/>
					{REPARTIDOR.rating}
				</div>
				<span class="text-[11px]" style="color:var(--c-text-muted)">{REPARTIDOR.entregasTotal} entregas</span>
			</div>
		</div>
		<!-- Toggle disponible -->
		<div class="flex flex-col items-center gap-1.5 shrink-0">
			<button onclick={() => repartidor.toggleDisponible()}
				class="w-14 h-7 rounded-full transition-colors relative"
				style="background:{repartidor.disponible ? 'var(--c-success)' : 'var(--c-border)'}">
				<div class="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all"
					style="left:{repartidor.disponible ? '30px' : '2px'}"></div>
			</button>
			<span class="text-[10px] font-bold"
				style="color:{repartidor.disponible ? 'var(--c-success)' : 'var(--c-text-muted)'}">
				{repartidor.disponible ? 'Disponible' : 'No disponible'}
			</span>
		</div>
	</div>

	<!-- Stats del día -->
	<div class="grid grid-cols-3 gap-2.5 mb-5">
		{#each [
			{ label: 'Ganancias hoy', value: fmtCOP(repartidor.gananciasHoy), icon: 'coin',    color: '#16A34A', bg: 'rgba(22,163,74,.08)' },
			{ label: 'Entregas hoy',  value: repartidor.entregasHoy.toString(),  icon: 'package', color: '#2563EB', bg: 'rgba(37,99,235,.08)' },
			{ label: 'Rating',        value: REPARTIDOR.rating.toString(),       icon: 'starFill',color: '#F59E0B', bg: 'rgba(245,158,11,.08)' },
		] as s}
			<div class="p-3.5 rounded-2xl border border-[var(--c-border-soft)] text-center"
				style="background:var(--c-bg-card)">
				<div class="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2"
					style="background:{s.bg}">
					<Icon name={s.icon} size={15} color={s.color}/>
				</div>
				<div class="font-display font-extrabold text-[15px] leading-none mb-0.5">{s.value}</div>
				<div class="text-[10.5px]" style="color:var(--c-text-muted)">{s.label}</div>
			</div>
		{/each}
	</div>

	<!-- ── ENTREGA ACTIVA ── -->
	{#if repartidor.pedidoActivo}
		{@const pedido = repartidor.pedidoActivo}
		{@const tienda = getStore(pedido.storeId)}
		{@const ea     = repartidor.entregaActiva!}

		<div class="mb-5">
			<div class="flex items-center justify-between mb-2">
				<h2 class="font-display text-[15px] font-bold">Entrega activa</h2>
				<Badge variant="brand">
					{#if ea.estado === 'recogiendo'}🏪 Ir a recoger{:else}🚴 En camino{/if}
				</Badge>
			</div>

			<div class="rounded-2xl border-2 overflow-hidden"
				style="border-color:var(--c-brand);background:var(--c-bg-card)">

				<!-- Ruta visual -->
				<div class="p-4">
					<!-- Origen -->
					<div class="flex items-start gap-3 mb-3">
						<div class="flex flex-col items-center gap-1 pt-0.5">
							<div class="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
								style="background:var(--c-brand-light)">
								{tienda.emoji}
							</div>
							<div class="w-0.5 h-6 rounded-full" style="background:var(--c-border)"></div>
						</div>
						<div class="flex-1 min-w-0 pt-1">
							<div class="text-[11px] font-bold uppercase tracking-wider mb-0.5" style="color:var(--c-text-muted)">Recoge en</div>
							<div class="font-display text-[14px] font-bold">{tienda.name}</div>
							<div class="text-[12px]" style="color:var(--c-text-muted)">Plaza Central · Local {tienda.id.toUpperCase()}</div>
						</div>
						{#if ea.estado === 'recogiendo'}
							<div class="shrink-0">
								<div class="w-2 h-2 rounded-full animate-pulse" style="background:var(--c-brand)"></div>
							</div>
						{/if}
					</div>

					<!-- Destino -->
					<div class="flex items-start gap-3">
						<div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
							style="background:rgba(220,38,38,.08)">
							<Icon name="location" size={16} color="var(--c-error)"/>
						</div>
						<div class="flex-1 min-w-0 pt-1">
							<div class="text-[11px] font-bold uppercase tracking-wider mb-0.5" style="color:var(--c-text-muted)">Entrega en</div>
							<div class="font-display text-[14px] font-bold leading-snug">{pedido.address}</div>
							{#if ea.salidaAt}
								<div class="text-[11.5px] mt-0.5" style="color:var(--c-text-muted)">{minTranscurridos(ea.salidaAt)}</div>
							{/if}
						</div>
						{#if ea.estado === 'en_camino'}
							<div class="shrink-0">
								<div class="w-2 h-2 rounded-full animate-pulse" style="background:var(--c-error)"></div>
							</div>
						{/if}
					</div>
				</div>

				<!-- Info pedido -->
				<div class="px-4 pb-3 flex items-center justify-between border-t border-[var(--c-border-soft)]"
					style="background:var(--c-bg-secondary)">
					<div class="flex items-center gap-2 pt-3">
						<span class="font-mono text-[11.5px] font-bold">{pedido.number}</span>
						<span class="text-[11px]" style="color:var(--c-text-muted)">
							{pedido.items.length} producto{pedido.items.length !== 1 ? 's' : ''}
						</span>
					</div>
					<div class="font-mono text-[14px] font-bold pt-3">{fmtCOP(pedido.total)}</div>
				</div>

				<!-- Botón de acción principal -->
				<div class="p-4 pt-0" style="background:var(--c-bg-secondary)">
					{#if ea.estado === 'recogiendo'}
						<button onclick={() => repartidor.marcarRecogido()}
							class="w-full py-3 rounded-xl font-bold text-[14px] text-white"
							style="background:var(--c-brand)">
							✓ Recogido — Salir a entregar
						</button>
					{:else}
						<button onclick={() => repartidor.marcarEntregado()}
							class="w-full py-3 rounded-xl font-bold text-[14px] text-white"
							style="background:var(--c-success)">
							✓ Marcar como entregado
						</button>
					{/if}
				</div>
			</div>
		</div>

	<!-- ── SIN ENTREGA ACTIVA ── -->
	{:else if repartidor.disponible}

		<!-- Pedidos disponibles -->
		{#if repartidor.disponibles.length > 0}
			<div class="mb-2 flex items-center justify-between">
				<h2 class="font-display text-[15px] font-bold">Pedidos disponibles</h2>
				<span class="text-[11.5px] font-semibold px-2.5 py-1 rounded-full"
					style="background:rgba(37,99,235,.08);color:var(--c-brand)">
					{repartidor.disponibles.length} disponible{repartidor.disponibles.length !== 1 ? 's' : ''}
				</span>
			</div>

			<div class="flex flex-col gap-3 mb-5">
				{#each repartidor.disponibles as pedido}
					{@const tienda = getStore(pedido.storeId)}
					<div class="rounded-2xl border border-[var(--c-border-soft)] overflow-hidden"
						style="background:var(--c-bg-card)">
						<div class="p-4">
							<div class="flex items-center gap-3 mb-3">
								<div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
									style="background:var(--c-bg-secondary)">{tienda.emoji}</div>
								<div class="flex-1 min-w-0">
									<div class="font-display text-[13.5px] font-bold">{tienda.name}</div>
									<div class="text-[11.5px]" style="color:var(--c-text-muted)">
										{pedido.items.length} producto{pedido.items.length !== 1 ? 's' : ''} · {pedido.date}
									</div>
								</div>
								<div class="font-mono text-[14px] font-bold shrink-0">{fmtCOP(pedido.total)}</div>
							</div>

							<div class="flex items-center gap-2 text-[12px] mb-3" style="color:var(--c-text-muted)">
								<Icon name="location" size={12}/>
								<span class="truncate">{pedido.address}</span>
							</div>

							<!-- Ganancia estimada -->
							<div class="flex items-center justify-between px-3 py-2 rounded-xl mb-3"
								style="background:rgba(22,163,74,.06)">
								<span class="text-[12px]" style="color:var(--c-text-secondary)">Ganancia estimada</span>
								<span class="font-mono font-bold text-[13.5px]" style="color:var(--c-success)">
									{fmtCOP(Math.round(pedido.total * 0.1))}
								</span>
							</div>

							<button onclick={() => repartidor.tomarPedido(pedido.id)}
								class="w-full py-2.5 rounded-xl font-bold text-[13.5px] text-white"
								style="background:var(--c-brand)">
								Tomar este pedido
							</button>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="text-center py-16 rounded-2xl border border-[var(--c-border-soft)]"
				style="background:var(--c-bg-card)">
				<div class="text-5xl mb-3">🔍</div>
				<div class="font-display font-bold text-base mb-1">Buscando pedidos…</div>
				<div class="text-sm" style="color:var(--c-text-muted)">
					Aparecerás como disponible cuando haya pedidos cerca.
				</div>
			</div>
		{/if}

	{:else}
		<!-- No disponible -->
		<div class="text-center py-16 rounded-2xl border border-[var(--c-border-soft)]"
			style="background:var(--c-bg-card)">
			<div class="text-5xl mb-3">😴</div>
			<div class="font-display font-bold text-lg mb-1">Estás desconectado</div>
			<div class="text-sm mb-5" style="color:var(--c-text-muted)">
				Activa tu disponibilidad para recibir pedidos.
			</div>
			<button onclick={() => repartidor.toggleDisponible()}
				class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white"
				style="background:var(--c-success)">
				<Icon name="check" size={16}/>
				Conectarme
			</button>
		</div>
	{/if}

	<!-- ── HISTORIAL ── -->
	{#if repartidor.historial.length > 0}
		<div class="mt-2">
			<h2 class="font-display text-[15px] font-bold mb-3">Historial reciente</h2>
			<div class="flex flex-col gap-2">
				{#each repartidor.historial.slice(0, 5) as pedido}
					{@const tienda = getStore(pedido.storeId)}
					<div class="flex items-center gap-3 p-3.5 rounded-xl border border-[var(--c-border-soft)]"
						style="background:var(--c-bg-card)">
						<div class="text-lg shrink-0">{tienda.emoji}</div>
						<div class="flex-1 min-w-0">
							<div class="font-display text-[13px] font-bold truncate">{tienda.name}</div>
							<div class="text-[11px]" style="color:var(--c-text-muted)">{pedido.date}</div>
						</div>
						<div class="text-right shrink-0">
							<div class="font-mono text-[12.5px] font-bold" style="color:var(--c-success)">
								+{fmtCOP(Math.round(pedido.total * 0.1))}
							</div>
							<div class="text-[10.5px]" style="color:var(--c-text-muted)">✅ Entregado</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
