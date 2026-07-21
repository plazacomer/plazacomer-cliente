<script lang="ts">
	import { citas, ESTADOS_CITA, fmtFechaCita, type Cita } from '$lib/stores/citas.svelte';
	import { getStore, getServicio } from '$lib/data/mock';
	import { fmtCOP } from '$lib/utils';
	import Icon from '$lib/components/ui/Icon.svelte';

	type Tab = 'proximas' | 'historial';
	let tab = $state<Tab>('proximas');

	const proximas = $derived(citas.proximas);
	const historial = $derived(citas.historial);
	const lista = $derived(tab === 'proximas' ? proximas : historial);

	function cancelar(id: string) {
		if (confirm('¿Cancelar esta cita?')) citas.cancel(id);
	}

	function ctaIcon(cita: Cita) {
		if (cita.cta === 'agendar') return 'calendar';
		if (cita.cta === 'cotizar') return 'receipt';
		return 'chat';
	}
</script>

<div class="max-w-2xl mx-auto px-4 pt-6 pb-28 md:pb-6">

	<!-- Header -->
	<div class="mb-6">
		<div class="font-mono text-[11px] font-semibold uppercase tracking-[1.5px] mb-1" style="color:var(--c-brand)">Gestiona tus servicios</div>
		<h1 class="font-display text-[26px] font-extrabold tracking-[-0.4px]">Mis citas</h1>
		<p class="text-sm mt-1" style="color:var(--c-text-secondary)">
			{proximas.length} próxima{proximas.length !== 1 ? 's' : ''} · {historial.length} en historial
		</p>
	</div>

	<!-- Tabs -->
	<div class="flex p-1 rounded-xl mb-6" style="background:var(--c-bg-secondary)">
		{#each ([['proximas','Próximas'], ['historial', 'Historial']] as [Tab, string][] ) as [id, label]}
			<button onclick={() => tab = id}
				class="flex-1 py-2.5 rounded-[10px] text-[13.5px] font-bold transition-all"
				style="background:{tab === id ? 'var(--c-bg-card)' : 'transparent'};
					color:{tab === id ? 'var(--c-text-primary)' : 'var(--c-text-muted)'};
					box-shadow:{tab === id ? 'var(--shadow-sm)' : 'none'}">
				{label}
				{#if id === 'proximas' && proximas.length > 0}
					<span class="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-extrabold text-white"
						style="background:var(--c-brand)">{proximas.length}</span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Empty state -->
	{#if lista.length === 0}
		<div class="text-center py-20" style="color:var(--c-text-muted)">
			<div class="text-5xl mb-4">{tab === 'proximas' ? '📅' : '📋'}</div>
			<h3 class="font-display font-bold text-xl mb-2">
				{tab === 'proximas' ? 'Sin citas próximas' : 'Sin historial'}
			</h3>
			<p class="text-sm leading-relaxed max-w-[260px] mx-auto">
				{tab === 'proximas'
					? 'Visita una tienda de servicios y agenda directamente desde ahí.'
					: 'Las citas completadas y canceladas aparecerán acá.'}
			</p>
			{#if tab === 'proximas'}
				<a href="/app/explore"
					class="inline-flex mt-5 items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white"
					style="background:var(--c-brand)">
					<Icon name="search" size={16}/> Explorar servicios
				</a>
			{/if}
		</div>
	{:else}
		<div class="flex flex-col gap-3">
			{#each lista as cita}
				{@const tienda = getStore(cita.tiendaId)}
				{@const servicio = getServicio(cita.servicioId)}
				{@const estado = ESTADOS_CITA[cita.estado]}

				<div class="rounded-[16px] border border-[var(--c-border-soft)] overflow-hidden"
					style="background:var(--c-bg-card)">

					<!-- Top bar with status -->
					<div class="px-4 pt-3 pb-2 flex items-center gap-2 border-b border-[var(--c-border-soft)]"
						style="background:var(--c-bg-secondary)">
						<span class="w-2 h-2 rounded-full shrink-0" style="background:{estado.color}"></span>
						<span class="text-[12px] font-bold" style="color:{estado.color}">{estado.label}</span>
						<span class="ml-auto text-[11.5px] font-mono" style="color:var(--c-text-muted)">
							#{cita.id.slice(-6).toUpperCase()}
						</span>
					</div>

					<!-- Main content -->
					<div class="p-4">
						<div class="flex gap-3 items-start">
							<!-- Icon -->
							<div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
								style="background:{tienda.logoColor}15">{tienda.emoji}</div>

							<!-- Info -->
							<div class="flex-1 min-w-0">
								<div class="font-display text-[15px] font-bold leading-snug mb-0.5">{cita.servicioNombre}</div>
								<div class="text-[12.5px] mb-2" style="color:var(--c-text-secondary)">{tienda.name}</div>

								<!-- Date / Time row -->
								<div class="flex gap-3 flex-wrap">
									{#if cita.fecha}
										<span class="flex items-center gap-1.5 text-[12px] font-semibold"
											style="color:var(--c-text-primary)">
											<Icon name="calendar" size={13} color="var(--c-brand)"/>
											{fmtFechaCita(cita.fecha)}
											{#if cita.hora}· {cita.hora}{/if}
										</span>
									{:else}
										<span class="text-[12px]" style="color:var(--c-text-muted)">Fecha por confirmar</span>
									{/if}

									{#if cita.precio != null}
										<span class="flex items-center gap-1.5 text-[12px] font-mono font-bold ml-auto"
											style="color:{cita.precio === 0 ? 'var(--c-success)' : 'var(--c-text-primary)'}">
											{cita.precio === 0 ? 'Gratis' : fmtCOP(cita.precio)}
										</span>
									{/if}
								</div>

								<!-- Tipo chip -->
								<div class="mt-2 flex items-center gap-1.5">
									<span class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
										style="background:var(--c-bg-secondary);color:var(--c-text-muted)">
										<Icon name={ctaIcon(cita)} size={10}/>
										{cita.tipo === 'cita' ? 'Cita médica' : cita.tipo === 'cotizacion' ? 'Cotización' : 'Consulta'}
									</span>
								</div>
							</div>
						</div>

						<!-- Actions -->
						{#if estado.grupo === 'activa' && cita.propio}
							<div class="flex gap-2 mt-4 pt-4 border-t border-[var(--c-border-soft)]">
								<a href="/app/store/{cita.tiendaId}"
									class="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-center border flex items-center justify-center gap-2"
									style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)">
									<Icon name="store" size={14}/> Ver tienda
								</a>
								<button onclick={() => cancelar(cita.id)}
									class="px-4 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-1.5"
									style="background:var(--c-error-light);color:var(--c-error)">
									<Icon name="close" size={14}/> Cancelar
								</button>
							</div>
						{:else if estado.grupo === 'cerrada'}
							<div class="flex gap-2 mt-4 pt-4 border-t border-[var(--c-border-soft)]">
								<a href="/app/store/{cita.tiendaId}"
									class="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-center flex items-center justify-center gap-2"
									style="background:var(--c-brand);color:#fff">
									<Icon name="calendar" size={14}/> Volver a agendar
								</a>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
