<script lang="ts">
	import { vendedor } from '$lib/stores/vendedor.svelte';
	import { ESTADOS_CITA, fmtFechaCita, type EstadoCita, type Cita } from '$lib/stores/citas.svelte';
	import { fmtCOP } from '$lib/utils';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';

	type Tab = 'pendientes' | 'hoy' | 'historial';
	let tab = $state<Tab>('pendientes');

	const lista = $derived.by(() => {
		const hoy = new Date().toISOString().slice(0, 10);
		if (tab === 'pendientes') return vendedor.citasPendientes;
		if (tab === 'hoy')        return vendedor.citasHoy;
		return vendedor.citasTienda.filter(c =>
			['completada', 'cancelada', 'atendida', 'aceptada', 'cerrada'].includes(c.estado)
		);
	});

	const TRANSICIONES: Partial<Record<EstadoCita, { next: EstadoCita; label: string; color: string }[]>> = {
		pendiente:  [
			{ next: 'confirmada', label: 'Confirmar cita',   color: 'var(--c-brand)' },
			{ next: 'cancelada',  label: 'Cancelar',         color: 'var(--c-error)' },
		],
		solicitada: [
			{ next: 'cotizada',   label: 'Enviar cotización', color: 'var(--c-brand)' },
			{ next: 'cancelada',  label: 'Cancelar',          color: 'var(--c-error)' },
		],
		cotizada:   [
			{ next: 'aceptada',   label: 'Marcar aceptada',  color: '#16A34A' },
			{ next: 'cancelada',  label: 'Cancelar',         color: 'var(--c-error)' },
		],
		confirmada: [
			{ next: 'atendida',   label: 'Marcar atendida',  color: '#16A34A' },
			{ next: 'cancelada',  label: 'Cancelar',         color: 'var(--c-error)' },
		],
	};

	function estadoVariant(estado: EstadoCita): 'brand' | 'accent' | 'success' | 'error' | 'default' {
		if (['completada', 'atendida', 'aceptada'].includes(estado)) return 'success';
		if (['cancelada', 'cerrada'].includes(estado))               return 'error';
		if (estado === 'confirmada')                                  return 'brand';
		if (estado === 'cotizada')                                    return 'accent';
		return 'default';
	}

	let expandido = $state<string | null>(null);

	// Cotización modal
	let cotizModalOpen = $state(false);
	let cotizCitaId    = $state('');
	let cotizMonto     = $state('');
	let cotizDetalle   = $state('');

	function abrirCotiz(citaId: string) {
		cotizCitaId = citaId;
		cotizMonto = '';
		cotizDetalle = '';
		cotizModalOpen = true;
	}

	function enviarCotizacion() {
		const monto = parseInt(cotizMonto.replace(/\D/g, ''), 10);
		if (!monto) return;
		vendedor.cambiarEstadoCita(cotizCitaId, 'cotizada');
		cotizModalOpen = false;
	}
</script>

<div class="max-w-2xl mx-auto px-4 pt-6 pb-10">

	<!-- Header con tienda de servicios -->
	<div class="flex items-center gap-3 mb-1">
		<div class="text-2xl">{vendedor.tiendaServicio?.emoji}</div>
		<div>
			<div class="font-mono text-[11px] font-bold uppercase tracking-widest" style="color:var(--c-brand)">
				Panel Servicios
			</div>
			<h1 class="font-display text-[22px] font-extrabold">{vendedor.tiendaServicio?.name}</h1>
		</div>
	</div>

	<!-- KPIs citas -->
	<div class="grid grid-cols-3 gap-2.5 mb-5 mt-4">
		{#each [
			{ label: 'Pendientes',  value: vendedor.citasPendientes.length, icon: 'clock',    color: '#EA580C', bg: 'rgba(234,88,12,.08)' },
			{ label: 'Hoy',         value: vendedor.citasHoy.length,        icon: 'calendar', color: '#2563EB', bg: 'rgba(37,99,235,.08)' },
			{ label: 'Completadas', value: vendedor.citasTienda.filter(c => ['completada','atendida'].includes(c.estado)).length, icon: 'check', color: '#16A34A', bg: 'rgba(22,163,74,.08)' },
		] as kpi}
			<div class="p-3.5 rounded-2xl border border-[var(--c-border-soft)]"
				style="background:var(--c-bg-card)">
				<div class="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5"
					style="background:{kpi.bg}">
					<Icon name={kpi.icon} size={15} color={kpi.color}/>
				</div>
				<div class="font-display font-extrabold text-[22px] leading-none mb-0.5">{kpi.value}</div>
				<div class="text-[11px]" style="color:var(--c-text-muted)">{kpi.label}</div>
			</div>
		{/each}
	</div>

	<!-- Tabs -->
	<div class="flex p-1 rounded-xl mb-5" style="background:var(--c-bg-secondary)">
		{#each ([
			['pendientes', 'Pendientes'],
			['hoy',        'Hoy'],
			['historial',  'Historial'],
		] as [Tab, string][]) as [id, label]}
			<button onclick={() => tab = id}
				class="flex-1 py-2.5 rounded-[10px] text-[12.5px] font-bold transition-all"
				style="background:{tab === id ? 'var(--c-bg-card)' : 'transparent'};
					color:{tab === id ? 'var(--c-text-primary)' : 'var(--c-text-muted)'};
					box-shadow:{tab === id ? 'var(--shadow-sm)' : 'none'}">
				{label}
				{#if id === 'pendientes' && vendedor.citasPendientes.length > 0}
					<span class="ml-1 text-[10px] font-bold text-white bg-[var(--c-error)] px-1.5 py-0.5 rounded-full">
						{vendedor.citasPendientes.length}
					</span>
				{/if}
			</button>
		{/each}
	</div>

	{#if lista.length === 0}
		<div class="text-center py-16" style="color:var(--c-text-muted)">
			<div class="text-5xl mb-4">📅</div>
			<h3 class="font-display font-bold text-lg mb-2">
				{tab === 'pendientes' ? 'Sin solicitudes pendientes' : tab === 'hoy' ? 'Sin citas para hoy' : 'Sin historial aún'}
			</h3>
		</div>
	{:else}
		<div class="flex flex-col gap-3">
			{#each lista as cita}
				{@const estadoInfo = ESTADOS_CITA[cita.estado]}
				{@const transiciones = TRANSICIONES[cita.estado] ?? []}
				<div class="rounded-2xl border border-[var(--c-border-soft)] overflow-hidden"
					style="background:var(--c-bg-card)">

					<!-- Card header -->
					<button
						onclick={() => expandido = expandido === cita.id ? null : cita.id}
						class="flex items-center gap-3 p-4 w-full text-left hover:bg-[var(--c-bg-secondary)] transition-colors">

						<!-- Estado dot + servicio icon -->
						<div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
							style="background:rgba({estadoInfo.color.replace('#','')},0.1)">
							<div class="w-3 h-3 rounded-full" style="background:{estadoInfo.color}"></div>
						</div>

						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 mb-0.5 flex-wrap">
								<span class="font-display text-[13.5px] font-bold truncate">{cita.servicioNombre}</span>
							</div>
							<div class="flex items-center gap-2 flex-wrap">
								<Badge variant={estadoVariant(cita.estado)}>{estadoInfo.label}</Badge>
								<span class="text-[11px]" style="color:var(--c-text-muted)">
									{cita.tipo === 'cotizacion' ? '📋 Cotización' : '📅 Cita'}
								</span>
							</div>
						</div>

						<div class="text-right shrink-0">
							<div class="text-[13px] font-bold">{fmtFechaCita(cita.fecha)}</div>
							{#if cita.hora}
								<div class="text-[11px]" style="color:var(--c-text-muted)">{cita.hora}</div>
							{/if}
							<Icon name={expandido === cita.id ? 'arrowUp' : 'arrowDown'} size={13} color="var(--c-text-muted)"/>
						</div>
					</button>

					<!-- Expandido -->
					{#if expandido === cita.id}
						<div class="px-4 pb-4 border-t border-[var(--c-border-soft)]"
							style="background:var(--c-bg-secondary)">
							<!-- Cliente info -->
							<div class="pt-3 mb-3">
								<div class="text-[11px] font-bold uppercase tracking-widest mb-2" style="color:var(--c-text-muted)">
									Cliente
								</div>
								<div class="flex flex-col gap-1.5">
									<div class="flex items-center gap-2 text-[13px]">
										<Icon name="user" size={13} color="var(--c-text-muted)"/>
										<span class="font-semibold">{cita.cliente.nombre}</span>
									</div>
									{#if cita.cliente.telefono}
										<a href="tel:{cita.cliente.telefono}"
											class="flex items-center gap-2 text-[13px]"
											style="color:var(--c-brand)">
											<Icon name="phone" size={13} color="var(--c-brand)"/>
											{cita.cliente.telefono}
										</a>
									{/if}
									{#if cita.cliente.email}
										<div class="flex items-center gap-2 text-[12px]" style="color:var(--c-text-muted)">
											<Icon name="message" size={13}/>
											{cita.cliente.email}
										</div>
									{/if}
								</div>
							</div>

							<!-- Datos adicionales -->
							{#if Object.keys(cita.datos).length > 0}
								<div class="mb-3 pt-3 border-t border-[var(--c-border-soft)]">
									<div class="text-[11px] font-bold uppercase tracking-widest mb-2" style="color:var(--c-text-muted)">
										Detalles
									</div>
									{#each Object.entries(cita.datos) as [k, v]}
										{#if v}
											<div class="flex items-start gap-1.5 text-[12.5px] mb-1">
												<span class="font-semibold capitalize" style="color:var(--c-text-secondary)">{k}:</span>
												<span>{String(v)}</span>
											</div>
										{/if}
									{/each}
								</div>
							{/if}

							<!-- Precio si aplica -->
							{#if cita.precio !== null}
								<div class="flex items-center justify-between py-2.5 px-3.5 rounded-xl mb-3"
									style="background:var(--c-bg-card)">
									<span class="text-[12.5px] font-semibold" style="color:var(--c-text-secondary)">Valor del servicio</span>
									<span class="font-mono font-bold text-[14px]">{fmtCOP(cita.precio)}</span>
								</div>
							{/if}

							<!-- Acciones de transición -->
							{#if transiciones.length > 0}
								<div class="flex gap-2 mt-1">
									{#each transiciones as tr}
										<button
											onclick={() => {
												if (tr.next === 'cotizada') {
													abrirCotiz(cita.id);
												} else {
													vendedor.cambiarEstadoCita(cita.id, tr.next);
													expandido = null;
												}
											}}
											class="flex-1 py-2.5 rounded-xl font-bold text-[13px] transition-all"
											style="background:{tr.next === 'cancelada' ? 'rgba(220,38,38,.06)' : tr.color};
												color:{tr.next === 'cancelada' ? 'var(--c-error)' : '#fff'};
												border:{tr.next === 'cancelada' ? '1px solid var(--c-error)' : 'none'}">
											{tr.label}
										</button>
									{/each}
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- ── Modal cotización ── -->
<Dialog.Root bind:open={cotizModalOpen}>
	<Dialog.Content showCloseButton={false} class="flex flex-col gap-4">
			<div class="flex items-center justify-between">
				<h3 class="font-display text-[18px] font-extrabold">Enviar cotización</h3>
				<button onclick={() => cotizModalOpen = false}
					class="w-8 h-8 rounded-full flex items-center justify-center"
					style="background:var(--c-bg-secondary);color:var(--c-text-muted)">
					<Icon name="close" size={15}/>
				</button>
			</div>

			<div>
				<div class="text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">
					Valor a cotizar ($)
				</div>
				<Input bind:value={cotizMonto} type="number" placeholder="Ej: 350000"
					class="w-full h-11 px-3.5 rounded-xl border text-[14px]"
					style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"/>
			</div>

			<div>
				<div class="text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">
					Detalle / Condiciones
				</div>
				<textarea bind:value={cotizDetalle} rows="3" placeholder="Incluye materiales, tiempo estimado..."
					class="w-full px-3.5 py-2.5 rounded-xl border text-[14px] outline-none resize-none"
					style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"></textarea>
			</div>

			<div class="flex gap-2.5">
				<button onclick={() => cotizModalOpen = false}
					class="flex-1 h-11 rounded-xl font-bold text-[14px] border"
					style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)">
					Cancelar
				</button>
				<button onclick={enviarCotizacion} disabled={!cotizMonto}
					class="flex-1 h-11 rounded-xl font-bold text-[14px] text-white disabled:opacity-40"
					style="background:var(--c-brand)">
					Enviar cotización
				</button>
			</div>
	</Dialog.Content>
</Dialog.Root>
